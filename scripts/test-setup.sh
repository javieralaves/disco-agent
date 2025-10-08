#!/bin/bash
# Disco Setup Testing Script

echo "🎵 Disco Setup Testing"
echo "====================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check .env.local exists
echo "1. Checking environment file..."
if [ -f .env.local ]; then
  echo -e "${GREEN}✓${NC} .env.local exists"
  
  # Check if DATABASE_URL is set
  if grep -q "DATABASE_URL=\"postgresql://REPLACE_ME\"" .env.local; then
    echo -e "${YELLOW}⚠${NC}  DATABASE_URL needs to be configured"
    echo "   Options:"
    echo "   A) Supabase: https://supabase.com (recommended)"
    echo "   B) Local: Install PostgreSQL + pgvector"
  else
    echo -e "${GREEN}✓${NC} DATABASE_URL configured"
  fi
  
  # Check if NEXTAUTH_SECRET is set
  if grep -q "NEXTAUTH_SECRET=\"REPLACE_WITH_GENERATED_SECRET\"" .env.local; then
    echo -e "${YELLOW}⚠${NC}  NEXTAUTH_SECRET needs to be set"
    echo "   Run: openssl rand -base64 32"
  else
    echo -e "${GREEN}✓${NC} NEXTAUTH_SECRET configured"
  fi
else
  echo -e "${RED}✗${NC} .env.local not found"
  echo "   Run: cp .env.example .env.local"
  exit 1
fi

echo ""
echo "2. Checking dependencies..."
if [ -d node_modules ]; then
  echo -e "${GREEN}✓${NC} node_modules exists"
else
  echo -e "${YELLOW}⚠${NC}  Dependencies not installed"
  echo "   Run: npm install"
fi

echo ""
echo "3. Checking Prisma client..."
if [ -d node_modules/@prisma/client ]; then
  echo -e "${GREEN}✓${NC} Prisma client generated"
else
  echo -e "${YELLOW}⚠${NC}  Prisma client not generated"
  echo "   Run: npm run db:generate"
fi

echo ""
echo "4. Checking database connection..."
if command -v psql &> /dev/null; then
  echo -e "${GREEN}✓${NC} PostgreSQL CLI installed (psql)"
else
  echo -e "${YELLOW}ℹ${NC}  PostgreSQL CLI not found (Supabase is fine)"
fi

echo ""
echo "5. Next steps:"
echo ""
echo "   ${YELLOW}Configure Database:${NC}"
echo "   • Option A (Recommended): Use Supabase"
echo "     1. Go to https://supabase.com"
echo "     2. Create a new project"
echo "     3. Go to Project Settings → Database"
echo "     4. Copy 'Connection String' (Transaction mode)"
echo "     5. Update DATABASE_URL in .env.local"
echo "     6. In SQL Editor, run: CREATE EXTENSION IF NOT EXISTS vector;"
echo ""
echo "   • Option B: Local PostgreSQL"
echo "     1. Install: brew install postgresql@14 pgvector"
echo "     2. Start: brew services start postgresql@14"
echo "     3. Create DB: createdb disco"
echo "     4. Enable pgvector: psql disco -c 'CREATE EXTENSION vector;'"
echo "     5. Update DATABASE_URL in .env.local"
echo ""
echo "   ${YELLOW}Run Migrations:${NC}"
echo "   • npm run db:migrate"
echo ""
echo "   ${YELLOW}Start Dev Server:${NC}"
echo "   • npm run dev"
echo ""
echo "   ${YELLOW}Configure Auth (Optional):${NC}"
echo "   • GitHub: https://github.com/settings/developers"
echo "   • Google: https://console.cloud.google.com"
echo ""
echo "📖 See docs/TESTING-GUIDE.md for detailed instructions"
echo ""
