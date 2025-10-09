#!/bin/bash

# Disco - Deployment Preparation Script
# This script helps prepare your local environment for Vercel deployment

echo "🚀 Disco Deployment Preparation"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit them before deploying."
    git status --short
    echo ""
    read -p "Do you want to commit all changes now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Please commit changes manually before deploying"
        exit 1
    fi
else
    echo "✅ Git working directory is clean"
fi

# Check if on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Warning: You're on branch '$current_branch', not 'main'"
    read -p "Switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        echo "✅ Switched to main branch"
    fi
fi

# Generate NEXTAUTH_SECRET
echo ""
echo "🔐 Generating NEXTAUTH_SECRET..."
nextauth_secret=$(openssl rand -base64 32)
echo "Your production NEXTAUTH_SECRET:"
echo "$nextauth_secret"
echo ""
echo "⚠️  Save this value! You'll need it for Vercel environment variables."
echo ""

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    echo ""
    read -p "Do you want to deploy now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    else
        echo "ℹ️  Run 'vercel --prod' when ready to deploy"
    fi
else
    echo "ℹ️  Vercel CLI not found. Install it with:"
    echo "   npm i -g vercel"
fi

echo ""
echo "📚 Next steps:"
echo "1. Create production GitHub OAuth app"
echo "2. Set environment variables in Vercel"
echo "3. Update GitHub OAuth callback URL"
echo "4. Test deployment"
echo ""
echo "See DEPLOYMENT-GUIDE.md for detailed instructions"

