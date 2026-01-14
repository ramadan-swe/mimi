#!/bin/bash
set -e

# Run migrations if needed
if [ -f "manage.py" ]; then
    # Create vector extension BEFORE migrations
    echo "⏳ Creating vector extension..."
    uv run python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
EOF

    echo "⏳ Running migrations..."
    uv run python manage.py makemigrations || true
    uv run python manage.py migrate --noinput || true

    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput || true

    # Copy test images if they don't exist in container
    if [ ! -d "/app/static/test-images" ] && [ -d "/host-static/test-images" ]; then
        echo "📸 Copying test images..."
        cp -r /host-static/test-images /app/static/ || true
    fi

    # Check if database needs seeding
    echo "🌱 Checking if database needs seeding..."
    LISTING_COUNT=$(uv run python manage.py shell -c "from listings.models import Listing; print(Listing.objects.count())" 2>/dev/null || echo "0")
    
    if [ "$LISTING_COUNT" = "0" ]; then
        echo "🌱 Seeding database..."
        uv run python manage.py seed_data --clear --users 20 --listings 50 || true
    else
        echo "✅ Database already has data ($LISTING_COUNT listings). Skipping seeding."
    fi
fi

# Execute the main command
exec "$@"