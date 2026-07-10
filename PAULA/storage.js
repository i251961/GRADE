/* =====================================================
   storage.js — persistência em localStorage
   Responsabilidade única: ler/gravar dados no localStorage.
   Nenhuma outra parte do app deve chamar localStorage direto.
   ===================================================== */

const STORAGE_KEY_ESTADO = "planejador_em_unicamp_v1";
const STORAGE_KEY_HISTORICO = "planejador_em_unicamp_historico_v1";

function salvarEstadoStorage(estado) {
  try {
    localStorage.setItem(STORAGE_KEY_ESTADO, JSON.stringify(estado));
  } catch (e) {
    console.warn("Não foi possível salvar o estado:", e);
  }
}

function carregarEstadoStorage() {
  const salvo = localStorage.getItem(STORAGE_KEY_ESTADO);
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch (e) {
    return null;
  }
}

function salvarHistoricoStorage(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(snapshot));
  } catch (e) {
    // histórico é "nice to have" — se a quota estourar, seguimos sem persistir
    console.warn("Não foi possível salvar o histórico:", e);
  }
}

function carregarHistoricoStorage() {
  const salvo = localStorage.getItem(STORAGE_KEY_HISTORICO);
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch (e) {
    return null;
  }
}
