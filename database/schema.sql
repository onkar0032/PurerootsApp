-- ============================================
-- Pure Roots - Fresh Juice Shop
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'OWNER')),
    address         TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JUICES (PRODUCTS) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS juices (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL DEFAULT 'classic',
    base_price      DECIMAL(10, 2) NOT NULL,
    image_url       VARCHAR(500),
    ingredients     TEXT[] NOT NULL DEFAULT '{}',
    is_available    BOOLEAN DEFAULT TRUE,
    is_seasonal     BOOLEAN DEFAULT FALSE,
    calories        INTEGER,
    size_options    JSONB DEFAULT '["Small", "Medium", "Large"]',
    customizations  JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id              BIGSERIAL PRIMARY KEY,
    order_number    VARCHAR(20) UNIQUE NOT NULL,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    order_type      VARCHAR(20) NOT NULL DEFAULT 'PICKUP'
                    CHECK (order_type IN ('PICKUP', 'DELIVERY')),
    items           JSONB NOT NULL DEFAULT '[]',
    total_amount    DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT,
    delivery_notes  TEXT,
    scheduled_time  TIMESTAMP WITH TIME ZONE,
    payment_method  VARCHAR(30) DEFAULT 'CASH',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_id        BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    category        VARCHAR(50) DEFAULT 'general',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_juices_category ON juices(category);
CREATE INDEX IF NOT EXISTS idx_juices_available ON juices(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order ON feedback(order_id);

-- ============================================
-- SEED DATA: Sample Juices (16 Juices) — Prices in ₹
-- ============================================

-- 🍊 CLASSIC
INSERT INTO juices (name, description, category, base_price, ingredients, calories, is_available, is_seasonal, customizations) VALUES
('Sunrise Orange', 'Pure, cold-pressed Valencia oranges — the perfect way to start your morning.', 'classic', 69, ARRAY['Valencia Orange'], 110, true, false,
 '{"add_ons": ["Ginger Shot", "Turmeric", "Honey", "Chia Seeds"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Ruby Grapefruit', 'Zesty and refreshing pink grapefruit, bursting with citrus vitality.', 'classic', 79, ARRAY['Pink Grapefruit'], 96, true, false,
 '{"add_ons": ["Mint", "Honey", "Lime", "Chia Seeds"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Golden Pineapple', 'Sweet, tropical sun-ripened pineapple that transports you to paradise.', 'classic', 89, ARRAY['Sun-Ripened Pineapple'], 132, true, false,
 '{"add_ons": ["Coconut Milk", "Mint", "Ginger", "Chia Seeds"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Simply Apple', 'A crisp, perfectly balanced blend of Fuji and Granny Smith apples.', 'classic', 69, ARRAY['Fuji Apple', 'Granny Smith Apple'], 120, true, false,
 '{"add_ons": ["Cinnamon", "Ginger", "Honey", "Lemon"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}');

-- 🥬 DETOX
INSERT INTO juices (name, description, category, base_price, ingredients, calories, is_available, is_seasonal, customizations) VALUES
('Earthly Roots', 'A grounding blend of beetroot, carrot, ginger, and lemon for deep cleansing.', 'detox', 99, ARRAY['Beetroot', 'Carrot', 'Ginger', 'Lemon'], 115, true, false,
 '{"add_ons": ["Turmeric", "Wheatgrass", "Spirulina", "Honey"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Green Machine', 'Spinach, kale, cucumber, green apple, and mint — a powerhouse of greens.', 'detox', 109, ARRAY['Spinach', 'Kale', 'Cucumber', 'Green Apple', 'Mint'], 95, true, false,
 '{"add_ons": ["Chia Seeds", "Protein Powder", "Flax Seeds", "Spirulina"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('The Purifier', 'Celery, parsley, lemon, and a hint of Himalayan salt for total detox.', 'detox', 89, ARRAY['Celery', 'Parsley', 'Lemon', 'Himalayan Salt'], 55, true, false,
 '{"add_ons": ["Ginger Shot", "Wheatgrass", "Cucumber", "Mint"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Glow Up', 'Cucumber, aloe vera, and green grapes for radiant skin and hydration.', 'detox', 99, ARRAY['Cucumber', 'Aloe Vera', 'Green Grapes'], 80, true, false,
 '{"add_ons": ["Mint", "Lemon", "Coconut Water", "Chia Seeds"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}');

-- 💪 WELLNESS
INSERT INTO juices (name, description, category, base_price, ingredients, calories, is_available, is_seasonal, customizations) VALUES
('Immunity Shield', 'Orange, turmeric, ginger, and cayenne pepper — your daily defense boost.', 'wellness', 119, ARRAY['Orange', 'Turmeric', 'Ginger', 'Cayenne Pepper'], 130, true, false,
 '{"add_ons": ["Honey", "Lemon", "Echinacea", "Black Pepper"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Recovery Fuel', 'Watermelon, coconut water, and lime — the ultimate post-workout refresher.', 'wellness', 109, ARRAY['Watermelon', 'Coconut Water', 'Lime'], 100, true, false,
 '{"add_ons": ["Chia Seeds", "Electrolytes", "Mint", "Honey"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Brain Power', 'Blueberry, pomegranate, and walnuts to fuel focus and cognitive clarity.', 'wellness', 139, ARRAY['Blueberry', 'Pomegranate', 'Walnuts'], 175, true, false,
 '{"add_ons": ["Flax Seeds", "Oat Milk", "Honey", "Acai"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Vitality Shot', 'A concentrated, potent blend of wheatgrass and lemon for instant energy.', 'wellness', 79, ARRAY['Wheatgrass', 'Lemon'], 35, true, false,
 '{"add_ons": ["Ginger", "Cayenne", "Spirulina", "Honey"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}');

-- 🌸 SEASONAL
INSERT INTO juices (name, description, category, base_price, ingredients, calories, is_available, is_seasonal, customizations) VALUES
('Summer Breeze', 'Mango, passion fruit, and lime — a tropical escape in every sip. (Summer)', 'seasonal', 129, ARRAY['Mango', 'Passion Fruit', 'Lime'], 160, true, true,
 '{"add_ons": ["Coconut Milk", "Chia Seeds", "Mint", "Turmeric"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Harvest Spice', 'Apple, carrot, cinnamon, and nutmeg — autumn in a glass. (Autumn)', 'seasonal', 119, ARRAY['Apple', 'Carrot', 'Cinnamon', 'Nutmeg'], 140, true, true,
 '{"add_ons": ["Ginger", "Honey", "Vanilla", "Oat Milk"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Winter Zest', 'Pomegranate, pear, and star anise — warming and aromatic. (Winter)', 'seasonal', 139, ARRAY['Pomegranate', 'Pear', 'Star Anise'], 135, true, true,
 '{"add_ons": ["Cinnamon", "Honey", "Ginger", "Clove"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}'),
('Spring Bloom', 'Strawberry, dragon fruit, and rose water — floral, fresh, and vibrant. (Spring)', 'seasonal', 149, ARRAY['Strawberry', 'Dragon Fruit', 'Rose Water'], 125, true, true,
 '{"add_ons": ["Chia Seeds", "Lavender", "Honey", "Coconut Milk"], "sweetness": ["None", "Light", "Regular"], "ice": ["No Ice", "Light", "Regular", "Extra"]}');
