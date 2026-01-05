-- ============================================
-- PebbleNotes Database Schema
-- PostgreSQL Database Setup Script
-- ============================================
-- Run this script to create the complete database structure
-- Usage: psql -U postgres -d pebblenotes -f schema.sql
-- ============================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;

-- Drop custom types if exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS purchase_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- ============================================
-- CUSTOM TYPES (ENUMS)
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE purchase_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('KHALTI', 'ESEWA', 'CARD', 'BANK_TRANSFER');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'USER',
    avatar VARCHAR(500),
    phone VARCHAR(20),
    bio TEXT,
    university VARCHAR(200),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- SESSIONS TABLE (for JWT token management)
-- ============================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================
-- NOTES TABLE
-- ============================================

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content TEXT, -- For AI-generated summaries
    subject VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(10, 2), -- For showing discounts
    preview_image_url VARCHAR(500),
    pdf_url VARCHAR(500),
    file_size BIGINT, -- In bytes
    page_count INT,
    university VARCHAR(200),
    course_code VARCHAR(50),
    semester VARCHAR(50),
    year INT,
    language VARCHAR(50) DEFAULT 'English',
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    rating_avg DECIMAL(2, 1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    tags TEXT[], -- Array of tags
    ai_summary TEXT, -- Gemini AI generated summary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_notes_subject ON notes(subject);
CREATE INDEX idx_notes_admin_id ON notes(admin_id);
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_notes_price ON notes(price);
CREATE INDEX idx_notes_is_published ON notes(is_published);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_slug ON notes(slug);

-- Full-text search index
CREATE INDEX idx_notes_search ON notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- PURCHASES TABLE
-- ============================================

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    status purchase_status DEFAULT 'PENDING',
    payment_method payment_method,
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    payment_response JSONB, -- Store full payment gateway response
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    
    -- Prevent duplicate purchases
    UNIQUE(user_id, note_id)
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_note_id ON purchases(note_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_date ON purchases(purchased_at DESC);

-- ============================================
-- REVIEWS TABLE
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- One review per user per note
    UNIQUE(user_id, note_id)
);

CREATE INDEX idx_reviews_note_id ON reviews(note_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- FAVORITES TABLE (Wishlist)
-- ============================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, note_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_note_id ON favorites(note_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- 'purchase', 'review', 'system', etc.
    data JSONB, -- Additional data
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- ACTIVITY LOGS TABLE (for analytics)
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'note', 'user', 'purchase', etc.
    entity_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update note rating when a review is added
CREATE OR REPLACE FUNCTION update_note_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE notes
    SET 
        rating_avg = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE note_id = COALESCE(NEW.note_id, OLD.note_id) AND is_approved = TRUE),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE note_id = COALESCE(NEW.note_id, OLD.note_id) AND is_approved = TRUE)
    WHERE id = COALESCE(NEW.note_id, OLD.note_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_note_rating();

-- ============================================
-- VIEWS
-- ============================================

-- View for note listing with admin info
CREATE OR REPLACE VIEW v_notes_with_admin AS
SELECT 
    n.*,
    u.name as admin_name,
    u.email as admin_email,
    u.avatar as admin_avatar,
    c.name as category_name
FROM notes n
LEFT JOIN users u ON n.admin_id = u.id
LEFT JOIN categories c ON n.category_id = c.id
WHERE n.is_published = TRUE;

-- View for user purchase history
CREATE OR REPLACE VIEW v_user_purchases AS
SELECT 
    p.*,
    n.title as note_title,
    n.preview_image_url,
    n.pdf_url,
    u.name as user_name,
    u.email as user_email
FROM purchases p
JOIN notes n ON p.note_id = n.id
JOIN users u ON p.user_id = u.id;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Mathematics', 'mathematics', 'Calculus, Algebra, Statistics and more', '📐', '#3B82F6'),
('Computer Science', 'computer-science', 'Programming, Data Structures, Algorithms', '💻', '#10B981'),
('Chemistry', 'chemistry', 'Organic, Inorganic, Physical Chemistry', '🧪', '#F59E0B'),
('Physics', 'physics', 'Mechanics, Thermodynamics, Quantum Physics', '⚛️', '#8B5CF6'),
('Biology', 'biology', 'Cell Biology, Genetics, Ecology', '🧬', '#EC4899'),
('Business', 'business', 'Management, Marketing, Finance', '📊', '#6366F1'),
('Engineering', 'engineering', 'Civil, Mechanical, Electrical Engineering', '⚙️', '#F97316'),
('Medical', 'medical', 'Anatomy, Physiology, Pharmacology', '🏥', '#EF4444'),
('Law', 'law', 'Constitutional, Criminal, Civil Law', '⚖️', '#64748B'),
('Arts & Humanities', 'arts-humanities', 'Literature, History, Philosophy', '🎨', '#A855F7');

-- Insert default admin user (password: admin123 - hashed with bcrypt)
-- NOTE: In production, change this password immediately!
INSERT INTO users (name, email, password_hash, role, is_verified, email_verified_at) VALUES
('Admin User', 'admin@pebblenotes.com', '$2b$10$rIC9k/X.P5F8vbsLrR9Emu3dJq3X8Z1q8G.6LF3mhNqVmK9l6FXbS', 'ADMIN', TRUE, CURRENT_TIMESTAMP);

-- Insert sample notes (linked to admin user)
INSERT INTO notes (title, slug, description, subject, price, preview_image_url, pdf_url, admin_id, is_featured, is_verified, tags)
SELECT 
    'Advanced Calculus Semester 1',
    'advanced-calculus-semester-1',
    'Comprehensive notes covering limits, derivatives, and integrations with solved examples.',
    'Mathematics',
    15.00,
    'https://picsum.photos/seed/math1/400/300',
    '#',
    id,
    TRUE,
    TRUE,
    ARRAY['calculus', 'derivatives', 'integration', 'limits']
FROM users WHERE email = 'admin@pebblenotes.com';

INSERT INTO notes (title, slug, description, subject, price, preview_image_url, pdf_url, admin_id, is_featured, is_verified, tags)
SELECT 
    'Data Structures in C++',
    'data-structures-cpp',
    'Deep dive into linked lists, trees, graphs, and algorithm complexity analysis.',
    'Computer Science',
    25.00,
    'https://picsum.photos/seed/cs1/400/300',
    '#',
    id,
    TRUE,
    TRUE,
    ARRAY['data structures', 'c++', 'algorithms', 'trees', 'graphs']
FROM users WHERE email = 'admin@pebblenotes.com';

INSERT INTO notes (title, slug, description, subject, price, preview_image_url, pdf_url, admin_id, is_verified, tags)
SELECT 
    'Organic Chemistry II',
    'organic-chemistry-2',
    'Focus on reaction mechanisms and spectroscopy. Includes high-quality diagrams.',
    'Chemistry',
    10.00,
    'https://picsum.photos/seed/chem1/400/300',
    '#',
    id,
    TRUE,
    ARRAY['organic chemistry', 'reactions', 'spectroscopy']
FROM users WHERE email = 'admin@pebblenotes.com';

INSERT INTO notes (title, slug, description, subject, price, preview_image_url, pdf_url, admin_id, tags)
SELECT 
    'Introduction to Machine Learning',
    'intro-machine-learning',
    'Fundamentals of ML algorithms including supervised and unsupervised learning.',
    'Computer Science',
    30.00,
    'https://picsum.photos/seed/ml1/400/300',
    '#',
    id,
    ARRAY['machine learning', 'AI', 'python', 'neural networks']
FROM users WHERE email = 'admin@pebblenotes.com';

INSERT INTO notes (title, slug, description, subject, price, preview_image_url, pdf_url, admin_id, tags)
SELECT 
    'Quantum Mechanics Basics',
    'quantum-mechanics-basics',
    'Introduction to quantum theory, wave functions, and Schrödinger equation.',
    'Physics',
    20.00,
    'https://picsum.photos/seed/physics1/400/300',
    '#',
    id,
    ARRAY['quantum', 'physics', 'wave functions', 'schrodinger']
FROM users WHERE email = 'admin@pebblenotes.com';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- Grant select, insert, update, delete on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ PebbleNotes database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, sessions, categories, notes, purchases, reviews, favorites, notifications, activity_logs, password_reset_tokens';
    RAISE NOTICE '👤 Default admin: admin@pebblenotes.com';
    RAISE NOTICE '🔐 Default password: admin123 (CHANGE THIS IN PRODUCTION!)';
END $$;
