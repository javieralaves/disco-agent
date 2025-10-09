#!/bin/bash
# Run database migrations for production
# This script should be run after deploying to Vercel

echo "🗄️  Running Database Migrations"
echo "================================"
echo ""

# Check if environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL and DIRECT_DATABASE_URL must be set"
  echo ""
  echo "Set them in your environment or .env file:"
  echo "  export DATABASE_URL='your-database-url'"
  echo "  export DIRECT_DATABASE_URL='your-direct-database-url'"
  exit 1
fi

echo "📋 Migration Details:"
echo "  - Database: $(echo $DIRECT_DATABASE_URL | sed 's/:[^:]*@/@/g')"
echo ""

# Run migrations
echo "🚀 Applying migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrations completed successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify your Vercel deployment is working"
  echo "  2. Test the pre-interview questions feature"
else
  echo ""
  echo "❌ Migration failed. Check the error above."
  echo ""
  echo "Troubleshooting:"
  echo "  - Verify DATABASE_URL and DIRECT_DATABASE_URL are correct"
  echo "  - Check that your database is accessible"
  echo "  - Ensure Supabase is not blocking the connection"
  exit 1
fi

