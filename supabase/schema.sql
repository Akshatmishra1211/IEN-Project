-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tracked Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_product_id INT UNIQUE NOT NULL,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(255),
    sku VARCHAR(100),
    description TEXT,
    scrape_interval_hours INT DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    last_scraped_at TIMESTAMPTZ,
    last_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Price & Stock History Table
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2),
    stock VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'INR',
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scrape Logs Table (Honest logging of every attempt & outcome)
CREATE TABLE IF NOT EXISTS public.scrape_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'RETRIED', 'FAILED'
    attempts INT DEFAULT 1,
    duration_ms INT,
    price_found NUMERIC(10, 2),
    stock_found VARCHAR(50),
    error_message TEXT,
    structure_changed BOOLEAN DEFAULT FALSE,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Alerts Table (Price Drop & Back In Stock)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    target_price NUMERIC(10, 2),
    alert_type VARCHAR(50) NOT NULL, -- 'PRICE_DROP', 'BACK_IN_STOCK'
    user_email VARCHAR(255),
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_product_id ON public.scrape_logs(product_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_mock_id ON public.products(mock_product_id);
