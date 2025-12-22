# Mimi - Egypt Car Rental Marketplace

A modern two-sided marketplace platform connecting car owners with renters in Egypt. Built with Django REST Framework and React, featuring AI-powered search, real-time chat, identity verification, and subscription-based monetization.

## Project Overview

**Timeline:** 11-day MVP Sprint  
**Team:** 5 Developers  
**Methodology:** Extreme Programming (XP)  
**Target Market:** Egyptian Drivers

## Core Features

### For Renters
- **AI-Powered Search** - Natural language queries using OpenAI embeddings
- **Identity Verification** - Veriff integration for ID & driver's license
- **Real-time Chat** - Firebase-powered messaging with rental confirmations
- **Reviews & Ratings** - Waseet Score reputation system
- **Push Notifications** - Firebase Cloud Messaging integration

### For Owners
- **Listing Management** - Comprehensive car details with image uploads
- **Owner Dashboard** - Manage requests, availability, and earnings
- **Free Trial** - 1 free listing for 2 months
- **Subscription Tiers** - Premium and Agency plans

### Platform Features
- **Secure Payments** - Paymob integration (test mode)
- **Email Notifications** - SendGrid SMTP
- **Phone Verification** - SMS.to OTP
- **Admin Panel** - Custom Django admin with moderation tools

## Tech Stack

### Backend
- **Framework:** Django 5.2 + Django REST Framework
- **Database:** PostgreSQL 15 + pgvector
- **Cache & Queue:** Redis + Celery
- **AI:** OpenAI (text-embedding-3-small)
- **Authentication:** JWT (SimpleJWT)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Routing:** React Router v7
- **Forms:** Formik + Yup
- **Notifications:** React Hot Toast

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Package Manager:** uv (Python), npm (Node.js)
- **Node Version:** 24 LTS

### Third-Party Services
- **Identity Verification:** Veriff API
- **SMS:** SMS.to
- **Email:** SendGrid
- **Payments:** Paymob (Test Mode)
- **Chat & Push:** Firebase (Firestore + FCM)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mimi

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files and add your API keys
# Required: DATABASE_URL, OPENAI_API_KEY, FIREBASE credentials

# Start all services
docker-compose up -d

# Enable pgvector extension
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:8000 | Django REST API |
| Admin Panel | http://localhost:8000/admin | Django admin |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache & Celery |

## Project Structure

```
mimi/
├── backend/                 # Django backend
│   ├── config/             # Django settings
│   ├── apps/               # Django apps (created on demand)
│   │   ├── users/         # User management
│   │   ├── listings/      # Car listings
│   │   ├── payments/      # Subscriptions
│   │   ├── chat/          # Firebase chat
│   │   └── notifications/ # FCM & Email
│   ├── media/             # Uploaded files
│   ├── Dockerfile         # Backend container
│   └── entrypoint.sh      # Auto-initialization script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   └── services/      # API clients
│   ├── Dockerfile.dev     # Frontend container
│   └── vite.config.js     # Vite configuration
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## Database Schema

### Core Models
- **User** - Custom user with verification status and Waseet Score
- **Subscription** - Tier management (Free, Premium, Agency)
- **Listing** - Car details with AI embeddings
- **ListingImage** - Multiple images per listing
- **RentalRequest** - Booking flow management
- **Review** - Ratings after rental completion
- **Notification** - In-app notification system
- **PhoneVerification** - OTP management

See [`jira_002_expanded.md`](jira_002_expanded.md) for detailed field specifications.

## Development

### Backend Development

```bash
# Run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create new Django app
docker-compose exec backend python manage.py startapp app_name

# Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend pytest

# Generate requirements.txt
docker-compose exec backend uv pip freeze > requirements.txt
```

### Frontend Development

```bash
# Install new package
docker-compose exec frontend npm install package-name

# Run linter
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery
```

## Testing

```bash
# Run backend tests
docker-compose exec backend pytest

# Run frontend tests (when implemented)
docker-compose exec frontend npm test

# E2E tests
docker-compose exec backend pytest tests/e2e/
```

## Documentation

- [`SETUP.md`](SETUP.md) - Detailed setup instructions
- [`README_DOCKER.md`](README_DOCKER.md) - Docker commands reference
- [`sprint_plan.md`](sprint_plan.md) - 11-day sprint breakdown
- [`jira_tasks_detailed.md`](jira_tasks_detailed.md) - All JIRA tasks with acceptance criteria
- [`implementation_plan.md`](implementation_plan.md) - Technical architecture

## Environment Variables

### Backend (.env)
```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/car_rental

# Redis
REDIS_URL=redis://redis:6379/0

# OpenAI
OPENAI_API_KEY=sk-...

# SMS.to
SMS_API_KEY=your-sms-api-key

# SendGrid
SENDGRID_API_KEY=SG...

# Veriff
VERIFF_API_KEY=your-veriff-key
VERIFF_API_SECRET=your-veriff-secret

# Paymob
PAYMOB_API_KEY=your-paymob-key

# Firebase
FIREBASE_CREDENTIALS_PATH=config/serviceAccountKey.json
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend won't start
```bash
# Check Node version (should be 24+)
docker-compose exec frontend node --version

# Reinstall dependencies
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
```

### Database issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
docker-compose exec db psql -U postgres -d car_rental -c "CREATE EXTENSION IF NOT EXISTS vector;"
docker-compose exec backend python manage.py migrate
```

## License

[Add your license here]

## Team

- **DEV-1:** Backend Lead (Auth, APIs)
- **DEV-2:** Backend (Listings, AI, Search)
- **DEV-3:** Frontend Lead (React UI)
- **DEV-4:** Full-Stack (Chat, Payments, FCM)
- **DEV-5:** DevOps/QA (Docker, Testing, Seeding)

## Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Write tests
4. Submit a pull request

## Roadmap

### Phase 2 (Week 12-13)
- Google Maps integration
- Advanced availability calendars
- Featured listings
- Mobile app (React Native)

### Phase 3 (Month 2)
- Live payments (Paymob/Stripe)
- Insurance tracking
- Seasonal pricing
- Analytics dashboard

---

**Built with care in Egypt**