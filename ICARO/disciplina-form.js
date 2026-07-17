/* =====================================================
   disciplina-form.js — formulário para adicionar disciplinas
   customizadas (não presentes na grade padrão de dados.js).
   ===================================================== */

const FormDisciplina = (function () {
  let overlay, form, erroEl;
  let deps = {}; // { onCriar, numSemestres, ordinal }

  function init(config) {
    deps = config;
    overlay = document.getElementById("form-overlay");
    form = document.getElementById("form-nova-disciplina");
    erroEl = document.getElementById("form-erro");

    preencherOpcoesSemestre();

    document.getElementById("btn-nova-disciplina").addEventListener("click", abrir);
    document.getElementById("form-close").addEventListener("click", fechar);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fechar();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && estaAberto()) fechar();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      esconderErro();

      const dadosForm = {
        codigo: document.getElementById("form-codigo").value,
        nome: document.getElementById("form-nome").value,
        creditos: document.getElementById("form-creditos").value,
        semestre: document.getElementById("form-semestre").value,
        tipo: document.getElementById("form-tipo").value,
        restricaoOferecimento: document.getElementById("form-restricao").value,
        departamento: document.getElementById("form-departamento").value,
        prerequisitos: document.getElementById("form-prereqs").value,
        ementa: document.getElementById("form-ementa").value,
      };

      const ok = deps.onCriar(dadosForm, mostrarErro);
      if (ok) fechar();
    });
  }

  function preencherOpcoesSemestre() {
    const select = document.getElementById("form-semestre");
    select.innerHTML = "";
    for (let i = 1; i <= deps.numSemestres; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = deps.ordinal(i) + " semestre";
      select.appendChild(opt);
    }
  }

  function mostrarErro(msg) {
    erroEl.textContent = msg;
    erroEl.classList.add("show");
  }

  function esconderErro() {
    erroEl.textContent = "";
    erroEl.classList.remove("show");
  }

  function abrir() {
    form.reset();
    esconderErro();
    document.getElementById("form-creditos").value = 4;
    overlay.classList.add("open");
    document.body.classList.add("modal-aberto");
    document.getElementById("form-codigo").focus();
  }

  function fechar() {
    overlay.classList.remove("open");
    document.body.classList.remove("modal-aberto");
  }

  function estaAberto() {
    return overlay.classList.contains("open");
  }

  return { init, abrir, fechar, estaAberto };
})();
