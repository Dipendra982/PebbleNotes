-- ============================================
-- Setup Admin Demo User
-- ============================================
-- This script creates or updates the admin demo user
-- with credentials: admin@gmail.com / admin@123
-- Usage: psql -U postgres -d pebblenotes -f setup-admin-demo.sql
-- ============================================

-- First, delete existing admin@gmail.com if it exists
DELETE FROM users WHERE email = 'admin@gmail.com';

-- Insert admin demo user
-- Password: admin@123 (bcrypt hashed with cost 10)
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role,
    is_verified,
    is_active,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Admin Demo',
    'admin@gmail.com',
    '$2b$10$KzF5p.HLa3uv8vwM3FOuCepCn9R7UY6vYkKLFYbQ8XkJ5hXZ7rH8y',
    'ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify the admin user was created
SELECT 
    id,
    name,
    email,
    role,
    is_verified,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@gmail.com';
