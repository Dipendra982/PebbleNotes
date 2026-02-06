#!/bin/bash

# ============================================
# PebbleNotes Database Setup Script
# ============================================
# This script sets up PostgreSQL database for PebbleNotes
# Run: chmod +x setup-database.sh && ./setup-database.sh
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="pebblenotes"
DB_USER="postgres"
DB_PASSWORD="roots"
DB_HOST="localhost"
DB_PORT="5433"

echo -e "${BLUE}"
echo "============================================"
echo "  PebbleNotes Database Setup"
echo "============================================"
echo -e "${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed or not in PATH${NC}"
    echo "Please install PostgreSQL first:"
    echo "  - Mac: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Check PostgreSQL service
echo -e "${YELLOW}Checking PostgreSQL service...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if brew services list | grep -q "postgresql.*started"; then
        echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
    else
        echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
        brew services start postgresql || brew services start postgresql@14 || brew services start postgresql@15
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
    else
        echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
        sudo systemctl start postgresql
    fi
fi

# Set password for PostgreSQL connection
export PGPASSWORD="$DB_PASSWORD"

# Create database if not exists
echo -e "${YELLOW}Creating database '${DB_NAME}'...${NC}"

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo -e "${GREEN}✅ Database '${DB_NAME}' ready${NC}"

# Run schema script
echo -e "${YELLOW}Running schema script...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/schema.sql"

echo -e "${GREEN}✅ Schema created successfully${NC}"

# Verify tables
echo -e "${YELLOW}Verifying tables...${NC}"

TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")

echo -e "${GREEN}✅ Created ${TABLE_COUNT} tables${NC}"

# Show connection info
echo ""
echo -e "${BLUE}============================================"
echo "  Database Setup Complete!"
echo "============================================${NC}"
echo ""
echo -e "${GREEN}Connection Details:${NC}"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo -e "${GREEN}Connection String:${NC}"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo -e "${GREEN}Default Admin Login:${NC}"
echo "  Email:    admin@pebblenotes.com"
echo "  Password: admin1234"
echo ""
echo -e "${YELLOW}⚠️  Remember to change the admin password in production!${NC}"
echo ""
