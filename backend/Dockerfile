FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package installation and move to standard location
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv && \
    uv --version

# Copy requirements file
COPY requirements.txt* ./

# Install Python dependencies
# If requirements.txt exists, use it; otherwise install core packages
RUN if [ -f requirements.txt ]; then \
    uv pip install --system -r requirements.txt; \
    else \
    uv pip install --system \
    Django \
    djangorestframework \
    djangorestframework-simplejwt \
    psycopg2-binary \
    pgvector \
    Pillow \
    celery \
    redis \
    openai \
    firebase-admin \
    requests \
    sendgrid \
    django-cors-headers \
    Faker \
    pytest \
    pytest-django \
    factory-boy \
    django-extensions \
    ipython \
    django-ratelimit \
    cryptography; \
    fi

# Copy project files
COPY . .

# Copy entrypoint script and make it executable
RUN chmod +x /app/entrypoint.sh

# Create media directory
RUN mkdir -p media

# Expose port
EXPOSE 8000

# Use entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
