# JIRA Tasks - Detailed Breakdown (Days 1-10)

## DAY 1: Foundation

### JIRA-001: Complete Project Initialization (Full-Stack)
**Assignee:** DEV-5 (Lead) + DEV-3 (Frontend) | **Story Points:** 8
**Description:** Complete end-to-end project setup including Docker infrastructure, Django backend initialization, React frontend with Vite, environment configuration, and version control.
**Acceptance Criteria:**

**Infrastructure (Docker):**
- `docker-compose.yml` created with 4 services: Django, PostgreSQL+pgvector, Redis, React (Vite)
- `docker-compose up` starts all services
- PostgreSQL accessible on port 5432 with pgvector extension installed
- Redis accessible on port 6379
- Frontend (Vite dev server) accessible on port 3000 with hot-reload enabled
- Frontend source mounted as volume (`./frontend:/app`) for instant updates
- All containers communicate via Docker network

**Environment & Configuration:**
- `.env.example` created with: DATABASE_URL, REDIS_URL, SECRET_KEY, OPENAI_API_KEY, SMS_API_KEY, SENDGRID_API_KEY
- `.gitignore` configured for Python/Django + Node.js

**Backend (Django):**
- Django project initialized: `django-admin startproject config .`
- `manage.py` executable
- `settings.py` configured for Docker (database, allowed_hosts, static/media)
- **Python dependencies installed using `uv`:**
  - Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - Install packages: `uv pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary pgvector Pillow celery redis openai firebase-admin requests sendgrid python-decouple django-cors-headers Faker pytest pytest-django factory-boy django-extensions ipython django-ratelimit cryptography`
  - Generate requirements.txt: `uv pip freeze > requirements.txt`

**Frontend (React):**
- React app initialized: `npm create vite@latest frontend -- --template react`
- Vite dev server runs on port 3000
- Tailwind CSS installed and configured
- `tailwind.config.js` with custom color palette
- Base styles imported in main CSS

**Version Control:**
- GitHub repository created
- Branch protection enabled on `main`
- `dev` branch created

---

### JIRA-002: Create All Database Models
**Assignee:** DEV-1 (Lead) + DEV-2 + DEV-4 | **Story Points:** 13
**Description:** Create complete Django database schema with all core models, relationships, and migrations. This includes User, Subscription, Listing, ListingImage, RentalRequest, Notification, PhoneVerification, Review, and Availability models.

**Acceptance Criteria:**

**User Management (DEV-1):**
- `User` model extending AbstractUser with fields:
  - phone_number, is_verified_identity, national_id_hash, waseet_score
  - commercial_register (FileField), role, current_subscription (FK), is_deleted
- `Subscription` model with: name, price, max_listings, features (JSON)
- Management command to seed subscription tiers (Free, Premium, Agency Silver, Agency Gold)
- FREE tier: max_listings=1, price=0

**Listing Management (DEV-2):**
- `Listing` model with 15 core fields:
  - owner (FK), title, brand, model, year, transmission, fuel_type
  - seats, doors, color, category, mileage_range, is_insured
  - daily_price, governorate, city, status, embedding (vector using pgvector)
- `ListingImage` model: listing (FK), image (ImageField), image_type (6 choices), order
- Images stored in `media/listings/`
- `RentalRequest` model: renter (FK), listing (FK), start_date, end_date, total_price, status
- Status choices: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
- `Review` model: transaction (FK to RentalRequest), rating (1-5), comment
- `Availability` model: listing (FK), date_start, date_end, is_available

**Notifications (DEV-4):**
- `Notification` model: user (FK), type, title, message, is_read, created_at
- `PhoneVerification` model: user (FK), otp_code (6 digits), expires_at, is_verified

**General:**
- All models registered in Django Admin
- Migrations generated and applied
- Database schema verified in PostgreSQL

---

### JIRA-003: Create Reusable Components
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Create Button, Input, Card components.
**Acceptance Criteria:**
- Components in src/components/ui/
- Variants supported (primary, secondary)
- Storybook optional

---

### JIRA-004: Setup SendGrid
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** Configure SendGrid SMTP in Django settings.
**Acceptance Criteria:**
- EMAIL_BACKEND configured
- Test email sends successfully

---

## DAY 2: Auth & User Management

### JIRA-101: Setup DRF + JWT
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Install djangorestframework and djangorestframework-simplejwt. Configure settings.
**Acceptance Criteria:**
- DRF installed and configured
- SimpleJWT configured
- Token endpoint accessible

---

### JIRA-102: Registration Endpoint
**Acceptance Criteria:**
- Creates user with hashed password
- Returns 201 on success
- Validates email uniqueness

---

### JIRA-102: Login Endpoint
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Implement POST /auth/token/ using SimpleJWT.
**Acceptance Criteria:**
- Returns access + refresh tokens
- Validates credentials

---

### JIRA-103: Password Reset Flow
**Assignee:** DEV-1 | **Story Points:** 5
**Description:** Implement password reset: POST /auth/password-reset/, POST /auth/password-reset-confirm/.
**Acceptance Criteria:**
- Sends email with reset token
- Token expires in 1 hour

---

### JIRA-104: Auth Unit Tests
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Write tests for registration, login, password reset.
**Acceptance Criteria:**
- >80% coverage
- Tests pass

---

### JIRA-105: Phone OTP Endpoints
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** POST /auth/verify-phone/ (sends OTP), POST /auth/confirm-otp/ (validates).
**Acceptance Criteria:**
- OTP expires in 10 minutes
- Max 3 retry attempts

---

### JIRA-106: SMS.to Integration
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Integrate SMS.to API with dev mode fallback (fixed OTP: 123456).
**Acceptance Criteria:**
- Sends SMS in production
- Dev mode uses fixed code

---

### JIRA-107: Veriff Session Endpoint
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** POST /auth/veriff/create-session/ creates Veriff session.
**Acceptance Criteria:**
- Returns session_url
- Stores session_id

---

### JIRA-108: Sign Up Page
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Build registration form with email, password, phone fields.
**Acceptance Criteria:**
- Form validation
- Calls /auth/register/

---

### JIRA-109: Login Page
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Build login form.
**Acceptance Criteria:**
- Stores JWT in localStorage
- Redirects after login

---

### JIRA-110: OTP Verification Modal
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Modal for 6-digit OTP input.
**Acceptance Criteria:**
- Auto-submits on 6 digits
- Resend OTP button

---

### JIRA-111: JWT Interceptor
**Assignee:** DEV-3 | **Story Points:** 2
**Description:** Setup axios interceptor to attach JWT to requests.
**Acceptance Criteria:**
- Token refresh on 401

---

### JIRA-112: Setup Celery
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Configure Celery with Redis broker.
**Acceptance Criteria:**
- Celery worker runs
- Test task executes

---

### JIRA-113: Waseet Score Task
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Create Celery task to calculate Waseet Score: (Rating×40) + (Response×30) + (Completion×30).
**Acceptance Criteria:**
- Task callable
- Updates user.waseet_score

---

### JIRA-114: Setup Ngrok
**Assignee:** DEV-5 | **Story Points:** 1
**Description:** Setup Ngrok for webhook testing.
**Acceptance Criteria:**
- Public URL accessible

---

### JIRA-115: E2E Registration Test
**Assignee:** DEV-5 | **Story Points:** 3
**Description:** Selenium/Playwright test for full registration flow.
**Acceptance Criteria:**
- Tests sign up + OTP + login

---

## DAY 3: Listings & Trial Logic

### JIRA-201: Listing CRUD Endpoints
**Assignee:** DEV-2 | **Story Points:** 5
**Description:** Implement GET/POST/PUT/DELETE /listings/.
**Acceptance Criteria:**
- Supports filtering by status
- Owner can only edit own listings

---

### JIRA-202: Trial Logic
**Assignee:** DEV-2 | **Story Points:** 5
**Description:** Implement can_create_listing() method with trial checks.
**Acceptance Criteria:**
- Blocks if subscription.max_listings exceeded
- Allows 1 free listing on trial

---

### JIRA-203: Soft-Delete Abuse Check
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Check national_id_hash across all users (including soft-deleted).
**Acceptance Criteria:**
- Blocks duplicate trials

---

### JIRA-204: Local Media Storage
**Assignee:** DEV-2 | **Story Points:** 2
**Description:** Configure MEDIA_ROOT and MEDIA_URL.
**Acceptance Criteria:**
- Images accessible at /media/

---

### JIRA-205: Veriff Webhook Listener
**Assignee:** DEV-1 | **Story Points:** 5
**Description:** POST /webhooks/veriff/ handles verification callbacks.
**Acceptance Criteria:**
- Parses verification_code
- Sets is_verified_identity=True

---

### JIRA-206: Parse Veriff Callback
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Extract national_id from Veriff payload.
**Acceptance Criteria:**
- Hashes and stores national_id

---

### JIRA-207: Manual ID Upload Endpoint
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** POST /auth/upload-id/ for fallback.
**Acceptance Criteria:**
- Accepts ID + License images
- Sets status to PENDING_REVIEW

---

### JIRA-208: Create Listing Form
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Multi-step form with 15 fields.
**Acceptance Criteria:**
- Validation on each step
- Calls POST /listings/

---

### JIRA-209: Image Upload Component
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Drag-and-drop component for 4 images.
**Acceptance Criteria:**
- Preview thumbnails
- Max 5MB per image

---

### JIRA-210: Listings Grid
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Card layout for listing results.
**Acceptance Criteria:**
- Shows image, price, location
- Click navigates to detail

---

### JIRA-211: Veriff JS SDK Integration
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Integrate Veriff SDK on frontend.
**Acceptance Criteria:**
- Opens Veriff modal
- Redirects after completion

---

### JIRA-212: Verification Flow UI
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Guide user through Veriff or manual upload.
**Acceptance Criteria:**
- Shows verification status

---

### JIRA-213: Upgrade Subscription Mock Page
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** Page showing subscription tiers with mock "Upgrade" button.
**Acceptance Criteria:**
- Button sets tier in DB (no payment)

---

### JIRA-214: Seed Script
**Assignee:** DEV-5 | **Story Points:** 5
**Description:** Django management command to create 50 listings + 20 users.
**Acceptance Criteria:**
- Realistic data (using Faker)
- Embeddings pre-generated

---

### JIRA-215: Test Listing Creation
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Manual test: create listing with/without trial.
**Acceptance Criteria:**
- Trial logic works
- Error messages clear

---

## DAY 4: AI Search & Discovery

### JIRA-301: OpenAI Integration
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Setup OpenAI client with text-embedding-3-small model.
**Acceptance Criteria:**
- API key configured
- Test embedding generated

---

### JIRA-302: Embedding Generation Signal
**Assignee:** DEV-2 | **Story Points:** 5
**Description:** post_save signal on Listing to generate embeddings.
**Acceptance Criteria:**
- Async Celery task
- Updates embedding field

---

### JIRA-303: Vector Search Endpoint
**Assignee:** DEV-2 | **Story Points:** 5
**Description:** POST /listings/ai-search/ with natural language query.
**Acceptance Criteria:**
- Uses pgvector cosine similarity
- Returns top 20 results

---

### JIRA-304: Standard Filter Endpoint
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** GET /listings/search/ with queryparams: governorate, price_max, transmission.
**Acceptance Criteria:**
- Combines filters with AND


### JIRA-306: Review Submission Endpoint
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** POST /reviews/ creates review.
**Acceptance Criteria:**
- Validates transaction exists
- Triggers Waseet Score recalc

---

### JIRA-307: Waseet Score Trigger
**Assignee:** DEV-1 | **Story Points:** 2
**Description:** Update score calculation to run on review creation.
**Acceptance Criteria:**
- Score updates immediately

---

### JIRA-308: Search Bar with AI Toggle
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Search input with "AI Search" toggle.
**Acceptance Criteria:**
- Calls /ai-search/ if toggled
- Otherwise /search/

---

### JIRA-309: Filter Sidebar
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Sidebar with governorate dropdown, price slider, transmission checkboxes.
**Acceptance Criteria:**
- Filters update URL params

---

### JIRA-310: Listing Detail Page
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Page showing all listing details + image carousel.
**Acceptance Criteria:**
- Shows "Request Rental" button
- Displays owner Waseet Score

---

### JIRA-311: Setup Firebase Project
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** Create Firebase project, enable Firestore + FCM.
**Acceptance Criteria:**
- Firebase config downloaded

---

### JIRA-312: Firebase Custom Token Endpoint
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** POST /chat/token/ returns Firebase custom token.
**Acceptance Criteria:**
- Only for accepted requests

---

### JIRA-313: Pre-generate Embeddings
**Assignee:** DEV-5 | **Story Points:** 3
**Description:** Run embedding generation on seed data.
**Acceptance Criteria:**
- All 50 listings have embeddings

---

### JIRA-314: Test Search Performance
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Benchmark vector search with 50+ listings.
**Acceptance Criteria:**
- <500ms response time

---

## DAY 5: Booking Flow

### JIRA-401: Rental Request Endpoint
**Assignee:** DEV-1 | **Story Points:** 5
**Description:** POST /rentals/request/ creates rental request.
**Acceptance Criteria:**
- Blocks if user not verified
- Notifies owner

---

### JIRA-402: Accept/Reject Endpoints
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** POST /rentals/{id}/accept/, /rentals/{id}/reject/.
**Acceptance Criteria:**
- Updates status
- Notifies renter

---

### JIRA-403: Verification Gate
**Assignee:** DEV-1 | **Story Points:** 2
**Description:** Middleware to block requests if is_verified_identity=False.
**Acceptance Criteria:**
- Returns 403 with message

---

### JIRA-404: Mutual Confirmation Logic
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** POST /rentals/{id}/confirm/ (called by both).
**Acceptance Criteria:**
- Reveals phone numbers when both confirm

---

### JIRA-405: Owner Dashboard Endpoint
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** GET /rentals/incoming/ returns requests for owner.
**Acceptance Criteria:**
- Filtered by listing owner

---

### JIRA-406: Renter Dashboard Endpoint
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** GET /rentals/my-requests/ for renter.
**Acceptance Criteria:**
- Shows all user's requests

---

### JIRA-407: Phone Number Reveal Logic
**Assignee:** DEV-2 | **Story Points:** 2
**Description:** Include phone_number in response only if both confirmed.
**Acceptance Criteria:**
- Secured by confirmation check

---

### JIRA-408: Request Rental Button
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Button on listing detail + modal for dates.
**Acceptance Criteria:**
- Shows verification prompt if unverified

---

### JIRA-409: Owner Dashboard UI
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Table of incoming requests with Accept/Reject actions.
**Acceptance Criteria:**
- Real-time updates

---

### JIRA-410: Renter Dashboard UI
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** List of sent requests with status.
**Acceptance Criteria:**
- Shows chat link if accepted

---

### JIRA-411: Firestore Chat Structure
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Design Firestore schema: chats/{rental_id}/messages.
**Acceptance Criteria:**
- Messages have sender, text, timestamp

---

### JIRA-412: Chat UI Component
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** Real-time chat component with Firestore.
**Acceptance Criteria:**
- Auto-scrolls
- Shows sender avatars

---

### JIRA-413: Confirm Rental Button
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** Button in chat to confirm rental.
**Acceptance Criteria:**
- Disabled if already confirmed

---

### JIRA-414: E2E Booking Test
**Assignee:** DEV-5 | **Story Points:** 3
**Description:** Test full flow: Request → Accept → Chat → Confirm.
**Acceptance Criteria:**
- Phone numbers revealed

---

## DAY 6: Chat & Notifications

### JIRA-501: Firebase Admin SDK
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Install firebase-admin, initialize with service account.
**Acceptance Criteria:**
- Can create custom tokens

---

### JIRA-502: Chat Message Persistence
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** Save messages to Firestore via backend endpoint.
**Acceptance Criteria:**
- POST /chat/{rental_id}/messages/

---

### JIRA-503: Test Real-Time Message Sync
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** Verify messages appear in real-time.
**Acceptance Criteria:**
- <1s latency

---

### JIRA-504: FCM Device Token Registration
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** POST /notifications/register-device/ stores FCM token.
**Acceptance Criteria:**
- Token stored on User model

---

### JIRA-505: Notification Trigger Signals
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Django signals on RentalRequest create/accept.
**Acceptance Criteria:**
- Triggers FCM push

---

### JIRA-506: FCM Push Sender
**Assignee:** DEV-1 | **Story Points:** 5
**Description:** Celery task to send FCM push via Firebase Admin.
**Acceptance Criteria:**
- Sends to device token

---

### JIRA-507: In-App Notification Endpoints
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** GET /notifications/, POST /notifications/{id}/mark-read/.
**Acceptance Criteria:**
- Returns unread count

---

### JIRA-508: Polish Chat UI
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Style message bubbles, timestamps.
**Acceptance Criteria:**
- Different colors for sender/receiver

---

### JIRA-509: Notification Bell Icon
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Header icon with dropdown of recent notifications.
**Acceptance Criteria:**
- Shows unread badge

---

### JIRA-510: FCM JS SDK Integration
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Request permission, send token to backend.
**Acceptance Criteria:**
- Listens for foreground messages

---

### JIRA-511: Optimize Listing Queries
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Add select_related, prefetch_related.
**Acceptance Criteria:**
- N+1 queries eliminated

---

### JIRA-512: Add Pagination
**Assignee:** DEV-2 | **Story Points:** 2
**Description:** Use DRF PageNumberPagination for /listings/.
**Acceptance Criteria:**
- Page size = 20

---

### JIRA-513: Test Chat Delivery
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Send messages from multiple devices.
**Acceptance Criteria:**
- All devices receive

---

### JIRA-514: Test FCM Push
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Trigger rental request, verify push received.
**Acceptance Criteria:**
- Push appears in notification tray

---

## DAY 7: Payments & Subscriptions

### JIRA-601: Paymob Integration
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** Integrate Paymob API in test mode.
**Acceptance Criteria:**
- Creates payment link

---

### JIRA-602: Payment Initiation Endpoint
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** POST /payments/initiate/ creates Paymob order.
**Acceptance Criteria:**
- Returns payment_url

---

### JIRA-603: Paymob Webhook Listener
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** POST /webhooks/paymob/ handles payment callbacks.
**Acceptance Criteria:**
- Verifies HMAC signature

---

### JIRA-604: Update Subscription Tier
**Assignee:** DEV-4 | **Story Points:** 2
**Description:** On payment success, update user.current_subscription.
**Acceptance Criteria:**
- Sets to paid tier

---

### JIRA-605: Subscription Enforcement Middleware
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Middleware to check listing count vs max_listings.
**Acceptance Criteria:**
- Blocks creation if exceeded

---

### JIRA-606: Agency Approval Admin Action
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Django Admin action: approve_agency / reject_agency.
**Acceptance Criteria:**
- Sends email notification

---

### JIRA-607: User Moderation Admin Actions
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Admin actions: ban_user, reset_waseet_score.
**Acceptance Criteria:**
- Sets is_deleted=True on ban

---

### JIRA-608: Subscription Plans Page
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Page showing tier comparison table.
**Acceptance Criteria:**
- "Upgrade" button per tier

---

### JIRA-609: Payment Flow UI
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Embed Paymob iframe for payment.
**Acceptance Criteria:**
- Redirects after success

---

### JIRA-610: Subscription Status Indicator
**Assignee:** DEV-3 | **Story Points:** 2
**Description:** Badge showing current tier in header.
**Acceptance Criteria:**
- Updates after payment

---

### JIRA-611: Availability Endpoints
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** GET/POST /listings/{id}/availability/.
**Acceptance Criteria:**
- CRUD for availability records

---

### JIRA-612: Basic Availability Calendar
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Logic for all days / weekdays / weekends.
**Acceptance Criteria:**
- Returns available dates

---

### JIRA-613: Test Payment Flow
**Assignee:** DEV-5 | **Story Points:** 3
**Description:** Complete payment in Paymob test mode.
**Acceptance Criteria:**
- Subscription updates

---

### JIRA-614: Test Subscription Restrictions
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Try creating 2nd listing on Free tier.
**Acceptance Criteria:**
- Returns 403

---

## DAY 8: Reviews & Admin Panel

### JIRA-701: Restrict Review Submission
**Assignee:** DEV-1 | **Story Points:** 2
**Description:** Only allow review if rental.status == COMPLETED.
**Acceptance Criteria:**
- Returns 403 otherwise

---

### JIRA-702: Listing Moderation Actions
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Admin action: force_deactivate_listing.
**Acceptance Criteria:**
- Sets status=BANNED

---

### JIRA-703: Admin Stats Endpoints
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** GET /admin/stats/ returns user count, listing count, etc.
**Acceptance Criteria:**
- JSON response

---

### JIRA-704: Review Submission Form
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Modal with star rating + textarea.
**Acceptance Criteria:**
- Calls POST /reviews/

---

### JIRA-705: Display Reviews on Detail Page
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** List reviews below listing details.
**Acceptance Criteria:**
- Shows rating + comment

---

### JIRA-706: User Profile Page
**Assignee:** DEV-3 | **Story Points:** 3
**Description:** Page showing user's Waseet Score, listings, reviews.
**Acceptance Criteria:**
- Shows score badge

---

### JIRA-707: Response Rate Tracking
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Track % of requests responded to within 24h.
**Acceptance Criteria:**
- Updates on accept/reject

---

### JIRA-708: Completion Rate Tracking
**Assignee:** DEV-2 | **Story Points:** 3
**Description:** Track % of accepted requests that reach COMPLETED.
**Acceptance Criteria:**
- Updates on confirmation

---

### JIRA-709: Recalculate Waseet Scores
**Assignee:** DEV-2 | **Story Points:** 2
**Description:** Management command to recalc scores for all users.
**Acceptance Criteria:**
- python manage.py recalc_scores

---

### JIRA-710: Admin Panel Custom Views
**Assignee:** DEV-4 | **Story Points:** 5
**Description:** Custom admin views for agency approval queue.
**Acceptance Criteria:**
- Shows pending agencies

---

### JIRA-711: Email Notifications for Admin Actions
**Assignee:** DEV-4 | **Story Points:** 3
**Description:** Send email on agency approve/reject.
**Acceptance Criteria:**
- Uses SendGrid

---

### JIRA-712: Admin Seed Data
**Assignee:** DEV-5 | **Story Points:** 1
**Description:** Create superuser via management command.
**Acceptance Criteria:**
- Username: admin, password: admin123

---

### JIRA-713: Test Admin Workflows
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Manual test: approve agency, ban user.
**Acceptance Criteria:**
- Email sent

---

## DAY 9: Integration & Bug Fixes

### JIRA-801: Fix Critical Bugs
**Assignee:** ALL | **Story Points:** 8
**Description:** Triage and fix P0/P1 bugs from testing.
**Acceptance Criteria:**
- Zero showstoppers

---

### JIRA-802: Polish UI/UX
**Assignee:** ALL | **Story Points:** 5
**Description:** Fix spacing, colors, responsiveness issues.
**Acceptance Criteria:**
- Design QA passed

---

### JIRA-803: Add Loading States
**Assignee:** ALL | **Story Points:** 3
**Description:** Spinners for async operations.
**Acceptance Criteria:**
- All buttons show loading

---

### JIRA-804: Optimize Slow Queries
**Assignee:** ALL | **Story Points:** 3
**Description:** Add database indexes.
**Acceptance Criteria:**
- Query times <200ms

---

### JIRA-805: Run E2E Test Suite
**Assignee:** DEV-5 | **Story Points:** 5
**Description:** Execute all E2E tests.
**Acceptance Criteria:**
- 100% pass rate

---

### JIRA-806: Document Known Issues
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Create known_issues.md.
**Acceptance Criteria:**
- Backlog prioritized

---

### JIRA-807: Prepare Staging
**Assignee:** DEV-5 | **Story Points:** 3
**Description:** Deploy to staging server.
**Acceptance Criteria:**
- Accessible via URL

---

### JIRA-808: Build Landing Page
**Assignee:** DEV-3 | **Story Points:** 5
**Description:** Hero section + car categories grid.
**Acceptance Criteria:**
- CTA to search

---

### JIRA-809: Add Footer
**Assignee:** DEV-3 | **Story Points:** 2
**Description:** Footer with links (About, Contact, Terms).
**Acceptance Criteria:**
- Responsive

---

### JIRA-810: Add Rate Limiting
**Assignee:** DEV-2 | **Story Points:** 2
**Description:** Use django-ratelimit on API endpoints.
**Acceptance Criteria:**
- 100 req/min per IP

---

### JIRA-811: CORS Configuration
**Assignee:** DEV-2 | **Story Points:** 1
**Description:** Configure django-cors-headers.
**Acceptance Criteria:**
- Frontend domain allowed

---

## DAY 10: Polish & Seeding

### JIRA-901: Finalize Seed Script
**Assignee:** DEV-5 | **Story Points:** 5
**Description:** 50+ listings, 20+ users with realistic Egyptian data.
**Acceptance Criteria:**
- Cairo, Alexandria, Giza governorates
- Brands: Toyota, Hyundai, Nissan

---

### JIRA-902: Run Seed Script
**Assignee:** DEV-5 | **Story Points:** 1
**Description:** Execute: python manage.py seed_data.
**Acceptance Criteria:**
- No errors

---

### JIRA-903: Verify Seed Data
**Assignee:** DEV-5 | **Story Points:** 2
**Description:** Browse all seeded listings.
**Acceptance Criteria:**
- Images load
- Search works

---

### JIRA-904: Create Demo Accounts
**Assignee:** DEV-5 | **Story Points:** 1
**Description:** Create demo_owner@test.com, demo_renter@test.com.
**Acceptance Criteria:**
- Verified accounts

---

### JIRA-905: UI Polish
**Assignee:** ALL | **Story Points:** 5
**Description:** Animations, hover states, transitions.
**Acceptance Criteria:**
- Smooth interactions

---

### JIRA-906: SEO Meta Tags
**Assignee:** ALL | **Story Points:** 2
**Description:** Add title, description, OG tags.
**Acceptance Criteria:**
- All pages tagged

---

### JIRA-907: Cross-Browser Testing
**Assignee:** ALL | **Story Points:** 3
**Description:** Test on Chrome, Safari, Firefox.
**Acceptance Criteria:**
- No layout breaks

---

### JIRA-908: Mobile Responsiveness
**Assignee:** ALL | **Story Points:** 3
**Description:** Fix mobile issues.
**Acceptance Criteria:**
- Works on iPhone, Android

---

### JIRA-909: API Documentation
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Setup drf-spectacular for OpenAPI docs.
**Acceptance Criteria:**
- Accessible at /api/docs/

---

### JIRA-910: Security Audit
**Assignee:** DEV-1 | **Story Points:** 3
**Description:** Check for SQL injection, XSS, CSRF.
**Acceptance Criteria:**
- No vulnerabilities

---

### JIRA-911: Demo Walkthrough Guide
**Assignee:** DEV-3 | **Story Points:** 2
**Description:** Write demo_script.md with step-by-step flow.
**Acceptance Criteria:**
- 30-min script

---

### JIRA-912: Screen Captures
**Assignee:** DEV-3 | **Story Points:** 2
**Description:** Record demo video.
**Acceptance Criteria:**
- MP4 file

---

**Total Tasks (Days 1-10): 93 tasks**
