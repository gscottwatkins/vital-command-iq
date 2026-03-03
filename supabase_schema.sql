-- Vital Command IQ - Multi-user schema with RLS

-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  date_of_birth date,
  sex text,
  height_inches int,
  goal_mode text default 'recomp', -- lose_fat | build_muscle | recomp | maintain | performance
  coaching_style text default 'balanced', -- conservative | balanced | performance
  created_at timestamptz default now()
);

-- DAILY METRICS
create table if not exists daily_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  weight numeric,
  body_fat numeric,
  visceral_fat numeric,
  muscle_mass numeric,
  hrv numeric,
  resting_hr numeric,
  sleep_score numeric,
  respiratory_rate numeric,
  vo2_max numeric,
  bp_systolic numeric,
  bp_diastolic numeric,
  energy int, -- 1-10
  motivation int, -- 1-10
  appetite int, -- 1-10
  gi_discomfort boolean,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- MEDICATIONS / INJECTIONS
create table if not exists medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  frequency text default 'weekly',
  injection_day int, -- 0=Sun ... 6=Sat
  injection_time text, -- optional (e.g. "08:00")
  fatigue_window_hours int default 48, -- adjustable per user
  active boolean default true,
  created_at timestamptz default now()
);

-- OTC LOG
create table if not exists otc_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  dose text,
  date_taken date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ALLERGIES
create table if not exists allergies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  substance text not null,
  reaction text,
  severity text, -- mild | moderate | severe
  created_at timestamptz default now()
);

-- INSURANCE
create table if not exists insurance_info (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  provider text,
  member_id text,
  group_number text,
  phone text,
  policy_holder text,
  created_at timestamptz default now()
);

-- NUTRITION LOG
create table if not exists nutrition_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  meal_type text, -- breakfast | lunch | dinner | snack
  item_name text not null,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  sugar numeric,
  source text, -- quick_add | photo_ai | manual
  created_at timestamptz default now()
);

-- FAVORITE FOODS LIBRARY (per user)
create table if not exists food_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category text,
  name text not null,
  default_calories numeric,
  default_protein numeric,
  default_carbs numeric,
  default_fat numeric,
  default_sugar numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table daily_metrics enable row level security;
alter table medications enable row level security;
alter table otc_log enable row level security;
alter table allergies enable row level security;
alter table insurance_info enable row level security;
alter table nutrition_log enable row level security;
alter table food_favorites enable row level security;

-- Policies
drop policy if exists "profiles self" on profiles;
create policy "profiles self" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "daily_metrics self" on daily_metrics;
create policy "daily_metrics self" on daily_metrics
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "medications self" on medications;
create policy "medications self" on medications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "otc self" on otc_log;
create policy "otc self" on otc_log
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allergies self" on allergies;
create policy "allergies self" on allergies
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "insurance self" on insurance_info;
create policy "insurance self" on insurance_info
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "nutrition self" on nutrition_log;
create policy "nutrition self" on nutrition_log
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "favorites self" on food_favorites;
create policy "favorites self" on food_favorites
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
