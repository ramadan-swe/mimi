#!/bin/bash
set -e

# Initialize Django project if manage.py doesn't exist
if [ ! -f "manage.py" ]; then
    echo "🚀 Initializing Django project..."
    django-admin startproject config .
    django-admin startapp accounts
    django-admin startapp listings
    django-admin startapp payments
    django-admin startapp chat
    django-admin startapp notifications
    echo "✅ Django project created!"
fi

# Run migrations if needed
if [ -f "manage.py" ]; then
    echo "⏳ Running migrations..."
    python manage.py migrate --noinput || true
    
    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput || true
fi

# Execute the main command
exec "$@"
