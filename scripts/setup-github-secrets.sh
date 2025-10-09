#!/bin/bash
# Setup GitHub Secrets for Deployment
# This script helps configure the required secrets for automated deployment

echo "🔐 GitHub Secrets Setup for Disco"
echo "=================================="
echo ""
echo "This script will guide you through setting up GitHub secrets."
echo "You'll need to manually add these to: Settings → Secrets and variables → Actions"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Required Secrets:${NC}"
echo ""

# Database URLs
echo -e "${GREEN}1. DATABASE_URL${NC}"
echo "   Your production PostgreSQL connection string"
echo "   Format: postgresql://user:password@host:port/database?sslmode=require"
echo ""

echo -e "${GREEN}2. DIRECT_DATABASE_URL${NC}"
echo "   Direct database URL (usually same as DATABASE_URL)"
echo "   Format: postgresql://user:password@host:port/database?sslmode=require"
echo ""

# Vercel
echo -e "${GREEN}3. VERCEL_TOKEN${NC}"
echo "   Get from: https://vercel.com/account/tokens"
echo "   Click 'Create Token' → Give it a name → Copy the token"
echo ""

echo -e "${GREEN}4. VERCEL_ORG_ID${NC}"
echo "   Found in: Vercel Project Settings → General"
echo "   Look for 'Organization ID' or 'Team ID'"
echo ""

echo -e "${GREEN}5. VERCEL_PROJECT_ID${NC}"
echo "   Found in: Vercel Project Settings → General"
echo "   Look for 'Project ID'"
echo ""

echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/secrets/actions"
echo "2. Click 'New repository secret' for each secret above"
echo "3. Paste the values you collected"
echo ""
echo "🚀 Once secrets are added, push to main to trigger deployment:"
echo "   git push origin main"
echo ""
echo "✅ Done!"

