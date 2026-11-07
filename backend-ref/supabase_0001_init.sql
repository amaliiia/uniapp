-- =====================================================================
-- UniApp – migration inicial para Supabase (PostgreSQL)
-- Rodar em: SQL Editor do Supabase  ou  supabase/migrations/0001_init.sql
-- =====================================================================

-- ---------- Tabelas de referência (leitura para todos os logados) ----------
create table public.cursos (
  id bigint generated always as identity primary key,
  nome text not null unique
);

create table public.semestres_letivos (
  id bigint generated always as identity primary key,
  rotulo text not null unique,              -- '2026.2'
  inicio date not null,
  fim date not null,
  check (fim > inicio)
);

create table public.disciplinas (
  id bigint generated always as identity primary key,
  codigo text not null unique,              -- 'mob', 'bd'...
  nome text not null,
  professor text,
  cor text
);

create table public.grade_curricular (
  curso_id bigint not null references public.cursos(id) on delete cascade,
  semestre smallint not null check (semestre between 1 and 12),
  disciplina text not null,
  primary key (curso_id, semestre, disciplina)
);

create table public.horarios (
  id bigint generated always as identity primary key,
  semestre_id bigint not null references public.semestres_letivos(id),
  disciplina_id bigint not null references public.disciplinas(id),
  dia_semana smallint not null check (dia_semana between 1 and 5), -- 1=Seg..5=Sex
  hora_inicio time not null,
  sala text
);

-- Tópico de cada aula (substitui o cálculo feito no front)
create table public.aulas (
  id bigint generated always as identity primary key,
  disciplina_id bigint not null references public.disciplinas(id),
  semestre_id bigint not null references public.semestres_letivos(id),
  data date not null,
  hora_inicio time not null,
  topico text,
  descricao text,
  unique (disciplina_id, data, hora_inicio)
);

create table public.planos_de_aula (
  disciplina_id bigint primary key references public.disciplinas(id) on delete cascade,
  ementa text,
  objetivos text[] not null default '{}',
  cronograma text[] not null default '{}',
  avaliacao text
);

create table public.materiais (
  id bigint generated always as identity primary key,
  disciplina_id bigint not null references public.disciplinas(id) on delete cascade,
  tipo text,                                -- PDF, PPT, SQL, XLS
  titulo text not null,
  tamanho_bytes bigint,
  arquivo_path text                         -- caminho no bucket 'materiais'
);

create table public.atividades (
  id bigint generated always as identity primary key,
  disciplina_id bigint not null references public.disciplinas(id) on delete cascade,
  titulo text not null,
  descricao text,
  prazo date,
  enunciado_path text                       -- caminho no bucket 'materiais'
);

create table public.agenda_eventos (
  id bigint generated always as identity primary key,
  data date not null,
  titulo text not null,
  tipo text not null check (tipo in ('Prova','Atividade','Evento')),
  disciplina_id bigint references public.disciplinas(id)
);

create table public.calendario_academico (
  id bigint generated always as identity primary key,
  semestre_id bigint not null references public.semestres_letivos(id),
  inicio date not null,
  fim date not null,
  titulo text not null,
  tipo text not null check (tipo in ('Aula','Feriado','Prova','Evento')),
  pdf_path text
);

create table public.noticias (
  id bigint generated always as identity primary key,
  categoria text,
  titulo text not null,
  resumo text,
  publicado_em timestamptz not null default now()
);

create table public.hc_categorias (
  categoria text primary key,
  limite_horas int not null check (limite_horas > 0)
);

-- ---------- Dados do aluno (RLS: só o próprio) ----------
-- alunos.id = auth.users.id
create table public.alunos (
  id uuid primary key references auth.users(id) on delete cascade,
  matricula text not null unique check (matricula ~ '^\d{4,}$'),
  nome text not null,
  email text not null unique,
  curso_id bigint references public.cursos(id),
  turno text,
  ingresso text
);

create table public.matriculas_disciplina (
  id bigint generated always as identity primary key,
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  disciplina_id bigint not null references public.disciplinas(id),
  semestre_id bigint not null references public.semestres_letivos(id),
  n1 numeric(3,1) check (n1 between 0 and 10),
  n2 numeric(3,1) check (n2 between 0 and 10),
  n3 numeric(3,1) check (n3 between 0 and 10),
  faltas int not null default 0 check (faltas >= 0),
  limite_faltas int not null default 20,
  unique (aluno_id, disciplina_id, semestre_id)
);

create table public.entregas (
  id bigint generated always as identity primary key,
  atividade_id bigint not null references public.atividades(id) on delete cascade,
  aluno_id uuid not null references public.alunos(id) on delete cascade default auth.uid(),
  arquivo_path text not null,               -- bucket 'entregas': {aluno_id}/{atividade_id}/arquivo
  enviada_em timestamptz not null default now(),
  unique (atividade_id, aluno_id)           -- sem linha = "Pendente"
);

create table public.horas_complementares (
  id bigint generated always as identity primary key,
  aluno_id uuid not null references public.alunos(id) on delete cascade default auth.uid(),
  categoria text not null references public.hc_categorias(categoria),
  atividade text not null,
  horas int not null check (horas > 0),
  status text not null default 'Em análise' check (status in ('Em análise','Aprovada','Rejeitada')),
  semestre text,
  comprovante_path text,                    -- bucket 'comprovantes': {aluno_id}/arquivo
  criado_em timestamptz not null default now()
);

create index on public.matriculas_disciplina (aluno_id, semestre_id);
create index on public.entregas (aluno_id);
create index on public.horas_complementares (aluno_id);
create index on public.agenda_eventos (data);
create index on public.aulas (data);

-- ---------- Views (regras de negócio que estavam no front) ----------
-- Média = média simples das notas lançadas (ignora NULL). Aprovação: >= 7,0
create view public.v_notas with (security_invoker = true) as
select m.aluno_id, s.rotulo as semestre, d.id as disciplina_id, d.nome as disciplina,
       m.n1, m.n2, m.n3,
       (select round(avg(n), 1) from unnest(array[m.n1, m.n2, m.n3]) as n) as media
from public.matriculas_disciplina m
join public.disciplinas d on d.id = m.disciplina_id
join public.semestres_letivos s on s.id = m.semestre_id;

-- Horas validadas = por categoria, min(teto, soma das horas aprovadas)
create view public.v_horas_validadas with (security_invoker = true) as
select h.aluno_id, h.categoria,
       least(c.limite_horas, sum(h.horas))::int as horas_validas,
       c.limite_horas
from public.horas_complementares h
join public.hc_categorias c on c.categoria = h.categoria
where h.status = 'Aprovada'
group by h.aluno_id, h.categoria, c.limite_horas;

-- ---------- Login por matrícula ----------
-- O Supabase Auth autentica por e-mail. O front chama este RPC para achar o
-- e-mail da matrícula e depois signInWithPassword({ email, password }).
-- Atenção: isso permite descobrir e-mails a partir de matrículas. Se isso for
-- um problema, use e-mail sintético (matricula@uniapp.local) como login.
create function public.email_por_matricula(p_matricula text)
returns text
language sql stable security definer set search_path = ''
as $$ select email from public.alunos where matricula = p_matricula $$;

revoke all on function public.email_por_matricula(text) from public;
grant execute on function public.email_por_matricula(text) to anon, authenticated;

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array[
    'cursos','semestres_letivos','disciplinas','grade_curricular','horarios','aulas',
    'planos_de_aula','materiais','atividades','agenda_eventos','calendario_academico',
    'noticias','hc_categorias'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "leitura autenticados" on public.%I for select to authenticated using (true)', t);
  end loop;
end $$;

alter table public.alunos enable row level security;
create policy "aluno le o proprio" on public.alunos
  for select to authenticated using (id = auth.uid());

alter table public.matriculas_disciplina enable row level security;
create policy "aluno le as proprias" on public.matriculas_disciplina
  for select to authenticated using (aluno_id = auth.uid());
-- notas e faltas são lançadas pela coordenação/professor (service_role), sem policy de escrita

alter table public.entregas enable row level security;
create policy "entregas: ler" on public.entregas
  for select to authenticated using (aluno_id = auth.uid());
create policy "entregas: enviar" on public.entregas
  for insert to authenticated with check (aluno_id = auth.uid());
create policy "entregas: reenviar" on public.entregas
  for update to authenticated using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());

alter table public.horas_complementares enable row level security;
create policy "hc: ler" on public.horas_complementares
  for select to authenticated using (aluno_id = auth.uid());
create policy "hc: lancar (sempre Em análise)" on public.horas_complementares
  for insert to authenticated
  with check (aluno_id = auth.uid() and status = 'Em análise');
create policy "hc: excluir enquanto em análise" on public.horas_complementares
  for delete to authenticated using (aluno_id = auth.uid() and status = 'Em análise');
-- aprovação/rejeição: só service_role (painel da coordenação)

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values
  ('materiais',    'materiais',    false),   -- materiais de aula, enunciados, PDF do calendário
  ('entregas',     'entregas',     false),   -- {aluno_id}/{atividade_id}/arquivo
  ('comprovantes', 'comprovantes', false)    -- {aluno_id}/arquivo
on conflict (id) do nothing;

create policy "materiais: leitura" on storage.objects
  for select to authenticated using (bucket_id = 'materiais');

create policy "entregas: pasta propria" on storage.objects
  for all to authenticated
  using (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "comprovantes: pasta propria" on storage.objects
  for all to authenticated
  using (bucket_id = 'comprovantes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'comprovantes' and (storage.foldername(name))[1] = auth.uid()::text);
