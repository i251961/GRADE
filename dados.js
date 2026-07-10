/*
  dados.js
  Grade curricular - Engenharia Mecânica - UNICAMP (curso 10G)
  Fonte dos códigos, nomes e créditos: Catálogo de Graduação UNICAMP 2025
  (proposta de currículo do curso 10G) e Matriz Curricular da FEM.

  IMPORTANTE SOBRE OS PRÉ-REQUISITOS:
  A lista oficial de pré-requisito por pré-requisito não estava disponível
  para leitura automática (o catálogo da DAC bloqueia acesso automatizado).
  Os pré-requisitos abaixo foram inferidos a partir da ordem sugerida do
  currículo e do encadeamento típico dessas disciplinas (ex: Cálculo I antes
  de Cálculo II, Estática antes de Dinâmica, etc). Confira e ajuste livremente
  aqui no arquivo dados.js caso encontre alguma diferença em relação à grade
  oficial da sua turma/currículo.
*/

const DISCIPLINAS = [
  // ---------- 1º SEMESTRE ----------
  { codigo: "EM102", nome: "Desenho Técnico", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "EM110", nome: "Introdução à Engenharia Mecânica", semestre: 1, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "EM120", nome: "Introdução à Prática de Extensão em Engenharia", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "F 128", nome: "Física Geral I", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Física (IFGW)", prerequisitos: [] },
  { codigo: "MA111", nome: "Cálculo I", semestre: 1, creditos: 6, tipo: "Obrigatória", departamento: "Matemática (IMECC)", prerequisitos: [] },
  { codigo: "MA141", nome: "Geometria Analítica e Vetores", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Matemática (IMECC)", prerequisitos: [] },
  { codigo: "QG101", nome: "Química Geral", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Química (IQ)", prerequisitos: [] },

  // ---------- 2º SEMESTRE ----------
  { codigo: "EM103", nome: "Metodologia de Pesquisa e Redação Científica", semestre: 2, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "EM200", nome: "Desenho Assistido por Computador", semestre: 2, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM102"] },
  { codigo: "EM240", nome: "Estrutura e Propriedades dos Materiais", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["QG101"] },
  { codigo: "EM306", nome: "Estática", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["F 128", "MA141"] },
  { codigo: "F 159", nome: "Introdução à Física Experimental I", semestre: 2, creditos: 2, tipo: "Obrigatória", departamento: "Física (IFGW)", prerequisitos: ["F 128"] },
  { codigo: "F 328", nome: "Física Geral III", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Física (IFGW)", prerequisitos: ["F 128"] },
  { codigo: "MA211", nome: "Cálculo II", semestre: 2, creditos: 6, tipo: "Obrigatória", departamento: "Matemática (IMECC)", prerequisitos: ["MA111"] },
  { codigo: "ME414", nome: "Estatística para Experimentalistas", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Estatística (IMECC)", prerequisitos: ["MA111"] },
  { codigo: "ELET-2S", nome: "Créditos Eletivos (2º sem.)", semestre: 2, creditos: 2, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 3º SEMESTRE ----------
  { codigo: "EM330", nome: "Oficinas I", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM102"] },
  { codigo: "EM335", nome: "Tecnologia Mecânica", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM240"] },
  { codigo: "EM360", nome: "Termodinâmica I", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["F 328", "QG101"] },
  { codigo: "F 259", nome: "Introdução à Física Experimental II", semestre: 3, creditos: 2, tipo: "Obrigatória", departamento: "Física (IFGW)", prerequisitos: ["F 159", "F 328"] },
  { codigo: "F 428", nome: "Física Geral IV", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Física (IFGW)", prerequisitos: ["F 328"] },
  { codigo: "MA311", nome: "Cálculo III", semestre: 3, creditos: 6, tipo: "Obrigatória", departamento: "Matemática (IMECC)", prerequisitos: ["MA211"] },
  { codigo: "MC102", nome: "Algoritmos e Programação de Computadores", semestre: 3, creditos: 6, tipo: "Obrigatória", departamento: "Computação (IC)", prerequisitos: [] },

  // ---------- 4º SEMESTRE ----------
  { codigo: "EM404", nome: "Dinâmica", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM306"] },
  { codigo: "EM406", nome: "Resistência dos Materiais I", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM306", "EM240"] },
  { codigo: "EM460", nome: "Termodinâmica II", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM360"] },
  { codigo: "EM461", nome: "Mecânica dos Fluidos I", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM360", "MA311"] },
  { codigo: "EM641", nome: "Ensaios dos Materiais", semestre: 4, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM240"] },
  { codigo: "MA327", nome: "Álgebra Linear", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Matemática (IMECC)", prerequisitos: ["MA211"] },
  { codigo: "MS211", nome: "Cálculo Numérico", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Matemática Aplicada (IMECC)", prerequisitos: ["MA311", "MC102"] },
  { codigo: "ELET-4S", nome: "Créditos Eletivos (4º sem.)", semestre: 4, creditos: 2, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 5º SEMESTRE ----------
  { codigo: "EM104", nome: "Materiais Poliméricos", semestre: 5, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM240"] },
  { codigo: "EM503", nome: "Introdução aos Métodos Numéricos Aplicados à Engenharia", semestre: 5, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["MS211"] },
  { codigo: "EM504", nome: "Mecanismos e Dinâmica das Máquinas", semestre: 5, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM404"] },
  { codigo: "EM506", nome: "Resistência dos Materiais II", semestre: 5, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM406"] },
  { codigo: "EM561", nome: "Mecânica dos Fluidos II", semestre: 5, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM461"] },
  { codigo: "EM570", nome: "Transferência de Calor I", semestre: 5, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM460", "EM461"] },
  { codigo: "EM638", nome: "Mecânica e Mecanismos da Fratura", semestre: 5, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM406"] },
  { codigo: "EM727", nome: "Tecnologia das Ligas Metálicas", semestre: 5, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM240"] },
  { codigo: "ELET-5S", nome: "Créditos Eletivos (5º sem.)", semestre: 5, creditos: 4, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 6º SEMESTRE ----------
  { codigo: "EM535", nome: "Usinagem dos Materiais", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM335"] },
  { codigo: "EM607", nome: "Vibrações de Sistemas Mecânicos", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM404", "MA327"] },
  { codigo: "EM665", nome: "Processos Metalúrgicos de Fabricação", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM727"] },
  { codigo: "EM670", nome: "Transferência de Calor II", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM570"] },
  { codigo: "EM733", nome: "Sistemas Produtivos", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM504"] },
  { codigo: "ET017", nome: "Circuitos Elétricos e Eletrotécnica", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Elétrica (FEEC)", prerequisitos: ["F 428"] },
  { codigo: "ELET-6S", nome: "Créditos Eletivos (6º sem.)", semestre: 6, creditos: 6, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 7º SEMESTRE ----------
  { codigo: "EM608", nome: "Elementos de Máquinas", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM504", "EM506"] },
  { codigo: "EM703", nome: "Instrumentação", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["ET017"] },
  { codigo: "EM707", nome: "Controle de Sistemas Mecânicos", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM607", "MS211"] },
  { codigo: "EM730", nome: "Conformação Mecânica", semestre: 7, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM535"] },
  { codigo: "EM783", nome: "Laboratório de Calor e Fluidos I", semestre: 7, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM570", "EM561"] },
  { codigo: "EM833", nome: "Seleção de Materiais", semestre: 7, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM641", "EM727"] },
  { codigo: "EM853", nome: "Engenharia Econômica", semestre: 7, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "EM884", nome: "Sistemas Fluidotérmicos II", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM570"] },
  { codigo: "ELET-7S", nome: "Créditos Eletivos (7º sem.)", semestre: 7, creditos: 6, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 8º SEMESTRE ----------
  { codigo: "BE310", nome: "Ciências do Ambiente", semestre: 8, creditos: 2, tipo: "Obrigatória", departamento: "Biologia (IB)", prerequisitos: [] },
  { codigo: "CE738", nome: "Economia para Engenharia", semestre: 8, creditos: 4, tipo: "Obrigatória", departamento: "Economia (IE)", prerequisitos: [] },
  { codigo: "EM740", nome: "Laboratório de Engenharia dos Materiais", semestre: 8, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM833"] },
  { codigo: "EM790", nome: "Engenharia Assistida por Computador", semestre: 8, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM200", "EM503"] },
  { codigo: "EM807", nome: "Laboratório de Dinâmica e Vibrações", semestre: 8, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM607"] },
  { codigo: "EM984", nome: "Sistemas Fluidotérmicos III", semestre: 8, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM884"] },
  { codigo: "ELET-8S", nome: "Créditos Eletivos (8º sem.)", semestre: 8, creditos: 4, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 9º SEMESTRE ----------
  { codigo: "CE304", nome: "Direito", semestre: 9, creditos: 2, tipo: "Obrigatória", departamento: "Economia/Direito (IE)", prerequisitos: [] },
  { codigo: "EM105", nome: "Introdução ao Trabalho de Conclusão de Curso", semestre: 9, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
  { codigo: "EM909", nome: "Projeto de Sistemas Mecânicos", semestre: 9, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM608"] },
  { codigo: "EM928", nome: "Projeto do Processo", semestre: 9, creditos: 4, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM733"] },
  { codigo: "ELET-9S", nome: "Créditos Eletivos (9º sem.)", semestre: 9, creditos: 2, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },

  // ---------- 10º SEMESTRE ----------
  { codigo: "EM107", nome: "Trabalho de Conclusão de Curso", semestre: 10, creditos: 2, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: ["EM105"] },
  { codigo: "EM916", nome: "Estágio Supervisionado", semestre: 10, creditos: 12, tipo: "Obrigatória", departamento: "Engenharia Mecânica (FEM)", prerequisitos: [] },
];

// Total de créditos do currículo (usado no dashboard)
const TOTAL_CREDITOS_CURSO = DISCIPLINAS.reduce((soma, d) => soma + d.creditos, 0);
const TOTAL_DISCIPLINAS_CURSO = DISCIPLINAS.length;
const NOME_CURSO = "Engenharia Mecânica";
const INSTITUICAO = "UNICAMP";
const NUM_SEMESTRES = 10;
