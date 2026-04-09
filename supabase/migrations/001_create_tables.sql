-- 트레이너 (유저당 1개)
create table trainers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  starter_chosen boolean not null default false,
  active_pokemon_instance_id uuid,
  created_at timestamptz not null default now()
);

-- 포켓몬 인스턴스 (유저당 N개)
create table pokemon_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id text not null,
  current_stage int not null default 1,
  hp int not null default 0,
  attack int not null default 0,
  defense int not null default 0,
  speed int not null default 0,
  total_correct_count int not null default 0,
  graduated boolean not null default false,
  evolution_pending boolean not null default false,
  created_at timestamptz not null default now()
);

-- 도감 (유저당 N개)
create table pokedex_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, species_id)
);

-- 풀이 기록 (유저당 N개)
create table solved_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  correct boolean not null,
  solved_at timestamptz not null default now()
);

-- 진행 상태 (유저당 1개)
create table progression (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak_correct_count int not null default 0,
  pending_pokemon_selection boolean not null default false,
  pending_evolution_instance_id uuid,
  unlocked_legendary_stage text not null default 'none'
);

-- trainers.active_pokemon_instance_id FK (테이블 생성 후 추가)
alter table trainers
  add constraint fk_active_pokemon
  foreign key (active_pokemon_instance_id)
  references pokemon_instances(id);

-- 인덱스
create index idx_pokemon_instances_user on pokemon_instances(user_id);
create index idx_solved_questions_user on solved_questions(user_id);
create index idx_solved_questions_question on solved_questions(user_id, question_id);
