# Egypt Car Rental Platform - Docker Setup

## Quick Start

```bash
# 1. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Start all services
docker-compose up -d

# 3. Run migrations
docker-compose exec backend python manage.py migrate

# 4. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 5. Enable pgvector extension
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 6. Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
```

## Services

- **db**: PostgreSQL 15 with pgvector extension (port 5432)
- **redis**: Redis 7 for Celery (port 6379)
- **backend**: Django API server (port 8000)
- **celery**: Celery worker for async tasks
- **frontend**: React + Vite dev server with hot-reload (port 3000)

## Development Commands

### Backend
```bash
# Run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create app
docker-compose exec backend python manage.py startapp app_name

# Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend pytest

# Generate requirements.txt
docker-compose exec backend uv pip freeze > requirements.txt
```

### Frontend
```bash
# Install new package
docker-compose exec frontend npm install package-name

# Run linter
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build
```

### Database
```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d car_rental

# Backup database
docker-compose exec db pg_dump -U postgres car_rental > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres car_rental < backup.sql
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery
```

## Troubleshooting

### pgvector extension not found
```bash
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Port already in use
```bash
# Check what's using the port
lsof -i :8000  # or :3000, :5432
# Kill the process or change port in docker-compose.yml
```

### Frontend not hot-reloading
Make sure `node_modules` is in `.dockerignore` and volume is mounted correctly.

### Permission issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Production Build

For production, create a separate `docker-compose.prod.yml` with:
- Multi-stage builds
- Gunicorn for Django
- Nginx for static files
- No hot-reload for frontend
