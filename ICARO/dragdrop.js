/* =====================================================
   dragdrop.js — arrastar disciplinas entre semestres
   Cobre dois modos:
   - Desktop: Drag and Drop API nativa (HTML5)
   - Touch: implementação manual com touchstart/move/end

   Comportamento no touch (igual a Trello / Notion / Google Keep):
   - Tocar e deslizar rapidamente = rolagem normal da página.
   - Tocar e SEGURAR parado por ~500ms (long press) = entra em
     modo de arraste.
   - Durante o arraste, aproximar o dedo das bordas esquerda/direita
     da tela dispara rolagem horizontal automática entre semestres.
   ===================================================== */

const DragDrop = (function () {
  const HOLD_MS = 500;              // duração do long press para iniciar o arraste
  const CANCELAR_PX = 10;           // se mover mais que isso antes do long press dar, é rolagem
  const AUTOSCROLL_ZONA_PX = 64;    // faixa nas bordas da TELA que dispara auto-scroll
  const AUTOSCROLL_VELOCIDADE_MAX = 28; // px por frame, na borda extrema

  // Código da disciplina sendo arrastada no momento (desktop ou touch).
  // Usado só para dar feedback visual (coluna "bloqueada") durante o arraste;
  // quem de fato decide se o movimento é permitido é moverDisciplina, no script.js.
  let codigoArrastandoAtual = null;

  /* ---------- Auto-scroll horizontal (usado no drag desktop e touch) ----------
     Importante: a zona de detecção usa as bordas da JANELA (window.innerWidth),
     não do elemento — é o que o usuário sente como "borda da tela" no celular,
     e evita depender do bounding rect do próprio container que rola (que pode
     variar por causa de padding/scroll-snap/zoom). */

  const AutoScroll = (function () {
    let raf = null;
    let vx = 0;
    let acumulado = 0;
    let scrollEl = null;

    function loop() {
      if (scrollEl && vx !== 0) {
        acumulado += vx;
        const passo = Math.trunc(acumulado);
        if (passo !== 0) {
          scrollEl.scrollLeft += passo;
          acumulado -= passo;
        }
      }
      raf = requestAnimationFrame(loop);
    }

    function start(el) {
      scrollEl = el;
      acumulado = 0;
      // desliga o scroll-snap enquanto arrasta: com "scroll-snap-type: x mandatory"
      // (usado no layout mobile) o navegador tende a "puxar" o scroll de volta
      // para a coluna mais próxima a cada ajuste programático, o que travava o
      // auto-scroll no celular. Sem o snap durante o arraste, scrollLeft responde
      // imediatamente; o snap volta a valer assim que soltamos a disciplina.
      el.classList.add("autoscroll-ativo");
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function update(clientX) {
      if (!scrollEl) return;
      const larguraTela = window.innerWidth;
      const distEsquerda = clientX;
      const distDireita = larguraTela - clientX;

      if (distEsquerda < AUTOSCROLL_ZONA_PX) {
        const t = Math.max(0, (AUTOSCROLL_ZONA_PX - distEsquerda) / AUTOSCROLL_ZONA_PX);
        vx = -AUTOSCROLL_VELOCIDADE_MAX * t;
      } else if (distDireita < AUTOSCROLL_ZONA_PX) {
        const t = Math.max(0, (AUTOSCROLL_ZONA_PX - distDireita) / AUTOSCROLL_ZONA_PX);
        vx = AUTOSCROLL_VELOCIDADE_MAX * t;
      } else {
        vx = 0;
      }
    }

    function stop() {
      vx = 0;
      acumulado = 0;
      if (scrollEl) scrollEl.classList.remove("autoscroll-ativo");
      scrollEl = null;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    return { start, update, stop };
  })();

  /** Torna um card arrastável no desktop (mouse). */
  function ativarDesktop(cardEl, codigo) {
    cardEl.draggable = true;
    cardEl.addEventListener("dragstart", (e) => {
      cardEl.classList.add("dragging");
      codigoArrastandoAtual = codigo;
      e.dataTransfer.setData("text/plain", codigo);
      e.dataTransfer.effectAllowed = "move";
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.classList.remove("dragging");
      codigoArrastandoAtual = null;
      AutoScroll.stop();
    });
  }

  /** Torna uma coluna um alvo válido de drop (desktop). */
  function ativarColunaAlvo(bodyEl, colEl, semestre, onDrop) {
    bodyEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (codigoArrastandoAtual && !disciplinaPermiteSemestre(codigoArrastandoAtual, semestre)) {
        colEl.classList.remove("drag-over");
        colEl.classList.add("drag-invalid");
      } else {
        colEl.classList.remove("drag-invalid");
        colEl.classList.add("drag-over");
      }
    });
    bodyEl.addEventListener("dragleave", (e) => {
      if (!bodyEl.contains(e.relatedTarget)) {
        colEl.classList.remove("drag-over");
        colEl.classList.remove("drag-invalid");
      }
    });
    bodyEl.addEventListener("drop", (e) => {
      e.preventDefault();
      colEl.classList.remove("drag-over");
      colEl.classList.remove("drag-invalid");
      const codigo = e.dataTransfer.getData("text/plain");
      if (codigo) onDrop(codigo, semestre);
    });
  }

  /**
   * Liga a rolagem horizontal automática do quadro durante um arraste
   * feito com o mouse (Drag and Drop API nativa). Chamado uma única
   * vez, no elemento `.board`.
   */
  function ativarAutoScrollBoard(boardEl) {
    boardEl.addEventListener("dragover", (e) => {
      AutoScroll.start(boardEl);
      AutoScroll.update(e.clientX);
    });
    boardEl.addEventListener("dragleave", (e) => {
      if (!boardEl.contains(e.relatedTarget)) AutoScroll.stop();
    });
    boardEl.addEventListener("drop", () => AutoScroll.stop());
    document.addEventListener("dragend", () => AutoScroll.stop());
  }

  /** Torna um card arrastável por toque (mobile/tablet), com long press. */
  function ativarTouch(cardEl, codigo, onDrop) {
    let ghost = null;
    let holdTimer = null;
    let startX = 0, startY = 0;
    let originLeft = 0, originTop = 0, originWidth = 0;
    let arrastando = false;

    function limparTimer() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    function limparAlvos() {
      document.querySelectorAll(".column.drag-over").forEach((c) => c.classList.remove("drag-over"));
      document.querySelectorAll(".column.drag-invalid").forEach((c) => c.classList.remove("drag-invalid"));
    }

    function colunaSobPonto(x, y) {
      if (ghost) ghost.style.display = "none";
      const el = document.elementFromPoint(x, y);
      if (ghost) ghost.style.display = "";
      return el ? el.closest(".column") : null;
    }

    function iniciarArraste() {
      arrastando = true;
      codigoArrastandoAtual = codigo;
      cardEl.classList.remove("touch-pressing");
      cardEl.classList.add("dragging");
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (e) { /* ignora se não suportado */ }
      }
      ghost = cardEl.cloneNode(true);
      ghost.classList.add("card-ghost");
      ghost.style.width = originWidth + "px";
      ghost.style.left = originLeft + "px";
      ghost.style.top = originTop + "px";
      document.body.appendChild(ghost);

      const boardEl = document.getElementById("board");
      if (boardEl) AutoScroll.start(boardEl);
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
          // Ainda não entrou em modo de arraste: se o dedo já se moveu
          // mais do que o limiar antes do long press disparar, é rolagem
          // — cancela o long press e deixa a página rolar normalmente
          // (não chamamos preventDefault em nenhum momento aqui).
          if (holdTimer && (Math.abs(dx) > CANCELAR_PX || Math.abs(dy) > CANCELAR_PX)) {
            limparTimer();
            cardEl.classList.remove("touch-pressing");
          }
          return;
        }

        // Modo de arraste ativo: agora sim bloqueia a rolagem da página
        // e move o card-fantasma livremente.
        e.preventDefault();
        ghost.style.left = originLeft + dx + "px";
        ghost.style.top = originTop + dy + "px";
        limparAlvos();
        const col = colunaSobPonto(t.clientX, t.clientY);
        if (col) {
          const semestreCol = parseInt(col.dataset.semestre, 10);
          const permitido = disciplinaPermiteSemestre(codigo, semestreCol);
          col.classList.add(permitido ? "drag-over" : "drag-invalid");
        }
        AutoScroll.update(t.clientX);
      },
      { passive: false }
    );

    function finalizar(e) {
      limparTimer();
      cardEl.classList.remove("touch-pressing");
      cardEl.classList.remove("dragging");
      codigoArrastandoAtual = null;
      AutoScroll.stop();

      if (arrastando) {
        const t = e.changedTouches[0];
        const col = colunaSobPonto(t.clientX, t.clientY);
        limparAlvos();
        if (col) {
          const semestre = parseInt(col.dataset.semestre, 10);
          onDrop(codigo, semestre);
        }
      }
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      arrastando = false;
    }

    cardEl.addEventListener("touchend", finalizar);
    cardEl.addEventListener("touchcancel", finalizar);
  }

  return { ativarDesktop, ativarColunaAlvo, ativarTouch, ativarAutoScrollBoard };
})();
