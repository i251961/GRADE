/* =====================================================
   storage.js — persistência centralizada em localStorage
   Responsabilidade única: ler/gravar dados no localStorage.
   Nenhuma outra parte do app deve chamar localStorage direto —
   tudo passa pelas funções deste arquivo. Isso também deixa o
   projeto pronto para, no futuro, trocar o localStorage por uma
   API remota sem precisar mexer no restante do código: bastaria
   reimplementar as funções abaixo.

   Tudo fica guardado em UMA única chave (STORAGE_KEY), com um
   objeto interno organizado por área:
   {
     disciplinas: {},        // estado de cada disciplina (semestre/status/observações)
     historicoUndo: [],      // snapshots que podem ser desfeitos (posição atual incluída)
     historicoRedo: [],      // snapshots que podem ser refeitos
     simulacoes: [],         // reservado para uma futura funcionalidade de simulações
     configuracoes: {},      // reservado para preferências futuras do usuário
     ultimaAtualizacao: "..." // ISO string do último salvamento
   }
   ===================================================== */

const STORAGE_KEY = "planejadorGraduacao";

// Chaves antigas (versão anterior, com dados espalhados em duas chaves).
// Mantidas só para migrar automaticamente quem já tinha usado o site antes.
const CHAVES_ANTIGAS = ["planejador_em_unicamp_v1", "planejador_em_unicamp_historico_v1"];

let _cache = null;          // objeto em memória, evita reler o localStorage a cada chamada
let _dadosForamCorrompidos = false; // true quando havia algo salvo mas não pôde ser lido

function _estruturaPadrao() {
  return {
    disciplinas: {},
    historicoUndo: [],
    historicoRedo: [],
    simulacoes: [],
    configuracoes: {},
    ultimaAtualizacao: null,
  };
}

function _estruturaValida(dados) {
  return (
    !!dados &&
    typeof dados === "object" &&
    typeof dados.disciplinas === "object" &&
    dados.disciplinas !== null &&
    Array.isArray(dados.historicoUndo) &&
    Array.isArray(dados.historicoRedo)
  );
}

/** Tenta migrar dados do formato antigo (duas chaves separadas), se existirem. */
function _migrarChavesAntigasSeExistirem() {
  try {
    const estadoAntigo = localStorage.getItem(CHAVES_ANTIGAS[0]);
    const historicoAntigo = localStorage.getItem(CHAVES_ANTIGAS[1]);
    if (!estadoAntigo && !historicoAntigo) return null;

    const migrado = _estruturaPadrao();
    if (estadoAntigo) {
      try { migrado.disciplinas = JSON.parse(estadoAntigo); } catch (e) { /* ignora */ }
    }
    if (historicoAntigo) {
      try {
        const h = JSON.parse(historicoAntigo);
        if (h && Array.isArray(h.pilha)) {
          const indice = typeof h.indice === "number" ? h.indice : h.pilha.length - 1;
          migrado.historicoUndo = h.pilha.slice(0, indice + 1);
          migrado.historicoRedo = h.pilha.slice(indice + 1);
        }
      } catch (e) { /* ignora */ }
    }
    localStorage.removeItem(CHAVES_ANTIGAS[0]);
    localStorage.removeItem(CHAVES_ANTIGAS[1]);
    return migrado;
  } catch (e) {
    return null;
  }
}

/** Lê e valida o conteúdo salvo. Retorna null se não existir ou estiver corrompido. */
function _ler() {
  let bruto;
  try {
    bruto = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage indisponível (modo privado, quota, etc.) — segue sem persistência
    return null;
  }

  if (!bruto) {
    const migrado = _migrarChavesAntigasSeExistirem();
    return migrado; // pode ser null, tudo bem
  }

  try {
    const dados = JSON.parse(bruto);
    if (!_estruturaValida(dados)) {
      _dadosForamCorrompidos = true;
      return null;
    }
    return dados;
  } catch (e) {
    _dadosForamCorrompidos = true;
    return null;
  }
}

/** Retorna o objeto de dados em memória, carregando do localStorage na primeira vez. */
function _obterDados() {
  if (_cache) return _cache;
  _cache = _ler() || _estruturaPadrao();
  return _cache;
}

/** Grava o objeto de dados atual no localStorage (chamado após qualquer alteração). */
function _persistir() {
  _cache.ultimaAtualizacao = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_cache));
  } catch (e) {
    // ex: quota do localStorage excedida — não quebra o app, só não persiste
    console.warn("Não foi possível salvar no LocalStorage:", e);
  }
}

/* ---------- API pública usada pelo restante do app ---------- */

/** true se existia algo salvo mas não pôde ser lido (localStorage corrompido). */
function storageFoiCorrompido() {
  return _dadosForamCorrompidos;
}

function salvarEstadoStorage(estado) {
  const dados = _obterDados();
  dados.disciplinas = estado;
  _persistir();
}

function carregarEstadoStorage() {
  const dados = _obterDados();
  return dados.disciplinas && Object.keys(dados.disciplinas).length ? dados.disciplinas : null;
}

function salvarHistoricoStorage(snapshot) {
  const dados = _obterDados();
  const pilha = (snapshot && snapshot.pilha) || [];
  const indice = snapshot && typeof snapshot.indice === "number" ? snapshot.indice : pilha.length - 1;
  dados.historicoUndo = pilha.slice(0, indice + 1);
  dados.historicoRedo = pilha.slice(indice + 1);
  _persistir();
}

function carregarHistoricoStorage() {
  const dados = _obterDados();
  if (!dados.historicoUndo || !dados.historicoUndo.length) return null;
  const pilha = dados.historicoUndo.concat(dados.historicoRedo || []);
  const indice = dados.historicoUndo.length - 1;
  return { pilha, indice };
}

function salvarConfiguracoesStorage(configuracoes) {
  const dados = _obterDados();
  dados.configuracoes = Object.assign({}, dados.configuracoes, configuracoes);
  _persistir();
}

function carregarConfiguracoesStorage() {
  return _obterDados().configuracoes || {};
}

function salvarSimulacoesStorage(simulacoes) {
  const dados = _obterDados();
  dados.simulacoes = simulacoes || [];
  _persistir();
}

function carregarSimulacoesStorage() {
  return _obterDados().simulacoes || [];
}

/**
 * Apaga TUDO que foi salvo pelo usuário (usado pelo botão "Restaurar grade").
 * Depois de chamar isso, o próximo salvarEstadoStorage/salvarHistoricoStorage
 * começa uma estrutura nova, do zero.
 */
function limparTudoStorage() {
  _cache = _estruturaPadrao();
  _dadosForamCorrompidos = false;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Não foi possível limpar o LocalStorage:", e);
  }
}
