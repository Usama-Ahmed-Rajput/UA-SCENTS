-- =============================================================================
-- UA SCENTS - Complete Supabase Database Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fragrance', 'object', 'set')),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_2_url TEXT,
    image_3_url TEXT,
    gradient TEXT,
    badge TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    option_label TEXT NOT NULL,
    sku TEXT,
    price NUMERIC NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Notes Table
CREATE TABLE IF NOT EXISTS public.product_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 4. Product Genders Table
CREATE TABLE IF NOT EXISTS public.product_genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    gender TEXT NOT NULL
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    shipping_address JSONB,
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    variant_id UUID,
    title TEXT NOT NULL,
    variant_title TEXT,
    price NUMERIC NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    image_url TEXT
);

-- 7. Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAQ Items Table
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 9. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Gradients Table
CREATE TABLE IF NOT EXISTS public.gradients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    css_value TEXT NOT NULL,
    category TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. View: products_full
CREATE OR REPLACE VIEW public.products_full AS
SELECT 
    p.*,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', v.id,
                'title', v.title,
                'option', v.option_label,
                'sku', v.sku,
                'price', v.price
            )
        ) FILTER (WHERE v.id IS NOT NULL), '[]'
    ) AS variants,
    COALESCE(
        array_agg(DISTINCT n.note) FILTER (WHERE n.note IS NOT NULL), '{}'
    ) AS notes,
    COALESCE(
        array_agg(DISTINCT g.gender) FILTER (WHERE g.gender IS NOT NULL), '{}'
    ) AS gender
FROM public.products p
LEFT JOIN public.product_variants v ON v.product_id = p.id
LEFT JOIN public.product_notes n ON n.product_id = p.id
LEFT JOIN public.product_genders g ON g.product_id = p.id
GROUP BY p.id;

-- Enable RLS & Allow public access policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gradients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to product_notes" ON public.product_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to product_genders" ON public.product_genders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to pages" ON public.pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to faq_items" ON public.faq_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to gradients" ON public.gradients FOR ALL USING (true) WITH CHECK (true);

-- Seed Default Luxury Gradients (Extracted from live reference site)
INSERT INTO public.gradients (name, css_value, category) VALUES
('Dune (Sage Green)', 'linear-gradient(135deg, #b8c4a8 0%, #a0b090 100%)', 'Earthy & Green'),
('Royal Vanilla (Warm Cashmere)', 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)', 'Warm & Cream'),
('Amalfi Coast (Sky Blue)', 'linear-gradient(135deg, #eaf0f6 0%, #d8e4ee 100%)', 'Fresh & Ocean'),
('Moroccan Souk (Spiced Tan)', 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)', 'Warm & Cream'),
('French Lavande (Soft Lavender)', 'linear-gradient(135deg, #e8e0f0 0%, #d8d0e8 100%)', 'Floral & Soft'),
('Rebel Moon (Blush Rose)', 'linear-gradient(135deg, #e0c0b8 0%, #d0a8a0 100%)', 'Floral & Soft'),
('Disfruta (Ice Blue)', 'linear-gradient(135deg, #e0ecf4 0%, #c8dde8 100%)', 'Fresh & Ocean'),
('Gold Rush (Peach Glow)', 'linear-gradient(135deg, #f5e0e0 0%, #ecc8cc 100%)', 'Floral & Soft'),
('Azur (Emerald Mint)', 'linear-gradient(135deg, #c0d4c8 0%, #a8c0b0 100%)', 'Earthy & Green'),
('Qahwa (Warm Cinnamon)', 'linear-gradient(135deg, #f5e6c8 0%, #edd8b0 100%)', 'Warm & Cream'),
('Oud Essence (Amber Wood)', 'linear-gradient(135deg, #d4a07a 0%, #c08860 100%)', 'Earthy & Woody'),
('Ananas Royal (Golden Velvet)', 'linear-gradient(135deg, #e8d470 0%, #d4bc50 100%)', 'Warm & Cream')
ON CONFLICT DO NOTHING;



