Here is your **Detailed Product Requirement Document (PRD)** for:

# 🥗 AI Calories App

**Platform:** Mobile (iOS & Android)
**Tech Stack:** React Native (Expo) + Firebase

---

# 1. Executive Summary

AI Calories App is a mobile application that allows users to track daily calorie intake using AI-based food image recognition and manual entry. The app provides personalized calorie goals, real-time progress tracking, and nutrition insights to help users achieve fitness goals.

---

# 2. Problem Statement

Users struggle with:

* Manually calculating calories
* Tracking meals consistently
* Understanding portion sizes
* Staying motivated

There is a need for a simple, AI-powered mobile app that makes calorie tracking fast and intelligent.

---

# 3. Product Goals

### Primary Goals

* Enable food logging in under 10 seconds
* Provide accurate calorie estimation
* Improve user retention with progress tracking
* Create a habit-forming daily tracking experience

### Secondary Goals

* Provide personalized insights
* Build scalable architecture
* Prepare for premium monetization

---

# 4. Target Audience

* Fitness beginners
* Gym users
* Weight loss/gain users
* Students
* Working professionals
* Diet-conscious individuals

---

# 5. Success Metrics (KPIs)

| Metric               | Target                  |
| -------------------- | ----------------------- |
| Daily Active Users   | 30% of registered users |
| Meal logs per day    | Avg 3 per user          |
| 7-day retention      | 40%+                    |
| AI scan usage        | 60% of meals logged     |
| Goal completion rate | 25%+                    |

---

# 6. Product Scope

---

# 6.1 MVP Features

---

## 6.1.1 Authentication

### Description

User registration and secure login.

### Functional Requirements

* Email/password login
* Google Sign-In
* Password reset
* Persistent session

### Non-Functional

* Secure JWT handling via Firebase
* Session auto-refresh

---

## 6.1.2 Onboarding

### Functional Requirements

* Collect:

  * Name
  * Age
  * Gender
  * Height
  * Weight
  * Activity level
* Select goal:

  * Lose weight
  * Gain weight
  * Maintain weight
* Auto-calculate calorie target

### Calculation Logic

BMR (Mifflin-St Jeor Formula)
Multiply by activity factor

---

## 6.1.3 Dashboard (Home)

### Features

* Daily calorie summary
* Progress circle
* Calories remaining
* Macro breakdown
* Today's meals list
* Add meal button

### Real-time Updates

Use Firestore snapshot listener.

---

## 6.1.4 Add Meal – AI Scan

### Flow

1. Open camera (Expo Camera)
2. Capture image
3. Compress image
4. Upload to Firebase Storage
5. Trigger Cloud Function
6. Call AI API
7. Receive:

   * Food name
   * Calories
   * Protein
   * Carbs
   * Fat
8. User confirms or edits
9. Save to Firestore

### Edge Cases

* AI confidence low → ask manual confirmation
* API failure → fallback to manual entry

---

## 6.1.5 Manual Entry

### Features

* Search input
* Select food item
* Enter quantity
* Auto calculate calories
* Save entry

---

## 6.1.6 History

### Features

* Daily logs
* Weekly chart
* Monthly summary
* Edit/delete meal

---

## 6.1.7 Profile

### Features

* Edit personal info
* Update goal
* Change calorie target
* Logout

---

# 6.2 Phase 2 Features

* AI Chat Nutrition Assistant
* Meal reminders (Push notifications)
* Water tracking
* Barcode scanning
* Smart weekly insights
* Dark mode
* Streak system
* Social sharing

---

# 7. User Flows

---

## 7.1 New User Flow

Install → Signup → Onboarding → Dashboard → Add Meal → Track Progress

---

## 7.2 Returning User Flow

Open app → View progress → Add meal → Review stats

---

# 8. Functional Requirements

| ID  | Requirement                   |
| --- | ----------------------------- |
| FR1 | User must authenticate        |
| FR2 | User must set goal            |
| FR3 | User can upload food image    |
| FR4 | AI must return nutrition data |
| FR5 | User can edit AI result       |
| FR6 | App calculates daily total    |
| FR7 | User can view history         |
| FR8 | User can delete meal          |

---

# 9. Non-Functional Requirements

* App load time < 2 seconds
* AI response time < 5 seconds
* Data encryption in transit (HTTPS)
* Offline support via Firestore cache
* App size optimized
* Image compression before upload

---

# 10. Technical Architecture

---

## Frontend (React Native + Expo)

* React Navigation
* Context API / Zustand
* Expo Camera
* Reanimated
* Chart library

---

## Backend (Firebase)

### Firebase Services Used:

* Authentication
* Firestore
* Storage
* Cloud Functions
* Firebase Messaging (future)

---

## AI Integration

Cloud Function:

* Receives image URL
* Sends to OpenAI Vision API
* Parses response
* Saves structured nutrition data

---

# 11. Database Design (Firestore)

---

## Collection: users

users/{userId}

* name
* email
* age
* weight
* height
* gender
* activityLevel
* goal
* calorieTarget
* createdAt

---

## Subcollection: meals

users/{userId}/meals/{mealId}

* foodName
* calories
* protein
* carbs
* fat
* imageUrl
* source (AI/manual)
* date
* createdAt

---

## Collection: dailyStats (optional optimization)

users/{userId}/dailyStats/{date}

* totalCalories
* totalProtein
* totalCarbs
* totalFat

---

# 12. Security Rules

### Firestore Rules

* User can read/write only own data
* Validate numeric fields
* Prevent overwriting system fields

### Storage Rules

* Authenticated uploads only
* Max file size 5MB

---

# 13. UI/UX Requirements

* Minimal clean interface
* 8pt spacing system
* Touch target ≥ 44px
* Progress animation on updates
* Friendly microcopy
* Dark mode support

---

# 14. Error Handling

| Scenario             | Handling          |
| -------------------- | ----------------- |
| AI fails             | Manual fallback   |
| Network error        | Retry option      |
| Invalid input        | Inline validation |
| Storage upload fails | Compress + retry  |

---

# 15. Performance Optimization

* Image compression
* Firestore indexing
* Pagination for history
* Optimistic UI updates
* Debounced search input

---

# 16. Analytics Tracking

Track:

* Meals logged
* AI scans
* Time spent in app
* Goal changes
* Drop-off points

---

# 17. Risks & Mitigation

| Risk               | Mitigation              |
| ------------------ | ----------------------- |
| AI inaccuracy      | Allow manual correction |
| User churn         | Streak system           |
| Large storage cost | Compress images         |
| API cost high      | Cache common foods      |

---

# 18. Monetization Strategy (Future)

Freemium Model:

Free:

* Basic tracking
* Limited AI scans

Premium:

* Unlimited AI scans
* Advanced analytics
* Smart meal plans
* No ads

---

# 19. Deployment Plan

* Build with Expo
* Test on iOS & Android
* Firebase production config
* Release via:

  * Google Play Store
  * Apple App Store

---

# 20. Timeline (4–6 Weeks)

Week 1:
Auth + Onboarding

Week 2:
Dashboard + Manual Entry

Week 3:
AI Integration

Week 4:
History + Profile

Week 5:
Testing & Optimization

Week 6:
Deployment

---

# 21. Future Scalability

* Microservice AI processing
* Dedicated nutrition database
* Subscription billing system
* Web dashboard
* Trainer accounts

---




