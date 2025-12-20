# Functional Requirements Specification

**Project:** Egypt Car Rental Classifieds Platform
**Tech Stack:** Django DRF, Postgres, React.js, Tailwind CSS, Veriff (ID Verification), SMS.to (Phone Verification), Paymob or Stripe (Payments/Subscriptions)

## 1. Authentication & Onboarding Module

**Goal:** specific secure access and verify contact channels.

* **FR-01 (Sign Up):** The system shall allow users to create an account using an email address and a password.
* **FR-02 (Email Verification):** Upon registration, the system shall send a verification link to the user's email. The account must remain in a `UNVERIFIED_EMAIL` state until the link is clicked.
* **FR-03 (Phone Verification - SMS.to):** During the sign-up process, the system shall prompt the user for a mobile number.
* The system shall generate a 6-digit OTP.
* The system shall send the OTP via **SMS.to API**.
* The system shall verify the entered OTP and mark the phone number as `VERIFIED`.


* **FR-04 (Login/Logout):** The system shall support secure login via email/password and allow users to log out.
* **FR-05 (Password Reset):** The system shall provide a "Forgot Password" flow via verified email.

## 2. Identity Verification Module

**Goal:** Establish trust using **Veriff** for individuals and **Manual Review** for businesses.

* **FR-06 (Renter Verification Gate):** The system shall restrict unverified users from clicking "Contact Host" on any listing.
* **FR-07 (Veriff Integration - Individual):** When a user (Renter or Individual Host) initiates verification:
* The system shall generate a **Veriff session**.
* The system shall redirect the user to the Veriff web interface to capture their **National ID** or **Driver's License** and a selfie.
* The system shall listen for the Veriff webhook callback.
* **If Approved:** System sets `identity_status = VERIFIED` and awards the 'Verified User' badge.
* **If Declined:** System notifies the user with the rejection reason provided by Veriff.


* **FR-08 (Agency Verification - Manual):** If a user subscribes to an **Agency Tier**:
* The system shall require the upload of a **Commercial Registration (Sijil Tijari)** document (PDF/Image).
* The system shall set the Agency status to `PENDING_REVIEW`.
* The system shall allow Admins to view the document in the **Admin Panel** and Approve or Reject the Agency status.


* **FR-09 (Re-Verification):** The system shall flag users for re-verification if their document expires (tracked via Veriff data).

## 3. Listing & Inventory Module

**Goal:** Manage car availability and enforce the "Freemium/Subscription" logic.

* **FR-10 (Listing Creation):** The system shall allow Hosts to input car details: Make, Model, Year, Transmission, Fuel Type, Location (City/District), Price (EGP/Day), and upload 3-10 photos.
* **FR-11 (Individual Trial Logic):**
* If the Host is `INDIVIDUAL` and `listing_count == 0`, the system shall allow creation and set a `trial_expiry_date` (Current Date + 60 Days).
* If `trial_expiry_date` is passed, the system shall automatically **Deactivate** the listing and prompt for subscription.


* **FR-12 (Agency Limit Logic):**
* The system shall check the Agency's active Stripe Subscription tier before allowing a new listing.
* If `current_listings >= subscription_limit`, the system shall block creation and redirect to the Upgrade page.


* **FR-13 (Listing Management):** Hosts shall be able to Edit, Deactivate (Hide), or Delete their listings.

## 4. Search & Discovery Module

**Goal:** Enable Renters to find cars efficiently.

* **FR-14 (Search Filters):** The system shall allow users to filter listings by: City, Price Range (Min/Max), Car Type, Transmission, and **Host Trust Level** (e.g., "Show only Verified Hosts").
* **FR-15 (Sorting):** Users shall be able to sort results by: Price (Low-High), Newest, and **Waseet Score (High-Low)**.
* **FR-16 (Listing View):** The listing detail page shall display the car info, Host's First Name, Host's Waseet Score, Verified Badges, and the obscured "Contact Host" button.

## 5. Communication & Offline Transaction Module

**Goal:** Connect users securely and track the offline "deal."

* **FR-17 (Chat Initiation):** The system shall only allow a chat session to start if the Renter's `identity_status == VERIFIED`.
* **FR-18 (Secure Messaging):** The system shall facilitate text-based chat between Renter and Host.
* **FR-19 (Rental Confirmation Trigger):** The chat interface shall contain a **"Confirm Rental"** button.
* If clicked by User A, User B receives a prompt to "Confirm".
* Upon mutual confirmation, the system records a `rental_transaction_id` (internal only, no payment processed).


* **FR-20 (Phone Number Reveal):** Upon mutual confirmation, the system shall display the verified phone numbers of both parties in the chat window.

## 6. Payments & Subscription Module

**Goal:** Monetize via **Stripe** for subscriptions and one-off fees.

* **FR-21 (Stripe Customer Creation):** When a user initiates a payment, the system shall create a corresponding Customer object in Stripe.
* **FR-22 (Subscription Handling):**
* The system shall display available tiers (e.g., Individual Pro, Agency Silver, Agency Gold).
* The system shall use **Stripe Checkout** or **Stripe Elements** to process the recurring credit card payment.
* The system shall handle Stripe webhooks (`invoice.payment_succeeded`, `customer.subscription.deleted`) to update the user's `subscription_status` and `listing_limit` in the local database.


* **FR-23 (Failed Payments):** If a Stripe renewal fails, the system shall automatically **Deactivate** the user's listings exceeding the free limit and notify the user via email.
* **FR-24 (One-Time Promotion Payments):** The system shall allow users to pay a one-time fee via Stripe to set a listing's `is_featured` flag to `TRUE` for a specific duration (e.g., 7 days).

## 7. Reputation & Rewards (Gamification)

**Goal:** Calculate Waseet Score and manage Tiers.

* **FR-25 (Review Submission):** The system shall allow users to leave a star rating (1-5) and text review *only* after a `rental_transaction_id` is generated (Mutual Confirmation).
* **FR-26 (Score Calculation):** The system shall recalculate the **Waseet Score** (0-100 scale) daily based on: Average Rating, Response Rate, and Completion Rate.
* **FR-27 (Tier Assignment):** The system shall automatically assign "El-Basha" status if `Waseet Score > 90` and `rentals_count > 15`.

## 8. Admin & Operations Panel

**Goal:** Manual oversight for high-risk items.

* **FR-28 (Agency Document Review):** Admins shall have a queue to view "Pending" Commercial Registry documents and click "Approve" or "Reject" (triggering an email notification).
* **FR-29 (User Moderation):** Admins shall be able to Search Users, View Veriff Status, Ban Users, and Reset Waseet Scores.
* **FR-30 (Listing Moderation):** Admins shall be able to "Force Deactivate" any listing flagged as fraudulent.