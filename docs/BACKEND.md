# UniApp – Guia para montar o backend

O front (`frontend/`) é um protótipo com dados fixos em `frontend/js/data.js`.
Os mesmos dados estão em `backend-ref/seed/*.json` (com campos nomeados) e o
modelo relacional sugerido está em `backend-ref/schema.sql`.

## Estrutura do projeto

```
frontend/
  index.html
  css/styles.css
  js/data.js     dados mock  → vira chamadas à API
  js/utils.js    helpers de data, ícones SVG, ilustrações
  js/views.js    HTML de cada tela
  js/app.js      estado, rotas (#hash), eventos, render()
backend-ref/
  schema.sql     tabelas sugeridas (PostgreSQL)
  seed/*.json    dados iniciais
docs/BACKEND.md  este arquivo
```
Os scripts usam escopo global compartilhado; a ordem no `index.html` importa
(data → utils → views → app).

## Telas × dados × endpoints sugeridos

| Tela (hash)      | Dados usados                       | Endpoint                                   |
|------------------|------------------------------------|--------------------------------------------|
| login            | matrícula + senha                  | `POST /auth/login` → token (JWT)           |
| esqueci a senha  | e-mail institucional               | `POST /auth/forgot-password`               |
| #inicio          | notícias                           | `GET /noticias`                            |
| #horarios        | horários da semana                 | `GET /horarios`                            |
| #agenda          | aulas do dia, tópicos, eventos     | `GET /agenda?data=YYYY-MM-DD`              |
| #grade           | grade curricular por semestre      | `GET /grade-curricular`                    |
| #plano           | plano de aula por disciplina       | `GET /disciplinas/:id/plano`               |
| #materiais       | arquivos por disciplina            | `GET /materiais?disciplina_id=` · `GET /materiais/:id/download` |
| #atividades      | atividades + status                | `GET /atividades?status=&disciplina_id=`   |
| (detalhe ativ.)  | enunciado, upload de entrega       | `GET /atividades/:id` · `POST /atividades/:id/entrega` (multipart) |
| #notas           | notas por semestre letivo          | `GET /notas?semestre=2026.2`               |
| #faltas          | faltas por disciplina              | `GET /faltas`                              |
| #calendario      | calendário acadêmico (PDF + datas) | `GET /calendario-academico?semestre=`      |
| #complementares  | lançamentos + total validado       | `GET /horas-complementares` · `POST /horas-complementares` (multipart: categoria, atividade, horas, comprovante) |
| #perfil          | dados do aluno                     | `GET /me`                                  |

Todos (exceto `/auth/*`) exigem autenticação e devem filtrar pelo aluno logado.

## Regras de negócio que hoje estão no front

- **Média da disciplina** = média simples das notas lançadas (N1, N2; N3 pode ser `null`).
  Aprovação: média ≥ 7,0. Cores: ≥7 verde, ≥5 amarelo, <5 vermelho.
- **Média do semestre** = média das médias das disciplinas que já têm nota.
- **Faltas**: o protótipo mostra `faltas/limite` (limite = 20) e "restam N". O texto
  fala em 25% da carga horária – defina no backend se `limite` é nº de faltas
  permitidas ou se deve ser calculado como 25% da carga horária da disciplina.
- **Horas complementares**: total exigido 200 h. Só contam lançamentos com status
  `Aprovada`, e cada categoria tem teto (Ensino 60, Pesquisa 60, Extensão 60,
  Eventos e cultura 40). Total validado = soma de `min(teto, horas aprovadas)` por categoria.
  Novo lançamento entra como `Em análise` (coordenação analisa em até 10 dias úteis).
- **Atividades**: status `Pendente` | `Enviada`. Enviar exige arquivo anexado.
- **Agenda**: não há aula em feriados nem fora do período letivo
  (2026-08-03 a 2026-12-11). O "tópico da aula" é derivado: conta-se quantas aulas
  da disciplina já ocorreram desde o início e mapeia para o cronograma do plano
  (5 aulas por semana do cronograma). No backend, prefira guardar o tópico por aula.
- **Login (protótipo)**: matrícula só numérica (≥4 dígitos), senha ≥4 caracteres.
  No backend: hash de senha (argon2/bcrypt), rate limit e JWT/refresh token.

## Pontos de atenção

- IDs de disciplina são strings curtas (`mob`, `bd`...). Troque por UUID/serial.
- Prazos de atividades estão como texto ("12 nov"); no banco use `DATE`
  (`prazo` em `atividades`) e formate no front.
- Arquivos (materiais, enunciados, entregas, comprovantes): guarde em
  S3/disco e salve só a URL/chave no banco.
- Notícias têm "Hoje/Ontem" como texto; use `publicado_em TIMESTAMP`.
- O front exclui, na versão organizada, funções sem uso do original
  (`calOld`, `calFull`, `notasOld`, `agendaOld`).

## Para ligar o front ao backend

1. Crie `frontend/js/api.js` com um `fetch` wrapper que envie o token.
2. No login (`entrar()` em `app.js`) chame `POST /auth/login` e guarde o token.
3. No `render()` carregue os dados da tela via API antes de chamar `V[h]()`
   (as views hoje leem constantes globais; passe a ler do resultado da API).
