/* =====================================================
   modal.js — painel de detalhes da disciplina
   ===================================================== */

const Modal = (function () {
  let overlay = null;
  let codigoAtual = null;
  let deps = {};
  let obsTimeout = null;

  function init(config) {
    deps = config; // { getEstado, disciplinaPorCodigo, desbloqueiaDe, ordinal, onStatusChange, onObsChange }
    overlay = document.getElementById("modal-overlay");

    document.getElementById("modal-close").addEventListener("click", fechar);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fechar();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && estaAberto()) fechar();
    });

    document.getElementById("modal-status").addEventListener("change", (e) => {
      if (!codigoAtual) return;
      deps.onStatusChange(codigoAtual, e.target.value);
      abrir(codigoAtual); // mantém o modal aberto com os dados atualizados
    });

    document.getElementById("modal-obs").addEventListener("input", (e) => {
      if (!codigoAtual) return;
      const valor = e.target.value;
      clearTimeout(obsTimeout);
      obsTimeout = setTimeout(() => deps.onObsChange(codigoAtual, valor), 400);
    });
  }

  function abrir(codigo) {
    const estado = deps.getEstado();
    const d = deps.disciplinaPorCodigo(codigo);
    if (!d) return;
    codigoAtual = codigo;

    document.getElementById("modal-codigo").textContent = d.codigo;
    document.getElementById("modal-nome").textContent = d.nome;
    document.getElementById("modal-creditos").textContent = d.creditos;
    document.getElementById("modal-departamento").textContent = d.departamento;
    document.getElementById("modal-tipo").textContent = d.tipo;
    document.getElementById("modal-semestre").textContent = deps.ordinal(estado[codigo].semestre);
    document.getElementById("modal-status").value = estado[codigo].status;
    document.getElementById("modal-obs").value = estado[codigo].observacoes || "";
    document.getElementById("modal-ementa").textContent =
      d.ementa && d.ementa.trim() ? d.ementa : "Ementa ainda não cadastrada.";

    const rotuloRestricao = rotuloRestricaoOferecimento(d);
    const restricaoEl = document.getElementById("modal-restricao");
    if (restricaoEl) {
      restricaoEl.textContent = rotuloRestricao || "";
      restricaoEl.classList.toggle("show", !!rotuloRestricao);
    }

    renderChips("modal-prereqs", d.prerequisitos, "Nenhum");
    renderChips("modal-desbloqueia", deps.desbloqueiaDe(d.codigo), "Nenhuma");

    overlay.classList.add("open");
    document.body.classList.add("modal-aberto");
  }

  function renderChips(containerId, lista, textoVazio) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!lista || lista.length === 0) {
      const span = document.createElement("span");
      span.className = "chip chip-empty";
      span.textContent = textoVazio;
      container.appendChild(span);
      return;
    }
    lista.forEach((cod) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.tabIndex = 0;
      const disc = deps.disciplinaPorCodigo(cod);
      chip.textContent = disc ? `${cod} · ${disc.nome}` : cod;
      chip.addEventListener("click", () => abrir(cod));
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir(cod);
        }
      });
      container.appendChild(chip);
    });
  }

  function fechar() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.classList.remove("modal-aberto");
    codigoAtual = null;
  }

  function estaAberto() {
    return !!overlay && overlay.classList.contains("open");
  }

  return { init, abrir, fechar, estaAberto };
})();
