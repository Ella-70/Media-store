-- ============================================================
-- The Stacks — Supabase migration
-- Run this in the Supabase SQL editor (or via the CLI).
-- ============================================================

-- 1. Add `username` column to the existing `profiles` table
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Enforce uniqueness so two users can never claim the same handle.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- 2. Update the trigger function that creates a profile row on sign-up
--    so it also stores the username passed through Supabase auth metadata.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, username)
  VALUES (
    new.id,
    new.email,
    'user',
    'active',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$;

-- 3. Cart items table — persists a user's shopping cart across sessions.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  title      TEXT,
  cover      TEXT,
  year       INT,
  rating     NUMERIC,
  source_id  TEXT,
  added_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Wishlist items table — same shape as cart_items.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  title      TEXT,
  cover      TEXT,
  year       INT,
  rating     NUMERIC,
  source_id  TEXT,
  added_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist"
  ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Cart & Wishlist upgrades — snapshot, quantity, uniqueness, update policy
-- ============================================================

-- Store a full JSON snapshot of the normalized item at add-time so the
-- cart / wishlist can render covers, titles, ratings without re-fetching
-- from three external APIs every time the page loads.
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Prevent the same item from appearing twice in one user's cart.
-- An upsert (ON CONFLICT … DO UPDATE) can bump quantity instead.
ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

ALTER TABLE public.wishlist_items
  ADD CONSTRAINT wishlist_items_user_product_unique UNIQUE (user_id, product_id);

CREATE POLICY "Users can update own wishlist"
  ON public.wishlist_items FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Fake Buy/Rent system — purchase_type, unit_price, orders, order_items
-- ============================================================

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS purchase_type TEXT NOT NULL DEFAULT 'buy',
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC NOT NULL DEFAULT 0;

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'paid',
  total      NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  product_snapshot  JSONB,
  quantity          INTEGER NOT NULL DEFAULT 1,
  purchase_type     TEXT NOT NULL DEFAULT 'buy',
  unit_price        NUMERIC NOT NULL DEFAULT 0,
  line_total        NUMERIC NOT NULL DEFAULT 0,
  rental_expires_at TIMESTAMPTZ
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

