/* =====================================================
   ui.js — renderização do quadro (colunas, cards, dashboard)
   ===================================================== */

const UI = (function () {
  let boardEl, dotsEl;
  let deps = {}; // { getEstado, onMover, onAbrirModal, numSemestres }
  let dotsRaf = null;

  function init(config) {
    deps = config;
    boardEl = document.getElementById("board");
    dotsEl = document.getElementById("board-dots");

    boardEl.addEventListener("scroll", () => {
      if (dotsRaf) return;
      dotsRaf = requestAnimationFrame(() => {
        atualizarDotAtivo();
        dotsRaf = null;
      });
    }, { passive: true });

    ativarPesquisa();
  }

  function ordinal(n) {
    return n + "º";
  }

  function disciplinaPorCodigo(cod) {
    return DISCIPLINAS.find((d) => d.codigo === cod);
  }

  function desbloqueiaDe(cod) {
    return DISCIPLINAS.filter((d) => d.prerequisitos.includes(cod)).map((d) => d.codigo);
  }

  function disciplinasDoSemestre(estado, sem) {
    return DISCIPLINAS.filter((d) => estado[d.codigo].semestre === sem);
  }

  function creditosDoSemestre(estado, sem) {
    return disciplinasDoSemestre(estado, sem).reduce((soma, d) => soma + d.creditos, 0);
  }

  /* ---------- Quadro ---------- */

  function renderBoard() {
    const estado = deps.getEstado();
    const scrollAntes = boardEl.scrollLeft;

    boardEl.innerHTML = "";
    for (let sem = 1; sem <= deps.numSemestres; sem++) {
      boardEl.appendChild(criarColuna(estado, sem));
    }
    boardEl.scrollLeft = scrollAntes;

    renderizarDots(deps.numSemestres);
    atualizarDashboard(estado);
    aplicarFiltroPesquisa();
  }

  function criarColuna(estado, sem) {
    const col = document.createElement("section");
    col.className = "column";
    col.dataset.semestre = sem;

    const header = document.createElement("div");
    header.className = "column-header";
    header.dataset.num = "S" + sem;

    const titulo = document.createElement("h2");
    titulo.className = "column-title";
    titulo.textContent = ordinal(sem) + " Semestre";

    const meta = document.createElement("div");
    meta.className = "column-meta";
    const creditos = creditosDoSemestre(estado, sem);
    const qtdDisc = disciplinasDoSemestre(estado, sem).length;
    meta.innerHTML = `
      <span class="column-credits">${creditos} créditos</span>
      <span>${qtdDisc} disciplina${qtdDisc === 1 ? "" : "s"}</span>
    `;

    const aviso = document.createElement("div");
    aviso.className = "column-warning";
    aviso.textContent = "⚠ carga pesada — considere redistribuir disciplinas";

    header.appendChild(titulo);
    header.appendChild(meta);
    header.appendChild(aviso);

    const body = document.createElement("div");
    body.className = "column-body";

    DragDrop.ativarColunaAlvo(body, col, sem, (codigo, novoSem) => deps.onMover(codigo, novoSem));

    disciplinasDoSemestre(estado, sem).forEach((d) => body.appendChild(criarCard(estado, d)));

    col.appendChild(header);
    col.appendChild(body);

    atualizarAvisoColuna(col, creditos);

    return col;
  }

  function atualizarAvisoColuna(col, creditos) {
    const creditsSpan = col.querySelector(".column-credits");
    const aviso = col.querySelector(".column-warning");
    creditsSpan.classList.remove("over-30", "over-34");
    aviso.classList.remove("show");
    if (creditos > 45) {
      creditsSpan.classList.add("over-34");
      aviso.classList.add("show");
    } else if (creditos > 30) {
      creditsSpan.classList.add("over-30");
    }
  }

  function criarCard(estado, d) {
    const info = estado[d.codigo];
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${d.codigo} — ${d.nome}. Status: ${info.status}. Toque para ver detalhes.`);
    card.dataset.codigo = d.codigo;
    card.dataset.status = info.status;

    DragDrop.ativarDesktop(card, d.codigo);
    DragDrop.ativarTouch(card, d.codigo, (codigo, novoSem) => deps.onMover(codigo, novoSem));

    card.addEventListener("click", () => deps.onAbrirModal(d.codigo));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        deps.onAbrirModal(d.codigo);
      }
    });

    const top = document.createElement("div");
    top.className = "card-top";
    const codigoEl = document.createElement("span");
    codigoEl.className = "card-codigo";
    codigoEl.textContent = d.codigo;
    const statusDot = document.createElement("span");
    statusDot.className = "card-status-dot";
    statusDot.dataset.status = info.status;
    top.appendChild(codigoEl);
    top.appendChild(statusDot);

    const nome = document.createElement("p");
    nome.className = "card-nome";
    nome.textContent = d.nome;

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const creditosEl = document.createElement("span");
    creditosEl.className = "card-creditos";
    creditosEl.textContent = d.creditos + (d.creditos === 1 ? " crédito" : " créditos");
    bottom.appendChild(creditosEl);
    if (d.tipo === "Eletiva") {
      const tag = document.createElement("span");
      tag.className = "card-eletiva-tag";
      tag.textContent = "eletiva";
      bottom.appendChild(tag);
    }

    card.appendChild(top);
    card.appendChild(nome);
    card.appendChild(bottom);

    return card;
  }

  /* ---------- Indicador de semestre (mobile) ---------- */

  function renderizarDots(num) {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    for (let i = 1; i <= num; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "board-dot";
      dot.setAttribute("aria-label", `Ir para o ${ordinal(i)} semestre`);
      dot.addEventListener("click", () => irParaSemestre(i));
      dotsEl.appendChild(dot);
    }
    atualizarDotAtivo();
  }

  function irParaSemestre(sem) {
    const col = boardEl.querySelector(`.column[data-semestre="${sem}"]`);
    if (col) col.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function atualizarDotAtivo() {
    if (!dotsEl) return;
    const dots = dotsEl.querySelectorAll(".board-dot");
    const cols = boardEl.querySelectorAll(".column");
    if (!dots.length || !cols.length) return;
    const boardLeft = boardEl.getBoundingClientRect().left;
    let ativo = 0;
    let melhorDist = Infinity;
    cols.forEach((col, i) => {
      const dist = Math.abs(col.getBoundingClientRect().left - boardLeft);
      if (dist < melhorDist) {
        melhorDist = dist;
        ativo = i;
      }
    });
    dots.forEach((dot, i) => dot.classList.toggle("active", i === ativo));
  }

  /* ---------- Dashboard ---------- */

  function atualizarDashboard(estado) {
    const total = TOTAL_DISCIPLINAS_CURSO;
    const concluidas = DISCIPLINAS.filter((d) => estado[d.codigo].status === "concluida");
    const creditosConcluidos = concluidas.reduce((s, d) => s + d.creditos, 0);
    const creditosRestantes = TOTAL_CREDITOS_CURSO - creditosConcluidos;
    const percentual = TOTAL_CREDITOS_CURSO > 0
      ? Math.round((creditosConcluidos / TOTAL_CREDITOS_CURSO) * 100)
      : 0;

    document.getElementById("stat-disc-concluidas").textContent = `${concluidas.length} / ${total}`;
    document.getElementById("stat-creditos-concluidos").textContent = creditosConcluidos;
    document.getElementById("stat-creditos-restantes").textContent = creditosRestantes;
    document.getElementById("progress-fill").style.width = percentual + "%";
    document.getElementById("progress-percent").textContent = percentual + "%";
  }

  /* ---------- Pesquisa ---------- */

  function ativarPesquisa() {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", aplicarFiltroPesquisa);
  }

  function aplicarFiltroPesquisa() {
    const searchInput = document.getElementById("search-input");
    const termo = searchInput.value.trim().toUpperCase();
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      const cod = card.dataset.codigo;
      const d = disciplinaPorCodigo(cod);
      const alvo = (d.codigo + " " + d.nome).toUpperCase();
      const bate = termo === "" || alvo.includes(termo);
      card.classList.toggle("hide", !bate);
      card.classList.toggle("highlight-match", bate && termo !== "");
    });
  }

  /* ---------- Toast ---------- */

  let toastTimeout = null;
  function mostrarToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  return {
    init,
    renderBoard,
    mostrarToast,
    ordinal,
    disciplinaPorCodigo,
    desbloqueiaDe,
  };
})();
