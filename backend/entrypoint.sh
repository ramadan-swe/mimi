#!/bin/bash
set -e

# Run migrations if needed
if [ -f "manage.py" ]; then
    echo "⏳ Running migrations..."
    uv run python manage.py migrate --noinput || true

    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput || true
fi

# create vector extension if not exists
if [ -f "manage.py" ]; then
    echo "⏳ Creating vector extension..."
    uv run python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
EOF
fi

# Execute the main command
exec "$@"
