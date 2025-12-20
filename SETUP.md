# Egypt Car Rental Platform - Project Setup

## Prerequisites

- Docker & Docker Compose installed
- (Optional) uv for local Python development

## Initial Setup

### 1. Clone & Navigate
```bash
cd /mnt/data/iti/mimi
```

### 2. Environment Configuration
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# Frontend  
cp frontend/.env.example frontend/.env
# Edit frontend/.env and add Firebase config
```

### 3. Start Services
```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Database Setup
```bash
# Enable pgvector extension
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | Django REST API |
| Frontend | http://localhost:3000 | React + Vite |
| Admin Panel | http://localhost:8000/admin | Django Admin |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache & Celery |

## Docker Services

### 1. **db** (PostgreSQL + pgvector)
- Image: `ankane/pgvector:latest`
- Port: 5432
- Database: `car_rental`
- User/Pass: `postgres/postgres`

### 2. **redis**
- Image: `redis:7-alpine`
- Port: 6379

### 3. **backend** (Django)
- Build: `./backend/Dockerfile`
- Port: 8000
- Hot-reload: ✅ (volume mounted)
- Package manager: **uv** (10-100x faster than pip)

### 4. **celery** (Async Tasks)
- Runs AI embeddings, email sending, etc.
- Same image as backend

### 5. **frontend** (React + Vite)
- Build: `./frontend/Dockerfile.dev`
- Port: 3000
- Hot-reload: ✅ (volume mounted + HMR)

## Development Workflow

### Backend Changes
- Code changes auto-reload (Django runserver)
- Add new package:
  ```bash
  docker-compose exec backend uv pip install package-name
  docker-compose exec backend uv pip freeze > requirements.txt
  ```

### Frontend Changes
- Vite HMR updates instantly
- Add new package:
  ```bash
  docker-compose exec frontend npm install package-name
  ```

### Database Migrations
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### pgvector extension error
```bash
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Port already in use
Check what's using the port and kill it:
```bash
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
```

Or change ports in `docker-compose.yml`

### Permission denied
```bash
sudo chown -R $USER:$USER .
```

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View resource usage
docker stats
```
