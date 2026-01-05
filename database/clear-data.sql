-- Clear site data while keeping core references
-- Keeps admin users and categories; clears content tables.

TRUNCATE TABLE purchases RESTART IDENTITY CASCADE;
TRUNCATE TABLE reviews RESTART IDENTITY CASCADE;
TRUNCATE TABLE favorites RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE activity_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE password_reset_tokens RESTART IDENTITY CASCADE;
TRUNCATE TABLE notes RESTART IDENTITY CASCADE;

-- Optionally clear non-admin users (uncomment if desired)
-- DELETE FROM users WHERE role <> 'ADMIN';
