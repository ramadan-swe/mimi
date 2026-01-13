#!/bin/bash
set -e

# Run migrations if needed
if [ -f "manage.py" ]; then
    echo "⏳ Running migrations..."
    uv run python manage.py migrate --noinput || true

    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput || true

    # create vector extension if not exists
    echo "⏳ Creating vector extension..."
    uv run python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
EOF

    echo " Seeding database..."
    uv run python manage.py seed_data --clear --users 20 --listings 50
fi

# Execute the main command
exec "$@"
