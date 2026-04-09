-- RLS 활성화
alter table trainers enable row level security;
alter table pokemon_instances enable row level security;
alter table pokedex_entries enable row level security;
alter table solved_questions enable row level security;
alter table progression enable row level security;

-- trainers: 본인 데이터만 접근
create policy "trainers_select" on trainers for select using (auth.uid() = user_id);
create policy "trainers_insert" on trainers for insert with check (auth.uid() = user_id);
create policy "trainers_update" on trainers for update using (auth.uid() = user_id);

-- pokemon_instances: 본인 데이터만 접근
create policy "pokemon_select" on pokemon_instances for select using (auth.uid() = user_id);
create policy "pokemon_insert" on pokemon_instances for insert with check (auth.uid() = user_id);
create policy "pokemon_update" on pokemon_instances for update using (auth.uid() = user_id);

-- pokedex_entries: 본인 데이터만 접근
create policy "pokedex_select" on pokedex_entries for select using (auth.uid() = user_id);
create policy "pokedex_insert" on pokedex_entries for insert with check (auth.uid() = user_id);

-- solved_questions: 본인 데이터만 접근
create policy "solved_select" on solved_questions for select using (auth.uid() = user_id);
create policy "solved_insert" on solved_questions for insert with check (auth.uid() = user_id);

-- progression: 본인 데이터만 접근
create policy "progression_select" on progression for select using (auth.uid() = user_id);
create policy "progression_insert" on progression for insert with check (auth.uid() = user_id);
create policy "progression_update" on progression for update using (auth.uid() = user_id);
