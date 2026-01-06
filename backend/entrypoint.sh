#!/bin/bash
set -e

# Run migrations if needed
if [ -f "manage.py" ]; then
    echo "⏳ Running migrations..."
    python manage.py migrate --noinput || true
fi

# create vector extension if not exists
if [ -f "manage.py" ]; then
    echo "⏳ Creating vector extension..."
    python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
EOF
fi

# Execute the main command
exec "$@"
