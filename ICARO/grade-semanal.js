/* =====================================================
   grade-semanal.js — Grade Semanal (horários de aula)
   Painel lateral (catálogo + cartões disponíveis) + grade
   visual (Segunda a Sábado, 08:00–23:00) onde o usuário monta
   seus horários arrastando cartões de disciplinas.

   Modelo de dados (persistido via storage.js):
   { instancias: [ { id, codigo, dia, inicio, duracao } ] }
   - dia: null (no painel, ainda não alocado) ou 0..5 (Seg..Sáb)
   - inicio: null ou minutos desde 00:00 (múltiplo de 30, dentro de 08:00–23:00)
   - duracao: minutos (múltiplo de 30, padrão 120)
   ===================================================== */

const GradeSemanal = (function () {
  const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const HORA_INICIO_MIN = 8 * 60;   // 08:00
  const HORA_FIM_MIN = 23 * 60;     // 23:00
  const SLOT_MIN = 30;              // granularidade de 30 minutos
  const TOTAL_SLOTS = (HORA_FIM_MIN - HORA_INICIO_MIN) / SLOT_MIN;
  const SLOT_PX = 24;               // altura de cada slot de 30min, em pixels
  const DURACAO_PADRAO_MIN = 120;   // 2h ao criar/alocar um novo cartão
  const DURACAO_MIN_MIN = 30;
  const HOLD_MS = 500;              // long press no touch (mesmo padrão do quadro de semestres)
  const CANCELAR_PX = 10;
  const AUTOSCROLL_ZONA_PX = 56;
  const AUTOSCROLL_VELOCIDADE_MAX = 20;

  let deps = {};          // { disciplinas: DISCIPLINAS }
  let instancias = [];    // estado em memória (espelha o storage)
  let elPool, elCatalogoLista, elDiasCols, elDiasHeader, elTimeCol, elGridScroll, elBuscaGs;

  /* ---------- utilidades ---------- */

  function gerarId() {
    return "inst_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function minutosParaLabel(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function corDisciplina(codigo) {
    let hash = 0;
    for (let i = 0; i < codigo.length; i++) {
      hash = (hash * 31 + codigo.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
  }

  function disciplinaPorCodigo(codigo) {
    return deps.disciplinas.find((d) => d.codigo === codigo);
  }

  /* ---------- persistência ---------- */

  function carregar() {
    const salvo = carregarGradeSemanalStorage();
    instancias = salvo && Array.isArray(salvo.instancias) ? salvo.instancias : [];
    // remove instâncias de disciplinas que não existem mais em dados.js
    instancias = instancias.filter((inst) => !!disciplinaPorCodigo(inst.codigo));
  }

  function persistir() {
    salvarGradeSemanalStorage({ instancias });
  }

  /* ---------- regras de conflito ---------- */

  /** Maior duração (em minutos) que um cartão pode ter a partir de `inicio` sem
   *  invadir o próximo cartão do mesmo dia (ou o fim da grade, se não houver). */
  function duracaoMaximaSemConflito(dia, inicio, idExcluir) {
    let limite = HORA_FIM_MIN;
    instancias.forEach((inst) => {
      if (inst.id === idExcluir || inst.dia !== dia || inst.inicio === null) return;
      if (inst.inicio > inicio && inst.inicio < limite) limite = inst.inicio;
    });
    return limite - inicio;
  }

  function haConflito(dia, inicio, duracao, idExcluir) {
    const fim = inicio + duracao;
    return instancias.some((inst) => {
      if (inst.id === idExcluir || inst.dia !== dia || inst.inicio === null) return false;
      const outroFim = inst.inicio + inst.duracao;
      return inst.inicio < fim && inicio < outroFim;
    });
  }

  /* ---------- ações que alteram o estado ---------- */

  function criarInstancia(codigo) {
    instancias.push({ id: gerarId(), codigo, dia: null, inicio: null, duracao: DURACAO_PADRAO_MIN });
    persistir();
    renderPool();
  }

  function removerInstancia(id) {
    instancias = instancias.filter((i) => i.id !== id);
    persistir();
    renderPool();
    renderGrid();
  }

  function desalocar(id) {
    const inst = instancias.find((i) => i.id === id);
    if (!inst) return;
    inst.dia = null;
    inst.inicio = null;
    persistir();
    renderPool();
    renderGrid();
  }

  function alocar(id, dia, inicioDesejado) {
    const inst = instancias.find((i) => i.id === id);
    if (!inst) return false;

    let inicio = Math.max(HORA_INICIO_MIN, Math.min(inicioDesejado, HORA_FIM_MIN - DURACAO_MIN_MIN));
    inicio = HORA_INICIO_MIN + Math.round((inicio - HORA_INICIO_MIN) / SLOT_MIN) * SLOT_MIN;
    const duracao = Math.min(inst.duracao || DURACAO_PADRAO_MIN, HORA_FIM_MIN - inicio);

    if (haConflito(dia, inicio, duracao, id)) {
      UI.mostrarToast("Conflito de horário: já existe uma aula nesse período.");
      renderPool();
      renderGrid();
      return false;
    }

    inst.dia = dia;
    inst.inicio = inicio;
    inst.duracao = duracao;
    persistir();
    renderPool();
    renderGrid();
    return true;
  }

  function redimensionar(id, novaDuracaoDesejada) {
    const inst = instancias.find((i) => i.id === id);
    if (!inst || inst.dia === null) return;
    const max = duracaoMaximaSemConflito(inst.dia, inst.inicio, id);
    const duracao = Math.max(DURACAO_MIN_MIN, Math.min(novaDuracaoDesejada, max));
    inst.duracao = duracao;
    persistir();
    renderGrid();
  }

  /* ---------- render: catálogo de disciplinas ---------- */

  function renderCatalogo() {
    const termo = (elBuscaGs.value || "").trim().toUpperCase();
    const lista = deps.disciplinas.filter((d) => {
      if (!termo) return true;
      return (d.codigo + " " + d.nome).toUpperCase().includes(termo);
    });

    elCatalogoLista.innerHTML = "";
    if (!lista.length) {
      const vazio = document.createElement("p");
      vazio.className = "gs-vazio";
      vazio.textContent = "Nenhuma disciplina encontrada.";
      elCatalogoLista.appendChild(vazio);
      return;
    }

    lista.forEach((d) => {
      const item = document.createElement("div");
      item.className = "gs-catalogo-item";
      const hue = corDisciplina(d.codigo);
      item.style.setProperty("--cor-h", hue);

      const info = document.createElement("div");
      info.className = "gs-catalogo-item-info";
      info.innerHTML = `<span class="gs-catalogo-codigo">${d.codigo}</span><span class="gs-catalogo-nome">${d.nome}</span>`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gs-btn-add";
      btn.setAttribute("aria-label", `Criar cartão de ${d.nome}`);
      btn.textContent = "+";
      btn.addEventListener("click", () => criarInstancia(d.codigo));

      item.appendChild(info);
      item.appendChild(btn);
      elCatalogoLista.appendChild(item);
    });
  }

  /* ---------- render: cartões disponíveis (pool) ---------- */

  function renderPool() {
    elPool.innerHTML = "";
    const disponiveis = instancias.filter((i) => i.dia === null);

    if (!disponiveis.length) {
      const vazio = document.createElement("p");
      vazio.className = "gs-vazio";
      vazio.textContent = "Nenhum cartão disponível — clique em “+” em uma disciplina acima.";
      elPool.appendChild(vazio);
      return;
    }

    disponiveis.forEach((inst) => {
      elPool.appendChild(criarElementoCartaoPool(inst));
    });
  }

  function criarElementoCartaoPool(inst) {
    const d = disciplinaPorCodigo(inst.codigo);
    const card = document.createElement("div");
    card.className = "gs-card gs-card-pool";
    card.dataset.instId = inst.id;
    card.style.setProperty("--cor-h", corDisciplina(inst.codigo));
    card.tabIndex = 0;

    const textos = document.createElement("span");
    textos.className = "gs-card-textos";

    const codigo = document.createElement("span");
    codigo.className = "gs-card-codigo";
    codigo.textContent = inst.codigo;

    const nome = document.createElement("span");
    nome.className = "gs-card-materia";
    nome.textContent = d ? d.nome : "";

    textos.appendChild(codigo);
    if (d) textos.appendChild(nome);

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "gs-card-remover";
    remover.setAttribute("aria-label", "Excluir este cartão");
    remover.textContent = "✕";
    remover.addEventListener("click", (e) => {
      e.stopPropagation();
      removerInstancia(inst.id);
    });

    card.appendChild(textos);
    card.appendChild(remover);

    ativarArrastoDesktop(card, inst.id);
    ativarArrastoTouch(card, inst.id);

    return card;
  }

  /* ---------- render: grade semanal ---------- */

  function renderGrid() {
    elDiasHeader.innerHTML = "";
    DIAS.forEach((nomeDia) => {
      const cel = document.createElement("div");
      cel.className = "gs-dia-header-cel";
      cel.textContent = nomeDia;
      elDiasHeader.appendChild(cel);
    });

    elTimeCol.innerHTML = "";
    elTimeCol.style.setProperty("--slot-h", SLOT_PX + "px");
    for (let min = HORA_INICIO_MIN; min < HORA_FIM_MIN; min += 60) {
      const rotulo = document.createElement("div");
      rotulo.className = "gs-hora-label";
      rotulo.style.height = SLOT_PX * 2 + "px";
      rotulo.textContent = minutosParaLabel(min);
      elTimeCol.appendChild(rotulo);
    }

    elDiasCols.innerHTML = "";
    elDiasCols.style.setProperty("--slot-h", SLOT_PX + "px");
    DIAS.forEach((_, diaIdx) => {
      const col = document.createElement("div");
      col.className = "gs-dia-col";
      col.dataset.dia = diaIdx;
      col.style.height = TOTAL_SLOTS * SLOT_PX + "px";

      instancias
        .filter((inst) => inst.dia === diaIdx)
        .forEach((inst) => col.appendChild(criarElementoCartaoGrade(inst)));

      ativarColunaAlvoDesktop(col, diaIdx);

      elDiasCols.appendChild(col);
    });
  }

  function criarElementoCartaoGrade(inst) {
    const d = disciplinaPorCodigo(inst.codigo);
    const card = document.createElement("div");
    card.className = "gs-card gs-card-grade";
    card.dataset.instId = inst.id;
    card.style.setProperty("--cor-h", corDisciplina(inst.codigo));
    card.style.top = ((inst.inicio - HORA_INICIO_MIN) / SLOT_MIN) * SLOT_PX + "px";
    card.style.height = Math.max(SLOT_PX - 3, (inst.duracao / SLOT_MIN) * SLOT_PX - 3) + "px";
    card.tabIndex = 0;

    const codigo = document.createElement("span");
    codigo.className = "gs-card-codigo";
    codigo.textContent = inst.codigo;

    const nome = document.createElement("span");
    nome.className = "gs-card-materia";
    nome.textContent = d ? d.nome : "";

    const horario = document.createElement("span");
    horario.className = "gs-card-horario";
    horario.textContent = minutosParaLabel(inst.inicio) + "–" + minutosParaLabel(inst.inicio + inst.duracao);

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "gs-card-remover";
    remover.setAttribute("aria-label", "Remover da grade");
    remover.textContent = "✕";
    remover.addEventListener("click", (e) => {
      e.stopPropagation();
      desalocar(inst.id);
    });

    const alca = document.createElement("div");
    alca.className = "gs-card-resize";
    alca.setAttribute("aria-hidden", "true");

    card.appendChild(codigo);
    if (d) card.appendChild(nome);
    card.appendChild(horario);
    card.appendChild(remover);
    card.appendChild(alca);

    ativarArrastoDesktop(card, inst.id);
    ativarArrastoTouch(card, inst.id);
    ativarRedimensionarDesktop(alca, inst.id);
    ativarRedimensionarTouch(alca, inst.id);

    return card;
  }

  /* ---------- drag and drop: desktop (HTML5 Drag and Drop API) ---------- */

  let arrastoInfo = null; // { id, duracao } — usado para o preview durante o dragover
  let previewEl = null;

  function garantirPreview() {
    if (!previewEl) {
      previewEl = document.createElement("div");
      previewEl.className = "gs-drop-preview";
    }
    return previewEl;
  }

  function limparPreview() {
    if (previewEl && previewEl.parentNode) previewEl.parentNode.removeChild(previewEl);
    document.querySelectorAll(".gs-dia-col.drag-over, .gs-pool.drag-over").forEach((el) => el.classList.remove("drag-over"));
  }

  function ativarArrastoDesktop(cardEl, instId) {
    cardEl.draggable = true;
    cardEl.addEventListener("dragstart", (e) => {
      const inst = instancias.find((i) => i.id === instId);
      arrastoInfo = { id: instId, duracao: inst ? inst.duracao : DURACAO_PADRAO_MIN };
      e.dataTransfer.setData("text/plain", instId);
      e.dataTransfer.effectAllowed = "move";
      cardEl.classList.add("dragging");
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.classList.remove("dragging");
      limparPreview();
      arrastoInfo = null;
    });
  }

  function ativarColunaAlvoDesktop(colEl, diaIdx) {
    colEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      colEl.classList.add("drag-over");
      if (!arrastoInfo) return;
      const rect = colEl.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round(offsetY / SLOT_PX)));
      const preview = garantirPreview();
      preview.style.top = slot * SLOT_PX + "px";
      preview.style.height = Math.max(SLOT_PX, (arrastoInfo.duracao / SLOT_MIN) * SLOT_PX) + "px";
      if (preview.parentNode !== colEl) colEl.appendChild(preview);
    });
    colEl.addEventListener("dragleave", (e) => {
      if (!colEl.contains(e.relatedTarget)) colEl.classList.remove("drag-over");
    });
    colEl.addEventListener("drop", (e) => {
      e.preventDefault();
      colEl.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      const rect = colEl.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round(offsetY / SLOT_PX)));
      alocar(id, diaIdx, HORA_INICIO_MIN + slot * SLOT_MIN);
      limparPreview();
    });
  }

  function ativarPoolAlvoDesktop() {
    elPool.addEventListener("dragover", (e) => {
      e.preventDefault();
      elPool.classList.add("drag-over");
    });
    elPool.addEventListener("dragleave", (e) => {
      if (!elPool.contains(e.relatedTarget)) elPool.classList.remove("drag-over");
    });
    elPool.addEventListener("drop", (e) => {
      e.preventDefault();
      elPool.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      if (id) desalocar(id);
    });
  }

  /* ---------- redimensionar: desktop (mouse) ---------- */

  function ativarRedimensionarDesktop(alcaEl, instId) {
    alcaEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const inst = instancias.find((i) => i.id === instId);
      if (!inst) return;
      const cardEl = alcaEl.parentElement;
      const duracaoOriginal = inst.duracao;
      const startY = e.clientY;

      function mover(ev) {
        const deltaSlots = Math.round((ev.clientY - startY) / SLOT_PX);
        const candidata = Math.max(DURACAO_MIN_MIN, duracaoOriginal + deltaSlots * SLOT_MIN);
        const max = duracaoMaximaSemConflito(inst.dia, inst.inicio, instId);
        const nova = Math.min(candidata, max);
        cardEl.style.height = Math.max(SLOT_PX - 3, (nova / SLOT_MIN) * SLOT_PX - 3) + "px";
      }
      function soltar(ev) {
        document.removeEventListener("mousemove", mover);
        document.removeEventListener("mouseup", soltar);
        const deltaSlots = Math.round((ev.clientY - startY) / SLOT_PX);
        redimensionar(instId, duracaoOriginal + deltaSlots * SLOT_MIN);
      }
      document.addEventListener("mousemove", mover);
      document.addEventListener("mouseup", soltar);
    });
  }

  function ativarRedimensionarTouch(alcaEl, instId) {
    alcaEl.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
        const t = e.touches[0];
        const inst = instancias.find((i) => i.id === instId);
        if (!inst) return;
        const cardEl = alcaEl.parentElement;
        const duracaoOriginal = inst.duracao;
        const startY = t.clientY;

        function mover(ev) {
          ev.preventDefault();
          const tt = ev.touches[0];
          const deltaSlots = Math.round((tt.clientY - startY) / SLOT_PX);
          const candidata = Math.max(DURACAO_MIN_MIN, duracaoOriginal + deltaSlots * SLOT_MIN);
          const max = duracaoMaximaSemConflito(inst.dia, inst.inicio, instId);
          const nova = Math.min(candidata, max);
          cardEl.style.height = Math.max(SLOT_PX - 3, (nova / SLOT_MIN) * SLOT_PX - 3) + "px";
        }
        function soltar(ev) {
          alcaEl.removeEventListener("touchmove", mover);
          alcaEl.removeEventListener("touchend", soltar);
          alcaEl.removeEventListener("touchcancel", soltar);
          const tt = ev.changedTouches[0];
          const deltaSlots = Math.round((tt.clientY - startY) / SLOT_PX);
          redimensionar(instId, duracaoOriginal + deltaSlots * SLOT_MIN);
        }
        alcaEl.addEventListener("touchmove", mover, { passive: false });
        alcaEl.addEventListener("touchend", soltar);
        alcaEl.addEventListener("touchcancel", soltar);
      },
      { passive: true }
    );
  }

  /* ---------- drag and drop: touch (long press + auto-scroll) ---------- */

  const AutoScrollGrid = (function () {
    let raf = null;
    let vx = 0, vy = 0;
    let acX = 0, acY = 0;
    let scrollEl = null;

    function loop() {
      if (scrollEl) {
        if (vx !== 0) {
          acX += vx;
          const p = Math.trunc(acX);
          if (p !== 0) { scrollEl.scrollLeft += p; acX -= p; }
        }
        if (vy !== 0) {
          acY += vy;
          const p = Math.trunc(acY);
          if (p !== 0) { scrollEl.scrollTop += p; acY -= p; }
        }
      }
      raf = requestAnimationFrame(loop);
    }

    function start(el) {
      scrollEl = el;
      acX = acY = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function update(clientX, clientY) {
      if (!scrollEl) return;
      const rect = scrollEl.getBoundingClientRect();
      const dl = clientX - rect.left, dr = rect.right - clientX;
      const dt = clientY - rect.top, db = rect.bottom - clientY;

      vx = dl < AUTOSCROLL_ZONA_PX ? -AUTOSCROLL_VELOCIDADE_MAX * Math.max(0, (AUTOSCROLL_ZONA_PX - dl) / AUTOSCROLL_ZONA_PX)
        : dr < AUTOSCROLL_ZONA_PX ? AUTOSCROLL_VELOCIDADE_MAX * Math.max(0, (AUTOSCROLL_ZONA_PX - dr) / AUTOSCROLL_ZONA_PX)
        : 0;
      vy = dt < AUTOSCROLL_ZONA_PX ? -AUTOSCROLL_VELOCIDADE_MAX * Math.max(0, (AUTOSCROLL_ZONA_PX - dt) / AUTOSCROLL_ZONA_PX)
        : db < AUTOSCROLL_ZONA_PX ? AUTOSCROLL_VELOCIDADE_MAX * Math.max(0, (AUTOSCROLL_ZONA_PX - db) / AUTOSCROLL_ZONA_PX)
        : 0;
    }

    function stop() {
      vx = vy = 0;
      scrollEl = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    return { start, update, stop };
  })();

  function ativarArrastoTouch(cardEl, instId) {
    let holdTimer = null;
    let arrastando = false;
    let ghost = null;
    let startX = 0, startY = 0, originLeft = 0, originTop = 0, originWidth = 0;

    function limparTimer() {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    }

    function alvoSobPonto(x, y) {
      if (ghost) ghost.style.display = "none";
      const el = document.elementFromPoint(x, y);
      if (ghost) ghost.style.display = "";
      if (!el) return null;
      const col = el.closest(".gs-dia-col");
      if (col) return { tipo: "grade", col };
      const pool = el.closest("#gs-pool");
      if (pool) return { tipo: "pool" };
      return null;
    }

    function limparAlvos() {
      document.querySelectorAll(".gs-dia-col.drag-over").forEach((c) => c.classList.remove("drag-over"));
      elPool.classList.remove("drag-over");
    }

    function iniciarArraste() {
      arrastando = true;
      cardEl.classList.remove("touch-pressing");
      cardEl.classList.add("dragging");
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }

      const inst = instancias.find((i) => i.id === instId);
      arrastoInfo = { id: instId, duracao: inst ? inst.duracao : DURACAO_PADRAO_MIN };

      ghost = cardEl.cloneNode(true);
      ghost.classList.add("gs-card-ghost");
      ghost.style.width = originWidth + "px";
      ghost.style.left = originLeft + "px";
      ghost.style.top = originTop + "px";
      document.body.appendChild(ghost);

      AutoScrollGrid.start(elGridScroll);
    }

    cardEl.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        const rect = cardEl.getBoundingClientRect();
        originLeft = rect.left;
        originTop = rect.top;
        originWidth = rect.width;
        arrastando = false;
        cardEl.classList.add("touch-pressing");
        limparTimer();
        holdTimer = setTimeout(() => {
          holdTimer = null;
          iniciarArraste();
        }, HOLD_MS);
      },
      { passive: true }
    );

    cardEl.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!arrastando) {
          if (holdTimer && (Math.abs(dx) > CANCELAR_PX || Math.abs(dy) > CANCELAR_PX)) {
            limparTimer();
            cardEl.classList.remove("touch-pressing");
          }
          return;
        }

        e.preventDefault();
        ghost.style.left = originLeft + dx + "px";
        ghost.style.top = originTop + dy + "px";
        limparAlvos();
        const alvo = alvoSobPonto(t.clientX, t.clientY);
        if (alvo && alvo.tipo === "grade") alvo.col.classList.add("drag-over");
        if (alvo && alvo.tipo === "pool") elPool.classList.add("drag-over");
        AutoScrollGrid.update(t.clientX, t.clientY);
      },
      { passive: false }
    );

    function finalizar(e) {
      limparTimer();
      cardEl.classList.remove("touch-pressing");
      cardEl.classList.remove("dragging");
      AutoScrollGrid.stop();

      if (arrastando) {
        const t = e.changedTouches[0];
        const alvo = alvoSobPonto(t.clientX, t.clientY);
        limparAlvos();
        if (alvo && alvo.tipo === "grade") {
          const rect = alvo.col.getBoundingClientRect();
          const offsetY = t.clientY - rect.top;
          const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round(offsetY / SLOT_PX)));
          alocar(instId, parseInt(alvo.col.dataset.dia, 10), HORA_INICIO_MIN + slot * SLOT_MIN);
        } else if (alvo && alvo.tipo === "pool") {
          desalocar(instId);
        }
      }
      if (ghost) { ghost.remove(); ghost = null; }
      arrastando = false;
      arrastoInfo = null;
    }

    cardEl.addEventListener("touchend", finalizar);
    cardEl.addEventListener("touchcancel", finalizar);
  }

  /* ---------- busca ---------- */

  function ativarBusca() {
    elBuscaGs.addEventListener("input", renderCatalogo);
  }

  /* ---------- inicialização ---------- */

  function init(config) {
    deps = config;

    elPool = document.getElementById("gs-pool");
    elCatalogoLista = document.getElementById("gs-catalogo-lista");
    elDiasCols = document.getElementById("gs-dias-cols");
    elDiasHeader = document.getElementById("gs-dias-header");
    elTimeCol = document.getElementById("gs-time-col");
    elGridScroll = document.getElementById("gs-grid-scroll");
    elBuscaGs = document.getElementById("gs-search");

    carregar();
    renderCatalogo();
    renderPool();
    renderGrid();
    ativarBusca();
    ativarPoolAlvoDesktop();
  }

  return { init };
})();
