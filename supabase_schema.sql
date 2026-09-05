-- WeatherGPT Supabase PostgreSQL Database Schema & Security Policies

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LOCATIONS TABLE
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  latitude numeric not null,
  longitude numeric not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PREFERENCES TABLE
create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  temperature_unit text default 'celsius',
  language text default 'en',
  notifications_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FAMILY CONNECTIONS TABLE
create table if not exists public.family_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  connected_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  relationship_label text not null,
  invite_method text not null check (invite_method in ('whatsapp', 'email')),
  contact_value text not null,
  invite_token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  safety_status text not null default 'SAFE' check (safety_status in ('SAFE', 'AT RISK', 'UNKNOWN')),
  last_checkin timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.preferences enable row level security;
alter table public.family_connections enable row level security;

-- PROFILES POLICIES
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- LOCATIONS POLICIES
create policy "Users can view their own locations"
  on public.locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own locations"
  on public.locations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own locations"
  on public.locations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on public.locations for delete
  using (auth.uid() = user_id);

-- PREFERENCES POLICIES
create policy "Users can view their own preferences"
  on public.preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.preferences for update
  using (auth.uid() = user_id);

-- FAMILY CONNECTIONS POLICIES
create policy "Users can view family connections"
  on public.family_connections for select
  using (auth.uid() = user_id or auth.uid() = connected_user_id or status = 'pending');

create policy "Users can insert family connections"
  on public.family_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update family connections"
  on public.family_connections for update
  using (auth.uid() = user_id or auth.uid() = connected_user_id or status = 'pending' or invite_token is not null);

create policy "Users can delete family connections"
  on public.family_connections for delete
  using (auth.uid() = user_id or auth.uid() = connected_user_id);

-- 6. AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present to prevent errors on re-execution
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
