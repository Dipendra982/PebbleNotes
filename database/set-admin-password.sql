-- Update admin user's password to 'admin1234' (bcrypt hashed)
-- Also mark as verified to avoid login block

UPDATE users
SET password_hash = '$2b$10$/7JP2UYsBpyZ2C0yxHveGO3HJzoUiR/TX15HlB58YYbGW1TGULiqu',
    is_verified = TRUE,
    email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP)
WHERE email = 'admin@pebblenotes.com';
