#!/bin/bash
set -e

# Run migrations if needed
if [ -f "manage.py" ]; then
    # create vector extension FIRST (before migrations)
    echo "⏳ Creating vector extension..."
    uv run python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
EOF

    echo "⏳ Running migrations..."
    uv run python manage.py migrate --noinput

    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput || true

    # Only seed if database is empty (check if User table has any records)
    echo "🔍 Checking if database needs seeding..."
    USER_COUNT=$(uv run python manage.py shell -c "from accounts.models import User; print(User.objects.count())" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" = "0" ]; then
        echo "📊 Seeding database with initial data..."
        uv run python manage.py seed_data --clear --users 20 --listings 50
    else
        echo "✅ Database already has data (${USER_COUNT} users). Skipping seeding."
    fi
fi

# Execute the main command
exec "$@"
