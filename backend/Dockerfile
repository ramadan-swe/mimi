FROM python:3.12-slim-trixie

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

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
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Configure UV to use /opt/venv
ENV UV_PROJECT_ENVIRONMENT="/opt/venv"
ENV UV_LINK_MODE=copy
# Update PATH so python/uv commands use the venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

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
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
