#!/bin/bash
# Database setup script for Disco

echo "🎵 Disco Database Setup"
echo "======================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please create a .env.local file with your database connection string"
  echo ""
  echo "For Supabase:"
  echo "  DATABASE_URL=\"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\""
  echo ""
  echo "For local PostgreSQL:"
  echo "  DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/disco\""
  exit 1
fi

echo "✅ Database URL found"
echo ""

# Enable pgvector extension (Supabase users should do this via SQL Editor)
echo "📦 Setting up pgvector extension..."
echo "If using Supabase, please run the following SQL in your Supabase SQL Editor:"
echo ""
echo "  CREATE EXTENSION IF NOT EXISTS vector;"
echo ""
echo "Press Enter when done, or Ctrl+C to exit..."
read -r

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✨ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Visit http://localhost:3000"
