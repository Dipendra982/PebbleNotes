# PebbleNotes Database Setup Guide

## 📋 Overview

This folder contains everything needed to set up the PostgreSQL database for PebbleNotes on any computer.

## 🗂️ Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema with tables, indexes, triggers, and seed data |
| `setup-database.sh` | Automated setup script for Mac/Linux |
| `setup-admin-demo.sql` | SQL script to create admin demo user |
| `setup-admin-demo.js` | Node.js script to create admin demo user |
| `set-admin-password.sql` | Legacy admin password update script |
| `.env.example` | Environment variables template |

## 🔑 Admin Demo Account

The project includes an Admin Demo feature for easy testing:

**Credentials:**
- Email: `admin@gmail.com`
- Password: `admin@123`

**Setup:**
```bash
# Run from backend directory
cd ../backend
node src/setup-admin-demo.js
```

This creates a verified admin account that can be accessed via the "Admin Demo" button on the login page.

## 🚀 Quick Setup

### Using Setup Script (Mac/Linux)

```bash
# Make script executable
chmod +x setup-database.sh

# Run the setup
./setup-database.sh
```

### Manual Setup

1. **Install PostgreSQL** (if not installed)
   - Mac: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/

2. **Start PostgreSQL service**
   - Mac: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

3. **Create database and run schema**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE pebblenotes;
   
   # Exit and run schema
   \q
   psql -U postgres -d pebblenotes -f schema.sql
   ```

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   USERS     │     │   NOTES     │     │ CATEGORIES  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ admin_id    │     │ id (PK)     │
│ name        │     │ id (PK)     │────►│ name        │
│ email       │     │ title       │     │ slug        │
│ password    │     │ description │     │ description │
│ role        │     │ subject     │     └─────────────┘
│ avatar      │     │ price       │
└─────────────┘     │ category_id │
       │            └─────────────┘
       │                  │
       │                  │
       ▼                  ▼
┌─────────────┐     ┌─────────────┐
│  PURCHASES  │     │  REVIEWS    │
├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │
│ user_id (FK)│     │ user_id (FK)│
│ note_id (FK)│     │ note_id (FK)│
│ amount      │     │ rating      │
│ status      │     │ comment     │
└─────────────┘     └─────────────┘
```

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | User accounts (admins and regular users) |
| `sessions` | JWT token management |
| `categories` | Note categories/subjects |
| `notes` | Study notes/materials |
| `purchases` | User purchase history |
| `reviews` | Note reviews and ratings |
| `favorites` | User wishlists |
| `notifications` | User notifications |
| `activity_logs` | Analytics and audit logs |
| `password_reset_tokens` | Password reset functionality |

## 🔐 Connection Details

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | pebblenotes |
| Username | postgres |
| Password | root |

### Connection String
```
postgresql://postgres:root@localhost:5432/pebblenotes
```

## 👤 Default Admin Account

| Field | Value |
|-------|-------|
| Email | admin@pebblenotes.com |
| Password | admin1234 |
| Role | ADMIN |

⚠️ **Change this password in production!**

## 🔧 pgAdmin Setup (Local)

1. Open pgAdmin and connect to your local server.
2. Add a new server:
   - Name: `PebbleNotes`
   - Host: `localhost`
   - Port: `5432`
   - Maintenance DB: `postgres`
   - Username: `postgres`
   - Password: `root`
3. After connecting, expand Databases → `pebblenotes` → Schemas → `public` → Tables.
4. If you don't see tables, right-click `Tables` and click Refresh, or run the setup script again.

## 📝 Common Commands

```bash
# Connect to database
psql -U postgres -d pebblenotes

# List all tables
\dt

# Describe a table
\d users

# Run a query
SELECT * FROM users;

# Exit
\q

# Backup database
pg_dump -U postgres -d pebblenotes > backup.sql

# Restore database
psql -U postgres -d pebblenotes < backup.sql
```

## 🔄 Reset Database

To completely reset the database:

```bash
# Clear all site data (notes, purchases, etc.) but keep users/categories
psql -U postgres -d pebblenotes -f clear-data.sql

# Or drop and recreate everything
psql -U postgres -c "DROP DATABASE IF EXISTS pebblenotes"
psql -U postgres -c "CREATE DATABASE pebblenotes"
psql -U postgres -d pebblenotes -f schema.sql
```

 

## 🆘 Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check if port 5432 is not in use

### Permission Denied
- Check user permissions
- Ensure password is correct

### Database Does Not Exist
- Run the setup script or create manually:
  ```sql
  CREATE DATABASE pebblenotes;
  ```
