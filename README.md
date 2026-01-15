# Mimi - Egypt Car Rental Marketplace

A modern two-sided marketplace platform connecting car owners with renters in Egypt. Built with Django REST Framework and React, featuring AI-powered search, real-time chat, identity verification, and subscription-based monetization.


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
- **Phone Verification** - Twilio SMS OTP
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
- **SMS:** Twilio
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

## Documentation

- [`SETUP.md`](SETUP.md) - Detailed setup instructions
- [`README_DOCKER.md`](README_DOCKER.md) - Docker commands reference
- [`implementation_plan.md`](implementation_plan.md) - Technical architecture
