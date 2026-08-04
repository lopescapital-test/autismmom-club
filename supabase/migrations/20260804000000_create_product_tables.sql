-- Product review system tables
-- Apply this in the Supabase Dashboard SQL editor.

-- Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text,
  category text not null check (category in ('learning-toys','therapy-equipment','food-brands','sensory-tools','clothing-daily-living','tech-apps')),
  description text,
  image_url text,
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);

-- Product reviews table
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references products(slug) on delete cascade,
  rating int not null check (rating between 1 and 5),
  author text not null default 'Anonymous Mom' check (char_length(author) between 1 and 60),
  text text not null check (char_length(text) between 10 and 4000),
  diagnoses text[],
  symptoms text[],
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_product_reviews_product_slug on public.product_reviews(product_slug);

-- RLS: enable
alter table public.products enable row level security;
alter table public.product_reviews enable row level security;

-- RLS: products — anon can only SELECT visible
create policy "anon_select_visible_products"
  on public.products for select
  to anon
  using (status = 'visible');

create policy "admin_all_products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- RLS: product_reviews — anon can SELECT visible and INSERT
create policy "anon_select_visible_reviews"
  on public.product_reviews for select
  to anon
  using (status = 'visible');

create policy "anon_insert_reviews"
  on public.product_reviews for insert
  to anon
  with check (true); -- status defaults to 'visible'

create policy "admin_all_reviews"
  on public.product_reviews for all
  to authenticated
  using (true)
  with check (true);

-- Seed: a few initial products
insert into public.products (slug, name, brand, category, description, image_url) values
  ('loop-engage-plus', 'Loop Engage Plus', 'Loop', 'sensory-tools', 'Noise-reducing earplugs that lower ambient sound while keeping speech clear.', '/emojis/audio-waveform.png'),
  ('yoto-player', 'Yoto Player (3rd Gen)', 'Yoto', 'learning-toys', 'Screen-free audio player controlled by physical cards. Kids manage their own content.', '/emojis/boombox.png'),
  ('chewigem-pendant', 'Chewigem Pendant', 'Chewigem', 'sensory-tools', 'Chewelry necklace for oral motor sensory input. Food-grade silicone.', '/emojis/necklace.png'),
  ('compression-sheets', 'Sensory Compression Sheets', 'SensaCalm', 'clothing-daily-living', 'Weighted lycra bed sheets that provide deep pressure for better sleep.', '/emojis/bed.png'),
  ('magnetic-tiles-set', 'Magna-Tiles 100-Piece Set', 'Magna-Tiles', 'learning-toys', 'Translucent magnetic building tiles for open-ended creative play.', '/emojis/toy-bricks.png'),
  ('okay-oats', 'Okay Oats (Variety Pack)', 'Okay Oats', 'food-brands', 'Pre-measured, texture-consistent instant oatmeal cups. Kid-friendly flavors.', '/emojis/hot-cereal.png'),
  ('habitica-app', 'Habitica', 'Habitica', 'tech-apps', 'Gamified habit tracker and to-do list. Turns routines into an RPG.', '/emojis/smartphone.png')
on conflict (slug) do nothing;