/* =====================================================
   historico.js — histórico de alterações (undo / redo)
   Mantém uma pilha de snapshots do `estado`, no estilo
   de editores como VS Code / Figma / Notion.

   Cada entrada é um snapshot do objeto `estado` inteiro.
   É uma implementação simples (snapshot-based) em vez de
   um diff/patch — para uma grade com ~70 disciplinas o
   snapshot é minúsculo (poucos KB), então o ganho de um
   sistema de patches não compensaria a complexidade extra.
   A API abaixo já isola essa decisão: se um dia o projeto
   crescer muito, dá para trocar para diffs sem mexer no
   restante do app.
   ===================================================== */

const Historico = (function () {
  const LIMITE = 100;

  let pilha = [];   // snapshots do estado
  let indice = -1;  // posição atual dentro da pilha
  let aoMudar = null; // callback(podeDesfazer, podeRefazer)

  function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function persistir() {
    salvarHistoricoStorage({ pilha, indice });
  }

  function notificar() {
    if (typeof aoMudar === "function") {
      aoMudar(podeDesfazer(), podeRefazer());
    }
  }

  function onMudar(callback) {
    aoMudar = callback;
    notificar();
  }

  /**
   * Inicializa o histórico. Se houver um histórico salvo compatível,
   * ele é reaproveitado; senão começa do zero a partir do estado atual.
   */
  function iniciar(estadoInicial, historicoSalvo) {
    if (
      historicoSalvo &&
      Array.isArray(historicoSalvo.pilha) &&
      historicoSalvo.pilha.length > 0 &&
      typeof historicoSalvo.indice === "number"
    ) {
      pilha = historicoSalvo.pilha;
      indice = Math.max(0, Math.min(historicoSalvo.indice, pilha.length - 1));
    } else {
      pilha = [clonar(estadoInicial)];
      indice = 0;
    }
    persistir();
    notificar();
  }

  /**
   * Registra um novo estado no topo do histórico.
   * Qualquer "futuro" (redo disponível) é descartado, igual a
   * qualquer editor de texto moderno.
   */
  function registrar(estadoAtual) {
    pilha = pilha.slice(0, indice + 1);
    pilha.push(clonar(estadoAtual));
    indice = pilha.length - 1;

    if (pilha.length > LIMITE) {
      pilha.shift();
      indice--;
    }

    persistir();
    notificar();
  }

  function podeDesfazer() {
    return indice > 0;
  }

  function podeRefazer() {
    return indice < pilha.length - 1;
  }

  /** Retorna o snapshot anterior, ou null se não houver o que desfazer. */
  function desfazer() {
    if (!podeDesfazer()) return null;
    indice--;
    persistir();
    notificar();
    return clonar(pilha[indice]);
  }

  /** Retorna o próximo snapshot, ou null se não houver o que refazer. */
  function refazer() {
    if (!podeRefazer()) return null;
    indice++;
    persistir();
    notificar();
    return clonar(pilha[indice]);
  }

  /** Reinicia o histórico (usado no "Restaurar grade"). */
  function resetar(estadoInicial) {
    pilha = [clonar(estadoInicial)];
    indice = 0;
    persistir();
    notificar();
  }

  return {
    iniciar,
    registrar,
    desfazer,
    refazer,
    podeDesfazer,
    podeRefazer,
    resetar,
    onMudar,
  };
})();
