/* =====================================================
   script.js — lógica do Planejador de Graduação
   ===================================================== */

const STORAGE_KEY = "planejador_em_unicamp_v1";

/* ---------- Estado ---------- */
// estado[codigo] = { semestre, status, observacoes }
let estado = {};

function estadoInicial(){
  const inicial = {};
  DISCIPLINAS.forEach(d => {
    inicial[d.codigo] = {
      semestre: d.semestre,
      status: "planejada",
      observacoes: ""
    };
  });
  return inicial;
}

function carregarEstado(){
  const salvo = localStorage.getItem(STORAGE_KEY);
  if(salvo){
    try{
      const parsed = JSON.parse(salvo);
      // garante que disciplinas novas do dados.js entrem no estado
      const base = estadoInicial();
      estado = { ...base, ...parsed };
      // remove entradas órfãs (código que não existe mais em dados.js)
      Object.keys(estado).forEach(cod => {
        if(!DISCIPLINAS.find(d => d.codigo === cod)) delete estado[cod];
      });
      return;
    } catch(e){ /* cai no fallback abaixo */ }
  }
  estado = estadoInicial();
}

function salvarEstado(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

/* ---------- Helpers de dados ---------- */

function disciplinaPorCodigo(cod){
  return DISCIPLINAS.find(d => d.codigo === cod);
}

function disciplinasDoSemestre(sem){
  return DISCIPLINAS.filter(d => estado[d.codigo].semestre === sem);
}

function desbloqueiaDe(cod){
  // calcula dinamicamente: quem tem `cod` como pré-requisito
  return DISCIPLINAS.filter(d => d.prerequisitos.includes(cod)).map(d => d.codigo);
}

function creditosDoSemestre(sem){
  return disciplinasDoSemestre(sem).reduce((soma, d) => soma + d.creditos, 0);
}

/* ---------- Renderização do quadro ---------- */

const boardEl = document.getElementById("board");

function renderBoard(){
  boardEl.innerHTML = "";
  for(let sem = 1; sem <= NUM_SEMESTRES; sem++){
    boardEl.appendChild(criarColuna(sem));
  }
  atualizarDashboard();
}

function criarColuna(sem){
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
  const creditos = creditosDoSemestre(sem);
  const qtdDisc = disciplinasDoSemestre(sem).length;
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
  body.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add("drag-over");
  });
  body.addEventListener("dragleave", () => col.classList.remove("drag-over"));
  body.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("drag-over");
    const cod = e.dataTransfer.getData("text/plain");
    moverDisciplina(cod, sem);
  });

  disciplinasDoSemestre(sem).forEach(d => body.appendChild(criarCard(d)));

  col.appendChild(header);
  col.appendChild(body);

  atualizarAvisoColuna(col, creditos);

  return col;
}

function atualizarAvisoColuna(col, creditos){
  const creditsSpan = col.querySelector(".column-credits");
  const aviso = col.querySelector(".column-warning");
  creditsSpan.classList.remove("over-30", "over-34");
  aviso.classList.remove("show");
  if(creditos > 34){
    creditsSpan.classList.add("over-34");
    aviso.classList.add("show");
  } else if(creditos > 30){
    creditsSpan.classList.add("over-30");
  }
}

function ordinal(n){
  return n + "º";
}

function criarCard(d){
  const card = document.createElement("article");
  card.className = "card";
  card.draggable = true;
  card.dataset.codigo = d.codigo;
  card.dataset.status = estado[d.codigo].status;

  card.addEventListener("dragstart", (e) => {
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", d.codigo);
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  card.addEventListener("click", () => abrirModal(d.codigo));

  const top = document.createElement("div");
  top.className = "card-top";
  const codigoEl = document.createElement("span");
  codigoEl.className = "card-codigo";
  codigoEl.textContent = d.codigo;
  const statusDot = document.createElement("span");
  statusDot.className = "card-status-dot";
  statusDot.dataset.status = estado[d.codigo].status;
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
  if(d.tipo === "Eletiva"){
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

/* ---------- Mover disciplina entre semestres ---------- */

function moverDisciplina(codigo, novoSemestre){
  if(!estado[codigo]) return;
  if(estado[codigo].semestre === novoSemestre) return;
  estado[codigo].semestre = novoSemestre;
  salvarEstado();
  renderBoard();
  mostrarToast(`${codigo} movida para o ${ordinal(novoSemestre)} semestre`);
}

/* ---------- Dashboard / estatísticas gerais ---------- */

function atualizarDashboard(){
  const total = TOTAL_DISCIPLINAS_CURSO;
  const concluidas = DISCIPLINAS.filter(d => estado[d.codigo].status === "concluida");
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

/* ---------- Modal de detalhes ---------- */

const overlay = document.getElementById("modal-overlay");
let codigoAtual = null;

function abrirModal(codigo){
  const d = disciplinaPorCodigo(codigo);
  if(!d) return;
  codigoAtual = codigo;

  document.getElementById("modal-codigo").textContent = d.codigo;
  document.getElementById("modal-nome").textContent = d.nome;
  document.getElementById("modal-creditos").textContent = d.creditos;
  document.getElementById("modal-departamento").textContent = d.departamento;
  document.getElementById("modal-tipo").textContent = d.tipo;
  document.getElementById("modal-semestre").textContent = ordinal(estado[codigo].semestre);
  document.getElementById("modal-status").value = estado[codigo].status;
  document.getElementById("modal-obs").value = estado[codigo].observacoes || "";

  renderChips("modal-prereqs", d.prerequisitos, "Nenhum");
  renderChips("modal-desbloqueia", desbloqueiaDe(d.codigo), "Nenhuma");

  overlay.classList.add("open");
}

function renderChips(containerId, lista, textoVazio){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if(!lista || lista.length === 0){
    const span = document.createElement("span");
    span.className = "chip chip-empty";
    span.textContent = textoVazio;
    container.appendChild(span);
    return;
  }
  lista.forEach(cod => {
    const chip = document.createElement("span");
    chip.className = "chip";
    const disc = disciplinaPorCodigo(cod);
    chip.textContent = disc ? `${cod} · ${disc.nome}` : cod;
    chip.addEventListener("click", () => abrirModal(cod));
    container.appendChild(chip);
  });
}

function fecharModal(){
  overlay.classList.remove("open");
  codigoAtual = null;
}

document.getElementById("modal-close").addEventListener("click", fecharModal);
overlay.addEventListener("click", (e) => {
  if(e.target === overlay) fecharModal();
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && overlay.classList.contains("open")) fecharModal();
});

document.getElementById("modal-status").addEventListener("change", (e) => {
  if(!codigoAtual) return;
  estado[codigoAtual].status = e.target.value;
  salvarEstado();
  renderBoard();
  // reabre destaque do card com dados atualizados (o modal continua aberto)
  overlay.classList.add("open");
});

let obsTimeout = null;
document.getElementById("modal-obs").addEventListener("input", (e) => {
  if(!codigoAtual) return;
  estado[codigoAtual].observacoes = e.target.value;
  clearTimeout(obsTimeout);
  obsTimeout = setTimeout(salvarEstado, 400);
});

/* ---------- Pesquisa ---------- */

const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", () => {
  const termo = searchInput.value.trim().toUpperCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    const cod = card.dataset.codigo;
    const d = disciplinaPorCodigo(cod);
    const alvo = (d.codigo + " " + d.nome).toUpperCase();
    const bate = termo === "" || alvo.includes(termo);
    card.classList.toggle("hide", !bate);
    card.classList.toggle("highlight-match", bate && termo !== "");
  });
});

/* ---------- Restaurar grade original ---------- */

document.getElementById("btn-reset").addEventListener("click", () => {
  const confirmar = confirm("Isso vai apagar seus status, observações e reorganizações, restaurando a grade sugerida original. Deseja continuar?");
  if(!confirmar) return;
  estado = estadoInicial();
  salvarEstado();
  renderBoard();
  mostrarToast("Grade restaurada ao planejamento original");
});

/* ---------- Toast ---------- */

let toastTimeout = null;
function mostrarToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Inicialização ---------- */

carregarEstado();
salvarEstado();
renderBoard();
