#!/bin/bash
# Verify Disco Setup Script

echo "🔍 Verifying Disco Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

# Function to check env var
check_env() {
  local var_name=$1
  local required=$2
  
  if grep -q "${var_name}=\"\"" .env.local 2>/dev/null || \
     grep -q "${var_name}=\"REPLACE" .env.local 2>/dev/null || \
     ! grep -q "^${var_name}=" .env.local 2>/dev/null; then
    if [ "$required" = "true" ]; then
      echo -e "${RED}✗${NC} ${var_name} not configured"
      ((ISSUES++))
    else
      echo -e "${YELLOW}○${NC} ${var_name} not configured (optional)"
    fi
    return 1
  else
    echo -e "${GREEN}✓${NC} ${var_name} configured"
    return 0
  fi
}

echo "📝 Environment Variables:"
check_env "DATABASE_URL" "true"
check_env "NEXTAUTH_URL" "true"
check_env "NEXTAUTH_SECRET" "true"
check_env "GITHUB_ID" "false"
check_env "GITHUB_SECRET" "false"
check_env "GOOGLE_CLIENT_ID" "false"
check_env "GOOGLE_CLIENT_SECRET" "false"

echo ""
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules installed"
else
  echo -e "${RED}✗${NC} node_modules not found"
  ((ISSUES++))
fi

if [ -d "node_modules/@prisma/client" ]; then
  echo -e "${GREEN}✓${NC} Prisma client generated"
else
  echo -e "${RED}✗${NC} Prisma client not generated"
  ((ISSUES++))
fi

echo ""
echo "🗄️  Database:"

# Try to connect to database (if Prisma is set up)
if [ -f "node_modules/.bin/prisma" ]; then
  if npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | grep -q "Error"; then
    echo -e "${RED}✗${NC} Cannot connect to database"
    echo "  Check your DATABASE_URL"
    ((ISSUES++))
  else
    echo -e "${GREEN}✓${NC} Database connection works"
    
    # Check if pgvector is installed
    if npx prisma db execute --stdin <<< "SELECT 1 FROM pg_extension WHERE extname = 'vector';" 2>&1 | grep -q "1"; then
      echo -e "${GREEN}✓${NC} pgvector extension installed"
    else
      echo -e "${RED}✗${NC} pgvector extension not found"
      echo "  Supabase: Run 'CREATE EXTENSION vector;' in SQL Editor"
      echo "  Local: psql disco -c 'CREATE EXTENSION vector;'"
      ((ISSUES++))
    fi
    
    # Check if migrations have been run
    if npx prisma db execute --stdin <<< "SELECT 1 FROM information_schema.tables WHERE table_name = 'users';" 2>&1 | grep -q "1"; then
      echo -e "${GREEN}✓${NC} Migrations applied (tables exist)"
    else
      echo -e "${RED}✗${NC} Migrations not applied"
      echo "  Run: npm run db:migrate"
      ((ISSUES++))
    fi
  fi
fi

echo ""
echo "🔐 Authentication:"
if check_env "GITHUB_ID" "false" || check_env "GOOGLE_CLIENT_ID" "false"; then
  echo -e "${GREEN}✓${NC} At least one OAuth provider configured"
else
  echo -e "${YELLOW}⚠${NC}  No OAuth providers configured"
  echo "  You won't be able to sign in without GitHub or Google OAuth"
  echo "  See: https://github.com/settings/developers"
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ Setup looks good!${NC}"
  echo ""
  echo "Ready to test:"
  echo "  1. npm run dev"
  echo "  2. Visit http://localhost:3000"
  echo "  3. Click 'Sign In' and test authentication"
  echo "  4. npm run db:studio (to view database)"
else
  echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
  echo ""
  echo "Please fix the issues above, then run this script again:"
  echo "  ./scripts/verify-setup.sh"
  echo ""
  echo "Need help? Check:"
  echo "  • QUICK-START.md"
  echo "  • docs/TESTING-GUIDE.md"
  exit 1
fi
