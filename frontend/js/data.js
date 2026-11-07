/* ============================================================
   DADOS MOCK – no backend, cada constante vira uma tabela/endpoint
   (ver docs/BACKEND.md). Troque por fetch() à API quando pronta.
   ============================================================ */
const C = [
   { id: "mob", n: "Desenvolvimento Mobile", p: "Prof. Carlos Lima", c: "#2563eb" },
   { id: "bd", n: "Banco de Dados", p: "Profa. Ana Souza", c: "#16a34a" },
   { id: "es", n: "Engenharia de Software", p: "Prof. Marcos Alves", c: "#d97706" },
   { id: "rd", n: "Redes de Computadores", p: "Profa. Júlia Rocha", c: "#9333ea" },
   { id: "est", n: "Estatística Aplicada", p: "Prof. Paulo Neri", c: "#dc2626" }];
const cn = id => C.find(x => x.id === id);
const NEWS = [
   ["Evento", "Semana de Tecnologia 2026 abre inscrições", "Palestras, oficinas e hackathon de 18 a 22 de novembro.", "Hoje"],
   ["Aviso", "Calendário de provas finais divulgado", "Consulte as datas na aba Agenda e organize seus estudos.", "Ontem"],
   ["Biblioteca", "Novo acervo digital disponível", "Mais de 3 mil títulos liberados com o login institucional.", "03 nov"],
   ["Curso", "Coordenação abre vagas para monitoria", "Interessados enviam histórico até 14 de novembro.", "02 nov"]];
const HOR = { Seg: [["19:00", "mob", "Lab 3"], ["20:50", "bd", "Sala 204"]], Ter: [["19:00", "es", "Sala 210"], ["20:50", "es", "Sala 210"]], Qua: [["19:00", "rd", "Lab 1"], ["20:50", "est", "Sala 105"]], Qui: [["19:00", "bd", "Lab 2"], ["20:50", "mob", "Lab 3"]], Sex: [["19:00", "est", "Sala 105"], ["20:50", "rd", "Lab 1"]] };
const GRADE = [
   ["Cálculo I", "Lógica de Programação", "Introdução à Computação", "Inglês Técnico"],
   ["Algoritmos", "Estruturas de Dados", "Matemática Discreta", "Arquitetura de Computadores"],
   ["Programação Orientada a Objetos", "Sistemas Operacionais", "Álgebra Linear", "Metodologia Científica"],
   ["Banco de Dados", "Engenharia de Software", "Redes de Computadores", "Estatística Aplicada", "Desenvolvimento Mobile"],
   ["Desenvolvimento Web", "Inteligência Artificial", "Segurança da Informação", "Gestão de Projetos"],
   ["Computação em Nuvem", "Interação Humano-Computador", "Sistemas Distribuídos", "Optativa I"],
   ["Estágio Supervisionado I", "Empreendedorismo", "Optativa II", "Projeto Integrador"],
   ["Estágio Supervisionado II", "Trabalho de Conclusão de Curso", "Ética e Cidadania"]];
const ATUAL = 3;
const PLANO = {
   mob: { e: "Desenvolvimento de aplicações móveis, PWA, APIs e usabilidade em dispositivos.", o: ["Construir interfaces responsivas", "Aplicar PWA e service workers", "Consumir APIs REST"], s: ["Fundamentos mobile", "Design responsivo", "PWA e manifest", "Service workers e cache", "Consumo de APIs", "Projeto final"], a: "2 provas (40%) + projeto (60%)" },
   bd: { e: "Modelagem relacional, SQL, normalização e transações.", o: ["Modelar com DER", "Escrever consultas SQL", "Normalizar tabelas"], s: ["Modelo relacional", "DER", "SQL básico", "Joins e subconsultas", "Normalização", "Transações"], a: "2 provas (70%) + listas (30%)" },
   es: { e: "Processos de software, requisitos, UML, testes e metodologias ágeis.", o: ["Levantar requisitos", "Modelar com UML", "Aplicar Scrum"], s: ["Ciclo de vida", "Requisitos", "UML", "Ágil e Scrum", "Testes", "Entrega"], a: "Prova (50%) + seminário (50%)" },
   rd: { e: "Modelo OSI/TCP-IP, endereçamento, roteamento e protocolos.", o: ["Entender camadas", "Configurar sub-redes", "Analisar tráfego"], s: ["Camadas", "Endereçamento IP", "Sub-redes", "Roteamento", "Transporte", "Aplicação"], a: "2 provas (80%) + laboratório (20%)" },
   est: { e: "Estatística descritiva, probabilidade, inferência e regressão.", o: ["Interpretar dados", "Calcular probabilidades", "Aplicar regressão"], s: ["Descritiva", "Probabilidade", "Distribuições", "Inferência", "Testes", "Regressão"], a: "3 avaliações com pesos iguais" }
};
const MAT = [["mob", "PDF", "Aula 05 – Service Workers.pdf", "1,2 MB"], ["mob", "PPT", "Slides – PWA e Manifest.pptx", "3,4 MB"], ["bd", "PDF", "Aula 08 – Normalização.pdf", "900 KB"], ["bd", "SQL", "Script – Banco Exemplo.sql", "12 KB"], ["es", "PDF", "Guia de Scrum.pdf", "2,1 MB"], ["rd", "PDF", "Lista de Sub-redes.pdf", "600 KB"], ["est", "XLS", "Dataset – Regressão.xlsx", "210 KB"]];
const ATV = [
   { id: 1, d: "mob", t: "Protótipo PWA – Entrega 2", p: "12 nov", desc: "Entregar o protótipo navegável com ao menos 5 telas. Formato: ZIP ou PDF com link.", f: "Enunciado_Prototipo.pdf", s: "Pendente" },
   { id: 2, d: "bd", t: "Lista 4 – Joins", p: "10 nov", desc: "Resolver os 10 exercícios de junção. Entregar em PDF.", f: "Lista4_Joins.pdf", s: "Pendente" },
   { id: 3, d: "es", t: "Diagramas UML do projeto", p: "15 nov", desc: "Casos de uso e diagrama de classes do sistema da equipe.", f: "Modelo_UML.docx", s: "Pendente" },
   { id: 4, d: "rd", t: "Relatório de Laboratório 2", p: "02 nov", desc: "Relatório sobre configuração de sub-redes.", f: "Roteiro_Lab2.pdf", s: "Enviada", a: "relatorio_lab2.pdf" }];
const AG = [["2026-11-09", "Prova 1 – Redes", "Prova", "rd"], ["2026-11-10", "Entrega Lista 4 – BD", "Atividade", "bd"], ["2026-11-12", "Entrega Protótipo PWA", "Atividade", "mob"], ["2026-11-15", "Entrega UML", "Atividade", "es"], ["2026-11-18", "Semana de Tecnologia", "Evento", ""], ["2026-11-24", "Prova 2 – Banco de Dados", "Prova", "bd"], ["2026-12-01", "Seminário – Eng. Software", "Prova", "es"]];
const NT = [["mob", 8.5, null, null], ["bd", 7.0, 6.5, null], ["es", 9.0, null, null], ["rd", 5.5, 7.0, null], ["est", 6.0, null, null]];
const FT = [["mob", 4, 20], ["bd", 2, 20], ["es", 0, 20], ["rd", 6, 20], ["est", 9, 20]];
const ME = { nome: "Maria Eduarda Santos", mat: "2025104587", curso: "Sistemas de Informação", sem: "4º semestre", email: "maria.santos@aluno.faculdade.edu.br", turno: "Noturno", ing: "2025.1" };
const TODAY = "2026-11-06", INI = "2026-08-03", FIM = "2026-12-11";
const HOL = { "2026-09-07": "Independência do Brasil", "2026-10-12": "Nossa Senhora Aparecida", "2026-11-02": "Finados", "2026-11-20": "Consciência Negra" };
const DK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PT = ["Introdução e conceitos", "Exemplos guiados", "Exercícios em sala", "Prática em laboratório", "Revisão e dúvidas"];
const NS = { "2025.1": ["1º semestre", [["Cálculo I", 8, 7.5], ["Lógica de Programação", 9, 8.5], ["Introdução à Computação", 7.5, 7], ["Inglês Técnico", 9.5, 9]]], "2025.2": ["2º semestre", [["Algoritmos", 7.5, 8], ["Estruturas de Dados", 6.5, 7.5], ["Matemática Discreta", 8, 7], ["Arquitetura de Computadores", 7, 7.5]]], "2026.1": ["3º semestre", [["Programação Orientada a Objetos", 8.5, 9], ["Sistemas Operacionais", 7.5, 7], ["Álgebra Linear", 7, 7.5], ["Metodologia Científica", 9, 8]]], "2026.2": ["4º semestre", NT.map(n => [cn(n[0]).n, n[1], n[2]])] };
const CAL = [["2026-08-03", "2026-08-03", "Início das aulas", "Aula"], ["2026-09-07", "2026-09-07", "Feriado: Independência do Brasil", "Feriado"], ["2026-10-12", "2026-10-12", "Feriado: Nossa Senhora Aparecida", "Feriado"], ["2026-11-02", "2026-11-02", "Feriado: Finados", "Feriado"], ["2026-11-09", "2026-11-13", "Período de provas I", "Prova"], ["2026-11-18", "2026-11-22", "Semana de Tecnologia", "Evento"], ["2026-11-20", "2026-11-20", "Feriado: Consciência Negra", "Feriado"], ["2026-11-23", "2026-11-27", "Período de provas II", "Prova"], ["2026-12-07", "2026-12-11", "Provas finais e encerramento do semestre", "Prova"]];
const HCAT = [["Ensino", 60], ["Pesquisa", 60], ["Extensão", 60], ["Eventos e cultura", 40]];
const HC = [["Monitoria de Algoritmos", "Ensino", 30, "Aprovada", "2025.2"], ["Semana de Tecnologia 2025", "Eventos e cultura", 20, "Aprovada", "2025.2"], ["Projeto de extensão: Inclusão Digital", "Extensão", 25, "Aprovada", "2026.1"], ["Curso de Git e GitHub (online)", "Ensino", 12, "Aprovada", "2026.1"], ["Iniciação científica (voluntária)", "Pesquisa", 20, "Em análise", "2026.2"]];
