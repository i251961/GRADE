/*
  dados.js
  Grade curricular - Pedagogia - UNICAMP (curso 20G)
  Fonte dos códigos, nomes, créditos e pré-requisitos: Catálogo de Graduação
  UNICAMP 2026 (páginas de disciplinas do curso 20G) e página de "Proposta
  para Cumprimento de Currículo" (sugestão de currículo por semestre) do
  mesmo catálogo.

  SOBRE OS PRÉ-REQUISITOS:
  Ao contrário de outros cursos (como Engenharia), o currículo de Pedagogia
  praticamente não tem encadeamento de disciplina-para-disciplina: quase
  todas as disciplinas obrigatórias não exigem pré-requisito algum segundo
  o catálogo oficial.
  As únicas exceções são os Estágios Supervisionados e o Trabalho de
  Conclusão de Curso, cujos pré-requisitos oficiais são expressos pelo DAC
  em termos de QUANTIDADE MÍNIMA DE CRÉDITOS INTEGRALIZADOS (códigos no
  formato "AAxxx"), e não em termos de disciplinas específicas do array
  abaixo. Por isso, para essas disciplinas foi adicionado o campo extra
  `prerequisitoCreditos`, mantendo `prerequisitos` (lista de códigos de
  disciplinas) vazio:
    - EP808 (TCC I)               -> AA200 ou AA470 (créditos integralizados)
    - EP809 (TCC II)              -> AA200 ou EP808
    - EP910 (Estágio Sup. I)      -> AA430 (créditos integralizados)
    - EP911 (Estágio Sup. II)     -> AA430 (créditos integralizados)
    - EP912 (Estágio Sup. III)    -> AA430 (créditos integralizados)
    - EP914 (Estágio Sup. V)      -> AA430 (créditos integralizados)
  Confira e ajuste livremente aqui no arquivo dados.js caso encontre alguma
  diferença em relação à grade oficial da sua turma/currículo.
*/

const DISCIPLINAS = [
  // ---------- 1º SEMESTRE (24 créditos) ----------
  { codigo: "EP107", nome: "Introdução à Pedagogia - Organização do Trabalho Pedagógico", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP110", nome: "História da Educação I", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP130", nome: "Filosofia da Educação I", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP140", nome: "Sociologia Geral", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP142", nome: "Educação e Antropologia Cultural", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP570", nome: "Estudo e Produção Acadêmica", semestre: 1, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },

  // ---------- 2º SEMESTRE (26 créditos) ----------
  { codigo: "EP128", nome: "Psicologia I", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP210", nome: "História da Educação II", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP230", nome: "Filosofia da Educação II", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP340", nome: "Sociologia da Educação I", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP347", nome: "Educação, Cultura e Linguagens", semestre: 2, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP381", nome: "Pesquisa, Prática Pedagógica e de Extensão", semestre: 2, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },

  // ---------- 3º SEMESTRE (24 créditos) ----------
  { codigo: "EP129", nome: "Psicologia II", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP152", nome: "Didática - Teoria Pedagógica", semestre: 3, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP165", nome: "Política Educacional: Organização da Educação Brasileira", semestre: 3, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP330", nome: "Filosofia da Educação III", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP412", nome: "História da Educação III", semestre: 3, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },

  // ---------- 4º SEMESTRE (37 créditos) ----------
  { codigo: "ELET-4S", nome: "Créditos Eletivos (4º sem.)", semestre: 4, creditos: 4, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },
  { codigo: "EP153", nome: "Metodologia do Ensino Fundamental", semestre: 4, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP158", nome: "Educação, Corpo e Arte", semestre: 4, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP164", nome: "Organização do Trabalho Pedagógico e Gestão Escolar", semestre: 4, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP226", nome: "Psicologia e Educação", semestre: 4, creditos: 5, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP372", nome: "Avaliação", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP445", nome: "Sociologia da Educação II", semestre: 4, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },

  // ---------- 5º SEMESTRE (44 créditos) ----------
  { codigo: "EP376", nome: "Práticas de Ensino e Estágio Supervisionado nos Anos Iniciais do Ensino Fundamental", semestre: 5, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP471", nome: "Escola, Alfabetização e Culturas da Escrita", semestre: 5, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP472", nome: "Escola e Conhecimento de História e Geografia", semestre: 5, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP473", nome: "Escola e Cultura Matemática", semestre: 5, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP474", nome: "Escola e Conhecimento em Ciências Naturais", semestre: 5, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP910", nome: "Estágio Supervisionado I - Gestão Escolar", semestre: 5, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [], prerequisitoCreditos: "AA430 (mínimo de créditos integralizados)" },

  // ---------- 6º SEMESTRE (30 créditos) ----------
  { codigo: "ELET-6S", nome: "Créditos Eletivos (6º sem.)", semestre: 6, creditos: 4, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },
  { codigo: "EP144", nome: "Metodologia da Pesquisa em Ciências da Educação I", semestre: 6, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP377", nome: "Planejamento Educacional e Estágio Supervisionado em Gestão Escolar", semestre: 6, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP790", nome: "Políticas de Educação Infantil", semestre: 6, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP911", nome: "Estágio Supervisionado II - Anos Iniciais do Ensino Fundamental", semestre: 6, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [], prerequisitoCreditos: "AA430 (mínimo de créditos integralizados)" },

  // ---------- 7º SEMESTRE (39 créditos) ----------
  { codigo: "ELET-7S", nome: "Créditos Eletivos (7º sem.)", semestre: 7, creditos: 4, tipo: "Eletiva", departamento: "Livre escolha", prerequisitos: [], eletivaPlaceholder: true },
  { codigo: "EP139", nome: "Pedagogia da Educação Infantil", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP146", nome: "Educação e Tecnologias", semestre: 7, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP162", nome: "Escola e Currículo", semestre: 7, creditos: 5, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP282", nome: "Práticas Extracurriculares de Extensão", semestre: 7, creditos: 2, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP348", nome: "Educação Especial e Inclusão", semestre: 7, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP808", nome: "Trabalho de Conclusão de Curso I", semestre: 7, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [], prerequisitoCreditos: "AA200 ou AA470 (mínimo de créditos integralizados)" },
  { codigo: "EP912", nome: "Estágio Supervisionado III - Educação Infantil", semestre: 7, creditos: 8, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [], prerequisitoCreditos: "AA430 (mínimo de créditos integralizados)" },

  // ---------- 8º SEMESTRE (33 créditos) ----------
  { codigo: "EP529", nome: "Educação de Surdos e Língua de Sinais", semestre: 8, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP809", nome: "Trabalho de Conclusão de Curso II", semestre: 8, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: ["EP808"], prerequisitoCreditos: "AA200 ou EP808" },
  { codigo: "EP879", nome: "Educação de Jovens e Adultos", semestre: 8, creditos: 3, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP887", nome: "Educação Não Formal", semestre: 8, creditos: 6, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP914", nome: "Estágio Supervisionado V - Educação Não Formal", semestre: 8, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [], prerequisitoCreditos: "AA430 (mínimo de créditos integralizados)" },
  { codigo: "EP915", nome: "Histórias e Culturas Afro-brasileiras e Africanas", semestre: 8, creditos: 3, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP916", nome: "Histórias e Culturas de Povos Indígenas Brasileiros", semestre: 8, creditos: 3, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] },
  { codigo: "EP923", nome: "Prática e Extensão em Educação Infantil", semestre: 8, creditos: 4, tipo: "Obrigatória", departamento: "Educação (FE)", prerequisitos: [] }
];

// Total de créditos do currículo (usado no dashboard)
const TOTAL_CREDITOS_CURSO = DISCIPLINAS.reduce((soma, d) => soma + d.creditos, 0);
const TOTAL_DISCIPLINAS_CURSO = DISCIPLINAS.length;
const NOME_CURSO = "Pedagogia Integral";
const INSTITUICAO = "UNICAMP";
const NUM_SEMESTRES = 8;