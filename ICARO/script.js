/* =====================================================
   script.js — orquestração do Planejador de Graduação
   Liga estado + storage.js + historico.js + ui.js + modal.js
   ===================================================== */

/* ---------- Estado ---------- */
// estado[codigo] = { semestre, status, observacoes }
let estado = {};

function estadoInicial() {
  const inicial = {};
  DISCIPLINAS.forEach((d) => {
    inicial[d.codigo] = {
      semestre: d.semestre,
      status: "planejada",
      observacoes: "",
    };
  });
  return inicial;
}

function carregarEstado() {
  const salvo = carregarEstadoStorage();
  const base = estadoInicial();
  if (salvo) {
    estado = { ...base, ...salvo };
    // remove entradas órfãs (código que não existe mais em dados.js)
    Object.keys(estado).forEach((cod) => {
      if (!DISCIPLINAS.find((d) => d.codigo === cod)) delete estado[cod];
    });
  } else {
    estado = base;
  }
}

/* ---------- Disciplinas customizadas ----------
   Precisa rodar ANTES de carregarEstado(), para que a disciplina já
   exista em DISCIPLINAS quando o estado for reconstruído a partir dela. */

function carregarDisciplinasCustomSalvas() {
  const salvas = carregarDisciplinasCustomStorage();
  salvas.forEach((d) => DISCIPLINAS.push(d));
}

function persistirDisciplinasCustom() {
  salvarDisciplinasCustomStorage(DISCIPLINAS.filter((d) => d.custom));
}

/**
 * Cria uma nova disciplina a partir dos dados do formulário (ver
 * disciplina-form.js) e a insere no semestre indicado.
 * Retorna true em caso de sucesso, false se houve erro de validação
 * (nesse caso já mostra o motivo via toast/callback de erro).
 */
function criarNovaDisciplina(dadosForm, aoFalhar) {
  const erro = (msg) => {
    if (typeof aoFalhar === "function") aoFalhar(msg);
    else UI.mostrarToast(msg);
  };

  const codigo = (dadosForm.codigo || "").trim();
  const nome = (dadosForm.nome || "").trim();
  const creditos = Number(dadosForm.creditos);
  const semestre = Number(dadosForm.semestre);

  if (!codigo || !nome) {
    erro("Preencha ao menos o código e o nome da disciplina.");
    return false;
  }
  if (codigoDisciplinaEmUso(codigo)) {
    erro(`Já existe uma disciplina com o código "${codigo}".`);
    return false;
  }
  if (!Number.isFinite(creditos) || creditos <= 0) {
    erro("Informe um número de créditos válido.");
    return false;
  }
  if (!Number.isInteger(semestre) || semestre < 1 || semestre > NUM_SEMESTRES) {
    erro(`Escolha um semestre entre 1 e ${NUM_SEMESTRES}.`);
    return false;
  }

  const prerequisitos = (dadosForm.prerequisitos || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const prereqInvalido = prerequisitos.find((cod) => !codigoDisciplinaEmUso(cod));
  if (prereqInvalido) {
    erro(`Pré-requisito "${prereqInvalido}" não corresponde a nenhuma disciplina existente.`);
    return false;
  }

  const nova = adicionarDisciplinaCustom({
    codigo,
    nome,
    creditos,
    semestre,
    tipo: dadosForm.tipo,
    departamento: dadosForm.departamento,
    prerequisitos,
    ementa: dadosForm.ementa,
    restricaoOferecimento: dadosForm.restricaoOferecimento || undefined,
  });

  estado[nova.codigo] = { semestre: nova.semestre, status: "planejada", observacoes: "" };
  persistirDisciplinasCustom();
  commit();
  UI.mostrarToast(`${nova.codigo} adicionada ao ${UI.ordinal(nova.semestre)} semestre`);
  return true;
}

/** Remove uma disciplina customizada (nunca remove disciplinas oficiais da grade). */
function removerDisciplina(codigo) {
  const d = UI.disciplinaPorCodigo(codigo);
  if (!d || !d.custom) return;
  if (!removerDisciplinaCustom(codigo)) return;
  delete estado[codigo];
  persistirDisciplinasCustom();
  commit();
  UI.mostrarToast(`${codigo} removida.`);
}

/* ---------- Ações que alteram o estado ----------
   Toda ação passa por `commit()`, que salva no localStorage
   e registra um novo ponto no histórico de undo/redo. */

function commit() {
  salvarEstadoStorage(estado);
  Historico.registrar(estado);
  UI.renderBoard();
}

function moverDisciplina(codigo, novoSemestre) {
  if (!estado[codigo]) return;
  if (estado[codigo].semestre === novoSemestre) return;

  if (!disciplinaPermiteSemestre(codigo, novoSemestre)) {
    const d = UI.disciplinaPorCodigo(codigo);
    const paridadePermitida = d.restricaoOferecimento === "par" ? "pares" : "ímpares";
    UI.mostrarToast(
      `${codigo} não pode ir para o ${UI.ordinal(novoSemestre)} semestre — ` +
      `${d.nome} só é oferecida em semestres ${paridadePermitida}.`
    );
    return;
  }

  estado[codigo].semestre = novoSemestre;
  commit();
  UI.mostrarToast(`${codigo} movida para o ${UI.ordinal(novoSemestre)} semestre`);
}

function alterarStatus(codigo, novoStatus) {
  if (!estado[codigo]) return;
  estado[codigo].status = novoStatus;
  commit();
}

function alterarObservacoes(codigo, texto) {
  if (!estado[codigo]) return;
  estado[codigo].observacoes = texto;
  commit();
  UI.mostrarToast("Alterações salvas");
}

/* ---------- Undo / redo ---------- */

const btnUndo = document.getElementById("btn-undo");
const btnRedo = document.getElementById("btn-redo");

function aplicarSnapshot(snapshot) {
  estado = snapshot;
  salvarEstadoStorage(estado);
  if (Modal.estaAberto()) Modal.fechar();
  UI.renderBoard();
}

btnUndo.addEventListener("click", () => {
  const snap = Historico.desfazer();
  if (snap) {
    aplicarSnapshot(snap);
    UI.mostrarToast("Alteração desfeita");
  }
});

btnRedo.addEventListener("click", () => {
  const snap = Historico.refazer();
  if (snap) {
    aplicarSnapshot(snap);
    UI.mostrarToast("Alteração refeita");
  }
});

Historico.onMudar((podeDesfazer, podeRefazer) => {
  btnUndo.disabled = !podeDesfazer;
  btnRedo.disabled = !podeRefazer;
});

/* ---------- Atalhos de teclado ---------- */

document.addEventListener("keydown", (e) => {
  const alvo = e.target;
  const emCampoDeTexto = alvo && (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA");
  if (emCampoDeTexto) return;

  const ctrlOuCmd = e.ctrlKey || e.metaKey;
  if (!ctrlOuCmd) return;

  const tecla = e.key.toLowerCase();
  if (tecla === "z" && !e.shiftKey) {
    e.preventDefault();
    if (!btnUndo.disabled) btnUndo.click();
  } else if ((tecla === "z" && e.shiftKey) || tecla === "y") {
    e.preventDefault();
    if (!btnRedo.disabled) btnRedo.click();
  }
});

/* ---------- Restaurar grade original ---------- */

document.getElementById("btn-reset").addEventListener("click", () => {
  const confirmar = confirm(
    "Deseja realmente restaurar a grade?\n\n" +
    "Todas as alterações, observações, histórico, configurações e disciplinas " +
    "adicionadas manualmente serão perdidas."
  );
  if (!confirmar) return;

  // remove disciplinas customizadas também da memória, não só do storage
  for (let i = DISCIPLINAS.length - 1; i >= 0; i--) {
    if (DISCIPLINAS[i].custom) DISCIPLINAS.splice(i, 1);
  }

  limparTudoStorage(); // apaga tudo (disciplinas, histórico, configurações) da chave única
  estado = estadoInicial();
  salvarEstadoStorage(estado);
  Historico.resetar(estado);
  UI.renderBoard();
  UI.mostrarToast("Grade restaurada ao planejamento original");
});

/* ---------- Inicialização ---------- */

carregarDisciplinasCustomSalvas();
carregarEstado();
salvarEstadoStorage(estado);

UI.init({
  getEstado: () => estado,
  onMover: moverDisciplina,
  onAbrirModal: (codigo) => Modal.abrir(codigo),
  numSemestres: NUM_SEMESTRES,
});

Modal.init({
  getEstado: () => estado,
  disciplinaPorCodigo: UI.disciplinaPorCodigo,
  desbloqueiaDe: UI.desbloqueiaDe,
  ordinal: UI.ordinal,
  onStatusChange: alterarStatus,
  onObsChange: alterarObservacoes,
  onRemover: removerDisciplina,
});

Historico.iniciar(estado, carregarHistoricoStorage());
UI.renderBoard();

FormDisciplina.init({
  onCriar: criarNovaDisciplina,
  numSemestres: NUM_SEMESTRES,
  ordinal: UI.ordinal,
});

GradeSemanal.init({ disciplinas: DISCIPLINAS });

/* ---------- Abas: Planejador / Grade Semanal ---------- */

const btnTabPlanejador = document.getElementById("tab-planejador");
const btnTabGrade = document.getElementById("tab-grade-semanal");
const viewPlanejador = document.getElementById("view-planejador");
const viewGradeSemanal = document.getElementById("view-grade-semanal");

function mostrarAba(aba) {
  const ehGrade = aba === "grade";
  viewPlanejador.hidden = ehGrade;
  viewGradeSemanal.hidden = !ehGrade;
  btnTabPlanejador.classList.toggle("active", !ehGrade);
  btnTabGrade.classList.toggle("active", ehGrade);
  btnTabPlanejador.setAttribute("aria-selected", String(!ehGrade));
  btnTabGrade.setAttribute("aria-selected", String(ehGrade));
}

btnTabPlanejador.addEventListener("click", () => mostrarAba("planejador"));
btnTabGrade.addEventListener("click", () => mostrarAba("grade"));

// Se havia algo salvo no navegador mas não pôde ser lido (corrompido/inválido),
// a grade padrão já foi carregada automaticamente — só avisamos discretamente.
if (storageFoiCorrompido()) {
  setTimeout(() => {
    UI.mostrarToast("Não foi possível ler seus dados salvos; a grade padrão foi restaurada.");
  }, 400);
}
