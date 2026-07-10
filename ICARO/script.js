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
    "Todas as alterações, observações, histórico e configurações serão perdidos."
  );
  if (!confirmar) return;

  limparTudoStorage(); // apaga tudo (disciplinas, histórico, configurações) da chave única
  estado = estadoInicial();
  salvarEstadoStorage(estado);
  Historico.resetar(estado);
  UI.renderBoard();
  UI.mostrarToast("Grade restaurada ao planejamento original");
});

/* ---------- Inicialização ---------- */

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
});

Historico.iniciar(estado, carregarHistoricoStorage());
UI.renderBoard();

// Se havia algo salvo no navegador mas não pôde ser lido (corrompido/inválido),
// a grade padrão já foi carregada automaticamente — só avisamos discretamente.
if (storageFoiCorrompido()) {
  setTimeout(() => {
    UI.mostrarToast("Não foi possível ler seus dados salvos; a grade padrão foi restaurada.");
  }, 400);
}
