/* =====================================================
   dragdrop.js — arrastar disciplinas entre semestres
   Cobre dois modos:
   - Desktop: Drag and Drop API nativa (HTML5)
   - Touch: implementação manual com touchstart/move/end,
     já que a Drag and Drop API nativa não funciona em
     telas touch.
   ===================================================== */

const DragDrop = (function () {
  const LIMIAR_PX = 8; // distância mínima para considerar "arrastando" no touch

  /** Torna um card arrastável no desktop (mouse). */
  function ativarDesktop(cardEl, codigo) {
    cardEl.draggable = true;
    cardEl.addEventListener("dragstart", (e) => {
      cardEl.classList.add("dragging");
      e.dataTransfer.setData("text/plain", codigo);
      e.dataTransfer.effectAllowed = "move";
    });
    cardEl.addEventListener("dragend", () => cardEl.classList.remove("dragging"));
  }

  /** Torna uma coluna um alvo válido de drop (desktop). */
  function ativarColunaAlvo(bodyEl, colEl, semestre, onDrop) {
    bodyEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      colEl.classList.add("drag-over");
    });
    bodyEl.addEventListener("dragleave", (e) => {
      if (!bodyEl.contains(e.relatedTarget)) colEl.classList.remove("drag-over");
    });
    bodyEl.addEventListener("drop", (e) => {
      e.preventDefault();
      colEl.classList.remove("drag-over");
      const codigo = e.dataTransfer.getData("text/plain");
      if (codigo) onDrop(codigo, semestre);
    });
  }

  /** Torna um card arrastável por toque (mobile/tablet). */
  function ativarTouch(cardEl, codigo, onDrop) {
    let ghost = null;
    let startX = 0, startY = 0;
    let originLeft = 0, originTop = 0, originWidth = 0;
    let arrastando = false;

    function limparAlvos() {
      document.querySelectorAll(".column.drag-over").forEach((c) => c.classList.remove("drag-over"));
    }

    function colunaSobPonto(x, y) {
      if (ghost) ghost.style.display = "none";
      const el = document.elementFromPoint(x, y);
      if (ghost) ghost.style.display = "";
      return el ? el.closest(".column") : null;
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
          if (Math.abs(dx) < LIMIAR_PX && Math.abs(dy) < LIMIAR_PX) return;
          arrastando = true;
          cardEl.classList.add("dragging");
          ghost = cardEl.cloneNode(true);
          ghost.classList.add("card-ghost");
          ghost.style.width = originWidth + "px";
          ghost.style.left = originLeft + "px";
          ghost.style.top = originTop + "px";
          document.body.appendChild(ghost);
        }

        if (arrastando) {
          e.preventDefault(); // evita rolar a página enquanto arrasta
          ghost.style.left = originLeft + dx + "px";
          ghost.style.top = originTop + dy + "px";
          limparAlvos();
          const col = colunaSobPonto(t.clientX, t.clientY);
          if (col) col.classList.add("drag-over");
        }
      },
      { passive: false }
    );

    function finalizar(e) {
      cardEl.classList.remove("dragging");
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

  return { ativarDesktop, ativarColunaAlvo, ativarTouch };
})();
