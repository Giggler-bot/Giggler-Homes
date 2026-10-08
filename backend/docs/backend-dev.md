# Giggler Homes Backend Development

> This document records the step-by-step development of the Giggler Homes backend. It explains what has been built, why each system exists, the technologies used, important implementation decisions, testing performed, and the next development steps.

**Project:** Giggler Homes
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
**Database:** Neon PostgreSQL
**Authentication:** JWT and bcryptjs
**Validation:** Zod
**Current Progress:** Phase 14 Complete — Verification
**Next Milestone:** Phase 15 — Reports and Moderation

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Backend Goals](#2-backend-goals)
3. [Technology Stack](#3-technology-stack)
4. [Backend Architecture](#4-backend-architecture)
5. [Development Phases](#5-development-phases)
6. [Phase 1 — Express and TypeScript Foundation](#phase-1--express-and-typescript-foundation)
7. [Phase 2 — Environment Configuration](#phase-2--environment-configuration)
8. [Phase 3 — API Structure and Error Handling](#phase-3--api-structure-and-error-handling)
9. [Phase 4 — PostgreSQL, Neon, and Prisma](#phase-4--postgresql-neon-and-prisma)
10. [Phase 5 — User Database Foundation](#phase-5--user-database-foundation)
11. [Phase 6 — Authentication](#phase-6--authentication)
12. [Current API Endpoints](#current-api-endpoints)
13. [Current Project Structure](#current-project-structure)
14. [Security Decisions](#security-decisions)
15. [Problems Solved](#problems-solved)
16. [Testing Checklist](#testing-checklist)
17. [Documentation Milestone](#documentation-milestone)
18. [Development Update Template](#development-update-template)
19. [Phase 14 — Verification](#phase-14--verification)
20. [Latest Project Status](#latest-project-status)

---

# 1. Project Overview

Giggler Homes is a Ghana-focused property platform designed to make it easier for people to search for:

* Houses for rent
* Rooms for rent
* Houses and properties for sale
* Hotels
* Guest houses
* Other accommodation options

The platform aims to improve transparency in the property-search process by allowing users to view property information, images, videos, locations, prices, and other important details before contacting a property owner or agent.

The backend is responsible for:

* User registration
* User login
* Authentication
* Authorization
* Property management
* Property listings
* Media uploads
* Amenities
* Favorites
* Inquiries
* User and property verification
* Reports and moderation
* Administrative operations

---

# 2. Backend Goals

The backend should be:

* Secure
* Modular
* Scalable
* Type-safe
* Easy to maintain
* Easy to test
* Suitable for a production property platform

The backend follows a modular architecture so that each major feature is organized independently.

Examples:

```text
auth
users
properties
listings
media
amenities
favorites
inquiries
reports
verifications
admin
```

Each module will normally contain:

```text
module-name/
├── module-name.routes.ts
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.schema.ts
```

Responsibilities:

* **Routes** define API endpoints.
* **Controllers** receive HTTP requests and return HTTP responses.
* **Services** contain business logic.
* **Schemas** validate incoming data.

---

# 3. Technology Stack

## Runtime

**Node.js**

Node.js runs the backend application.

---

## Framework

**Express**

Express handles:

* HTTP requests
* HTTP responses
* Routes
* Middleware
* API endpoints

---

## Programming Language

**TypeScript**

TypeScript provides:

* Static type checking
* Better editor support
* Safer refactoring
* Earlier detection of coding errors

The backend uses:

```powershell
npm run type-check
```

to run:

```powershell
tsc --noEmit
```

This checks TypeScript without generating JavaScript files.

---

## Database

**PostgreSQL**

PostgreSQL is the main relational database for Giggler Homes.

It stores information such as:

* Users
* Properties
* Listings
* Locations
* Property types
* Amenities
* Favorites
* Inquiries
* Reports
* Verifications

---

## Cloud Database Provider

**Neon PostgreSQL**

Neon provides the hosted PostgreSQL database.

The backend connects to Neon using:

```env
DATABASE_URL="postgresql://..."
```

The real database URL must remain private and must not be committed to GitHub.

---

## ORM

**Prisma**

Prisma is used to:

* Define database models
* Create database migrations
* Generate a type-safe database client
* Query PostgreSQL using TypeScript

Important commands:

```powershell
npx prisma validate
```

Validates the Prisma schema.

```powershell
npx prisma migrate dev --name migration_name
```

Creates and applies a database migration.

```powershell
npx prisma generate
```

Generates the Prisma Client.

```powershell
npx prisma studio
```

Opens Prisma Studio for viewing and managing database records.

---

## Validation

**Zod**

Zod validates incoming request data.

Examples:

* Email format
* Password length
* Required fields
* Name length
* Phone number length

Validation occurs before data reaches the service layer.

---

## Media Storage

**Cloudinary**

Cloudinary stores uploaded property images and videos.

The backend uses server-side Cloudinary credentials and stores the Cloudinary `secure_url` and `public_id` alongside Media metadata in PostgreSQL.

---

## Password Security

**bcryptjs**

bcryptjs is used to:

* Hash passwords during registration
* Compare passwords during login

Passwords are never stored directly in the database.

The database stores:

```text
passwordHash
```

instead of:

```text
password
```

---

## Authentication

**JSON Web Token (JWT)**

JWT is used to:

* Create access tokens during login
* Verify users on protected routes

The token is sent using:

```http
Authorization: Bearer ACCESS_TOKEN
```

---

# 4. Backend Architecture

The backend uses the following request flow:

```text
Client
  ↓
Express Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
Neon PostgreSQL
  ↓
Response
```

Example:

```text
POST /api/v1/auth/register
  ↓
Auth route
  ↓
Registration controller
  ↓
Registration service
  ↓
Prisma User model
  ↓
Neon PostgreSQL
  ↓
JSON response
```

---

# 5. Development Phases

The backend is being built incrementally. Each phase is implemented, tested, and documented before the next major domain is started.

| Phase | Feature | Status |
|---|---|---|
| Phase 1 | Express + TypeScript foundation | Complete |
| Phase 2 | Environment configuration | Complete |
| Phase 3 | API structure and error handling | Complete |
| Phase 4 | PostgreSQL + Neon + Prisma | Complete |
| Phase 5 | User database foundation | Complete |
| Phase 6 | Authentication | Complete |
| Phase 7 | Role-Based Authorization | Complete |
| Phase 8 | Property Foundation | Complete |
| Phase 9 | Listings | Complete |
| Phase 10 | Media Management | Complete |
| Phase 11 | Amenities | Complete |
| Phase 12 | Favorites | Complete |
| Phase 13 | Inquiries | Complete |
| Phase 14 | Verification | Complete |
| Phase 15 | Reports and Moderation | Planned |
| Phase 16 | Administration | Planned |
| Phase 17 | Testing + API Documentation | Planned |
| Phase 18 | Deployment | Planned |

# Phase 1 — Express and TypeScript Foundation

## Goal

Create a working Express backend using TypeScript.

## Completed

* Created the backend folder
* Initialized the Node.js project
* Installed Express
* Installed TypeScript
* Configured TypeScript
* Created the Express application
* Created the server entry point
* Added development scripts
* Started the backend successfully

## Development Command

```powershell
npm run dev
```

The server runs using:

```text
tsx watch src/server.ts
```

The server automatically restarts when TypeScript files change.

## Type Checking

```powershell
npm run type-check
```

Expected result:

```text
No TypeScript errors
```

---

# Phase 2 — Environment Configuration

## Goal

Store configuration values outside the application code.

## Completed

* Created `.env`
* Created `.env.example`
* Added environment configuration
* Centralized environment access

Important environment variables include:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL="postgresql://..."

JWT_ACCESS_SECRET="..."

JWT_ACCESS_EXPIRES_IN="15m"

BCRYPT_SALT_ROUNDS=12
```

## Important Rule

The real `.env` file must not be committed to GitHub.

The `.env.example` file should contain placeholders only.

---

# Phase 3 — API Structure and Error Handling

## Goal

Create a consistent API structure and centralized error handling.

## Completed

* API versioning
* Health endpoint
* 404 middleware
* Centralized error handler
* Application error class
* Zod validation error handling

API routes use:

```text
/api/v1/
```

This allows future API versions:

```text
/api/v1/
/api/v2/
```

without breaking older clients immediately.

---

## Application Errors

A custom `AppError` class is used for expected application errors.

Example:

```ts
throw new AppError(
  "User with this email already exists",
  409,
);
```

The error contains:

```text
message:
User with this email already exists

statusCode:
409
```

---

## Error Response Format

Example:

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

# Phase 4 — PostgreSQL, Neon, and Prisma

## Goal

Connect the backend to a hosted PostgreSQL database.

## Completed

* Created a Neon PostgreSQL database
* Added the Neon connection string
* Installed Prisma
* Initialized Prisma
* Configured Prisma
* Validated the Prisma schema
* Connected Prisma to Neon
* Generated Prisma Client

## Important Prisma 7 Note

The project uses Prisma 7.

The database connection URL is configured through:

```text
prisma.config.ts
```

instead of placing:

```prisma
url = env("DATABASE_URL")
```

inside `schema.prisma`.

This follows the Prisma 7 configuration approach.

---

## Empty Database Error

During development, this error occurred:

```text
P4001

The introspected database was empty.
```

Cause:

The Neon database did not contain any tables.

Resolution:

The database schema was created through Prisma migrations.

After the migration was applied, Prisma and Neon worked correctly.

---

# Phase 5 — User Database Foundation

## Goal

Create the User model and synchronize it with Neon.

## Completed

* Defined the User model
* Added user roles
* Added account status
* Added unique email
* Added unique phone
* Added password hashing field
* Added verification fields
* Created and applied database migrations
* Generated Prisma Client

The User model supports fields such as:

```text
id
firstName
lastName
email
phone
passwordHash
role
status
isEmailVerified
isPhoneVerified
createdAt
updatedAt
```

---

## User Roles

Current planned roles:

```text
USER
OWNER
AGENCY
ADMIN
```

---

## Account Status

The user account status is used to control whether an account can access the platform.

Examples:

```text
ACTIVE
SUSPENDED
INACTIVE
```

The exact enum values should remain synchronized with the Prisma schema.

---

# Phase 6 — Authentication

Authentication determines:

> Who is making this request?

Phase 6 was divided into three parts.

---

## Phase 6A — User Registration

### Endpoint

```http
POST /api/v1/auth/register
```

### Registration Flow

```text
Request
  ↓
Validate request with Zod
  ↓
Check for duplicate email
  ↓
Check for duplicate phone
  ↓
Hash password using bcryptjs
  ↓
Create user with Prisma
  ↓
Store user in Neon
  ↓
Return safe user data
```

### Registration Data

Example:

```json
{
  "firstName": "Obed",
  "lastName": "Developer",
  "email": "example@email.com",
  "phone": "+233241234567",
  "password": "SecurePassword123"
}
```

### Successful Response

```http
201 Created
```

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "Obed",
      "lastName": "Developer",
      "email": "example@email.com",
      "phone": "+233241234567",
      "role": "USER"
    }
  }
}
```

### Duplicate Account

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Security

The following fields are never returned:

```text
password
passwordHash
```

---

## Phase 6B — Login and JWT Generation

### Endpoint

```http
POST /api/v1/auth/login
```

### Login Flow

```text
Email + password
  ↓
Validate input
  ↓
Find user by email
  ↓
Check account status
  ↓
Compare password with passwordHash
  ↓
Generate JWT access token
  ↓
Return token and safe user data
```

### Successful Login

```http
200 OK
```

Example:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "JWT_ACCESS_TOKEN",
    "user": {
      "id": "user-id",
      "email": "example@email.com",
      "role": "USER"
    }
  }
}
```

### Wrong Email or Password

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

The same message is used for:

* Unknown email
* Incorrect password

This reduces the risk of attackers discovering which email addresses are registered.

---

## Phase 6C — JWT Verification and Protected Routes

### Endpoint

```http
GET /api/v1/auth/me
```

### Protected Route Flow

```text
Request
  ↓
Read Authorization header
  ↓
Extract Bearer token
  ↓
Verify JWT signature
  ↓
Check token expiration
  ↓
Attach authenticated user to req.user
  ↓
Load current user from Neon
  ↓
Return safe user information
```

### Authorization Header

```http
Authorization: Bearer ACCESS_TOKEN
```

### Missing Token

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

### Invalid Token

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid access token"
}
```

### Valid Token

```http
200 OK
```

The current user is returned without password information.

---

# Current API Endpoints

The backend now contains completed endpoints across Authentication, Property, Listings, and Media.

| Method | Endpoint | Authentication | Status |
|---|---|---|---|
| GET | `/health` | Public | Complete |
| POST | `/api/v1/auth/register` | Public | Complete |
| POST | `/api/v1/auth/login` | Public | Complete |
| GET | `/api/v1/auth/me` | Required | Complete |
| GET | `/api/v1/properties/:propertyId/media` | Public | Complete |
| GET | `/api/v1/media/:mediaId` | Public | Complete |
| POST | `/api/v1/media` | Required | Complete |
| PATCH | `/api/v1/properties/:propertyId/availability` | Required | Complete |
| GET | `/api/v1/favorites` | Required | Complete |
| GET | `/api/v1/favorites/:listingId` | Required | Complete |
| POST | `/api/v1/favorites/:listingId` | Required | Complete |
| DELETE | `/api/v1/favorites/:listingId` | Required | Complete |
| POST | `/api/v1/inquiries/listings/:listingId` | Required | Complete |
| GET | `/api/v1/inquiries/sent` | Required | Complete |
| GET | `/api/v1/inquiries/received` | Required | Complete |
| GET | `/api/v1/inquiries/:inquiryId` | Required | Complete |
| PATCH | `/api/v1/inquiries/:inquiryId/respond` | Required | Complete |
| PATCH | `/api/v1/inquiries/:inquiryId/close` | Required | Complete |

Additional Property and Listing endpoints are documented in their respective phase sections.

---

# Current Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── common/
│   │   ├── AppError.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.routes.ts
│   │       ├── auth.schema.ts
│   │       └── auth.service.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

The exact structure may change as new modules are added.

---

# Security Decisions

The following security practices are currently implemented.

## Passwords

* Passwords are hashed using bcryptjs.
* Plain passwords are never stored.
* Password hashes are never returned by the API.

## JWT

* JWT tokens are signed using a private server-side secret.
* The JWT secret is stored in `.env`.
* Access tokens have an expiration period.
* Invalid and expired tokens return `401 Unauthorized`.

## Login Errors

The same response is returned for:

* Unknown email
* Incorrect password

Response:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Protected Routes

Protected routes require:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Environment Variables

Secrets are not committed to GitHub.

---

# Problems Solved

## Prisma 7 Datasource Configuration

### Problem

Prisma reported:

```text
The datasource property `url` is no longer supported in schema files.
```

### Resolution

The database connection was moved to:

```text
prisma.config.ts
```

---

## Empty Neon Database

### Problem

Prisma reported:

```text
P4001

The introspected database was empty.
```

### Cause

The database did not yet contain tables.

### Resolution

The database schema was created using Prisma migrations.

---

## Duplicate User Returned 500

### Problem

A duplicate phone number produced:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Cause

The centralized error handler did not correctly recognize the custom `AppError`.

### Resolution

The error handler was updated to check:

```ts
error instanceof AppError
```

The API now returns:

```http
409 Conflict
```

with the correct message.

---

## JWT Error Named Export in ESM

### Problem

Node reported:

```text
The requested module 'jsonwebtoken'
does not provide an export named
'JsonWebTokenError'
```

### Cause

The project uses an ESM setup, and the JWT package did not expose the error classes as named runtime exports.

### Resolution

The package was imported using:

```ts
import jwt from "jsonwebtoken";
```

JWT error classes were accessed through:

```ts
jwt.TokenExpiredError

jwt.JsonWebTokenError
```

---

# Testing Checklist

## Registration

* [x] Valid user registration
* [x] Password hashing
* [x] User stored in Neon
* [x] Duplicate email handling
* [x] Duplicate phone handling
* [x] Validation errors
* [x] Password hash excluded from response

## Login

* [x] Valid login
* [x] JWT generation
* [x] Wrong password handling
* [x] Unknown email handling
* [x] Safe user response

## Protected Routes

* [x] Missing token handling
* [x] Invalid token handling
* [x] Valid token handling
* [x] Authenticated user attached to request
* [x] Current user loaded from Neon

## Development

* [x] Prisma schema validation
* [x] Prisma Client generation
* [x] TypeScript type checking
* [x] Backend server starts successfully

---

# Next Phase

# Phase 7 — Role-Based Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to do?

Planned roles:

```text
USER
OWNER
AGENCY
ADMIN
```

Phase 7 will include:

## Phase 7A

Create role authorization middleware.

Example:

```ts
authorizeRoles(
  "OWNER",
  "AGENCY",
  "ADMIN",
);
```

## Phase 7B

Protect role-specific routes.

Example:

```ts
router.post(
  "/properties",
  authenticate,
  authorizeRoles(
    "OWNER",
    "AGENCY",
    "ADMIN",
  ),
  createPropertyController,
);
```

## Phase 7C

Add ownership authorization.

Users should only be able to modify resources they own unless they are administrators.

## Phase 7D

Create and test admin-only routes.

---

# Development Update Template

Copy this section when a new phase is completed.

## Phase X — Feature Name

**Status:** Complete

### Goal

Describe the purpose of the phase.

### Features Added

* Feature 1
* Feature 2
* Feature 3

### Files Added

```text
path/to/file.ts
```

### Files Updated

```text
path/to/file.ts
```

### API Endpoints

| Method | Endpoint          | Authentication |
| ------ | ------------------ | --------------- |
| POST   | `/api/v1/example` | Required       |

### Important Decisions

Explain important architecture or security decisions.

### Problems Encountered

Describe problems and their solutions.

### Testing

* [x] Test 1
* [x] Test 2

### Result

Summarize the completed feature.

---

# Progress Summary

```text
Phase 1  ✅ Complete
Phase 2  ✅ Complete
Phase 3  ✅ Complete
Phase 4  ✅ Complete
Phase 5  ✅ Complete
Phase 6A ✅ Complete
Phase 6B ✅ Complete
Phase 6C ✅ Complete

Phase 7  ⏭️ Next
```

**Current backend milestone:** Authentication complete.

**Next development milestone:** Role-Based Authorization.

## Phase 7A — Role-Based Authorization Middleware

**Status:** Complete

### Goal

Create a reusable Role-Based Access Control (RBAC) middleware that restricts access to API routes based on the authenticated user's role.

### Features Added

* Central `UserRole` TypeScript type
* Supported user roles:

  * `USER`
  * `OWNER`
  * `AGENCY`
  * `HOTEL`
  * `ADMIN`
* Reusable `authorizeRoles()` middleware
* Admin-only test endpoint
* Role-based access checks
* `403 Forbidden` responses for authenticated users without permission

### Authorization Flow

```text
Request
  ↓
authenticate
  ↓
Verify JWT
  ↓
Attach authenticated user to req.user
  ↓
authorizeRoles
  ↓
Check whether the user's role is allowed
  ↓
Controller
```

### Files Added

```text
src/types/role.ts

src/middleware/authorizeRoles.ts

src/modules/admin/admin.controller.ts

src/modules/admin/admin.routes.ts
```

### Files Updated

```text
src/types/express.d.ts

src/common/jwt.ts

src/app.ts
```

### Reusable Authorization Middleware

The middleware can protect routes using one or more roles:

```ts
authorizeRoles("ADMIN");
```

or:

```ts
authorizeRoles(
  "OWNER",
  "AGENCY",
  "HOTEL",
  "ADMIN",
);
```

### Admin Test Endpoint

| Method | Endpoint                  | Required Role | Status   |
| ------ | ------------------------- | ------------- | -------- |
| GET    | `/api/v1/admin/dashboard` | `ADMIN`       | Complete |

### Test Results

#### Authenticated USER

Expected result:

```http
403 Forbidden
```

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

Result:

```text
Passed ✅
```

#### Authenticated ADMIN

Expected result:

```http
200 OK
```

Result:

```text
Passed ✅
```

### Important Security Decision

Authentication and authorization are handled separately.

Authentication determines:

> Who is the user?

Authorization determines:

> What is the user allowed to do?

A valid JWT does not automatically give a user permission to access every route.

### Result

Role-Based Access Control is working correctly. The backend can now restrict API endpoints according to user roles.

## Phase 7B — Property Ownership Authorization

**Status:** Complete

### Goal

Implement ownership-based authorization to ensure that users can only manage properties they own, while allowing administrators to manage any property.

### Problem Solved

Role-Based Access Control alone is not sufficient for resource protection.

For example, two users may both have the `OWNER` role:

```text
Owner A
└── Property A

Owner B
└── Property B
```

Both users are authorized to access owner-level property routes, but Owner B must not be allowed to update or delete Property A.

Ownership authorization adds a resource-level permission check.

### Authorization Rule

Access is allowed when:

```text
Authenticated user owns the property
                OR
Authenticated user has the ADMIN role
```

Otherwise, the request is rejected with:

```http
403 Forbidden
```

### Files Added

```text
src/middleware/authorizePropertyOwner.ts

src/modules/properties/property.controller.ts

src/modules/properties/property.routes.ts

src/scripts/createTestProperty.ts
```

### Files Updated

```text
src/app.ts

prisma/schema.prisma
```

### Property Ownership Middleware

The middleware performs the following checks:

1. Confirms that the request contains an authenticated user.
2. Retrieves the property ID from the route parameters.
3. Finds the property in the database.
4. Retrieves the property's `ownerId`.
5. Compares `property.ownerId` with `req.user.id`.
6. Allows access when the user owns the property.
7. Allows access when the user has the `ADMIN` role.
8. Returns `403 Forbidden` when the user is neither the owner nor an administrator.
9. Returns `404 Not Found` when the property does not exist.

### Protected Test Route

| Method | Endpoint                         | Allowed roles              |
| ------ | -------------------------------- | -------------------------- |
| PATCH  | `/api/v1/properties/:propertyId` | `OWNER`, `AGENCY`, `ADMIN` |

### Middleware Order

```text
Request
  ↓
authenticate
  ↓
Verify JWT
  ↓
Attach user information to req.user
  ↓
authorizeRoles
  ↓
Check whether the user's role is allowed
  ↓
authorizePropertyOwner
  ↓
Check whether the user owns the property
  ↓
Controller
```

### Test Results

| Scenario                        |    Expected result | Result |
| ------------------------------- | -----------------: | -----: |
| Request without an access token | `401 Unauthorized` | Passed |
| Authenticated `USER`            |    `403 Forbidden` | Passed |
| Property owner                  |           `200 OK` | Passed |
| Different property owner        |    `403 Forbidden` | Passed |
| Authenticated `ADMIN`           |           `200 OK` | Passed |

### Test Property Creation

A temporary Prisma script was created to insert a test property into the database.

The script uses Prisma Client to create the property and automatically generates a UUID through the Prisma schema:

```prisma
id String @id @default(uuid())
```

This avoided manually entering a property ID in Prisma Studio.

### Result

Property ownership authorization is working correctly.

The backend now supports both:

* Role-level authorization
* Resource ownership authorization

This provides a secure foundation for the upcoming Property module.

# Giggler Homes Backend Development

## Project Status

**Current Phase:** Phase 12 Complete – Favorites

**Project Status:** 🟢 Stable

The backend has successfully transitioned from authentication development into the core property domain. The project now has a production-quality architecture consisting of modular Express routes, controllers, services, middleware, Prisma ORM, PostgreSQL, and Zod validation.

---

# Development Philosophy

Rather than importing an entire generated backend, the project is being developed feature-by-feature.

Every feature follows the same workflow:

```
Design
    ↓
Database Model (Prisma)
    ↓
Migration
    ↓
Generate Prisma Client
    ↓
Validation (Zod)
    ↓
Service Layer
    ↓
Controller Layer
    ↓
Route Layer
    ↓
Testing
    ↓
Documentation
```

This approach ensures every component is fully understood before moving to the next feature.

---

# Completed Phases

## ✅ Phase 1 – Backend Project Setup

Completed

* Backend folder structure
* Express setup
* TypeScript configuration
* Development scripts
* Environment configuration
* Health endpoint

---

## ✅ Phase 2 – Express Configuration

Completed

* Express application
* Middleware configuration
* Helmet
* Morgan
* Compression
* CORS
* JSON parser
* Error middleware

---

## ✅ Phase 3 – Project Architecture

Completed

Project organized into:

```
src/

config/

common/

middleware/

modules/

lib/

generated/

types/
```

---

## ✅ Phase 4 – Database

Completed

Technology:

* PostgreSQL (Neon)
* Prisma ORM
* Prisma Client
* Prisma Migrations

Completed:

* Prisma initialization
* Database connection
* Migration workflow
* Shared Prisma client

---

## ✅ Phase 5 – Error Handling

Completed

Implemented:

* AppError
* Global Error Handler
* Zod validation error handling
* HTTP status handling
* Development stack traces

---

## ✅ Phase 6 – Authentication

Completed

Implemented:

* User Registration
* Login
* Password Hashing
* JWT Authentication
* Authentication Middleware

Validation includes:

* Email
* Phone
* Password
* Duplicate Email
* Duplicate Phone

---

## ✅ Phase 7 – Authorization

Completed

Implemented:

Role Authorization

Supported Roles

* USER
* OWNER
* AGENCY
* HOTEL
* ADMIN

Ownership Authorization

Property owners can only modify their own properties.

Successfully tested.

---

## ✅ Phase 8 – Property Foundation

Completed

### Database Models

Implemented

* User
* Property
* Location
* PropertyCategory
* PropertyType

Relationships

```
User
    │
    ▼
Property
    │
    ├────────────► Location
    │
    └────────────► PropertyType
                         │
                         ▼
                PropertyCategory
```

---

### Enums

Implemented

UserRole

* USER
* OWNER
* AGENCY
* HOTEL
* ADMIN

UserStatus

* ACTIVE
* INACTIVE
* SUSPENDED
* DEACTIVATED

GhanaRegion

* All sixteen Ghana regions

---

### Seed System

Implemented

Reference Data

Property Categories

* Residential
* Commercial
* Hospitality
* Land

Property Types

Residential

* Apartment
* Studio Apartment
* Self Contained
* Chamber & Hall
* Detached House
* Semi Detached House
* Townhouse
* Villa

Commercial

* Office
* Shop
* Warehouse
* Factory

Hospitality

* Hotel
* Guest House
* Hostel
* Resort

Land

* Residential Land
* Commercial Land
* Farm Land

Locations

* Ghana's sixteen regions

Seeding is idempotent using Prisma upsert().

---

### Property Module

Implemented

Create Property

Features

* Slug generation
* Owner assigned from authenticated user
* Foreign key validation
* Zod request validation
* Modular controller/service architecture

---

### Shared Prisma Client

A single Prisma client is shared across the application to avoid multiple database connections.

Location

```
src/lib/prisma.ts
```

---

# Architecture Standards

Every module follows the same structure.

```
module/

controller.ts

service.ts

routes.ts

validation.ts

types.ts (when required)

constants.ts (when required)

utils.ts (when required)
```

---

# API Design Standards

Controllers

* Handle HTTP requests and responses only.

Services

* Contain all business logic.

Validation

* Performed using Zod.

Database

* Accessed only through Prisma.

Middleware

* Handles authentication, authorization and validation.

---

# Testing Completed

Infrastructure

* Server
* Database
* Prisma
* Migrations

Authentication

* Registration
* Login
* JWT Generation
* JWT Verification

Authorization

* Role Authorization
* Property Ownership Authorization

Validation

* Authentication Validation
* Property Validation

Database

* Relationships
* Foreign Keys
* Seed Data

Property

* Property Creation
* Slug Generation
* Owner Assignment

Status

All tests completed successfully.

---

# Important Design Decisions

Rather than copying the generated backend, the project is being rebuilt from scratch using the generated backend only as a reference.

Database models are introduced incrementally instead of importing every model at once.

Reference data is seeded rather than manually inserted.

Prisma remains the single source of truth for database design.

Every feature is fully tested before development proceeds.

Documentation is updated after every completed phase.

---

# Current Project Structure

```
Backend

Authentication ✅

Authorization ✅

Property Foundation ✅

Listing Module ⏳

Media Module ⏳

Amenities Module ⏳

Favorites Module ⏳

Inquiry Module ⏳

Verification Module ⏳

Reports Module ⏳

Administration Module ⏳
```

---

# Next Phase

## Phase 9 – Listing Module

Objectives

* Listing model
* Listing validation
* Create listing endpoint
* Update listing endpoint
* Listing publication workflow
* Listing status management
* Pricing
* Rent period
* Sale listings
* Listing retrieval APIs
* Listing search and filtering
---

# Phase 9 — Listings

**Status:** Complete 🔥

## Goal

Build the Listing domain on top of the Property foundation.

The Listing model represents a market-facing offer for a property, while the Property model represents the underlying real-world property.

A property can therefore exist independently of a particular listing.

## Listing Database Model

The Listing model currently contains:

```text
id
propertyId
listingType
status
price
currency
rentPeriod
negotiable
isFeatured
availabilityConfirmedAt
publishedAt
expiresAt
viewCount
createdAt
updatedAt
deletedAt
```

The Listing belongs to a Property:

```text
Property
    │
    └── Listing[]
```

A Listing references exactly one Property.

## Listing Enums

### ListingType

```text
RENT
SALE
SHORT_STAY
LEASE
```

### ListingStatus

```text
DRAFT
PENDING_REVIEW
ACTIVE
REJECTED
EXPIRED
SOLD
RENTED
ARCHIVED
```

### RentPeriod

```text
DAILY
WEEKLY
MONTHLY
YEARLY
```

## Listing Development Workflow

The Listing module followed the project's incremental development philosophy:

```text
Schema
  ↓
Migration
  ↓
Prisma Client
  ↓
Validation
  ↓
Service
  ↓
Controller
  ↓
Routes
  ↓
Authorization
  ↓
Testing
  ↓
Documentation
```

## Listing Creation

The create-listing workflow validates:

* The referenced property exists.
* The property is available.
* The requested listing data is valid.
* The authenticated user is authorized to create the listing for the property.

The owner relationship is enforced through the existing property ownership authorization system.

## Listing Retrieval

The Listing module supports retrieval of active listings.

Implemented capabilities include:

* Listing retrieval
* Single listing retrieval
* Pagination
* Filtering
* Price filtering
* Listing type filtering
* Property-level filtering
* Location/region filtering
* Property type filtering
* Bedroom filtering
* Bathroom filtering
* Furnished-property filtering
* Featured listing ordering

The active listing query excludes deleted records.

Pagination uses:

```text
page
limit
skip
take
total
totalPages
```

The service explicitly supplies numeric pagination values to Prisma, including `skip`, to avoid Prisma 7 validation errors when optional pagination values are undefined.

## Listing Update

Listing updates are protected by authentication and authorization.

The backend distinguishes:

```text
Role Authorization
        ↓
Can this role perform this operation?

Resource Ownership Authorization
        ↓
Does this user own this property/listing?
```

Administrators can bypass ownership restrictions where the route permits administrative access.

## Listing Submission

Draft listings can be submitted for review.

```text
DRAFT
   │
   │ submit
   ▼
PENDING_REVIEW
```

The submission endpoint is protected and validated before the business operation is performed.

## Listing Moderation

Administrators can approve or reject listings.

```text
PENDING_REVIEW
      │
      ├── approve ──→ ACTIVE
      │
      └── reject ───→ REJECTED
```

This keeps moderation decisions separate from normal owner operations.

## Listing Lifecycle

The implemented lifecycle is:

```text
                         DRAFT
                           │
                         submit
                           ▼
                    PENDING_REVIEW
                      │          │
                   approve      reject
                      │          │
                      ▼          ▼
                    ACTIVE     REJECTED
                      │
          ┌───────────┼───────────┐
          │           │           │
        expire       sold       rented
          │           │           │
          ▼           ▼           ▼
       EXPIRED       SOLD       RENTED
          │           │           │
          └───────────┴───────────┘
                      │
                    archive
                      │
                      ▼
                   ARCHIVED
```

Terminal/business outcome states cannot be incorrectly transitioned into one another.

Examples:

```text
SOLD    → RENTED   ❌
RENTED  → SOLD     ❌
EXPIRED → SOLD     ❌
```

## Expiration

Active listings can be marked as expired through the dedicated lifecycle operation.

Expiration is a listing lifecycle transition and is not the same thing as deleting the database record.

## Sold

An active listing can be marked as:

```text
SOLD
```

Only an authorized administrative operation can perform the lifecycle transition.

## Rented

An active listing can be marked as:

```text
RENTED
```

The operation is separate from SOLD because renting and selling represent different business outcomes.

## Archive

Archiving is separate from deletion.

```text
ARCHIVED
```

means the listing is no longer part of the active marketplace lifecycle while its record can still be retained.

This is distinct from:

```text
deletedAt
```

which represents the database's soft-deletion state.

## Availability Management

Property availability and listing lifecycle were intentionally kept as separate concepts.

```text
Property.isAvailable
        ≠
Listing.status
```

The availability endpoint updates the property's availability:

```http
PATCH /api/v1/properties/:propertyId/availability
```

Example:

```json
{
  "isAvailable": false
}
```

This does **not** automatically change the Listing status.

For example:

```text
Property.isAvailable = false
Listing.status       = ACTIVE
```

is a valid state under the current architecture.

This separation prevents accidental coupling between property availability and the lifecycle of an individual listing.

## Validation

Listing requests use Zod validation.

Validation occurs before service-layer business logic.

A notable Express 5 consideration was discovered during pagination/filter development: `req.query` is getter-backed. The validation middleware therefore uses `Object.defineProperty()` when replacing the parsed query object rather than assigning directly to `req.query`.

Current pattern:

```ts
if (data.query !== undefined) {
  Object.defineProperty(req, "query", {
    value: data.query,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}
```

## Authorization Architecture

Listing operations use the existing authorization layers.

Typical protected flow:

```text
Request
  ↓
authenticate
  ↓
authorizeRoles
  ↓
validateRequest
  ↓
authorizePropertyOwner
  ↓
Controller
  ↓
Service
  ↓
Prisma
```

The exact middleware combination depends on the operation.

Administrative lifecycle operations are restricted to the appropriate administrative role.

## Important Listing Design Decisions

### 1. Listing status is controlled through dedicated operations

Clients should not arbitrarily change lifecycle states through a general update request.

Operations such as:

```text
submit
approve
reject
expire
sold
rented
archive
```

are represented as explicit business operations.

### 2. Property and Listing are separate domains

A Property represents the underlying property.

A Listing represents an offer involving that property.

This allows a property to have multiple listings over its lifetime.

### 3. Availability is separate from lifecycle

`Property.isAvailable` is not treated as an alternative name for `Listing.status`.

The two fields have different business meanings.

### 4. Soft deletion remains separate from archiving

```text
ARCHIVED
```

is a business lifecycle state.

```text
deletedAt
```

is a persistence/deletion state.

### 5. Models and enums are introduced incrementally

The project does not import the entire reference/generated Prisma schema at once.

Models and enums are introduced when the feature requires them.

The generated backend is used as a reference rather than copied wholesale.

## Listing Testing

The Listing domain was tested incrementally.

### Foundation

* [x] Prisma schema
* [x] Migration
* [x] Prisma Client generation
* [x] Type checking

### Creation

* [x] Valid listing creation
* [x] Invalid property handling
* [x] Property availability validation
* [x] Authorization
* [x] Validation

### Retrieval

* [x] Active listing retrieval
* [x] Single listing retrieval
* [x] Pagination
* [x] Price filtering
* [x] Region filtering
* [x] Property filters
* [x] Combined filters
* [x] Invalid filter handling

### Management

* [x] Listing update
* [x] Ownership authorization
* [x] Submission for review
* [x] Admin approval
* [x] Admin rejection

### Lifecycle

* [x] Expire listing
* [x] Mark listing as SOLD
* [x] Mark listing as RENTED
* [x] Archive listing
* [x] Availability management
* [x] Invalid lifecycle transitions
* [x] Authorization failures
* [x] Invalid UUID handling
* [x] Nonexistent resource handling

All Listing tests passed successfully.

---

# Documentation Milestone

**Status:** Complete through Phase 12

Phase 12 — Favorites has been implemented and tested. This document has now been synchronized with the actual Favorites implementation before beginning the next major domain.

## Documentation Order

```text
Phase 12 Complete
      ↓
Update backend-dev.md
      ↓
Review architecture against actual implementation
      ↓
Phase 13 — Inquiries
```

The architecture and backend documentation should continue to describe the real implementation as it evolves.

---

# Current Progress Summary

```text
Phase 1  ✅ Backend Project Setup
Phase 2  ✅ Express Configuration
Phase 3  ✅ API Structure and Error Handling
Phase 4  ✅ PostgreSQL + Neon + Prisma
Phase 5  ✅ User Database Foundation
Phase 6  ✅ Authentication
Phase 7  ✅ Role-Based Authorization
Phase 8  ✅ Property Foundation
Phase 9  ✅ Listing Module
Phase 10 ✅ Media Management
Phase 11 ✅ Amenities
Phase 12 ✅ Favorites

Phase 13 ⏭️ Inquiries
```

## Current Project Structure

```text
Authentication       ✅
Authorization        ✅
Property Foundation  ✅
Listing Module       ✅
Media Module         ✅
Amenities Module     ✅
Favorites Module     ✅
Inquiry Module       ⏭️
Verification Module  ⏳
Reports Module       ⏳
Administration       ⏳
```

---

# Phase 10 — Media Management

**Status:** Complete 🔥

## Goal

Build a property media system that stores media metadata in PostgreSQL while using Cloudinary for actual image and video storage.

The Media domain is currently **Property-based**. A Media record belongs directly to a Property rather than to an individual Listing.

## Media Database Model

The current `Media` model contains:

```text
id
propertyId
type
url
publicId
title
altText
sortOrder
isPrimary
createdAt
updatedAt
deletedAt
```

The model uses:

```text
MediaType
├── IMAGE
└── VIDEO
```

`publicId` is required because it is the Cloudinary identifier used to manage/delete the uploaded asset.

Media belongs to Property with cascade deletion at the database relationship level:

```text
Property
   │
   └── Media[]
```

Soft deletion remains supported through `deletedAt`.

> Database cascade deletion and Cloudinary asset deletion are separate concerns. Deleting a database record does not by itself remove the Cloudinary asset, so the application explicitly manages Cloudinary deletion.

## Media Architecture

The Media upload flow is:

```text
Client
  ↓
multipart/form-data
  ↓
Multer memoryStorage
  ↓
Request validation
  ↓
Property ownership authorization
  ↓
Media Service
  ↓
Cloudinary upload
  ↓
Cloudinary response
  ├── secure_url
  ├── public_id
  └── resource_type
  ↓
Prisma transaction
  ↓
Media record in PostgreSQL
```

The client does not supply Cloudinary-derived fields such as:

```text
type
url
publicId
```

The backend derives those values from the Cloudinary response.

## Media Validation

The creation request validates:

```text
propertyId
title
altText
sortOrder
isPrimary
```

Because media is submitted as `multipart/form-data`, fields such as `sortOrder` are coerced from their multipart string representation into numbers.

`isPrimary` is converted from the multipart `"true"` / `"false"` representation into a boolean.

The uploaded file is handled separately by Multer.

## Multer Upload Configuration

Media uploads use:

```text
multer.memoryStorage()
```

This provides the Media service with:

```ts
req.file.buffer
```

The configured allowed MIME types are:

```text
image/jpeg
image/png
image/webp
image/gif
video/mp4
video/webm
video/quicktime
```

The configured maximum file size is:

```text
50 MB
```

The file-size limit is configured in Multer. The >50 MB rejection boundary was not directly exercised because the current Postman setup used for testing limits multipart uploads to 5 MB.

Unsupported file types are rejected with:

```http
400 Bad Request
```

before the upload reaches Cloudinary.

## Cloudinary Configuration

Cloudinary is configured in:

```text
src/config/cloudinary.ts
```

The application reads:

```env
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

The API secret remains server-side and is not returned to clients or logged.

## Cloudinary Service

Cloudinary operations are isolated in the Cloudinary service.

The upload function accepts a `Buffer` because Multer uses `memoryStorage()`:

```ts
uploadMedia(
  file: Buffer,
  folder: string,
)
```

The implementation uses Cloudinary's `upload_stream()` with:

```text
resource_type: "auto"
```

This allows the same upload primitive to support both images and videos.

The deletion primitive accepts:

```text
publicId
resourceType
```

and calls Cloudinary's destroy operation.

## Cloudinary-to-Prisma Media Type Mapping

Cloudinary uses lowercase resource types:

```text
image
video
```

The Prisma enum uses:

```text
IMAGE
VIDEO
```

The Media service therefore contains a mapping helper:

```ts
getMediaType(resourceType)
```

which converts the Cloudinary value into the application's `MediaType` representation.

Unsupported Cloudinary resource types are rejected rather than silently stored.

## Media Creation

The Media creation endpoint is protected by:

```text
authenticate
authorizeRoles
uploadMediaFile.single("file")
validateRequest
authorizeMediaPropertyOwner
createMediaController
```

Allowed roles are:

```text
OWNER
AGENCY
HOTEL
ADMIN
```

Administrators bypass the property ownership restriction.

The creation service first verifies:

1. The property exists.
2. The property has not been soft deleted.

It then uploads the file to a property-specific Cloudinary folder:

```text
giggler-homes/properties/{propertyId}
```

The returned Cloudinary values are stored in the Media record.

## Primary Media

A property can have one active primary media item.

When a new media item is created with:

```text
isPrimary = true
```

existing active primary media for the same property is unset before the new record is created.

Both operations occur inside the same Prisma transaction.

This prevents a failed media creation from leaving the property without its previous primary media.

## Transaction and Rollback Strategy

Cloudinary and PostgreSQL are separate systems and cannot participate in one atomic Prisma transaction.

The implementation therefore uses a compensating transaction strategy:

```text
Multer buffer
      ↓
Cloudinary upload
      ↓
Prisma transaction
      ├── unset previous primary when required
      └── create Media record
      ↓
Success
```

If the Cloudinary upload fails:

```text
Cloudinary ❌
     ↓
No database transaction
     ↓
Request fails
```

If Cloudinary succeeds but the database transaction fails:

```text
Cloudinary upload ✅
        ↓
Prisma transaction ❌
        ↓
deleteMediaAsset()
        ↓
Cloudinary asset removed
```

This prevents orphaned Cloudinary assets when database creation fails.

The rollback behavior was explicitly tested successfully.

## Media Retrieval

The Media domain supports:

```text
GET /api/v1/properties/:propertyId/media
```

and:

```text
GET /api/v1/media/:mediaId
```

Property media retrieval:

* Is publicly accessible.
* Verifies that the property exists.
* Excludes soft-deleted media.
* Orders media by `sortOrder` ascending and then `createdAt` ascending.
* Returns an empty media collection when a valid property has no media.

## Media Update

Media metadata can be updated without re-uploading the physical asset when the operation only changes database metadata.

Cloudinary-specific identifiers remain tied to the uploaded asset.

## Media Deletion

Media deletion uses the Media identifier and also manages the associated Cloudinary asset.

The database record uses soft deletion through:

```text
deletedAt
```

Normal media retrieval excludes soft-deleted records.

Cloudinary deletion is handled separately using:

```text
publicId
resourceType
```

## Authorization Architecture

Media operations use the project's layered authorization model:

```text
Request
  ↓
authenticate
  ↓
authorizeRoles
  ↓
Multer
  ↓
validateRequest
  ↓
authorizeMediaPropertyOwner
  ↓
Controller
  ↓
Service
  ↓
Prisma / Cloudinary
```

The ownership rule is:

```text
Authenticated user owns the property
        OR
Authenticated user is ADMIN
```

Otherwise the request is rejected with:

```http
403 Forbidden
```

A normal `USER` role cannot create media.

## Media Security and Edge Cases

The completed tests include:

### Creation and Upload

* [x] Valid image upload
* [x] Valid video upload
* [x] Cloudinary upload
* [x] Database media creation
* [x] Cloudinary URL stored
* [x] Cloudinary public ID stored
* [x] Cloudinary resource type mapped to Prisma MediaType

### Authorization

* [x] Missing authentication
* [x] USER role rejected
* [x] Wrong property owner rejected
* [x] ADMIN ownership bypass
* [x] Authorized owner upload

### Validation and File Handling

* [x] Missing file
* [x] Unsupported `.txt` file rejected
* [x] Invalid media input
* [x] Deleted property rejected
* [x] Configured 50 MB Multer limit
* [ ] >50 MB rejection boundary not directly tested because of current Postman 5 MB upload limitation

### Primary Media

* [x] First primary media
* [x] Replacing an existing primary
* [x] Primary-media transaction rollback

### Retrieval and Deletion

* [x] Property media retrieval
* [x] Individual media retrieval
* [x] Soft-deleted media excluded
* [x] Image deletion
* [x] Video deletion

### Failure Handling

* [x] Cloudinary upload failure path
* [x] Database failure after Cloudinary upload
* [x] Cloudinary compensating cleanup
* [x] No orphaned Cloudinary asset after tested database failure

## Media Files

The Media implementation includes the following responsibilities:

```text
src/
├── config/
│   └── cloudinary.ts
│
├── middleware/
│   └── upload.middleware.ts
│
└── modules/
    └── media/
        ├── media.controller.ts
        ├── media.routes.ts
        ├── media.service.ts
        └── media.validation.ts
```

The Cloudinary service is kept separate from Media business logic so that Cloudinary-specific operations remain isolated.

The exact file path for the Cloudinary service should match the current project structure.

## Important Media Design Decisions

### 1. Cloudinary stores files; PostgreSQL stores metadata

The physical media asset is stored in Cloudinary.

PostgreSQL stores:

```text
property relationship
media type
secure URL
public ID
title
alt text
sort order
primary state
timestamps
soft-delete state
```

### 2. The client does not control Cloudinary identifiers

The backend derives:

```text
url
publicId
type
```

from the Cloudinary response.

### 3. Property-level media in V1

Media belongs directly to Property rather than Listing.

This keeps the initial media model aligned with the property-centric architecture.

### 4. Primary media is a database concern

The primary-media rule is enforced in the Prisma transaction rather than delegated to the client.

### 5. Cloudinary and PostgreSQL use compensating failure handling

A successful Cloudinary upload followed by a failed database transaction triggers an explicit Cloudinary deletion.

### 6. Soft deletion and Cloudinary deletion are separate operations

The database's `deletedAt` state does not automatically remove an external Cloudinary asset. The application explicitly manages the external asset.

## Media Test Summary

All planned Media tests passed except the direct >50 MB boundary test, which could not be executed with the current Postman 5 MB upload limitation.

The Media domain is therefore considered complete for the current development environment.

---

# Phase 11 — Amenities

**Status:** Complete 🔥

## Goal

Build the Amenities domain used to define reusable property features and associate those features with properties.

The Amenities module provides:

* Amenity creation and management
* Amenity categories
* Public amenity retrieval
* Administrative CRUD operations
* Soft deletion
* Property-to-amenity assignments
* Duplicate-assignment protection
* Case-insensitive amenity-name uniqueness

---

## Phase 11.1 — Database Foundation

### Amenity Model

The current `Amenity` model contains:

```text
id
name
icon
category
createdAt
updatedAt
deletedAt
```

### Amenity Category

The current enum is:

```text
SECURITY
UTILITIES
COMFORT
OUTDOOR
PARKING
CONNECTIVITY
```

### PropertyAmenity Model

Property-to-amenity relationships are represented using a join table:

```text
Property
    │
    └── PropertyAmenity
             │
             └── Amenity
```

The relationship contains:

```text
propertyId
amenityId
createdAt
```

The composite primary key is:

```prisma
@@id([propertyId, amenityId])
```

This prevents the same amenity from being assigned to the same property more than once.

The current database relationships use cascade deletion at the Prisma relation level.

---

## Phase 11.2 — Amenity Validation

Amenity requests use Zod validation.

### Create Amenity

The create request validates:

```text
name
icon
category
```

Rules include:

* `name` is required.
* `name` is trimmed.
* `name` must contain at least one character.
* `name` has a maximum length of 100 characters.
* `icon` is optional and trimmed.
* `icon` has a maximum length of 100 characters.
* `category` must be one of the supported `AmenityCategory` values.

### Update Amenity

The update request validates:

```text
amenityId
name
icon
category
```

The `amenityId` must be a valid UUID.

At least one update field must be provided.

An empty update request is rejected.

### List Amenities

The list endpoint optionally accepts:

```text
category
```

Invalid category values are rejected by Zod.

---

## Phase 11.3 — Amenity Service

The Amenity service contains the business logic for amenity management.

### Create

Creating an amenity:

1. Validates the request through Zod.
2. Checks whether the amenity name already exists.
3. Creates the amenity when the name is available.
4. Returns the created record.

Duplicate names return:

```http
409 Conflict
```

### List

The list operation:

* Returns only non-deleted amenities.
* Supports optional category filtering.
* Orders amenities by name ascending.

Soft-deleted records are excluded.

### Get by ID

The individual retrieval operation:

* Finds only active amenities.
* Returns `404 Not Found` for nonexistent amenities.
* Returns `404 Not Found` for soft-deleted amenities.

### Update

Amenity updates:

* Require an active amenity.
* Support partial updates.
* Check name conflicts.
* Return `404 Not Found` when the amenity does not exist.
* Return `409 Conflict` when the new name conflicts with another amenity.

### Delete

Amenity deletion uses soft deletion:

```text
deletedAt = current timestamp
```

The database record remains available for historical relationships and recovery strategies.

A deleted amenity is no longer returned through normal active retrieval endpoints.

---

## Phase 11.4 — Case-Insensitive Name Uniqueness

During testing, PostgreSQL's normal string uniqueness behavior exposed an important edge case.

Without a functional index, these values can be treated as different strings:

```text
Parking
parking
PARKING
```

For the Giggler Homes business model, these should represent the same logical amenity name.

The database therefore enforces case-insensitive uniqueness using:

```sql
CREATE UNIQUE INDEX "Amenity_name_lower_key"
ON "Amenity" (LOWER("name"));
```

The stored value keeps its original casing.

For example:

```text
Parking
```

remains stored as:

```text
Parking
```

The system does not silently convert the stored name to lowercase.

### Expected Behavior

```text
Parking          → allowed
parking          → 409 Conflict
PARKING          → 409 Conflict
"  Parking  "    → 409 Conflict
```

Whitespace is normalized by the application through trimming before the uniqueness check.

### Soft-Deleted Names

A soft-deleted amenity name remains reserved.

For example:

```text
Parking
   ↓
soft delete
   ↓
Parking remains unavailable
```

This avoids creating multiple historical records for the same logical amenity name.

A future restore/reactivation operation can be introduced if the product requires reusing a soft-deleted amenity.

---

## Phase 11.5 — Amenity API

### Public Endpoints

| Method | Endpoint | Authentication | Status |
|---|---|---|---|
| GET | `/api/v1/amenities` | Public | Complete |
| GET | `/api/v1/amenities/:amenityId` | Public | Complete |

### Administrative Endpoints

| Method | Endpoint | Required Role | Status |
|---|---|---|---|
| POST | `/api/v1/amenities` | `ADMIN` | Complete |
| PATCH | `/api/v1/amenities/:amenityId` | `ADMIN` | Complete |
| DELETE | `/api/v1/amenities/:amenityId` | `ADMIN` | Complete |

Administrative operations are protected by the existing role authorization middleware.

Normal users and non-administrative property roles cannot create, update, or delete amenities.

---

## Phase 11.6 — Property ↔ Amenity Assignment

The Amenities domain also supports assigning reusable amenities to properties through the `PropertyAmenity` join table.

The relationship is intentionally many-to-many:

```text
Property A
   ├── Parking
   ├── Security
   └── Wi-Fi

Property B
   ├── Parking
   └── Security
```

An amenity can therefore be shared by many properties, while a property can contain many amenities.

### Assignment Rules

A property-to-amenity assignment must verify:

1. The property exists.
2. The property is not soft deleted.
3. The amenity exists.
4. The amenity is not soft deleted.
5. The authenticated user is authorized to manage the property.
6. The same amenity is not already assigned to the property.

The composite primary key prevents duplicate assignments at the database level.

### Authorization

Property amenity management follows the existing ownership model:

```text
OWNER
AGENCY
HOTEL
ADMIN
```

A property owner can manage amenities for their own property.

An administrator can bypass ownership restrictions.

A normal `USER` cannot manage property amenities.

---

## Phase 11.7 — Migrations

The Amenities database work introduced two migrations before the final case-insensitive uniqueness constraint:

```text
20260922102715_add_amenity_model
20260923104542_remove_amenity_name_unique
```

Migration `20260923104542_remove_amenity_name_unique` removed the original Prisma `@unique` constraint from `Amenity.name`.

The final case-insensitive uniqueness behavior is enforced through the PostgreSQL functional unique index on:

```text
LOWER(name)
```

### Important Migration Safety Lesson

During development, the applied migration file was temporarily modified after Prisma had already recorded its checksum.

Prisma detected the mismatch and reported that the migration had been modified after application.

The migration was restored to its original applied contents, and its SHA-256 checksum was verified against the checksum recorded by the database.

The database was not reset.

The `_prisma_migrations` table was not manually modified.

This reinforced an important rule:

> Once a migration has been applied to the shared development database, its contents must not be casually edited. Create a new migration for subsequent schema changes.

The actual Giggler Homes database is the `neondb` database in the `public` schema. The Prisma shadow database used during migration operations must not be confused with the application's actual database.

---

## Phase 11.8 — Testing

The Amenities module was tested incrementally.

### CRUD

* [x] List amenities
* [x] Category filtering
* [x] Invalid category rejected
* [x] Admin amenity creation
* [x] Duplicate exact name rejected
* [x] Missing name rejected
* [x] Invalid category rejected
* [x] Non-admin creation rejected
* [x] Get amenity by ID
* [x] Invalid UUID rejected
* [x] Nonexistent amenity returns `404`
* [x] Update amenity
* [x] Partial update
* [x] Empty update rejected
* [x] Soft delete
* [x] Deleted amenity returns `404`
* [x] Deleted amenity excluded from list
* [x] Second delete returns `404`
* [x] Database record retained after soft delete

### Edge Cases

* [x] Case-sensitive duplicate test exposed PostgreSQL's default behavior
* [x] Case-insensitive uniqueness implemented
* [x] Whitespace trimming verified
* [x] Update to an existing amenity name rejected
* [x] Updating a deleted amenity rejected
* [x] Soft-deleted amenity name remains reserved
* [x] Duplicate property-amenity assignments prevented by the composite key

### Database

* [x] Prisma schema validation
* [x] Prisma Client generation
* [x] Database introspection
* [x] Migration synchronization
* [x] Functional unique index for case-insensitive names
* [x] Duplicate normalized-name cleanup before unique-index creation

All planned Amenities tests passed successfully.

---

## Important Amenities Design Decisions

### 1. Amenities are reusable reference data

Amenities are not stored as free-text values directly on properties.

Instead:

```text
Property
   ↓
PropertyAmenity
   ↓
Amenity
```

This keeps amenity names and categories consistent across the platform.

### 2. Amenities are administered centrally

Only administrators can create, modify, and delete amenity definitions.

Property owners and agencies manage which existing amenities belong to their properties rather than creating arbitrary new amenity definitions.

### 3. Soft deletion is used

Amenities use:

```text
deletedAt
```

rather than immediate physical deletion.

This preserves database history and allows future restoration strategies.

### 4. Case-insensitive uniqueness is enforced by PostgreSQL

The application should not be the only protection against duplicate logical names.

The database enforces:

```sql
UNIQUE (LOWER(name))
```

This protects the invariant even if another code path attempts to bypass the service-level duplicate check.

### 5. Stored casing is preserved

The system normalizes input for comparison but does not force all stored amenity names to lowercase.

### 6. PropertyAmenity uses a composite primary key

```prisma
@@id([propertyId, amenityId])
```

This makes duplicate property-to-amenity assignments impossible at the database level.

### 7. Property ownership remains separate from role authorization

The authorization model continues to distinguish:

```text
Role authorization
        ↓
Can this role manage property amenities?

Ownership authorization
        ↓
Does this user own this property?
```

Administrators can bypass the ownership restriction.

---

## Amenities Module Structure

The Amenities implementation follows the project's modular structure:

```text
src/modules/amenity/
├── amenity.controller.ts
├── amenity.routes.ts
├── amenity.service.ts
└── amenity.validation.ts
```

The PropertyAmenity assignment implementation is part of the property/amenity domain and should remain consistent with the established module architecture.

---

## Phase 11 Result

The Amenities domain is complete.

The backend now supports:

```text
Amenity definitions
        ↓
Amenity categories
        ↓
Case-insensitive unique names
        ↓
Administrative CRUD
        ↓
Soft deletion
        ↓
Property ↔ Amenity relationships
        ↓
Ownership authorization
        ↓
Duplicate-assignment protection
```

---

# Phase 12 — Favorites

**Status:** Complete 🔥

## Goal

Build a user-facing Favorites system that allows authenticated users to save active listings, view their saved listings, check favorite status, and remove favorites.

The Favorites domain is intentionally **Listing-based** rather than Property-based because users save a specific market-facing listing.

---

## Phase 12.1 — Architecture and Data Model

### Relationship

Favorites represent a many-to-many relationship between Users and Listings:

```text
User
 │
 │ 1
 │
 │ N
Favorite
 │
 │ N
 │
 │ 1
Listing
```

A user can favorite many listings, and a listing can be favorited by many users.

### Favorite Model

The current Prisma model contains:

```text
userId
listingId
createdAt
```

The relationship is represented through:

```prisma
@@id([userId, listingId])
```

This composite primary key prevents the same user from favoriting the same listing more than once.

The model also contains relations to:

```text
User
Listing
```

with cascade deletion at the database relationship level.

### Why the Favorite Targets Listing

A Property represents the underlying real-world property, while a Listing represents a market-facing offer.

Favorites therefore attach to:

```text
User
 ↓
Favorite
 ↓
Listing
 ↓
Property
```

This keeps the saved item aligned with what the user actually discovers in the marketplace.

---

## Phase 12.2 — Database Migration

The Favorite model was added through a Prisma migration.

Development workflow:

```text
Prisma schema
      ↓
Migration
      ↓
Neon PostgreSQL
      ↓
Prisma Client
```

The migration creates the Favorite table with:

```text
PRIMARY KEY (userId, listingId)
```

and an index on:

```text
listingId
```

The `listingId` index supports efficient listing-level favorite lookups and future favorite-count queries.

### Migration Connectivity Issue

During the initial migration attempt, Prisma returned:

```text
P1001: Can't reach database server
```

The database was then verified successfully using:

```powershell
npx prisma db pull
```

which successfully introspected the existing database.

The local `Favorite` model was restored after introspection and the migration was subsequently applied successfully.

No database reset was performed.

---

## Phase 12.3 — Favorite Validation

Favorite requests use Zod validation.

### Listing-Based Operations

The following operations validate:

```text
listingId
```

as a UUID:

```http
POST   /api/v1/favorites/:listingId
GET    /api/v1/favorites/:listingId
DELETE /api/v1/favorites/:listingId
```

Invalid UUID values are rejected before reaching the service layer.

### Favorite List

The user's favorite list supports:

```text
page
limit
```

Pagination values are coerced from Express query strings into numbers.

The limit is constrained to a maximum of:

```text
100
```

This prevents unbounded list requests.

---

## Phase 12.4 — Favorite Service

The Favorite service contains the business rules for creating, removing, checking, and retrieving favorites.

### Create Favorite

The creation flow is:

```text
Authenticated user
       ↓
Find listing
       ↓
Verify listing is ACTIVE
       ↓
Check existing Favorite
       ↓
Create Favorite
```

Only listings with:

```text
ACTIVE
```

status can be favorited.

The following listing states cannot be newly favorited:

```text
DRAFT
PENDING_REVIEW
REJECTED
EXPIRED
SOLD
RENTED
ARCHIVED
```

### Duplicate Protection

The service checks for an existing Favorite using:

```text
userId + listingId
```

A duplicate request returns:

```http
409 Conflict
```

The composite primary key provides an additional database-level protection against duplicate records.

### Remove Favorite

Removing a favorite requires both:

```text
userId
listingId
```

This ensures a user can only remove their own favorite.

A missing Favorite returns:

```http
404 Not Found
```

### Favorite Status

The status operation returns:

```json
{
  "isFavorited": true,
  "createdAt": "..."
}
```

or:

```json
{
  "isFavorited": false,
  "createdAt": null
}
```

This is designed to support frontend favorite controls such as saved/unsaved heart buttons.

### My Favorites

The user's favorites are returned in descending creation order.

The response includes pagination information:

```text
page
limit
total
totalPages
```

The query retrieves the associated Listing and Property data required to render saved listings.

### No Soft Deletion

Favorites do not use `deletedAt`.

Unlike Media and Amenities, a Favorite represents a lightweight user interaction.

The operations are therefore:

```text
POST    → INSERT
DELETE  → DELETE
```

rather than soft deletion.

---

## Phase 12.5 — Controller and Routes

The Favorites module follows the standard modular architecture:

```text
src/modules/favorite/
├── favorite.controller.ts
├── favorite.routes.ts
├── favorite.service.ts
└── favorite.validation.ts
```

### Authentication

All Favorite routes use:

```text
authenticate
```

at the router level.

Therefore anonymous users cannot create, remove, inspect, or retrieve Favorites.

The authenticated user's ID is obtained from:

```text
req.user.id
```

The client never supplies the `userId`.

This prevents users from attempting to manipulate another user's Favorite records by changing a request body or URL.

### API Endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/v1/favorites` | Required | Get the authenticated user's favorites |
| GET | `/api/v1/favorites/:listingId` | Required | Check favorite status for a listing |
| POST | `/api/v1/favorites/:listingId` | Required | Favorite an active listing |
| DELETE | `/api/v1/favorites/:listingId` | Required | Remove the authenticated user's favorite |

### Router Registration

The router is registered under:

```text
/api/v1/favorites
```

The complete route flow is:

```text
Request
  ↓
Favorite Router
  ↓
authenticate
  ↓
validateRequest
  ↓
Favorite Controller
  ↓
Favorite Service
  ↓
Prisma
```

---

## Phase 12.6 — Authorization and Security

Favorites do not require a role-specific restriction such as:

```text
authorizeRoles("ADMIN")
```

Any authenticated user role can use the Favorites feature.

The important authorization boundary is **resource ownership**:

```text
JWT
 ↓
req.user.id
 ↓
Favorite.userId
```

A user can only operate on their own Favorite records.

### Authenticated Roles

The Favorite feature is available to authenticated users regardless of whether their role is:

```text
USER
OWNER
AGENCY
HOTEL
ADMIN
```

The requirement is authentication, not a particular role.

### Listing Eligibility

A listing must be active to receive a new Favorite.

This prevents users from newly saving listings that are no longer available in the marketplace.

Existing Favorite records are not automatically deleted when a listing later becomes inactive.

This preserves the user's saved-list history and leaves the presentation/filtering decision to the Favorites retrieval layer.

---

## Phase 12.7 — Testing

The Favorites module was tested through Postman after implementation.

### Initial Favorites

* [x] Get favorites for authenticated user
* [x] Empty favorites response
* [x] Pagination response

### Creation

* [x] Favorite active listing
* [x] Successful `201 Created` response
* [x] Favorite record created in database

### Status

* [x] Check favorited listing
* [x] `isFavorited: true`
* [x] Check after removal
* [x] `isFavorited: false`

### Retrieval

* [x] Get authenticated user's favorites
* [x] Favorite total count
* [x] Pagination metadata
* [x] Listing data returned with favorites

### Duplicate Protection

* [x] Duplicate favorite rejected
* [x] `409 Conflict` returned

### Validation

* [x] Invalid listing UUID rejected
* [x] `400 Bad Request` returned

### Resource Handling

* [x] Nonexistent listing rejected
* [x] `404 Not Found` returned
* [x] Inactive listing rejected
* [x] `404 Not Found` returned

### Authentication

* [x] Missing access token rejected
* [x] `401 Unauthorized` returned

### Removal

* [x] Remove existing favorite
* [x] `200 OK` returned
* [x] Remove nonexistent favorite
* [x] `404 Not Found` returned

### Type and Database Checks

* [x] Prisma Client generated
* [x] TypeScript type checking passed
* [x] Prisma migration applied
* [x] Favorite composite primary key verified through successful duplicate protection

All planned Favorites tests passed successfully.

---

## Phase 12.8 — Important Favorites Design Decisions

### 1. Favorites belong to Listings

Favorites target Listings rather than Properties:

```text
User
 ↓
Favorite
 ↓
Listing
 ↓
Property
```

This keeps the saved item aligned with the marketplace offer.

### 2. Composite Primary Key

The database uses:

```prisma
@@id([userId, listingId])
```

This prevents duplicate favorites at the database level.

### 3. Authentication Rather Than Role Restriction

Favorites are a consumer feature available to all authenticated roles.

### 4. User ID Comes From the JWT

The API never accepts a user ID for Favorite creation or deletion.

The authenticated identity determines the Favorite owner.

### 5. Only Active Listings Can Be Newly Favorited

The service verifies:

```text
Listing.status = ACTIVE
```

before creating a Favorite.

### 6. Favorites Are Hard-Deleted

Unfavoriting removes the Favorite record rather than setting a `deletedAt` timestamp.

### 7. Existing Favorites Are Retained When Listings Become Inactive

A listing changing from:

```text
ACTIVE
```

to:

```text
SOLD
EXPIRED
RENTED
ARCHIVED
```

does not automatically remove existing Favorite records.

This preserves user history.

### 8. Pagination Is Built In

The user's Favorites endpoint supports pagination from the beginning rather than returning an unbounded collection.

---

## Phase 12.9 — Problems Encountered

### Prisma Database Connectivity During Migration

#### Problem

The first migration attempt returned:

```text
P1001: Can't reach database server
```

#### Investigation

The database connection was tested using:

```powershell
npx prisma db pull
```

The command successfully connected to Neon and introspected the existing models.

#### Resolution

The local Favorite model was restored after introspection and the migration was rerun successfully.

No database reset was performed.

---

### Prisma Type Error in Existing Amenity Service

#### Problem

After generating Prisma Client, TypeScript reported:

```text
Type '{ name: string; }' is not assignable to type 'AmenityWhereUniqueInput'
```

The problem occurred because the Amenities implementation had intentionally removed Prisma's:

```prisma
name @unique
```

constraint in favor of the PostgreSQL expression index:

```sql
LOWER("name")
```

Therefore Prisma could no longer use:

```typescript
findUnique({
  where: {
    name: data.name,
  },
})
```

#### Resolution

The lookup was changed to a case-insensitive `findFirst()` query.

The PostgreSQL functional unique index remains the final database-level uniqueness guarantee.

Type checking subsequently passed.

---

## Phase 12.10 — Result

The Favorites domain is complete.

The backend now supports:

```text
Authenticated user
       ↓
View favorites
       ↓
Favorite active listing
       ↓
Check favorite status
       ↓
Remove favorite
```

with:

```text
Authentication
      ↓
UUID validation
      ↓
Listing eligibility
      ↓
Duplicate protection
      ↓
User ownership
      ↓
Pagination
      ↓
Database constraints
```

The Favorites feature is now ready for frontend integration.

---

# Current Backend Milestone

```text
Phase 1  ✅ Backend Project Setup
Phase 2  ✅ Express Configuration
Phase 3  ✅ API Structure and Error Handling
Phase 4  ✅ PostgreSQL + Neon + Prisma
Phase 5  ✅ User Database Foundation
Phase 6  ✅ Authentication
Phase 7  ✅ Role-Based Authorization
Phase 8  ✅ Property Foundation
Phase 9  ✅ Listing Module
Phase 10 ✅ Media Management
Phase 11 ✅ Amenities
Phase 12 ✅ Favorites
Phase 13 ✅ Inquiries

Phase 14 ⏭️ Verification
```

## Current Project Structure

```text
Authentication       ✅
Authorization        ✅
Property Foundation  ✅
Listing Module       ✅
Media Module         ✅
Amenities Module     ✅
Favorites Module     ✅
Inquiry Module       ✅
Verification Module  ⏭️
Reports Module       ⏳
Administration       ⏳
```

---

# Phase 13 — Inquiries

**Status:** Complete 🔥

## Goal

Build the Inquiry domain so authenticated users can contact the owner of an active listing while enforcing ownership, duplicate-open-inquiry, lifecycle, and authorization rules.

The Inquiry domain is intentionally **Listing-based** rather than Property-based because the inquiry is about a specific market-facing listing.

---

## Phase 13.1 — Business Rules

| Area | Rule |
|---|---|
| Sender | Any authenticated user |
| Recipient | Denormalized `ownerId`, captured once at creation |
| Self-inquiry | Blocked |
| Listing eligibility | Listing must be `ACTIVE` |
| Duplicate rule | Only one `OPEN` inquiry per `(senderId, listingId)` |
| After closure | Sender may create a new inquiry after the previous inquiry is `CLOSED` |
| Message | One initial message; no threaded replies in V1 |
| Status flow | `OPEN → RESPONDED → CLOSED` |
| Backward transitions | Not allowed |
| Sender closing | Sender may transition an inquiry to `CLOSED` |
| Owner closing | Owner may transition an inquiry to `CLOSED` |
| Admin | Full unrestricted access |
| Recipient storage | `ownerId` is captured at creation |
| Ownership source | `listing.property.ownerId` at creation |

### Recipient Snapshot

The Inquiry stores:

```text
ownerId
```

even though the current property owner can be reached through:

```text
Inquiry
   ↓
Listing
   ↓
Property
   ↓
User
```

This is intentional denormalization. The stored `ownerId` is a historical snapshot of the recipient when the inquiry was created.

If property ownership changes later, an existing inquiry remains associated with the original recipient.

---

## Phase 13.2 — Data Model

### Inquiry Status

```prisma
enum InquiryStatus {
  OPEN
  RESPONDED
  CLOSED
}
```

Lifecycle:

```text
OPEN
  ↓
RESPONDED
  ↓
CLOSED
```

Backward transitions are not supported.

### Inquiry Model

The current model contains:

```text
id
listingId
senderId
ownerId
message
status
createdAt
updatedAt
respondedAt
closedAt
```

Relations:

```text
User
 ├── sentInquiries
 │       ↓
 │    Inquiry
 │       ↓
 │    Listing
 │       ↓
 │    Property
 │
 └── receivedInquiries
         ↓
      Inquiry
```

The User relations are explicitly named:

```prisma
sentInquiries     Inquiry[] @relation("InquirySender")
receivedInquiries Inquiry[] @relation("InquiryOwner")
```

The Listing model also exposes:

```prisma
inquiries Inquiry[]
```

Indexes are defined on:

```text
listingId
senderId
ownerId
status
createdAt
```

---

## Phase 13.3 — Conditional Database Uniqueness

The business rule requires one `OPEN` inquiry per sender/listing pair while allowing multiple closed historical inquiries.

A normal Prisma `@@unique([senderId, listingId])` would be too restrictive.

PostgreSQL therefore enforces the rule with a partial unique index:

```sql
CREATE UNIQUE INDEX "Inquiry_open_sender_listing_key"
ON "Inquiry"("senderId", "listingId")
WHERE "status" = 'OPEN';
```

Expected behavior:

```text
User A → Listing 1 → OPEN       ✅
User A → Listing 1 → OPEN       ❌ 409

User A → Listing 1 → CLOSED     ✅
User A → Listing 1 → CLOSED     ✅

User A → Listing 1 → CLOSED
User A → Listing 1 → OPEN       ✅
```

The service checks for an existing open inquiry first, while the database constraint provides the final integrity guarantee.

### Migration Incident and Resolution

The initial Inquiry model migration was:

```text
20260929104926_add_inquiry_model
```

The partial unique index was initially added to that already-applied migration. Prisma detected the modified migration and reported:

```text
The migration 20260929104926_add_inquiry_model
was modified after it was applied.
```

The original applied migration was restored.

No:

```text
prisma migrate reset
```

was performed, and `_prisma_migrations` was not manually modified.

After restoration:

```text
17 migrations found in prisma/migrations
Database schema is up to date!
```

Because Prisma did not represent the PostgreSQL-specific partial index as a normal schema change, a separate migration was created with:

```powershell
npx prisma migrate dev --create-only --name add_inquiry_open_unique_index
```

The custom SQL was placed in that new migration and applied successfully.

### Migration Safety Lesson

> Once a migration has been applied, freeze that migration file. Database-specific SQL changes should be introduced through a new migration.

---

## Phase 13.4 — Validation

Inquiry requests use Zod validation.

### Create Inquiry

The create request validates:

```text
listingId
message
```

Rules:

```text
listingId → UUID
message   → trimmed string
message   → minimum 1 character
message   → maximum 2000 characters
```

The message schema is:

```ts
z.string()
  .trim()
  .min(1, "Message is required")
  .max(2000, "Message must not exceed 2000 characters")
```

### Inquiry ID

Inquiry-specific operations validate `inquiryId` as a UUID.

### Inquiry Lists

The sent and received endpoints support:

```text
page
limit
status
```

with:

```text
page   → integer >= 1
limit  → integer >= 1
limit  → maximum 100
status → OPEN | RESPONDED | CLOSED
```

Query-string pagination values are coerced into numbers before reaching the service.

---

## Phase 13.5 — Inquiry Service

### Create Inquiry Flow

```text
Authenticated user
       ↓
Find Listing
       ↓
Verify Listing exists
       ↓
Verify Listing.status = ACTIVE
       ↓
Read listing.property.ownerId
       ↓
Block self-inquiry
       ↓
Check existing OPEN inquiry
       ↓
Create Inquiry
       ↓
Return Inquiry
```

The client does not supply `ownerId`.

### Active Listing Requirement

Only `ACTIVE` listings can receive new inquiries.

Inactive listings return:

```http
404 Not Found
```

### Self-Inquiry Protection

If:

```text
senderId === listing.property.ownerId
```

the request returns:

```http
403 Forbidden
```

### Duplicate OPEN Protection

The service checks:

```text
listingId
senderId
status = OPEN
```

An existing open inquiry returns:

```http
409 Conflict
```

The service also catches Prisma `P2002` and converts it into the same business response, protecting the rule under concurrent creation attempts.

---

## Phase 13.6 — Retrieval and Lifecycle Management

### Sent Inquiries

```http
GET /api/v1/inquiries/sent
```

Filters by:

```text
senderId = req.user.id
```

and supports pagination and optional status filtering.

Results are ordered by:

```text
createdAt DESC
```

### Received Inquiries

```http
GET /api/v1/inquiries/received
```

Filters by:

```text
ownerId = req.user.id
```

and supports pagination and optional status filtering.

### Individual Inquiry

```http
GET /api/v1/inquiries/:inquiryId
```

Allowed viewers:

```text
sender
owner
ADMIN
```

An unrelated authenticated user receives `403 Forbidden`.

### Respond

```http
PATCH /api/v1/inquiries/:inquiryId/respond
```

Allowed roles/relationship:

```text
owner
ADMIN
```

Valid transition:

```text
OPEN → RESPONDED
```

The operation sets:

```text
respondedAt
```

A sender cannot respond, and an already responded or closed inquiry cannot be responded to again.

### Close

```http
PATCH /api/v1/inquiries/:inquiryId/close
```

Allowed:

```text
sender
owner
ADMIN
```

Valid transitions:

```text
OPEN → CLOSED
RESPONDED → CLOSED
```

The operation sets:

```text
closedAt
```

A closed inquiry cannot be closed again.

---

## Phase 13.7 — Controller Layer

The module contains:

```text
createInquiryController
getSentInquiriesController
getReceivedInquiriesController
getInquiryByIdController
respondToInquiryController
closeInquiryController
```

Controllers remain thin:

```text
Read validated request data
        ↓
Read req.user
        ↓
Call service
        ↓
Return HTTP response
```

Business rules remain in the service layer.

The authenticated identity comes from:

```text
req.user.id
```

and administrative access is determined from the authenticated user's role.

---

## Phase 13.8 — Routes

All Inquiry routes use authentication at the router level.

Base path:

```text
/api/v1/inquiries
```

### API Endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/v1/inquiries/listings/:listingId` | Required | Create inquiry for an active listing |
| GET | `/api/v1/inquiries/sent` | Required | Get inquiries sent by the authenticated user |
| GET | `/api/v1/inquiries/received` | Required | Get inquiries received by the authenticated user |
| GET | `/api/v1/inquiries/:inquiryId` | Required | Get one inquiry |
| PATCH | `/api/v1/inquiries/:inquiryId/respond` | Required | Owner/Admin responds |
| PATCH | `/api/v1/inquiries/:inquiryId/close` | Required | Sender/Owner/Admin closes |

Static routes:

```text
/sent
/received
```

are defined before:

```text
/:inquiryId
```

so the generic parameter route does not capture the static route names.

### Route Flow

```text
Request
  ↓
Inquiry Router
  ↓
authenticate
  ↓
validateRequest
  ↓
Inquiry Controller
  ↓
Inquiry Service
  ↓
Prisma
```

Resource-level authorization is enforced in the service because it depends on the relationship between the authenticated user and the inquiry.

---

## Phase 13.9 — Authentication and Authorization

All Inquiry operations require authentication.

Anonymous requests receive:

```http
401 Unauthorized
```

### Create

Any authenticated user may create an inquiry if:

```text
Listing exists
Listing is ACTIVE
Sender is not owner
No OPEN inquiry already exists
```

### Read

An individual inquiry is accessible to:

```text
sender
owner
ADMIN
```

### Respond

Only:

```text
owner
ADMIN
```

can perform:

```text
OPEN → RESPONDED
```

### Close

The following can close:

```text
sender
owner
ADMIN
```

### Admin

Administrators have unrestricted Inquiry access.

---

## Phase 13.10 — Testing

The Inquiry module was tested through normal, failure, authorization, lifecycle, and database-integrity scenarios.

### Creation

- [x] Valid inquiry creation
- [x] `201 Created`
- [x] Returned inquiry verified
- [x] Listing association verified
- [x] Sender association verified
- [x] Owner association verified
- [x] Message stored correctly
- [x] Initial status is `OPEN`

### Duplicate and Listing Rules

- [x] Duplicate `OPEN` inquiry rejected with `409`
- [x] Partial unique index verified
- [x] Multiple `CLOSED` inquiries allowed
- [x] New inquiry allowed after previous inquiry is `CLOSED`
- [x] Inactive listing rejected
- [x] Nonexistent listing rejected
- [x] Invalid listing UUID rejected
- [x] Self-inquiry rejected

### Retrieval

- [x] Sent inquiries
- [x] Received inquiries
- [x] Pagination
- [x] Status filtering
- [x] Individual inquiry as sender
- [x] Individual inquiry as owner
- [x] Admin retrieval
- [x] Unrelated-user access rejected
- [x] Nonexistent inquiry returns `404`
- [x] Invalid inquiry UUID returns `400`

### Lifecycle

- [x] Owner responds
- [x] `RESPONDED` verified
- [x] `respondedAt` verified
- [x] Sender cannot respond
- [x] Owner cannot respond twice
- [x] Sender closes
- [x] `CLOSED` verified
- [x] `closedAt` verified
- [x] Owner closes
- [x] Admin responds
- [x] Admin closes
- [x] Responding to `CLOSED` rejected
- [x] Closing already `CLOSED` rejected
- [x] Invalid lifecycle transitions rejected

### Validation

- [x] Empty message rejected
- [x] Message over 2000 characters rejected
- [x] Invalid status rejected
- [x] Invalid page rejected
- [x] Invalid limit rejected
- [x] Invalid UUID rejected

### Authentication and Authorization

- [x] Unauthenticated create rejected
- [x] Unauthenticated retrieval rejected
- [x] Unauthenticated lifecycle operation rejected
- [x] Unrelated user cannot respond
- [x] Unrelated user cannot close
- [x] Sender cannot respond
- [x] Owner can respond
- [x] Sender can close
- [x] Owner can close
- [x] Admin unrestricted access

### Data Integrity

- [x] `ownerId` snapshot verified
- [x] `createdAt` verified
- [x] `updatedAt` verified
- [x] `respondedAt` verified
- [x] `closedAt` verified
- [x] Partial unique index verified
- [x] Multiple closed inquiries verified

### Development Checks

- [x] Prisma Client generated
- [x] `npm run type-check`
- [x] `npx prisma validate`
- [x] `npx prisma migrate status`
- [x] Database schema synchronized

**All Phase 13 tests passed successfully.**

---

## Phase 13.11 — Problems Encountered

### Incorrect Prisma Model Used During Create

The initial create service attempted to query the Inquiry model when it needed to find the Listing.

The lookup was corrected to:

```ts
const listing = await prisma.listing.findUnique({
  where: { id: listingId },
  include: {
    property: {
      select: { ownerId: true },
    },
  },
});
```

The correct flow is:

```text
listingId
   ↓
Listing
   ↓
Property.ownerId
   ↓
Inquiry
```

### Incorrect User Field Names

The first returned relation selection used a `name` field.

The actual User model uses:

```text
firstName
lastName
```

The service was corrected to select:

```text
id
firstName
lastName
email
```

The creation test and type checking then passed.

### Applied Migration Modified

The partial unique index was initially added to an already-applied migration.

Prisma detected the checksum mismatch.

The original migration was restored and the partial unique index was moved into its own new migration.

No database reset was performed.

---

## Phase 13.12 — Important Design Decisions

### 1. Inquiries Belong to Listings

The Inquiry targets a specific Listing rather than a Property.

```text
Inquiry
   ↓
Listing
   ↓
Property
```

This keeps the inquiry tied to the marketplace offer the user actually viewed.

### 2. Recipient Is Snapshotted

`ownerId` is captured at creation.

This preserves the original recipient if property ownership later changes.

### 3. One Initial Message in V1

The Inquiry has one initial:

```text
message
```

field.

V1 does not implement threaded messages. A future messaging system can be introduced independently.

### 4. Explicit Lifecycle Operations

There is no generic arbitrary-status endpoint.

Instead:

```text
/respond
/close
```

represent the supported business operations.

### 5. Database-Enforced OPEN Uniqueness

The service performs an application-level check, while PostgreSQL enforces:

```sql
WHERE "status" = 'OPEN'
```

This protects the invariant under concurrent requests.

### 6. Different Sender and Owner Capabilities

```text
Sender
  └── can close

Owner
  ├── can respond
  └── can close

Admin
  └── unrestricted
```

### 7. Closed Inquiries Are Retained

Closed inquiries remain in the database for historical purposes.

A later inquiry can be created after the previous one is closed.

### 8. Ownership Is Not Reassigned Historically

Existing `ownerId` values are not rewritten when property ownership changes.

---

## Phase 13.13 — Inquiry Module Structure

```text
src/modules/inquiry/
├── inquiry.controller.ts
├── inquiry.routes.ts
├── inquiry.service.ts
└── inquiry.validation.ts
```

The Prisma schema contains the Inquiry model and the required named User and Listing relations.

---

## Phase 13.14 — Phase Result

The Inquiry domain is complete.

The backend now supports:

```text
Authenticated user
       ↓
Select active listing
       ↓
Create inquiry
       ↓
Listing owner receives inquiry
       ↓
Owner responds
       ↓
Sender / Owner / Admin can close
```

with:

```text
Authentication
      ↓
UUID validation
      ↓
Active-listing validation
      ↓
Self-inquiry protection
      ↓
OPEN inquiry uniqueness
      ↓
Sender/Owner authorization
      ↓
Explicit lifecycle transitions
      ↓
Timestamp tracking
      ↓
Database integrity
```

The Inquiry feature is ready for frontend integration.

---

# Phase 14 — Verification

## Goal

Phase 14 introduces the Giggler Homes verification domain. The purpose is to establish trustworthy evidence around three distinct claims:

1. **User Verification** — proves that an account is associated with a real person.
2. **Ownership Verification** — proves that a specific property is legitimately associated with its owner.
3. **Business Verification** — proves that an AGENCY or HOTEL account represents a legitimate business.

Verification evidence is represented by a shared `VerificationDocument` model. Verification documents are private evidence and are deliberately kept separate from normal public property/listing media.

The phase follows the established backend workflow:

```text
Business Rules
      ↓
Data Model
      ↓
Migration
      ↓
Validation
      ↓
Services
      ↓
Controllers
      ↓
Routes
      ↓
Authorization
      ↓
Testing
      ↓
Documentation
```

---

## Phase 14.1 — Business Rules

### Verification Types

The V1 verification domain contains three verification records:

| Verification | What it establishes | Who can submit | Who reviews |
|---|---|---|---|
| UserVerification | Account identity | Any authenticated user | ADMIN |
| OwnershipVerification | Property ownership/association | Property owner | ADMIN |
| BusinessVerification | Legitimate agency/hotel business | AGENCY or HOTEL | ADMIN |

There is no separate `ListingVerification` model in V1. Listing trust can derive from the verification state of the underlying property and relevant account.

### Verification Lifecycle

The lifecycle is intentionally small:

```text
PENDING
   ├──→ VERIFIED
   └──→ REJECTED
             │
             └──→ PENDING  (resubmission)
```

Rules:

- A `PENDING` verification cannot be submitted again.
- A `VERIFIED` verification cannot be resubmitted.
- A `REJECTED` verification can be resubmitted using the same verification record.
- Resubmission changes the record back to `PENDING`.
- Resubmission clears previous review metadata and the rejection reason.
- Only an ADMIN can approve or reject.
- Only a `PENDING` verification can be approved or rejected.
- V1 does not implement an `EXPIRED` state.

### User Verification Rules

- Any authenticated account may submit identity verification.
- The client controls neither `userId` nor reviewer identity.
- The user ID always comes from the authenticated JWT.
- Identity document types are restricted to the supported identity enum values.

### Ownership Verification Rules

- The property must exist.
- V1 submission is restricted to the property's current owner.
- Agency delegation is intentionally not supported yet because a separate delegation/authorization model has not been introduced.
- The authenticated user's identity is used as `submittedById`.
- Other users cannot submit or retrieve another owner's ownership verification.
- ADMIN can retrieve and review ownership verification.

### Business Verification Rules

- Only `AGENCY` and `HOTEL` accounts can submit business verification.
- `businessType` must match the authenticated user's role.
- A USER, OWNER, or other non-business role cannot submit business verification.
- Business verification belongs to the account through `ownerId`.
- The client cannot choose a different `ownerId`.

### Evidence Rules

Verification evidence is not ordinary listing/property media.

`VerificationDocument` is intended for private verification evidence such as:

- National ID
- Passport
- Voter's ID
- Driver's License
- Property deed
- Utility bill
- Lease agreement
- Business registration evidence

Documents are associated with exactly one verification parent by service-layer rules. Prisma provides the three nullable foreign keys, while the service layer ensures that a document is not attached to multiple verification parents or to none.

---

## Phase 14.2 — Data Model

### VerificationStatus

```prisma
enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### BusinessType

```prisma
enum BusinessType {
  AGENCY
  HOTEL
}
```

### VerificationDocumentType

```prisma
enum VerificationDocumentType {
  NATIONAL_ID
  PASSPORT
  VOTERS_ID
  DRIVERS_LICENSE

  PROPERTY_DEED
  UTILITY_BILL
  LEASE_AGREEMENT

  BUSINESS_REGISTRATION
}
```

### UserVerification

```prisma
model UserVerification {
  id              String                   @id @default(cuid())
  userId          String                   @unique
  user            User                     @relation(fields: [userId], references: [id], onDelete: Cascade)

  status          VerificationStatus       @default(PENDING)
  idType          VerificationDocumentType
  idNumber        String

  documents       VerificationDocument[]

  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?

  reviewer User? @relation(
    "UserVerificationReviewer",
    fields: [reviewedBy],
    references: [id],
    onDelete: SetNull
  )

  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
}
```

### OwnershipVerification

```prisma
model OwnershipVerification {
  id              String                   @id @default(cuid())

  propertyId      String                   @unique
  property        Property                 @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  submittedById   String
  submittedBy     User                     @relation("OwnershipVerificationSubmitter", fields: [submittedById], references: [id], onDelete: Cascade)

  proofType       VerificationDocumentType

  documents       VerificationDocument[]

  status          VerificationStatus       @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?

  reviewer User? @relation(
    "OwnershipVerificationReviewer",
    fields: [reviewedBy],
    references: [id],
    onDelete: SetNull
  )

  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
}
```

### BusinessVerification

```prisma
model BusinessVerification {
  id                 String                   @id @default(cuid())

  ownerId            String                   @unique
  owner              User                     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  businessType       BusinessType
  businessName       String
  registrationNumber String

  documents          VerificationDocument[]

  status             VerificationStatus       @default(PENDING)
  reviewedBy         String?
  reviewedAt         DateTime?
  rejectionReason    String?

  reviewer User? @relation(
    "BusinessVerificationReviewer",
    fields: [reviewedBy],
    references: [id],
    onDelete: SetNull
  )

  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt
}
```

### VerificationDocument

```prisma
model VerificationDocument {
  id         String                   @id @default(cuid())
  storageKey String
  fileUrl    String?
  docType    VerificationDocumentType
  uploadedAt DateTime                 @default(now())

  userVerificationId      String?
  userVerification        UserVerification?      @relation(fields: [userVerificationId], references: [id], onDelete: Cascade)

  ownershipVerificationId String?
  ownershipVerification   OwnershipVerification? @relation(fields: [ownershipVerificationId], references: [id], onDelete: Cascade)

  businessVerificationId  String?
  businessVerification    BusinessVerification?  @relation(fields: [businessVerificationId], references: [id], onDelete: Cascade)

  @@index([userVerificationId])
  @@index([ownershipVerificationId])
  @@index([businessVerificationId])
}
```

### User Relations

The User model was extended with:

```prisma
userVerification UserVerification?
businessVerification BusinessVerification?

submittedOwnershipVerifications OwnershipVerification[]
  @relation("OwnershipVerificationSubmitter")

reviewedVerifications UserVerification[]
  @relation("UserVerificationReviewer")

reviewedOwnershipVerifications OwnershipVerification[]
  @relation("OwnershipVerificationReviewer")

reviewedBusinessVerifications BusinessVerification[]
  @relation("BusinessVerificationReviewer")
```

### Property Relation

The Property model was extended with:

```prisma
ownershipVerification OwnershipVerification?
```

### Identifier Design

The verification models use CUID primary keys while existing property/user identifiers use UUIDs.

Therefore:

```text
Verification ID → z.cuid()
Property ID     → z.uuid()
User ID         → z.uuid()
```

This distinction is important when defining route validation.

---

## Phase 14.3 — Database Migration

The verification models were migrated into PostgreSQL without resetting the database.

Migration workflow:

```bash
npx prisma format
npx prisma validate
npm run type-check
npx prisma migrate dev --name add_verification_models
npx prisma migrate status
npx prisma generate
```

The existing database history was preserved. The migration was applied normally and the Prisma client was regenerated afterward.

### Migration Safety Rule

As established in earlier phases, an already-applied migration is treated as immutable. If additional database-specific SQL or structural changes are required after a migration has been applied, create a new migration rather than editing migration history.

---

## Phase 14.4 — Validation

Validation uses Zod and follows the existing request-validation middleware.

### User Verification

```ts
export const createUserVerificationSchema = z.object({
  body: z.object({
    idType: z.enum([
      "NATIONAL_ID",
      "PASSPORT",
      "VOTERS_ID",
      "DRIVERS_LICENSE",
    ]),
    idNumber: z.string().trim().min(1).max(100),
  }),
});
```

### Ownership Verification

```ts
export const createOwnershipVerificationSchema = z.object({
  params: z.object({
    propertyId: z.uuid(),
  }),
  body: z.object({
    proofType: z.enum([
      "PROPERTY_DEED",
      "UTILITY_BILL",
      "LEASE_AGREEMENT",
    ]),
  }),
});

export const ownershipPropertyIdSchema = z.object({
  params: z.object({
    propertyId: z.uuid(),
  }),
});
```

### Business Verification

```ts
export const createBusinessVerificationSchema = z.object({
  body: z.object({
    businessType: z.enum(["AGENCY", "HOTEL"]),
    businessName: z.string().trim().min(1).max(200),
    registrationNumber: z.string().trim().min(1).max(100),
  }),
});
```

### Verification IDs

Verification IDs are CUIDs:

```ts
export const verificationIdSchema = z.object({
  params: z.object({
    verificationId: z.cuid(),
  }),
});
```

The rejection schema uses the same CUID validation and requires a non-empty rejection reason with a maximum of 1,000 characters.

### Validation Design

The client cannot submit security-sensitive identifiers such as:

- `userId`
- `submittedById`
- `ownerId`
- `reviewedBy`
- `status`

These values are determined by the authenticated identity, resource ownership, role authorization, or server-side lifecycle logic.

---

## Phase 14.5 — Service Layer

The service layer contains the business rules and prevents controllers from becoming authorization/business-logic containers.

### User Verification Services

Implemented:

```text
createUserVerification(userId, idType, idNumber)
getUserVerification(userId)
approveUserVerification(verificationId, adminId)
rejectUserVerification(verificationId, adminId, rejectionReason)
```

Behavior:

- No existing record → create `PENDING`.
- Existing `PENDING` → 409.
- Existing `VERIFIED` → 409.
- Existing `REJECTED` → update same row to `PENDING`.
- Resubmission clears `reviewedBy`, `reviewedAt`, and `rejectionReason`.
- Approval requires `PENDING`.
- Rejection requires `PENDING`.
- Reviewer identity is connected through Prisma's nested relation syntax.

Example reviewer assignment:

```ts
reviewer: {
  connect: { id: adminId },
}
```

### Ownership Verification Services

Implemented:

```text
createOwnershipVerification(propertyId, submittedById, proofType)
getOwnershipVerification(propertyId, userId, isAdmin)
approveOwnershipVerification(verificationId, adminId)
rejectOwnershipVerification(verificationId, adminId, rejectionReason)
```

Behavior:

- Property must exist.
- Submission is allowed only when `property.ownerId === submittedById`.
- Cross-owner submission → 403.
- Owner retrieval is allowed.
- Non-owner retrieval → 403.
- ADMIN retrieval is allowed.
- Existing `PENDING` → 409.
- Existing `VERIFIED` → 409.
- `REJECTED` can be resubmitted to `PENDING`.
- Only ADMIN can approve/reject.

### Business Verification Services

Implemented:

```text
createBusinessVerification(userId, businessType, businessName, registrationNumber)
getBusinessVerification(userId, isAdmin)
approveBusinessVerification(verificationId, adminId)
rejectBusinessVerification(verificationId, adminId, rejectionReason)
```

Behavior:

- User must exist.
- Role must be `AGENCY` or `HOTEL`.
- Submitted `businessType` must match the authenticated account role.
- Existing `PENDING` → 409.
- Existing `VERIFIED` → 409.
- `REJECTED` can be resubmitted.
- Only ADMIN can approve/reject.

---

## Phase 14.6 — Controller Layer

Controllers remain intentionally thin.

### User Controllers

```text
createUserVerificationController
getUserVerificationController
approveUserVerificationController
rejectUserVerificationController
```

### Ownership Controllers

```text
createOwnershipVerificationController
getOwnershipVerificationController
approveOwnershipVerificationController
rejectOwnershipVerificationController
```

### Business Controllers

```text
createBusinessVerificationController
getBusinessVerificationController
approveBusinessVerificationController
rejectBusinessVerificationController
```

Controllers obtain the authenticated identity from `req.user` and pass the required values to the service layer.

The client is never trusted to identify the account that owns or submits a verification.

---

## Phase 14.7 — Routes

The verification router is protected by authentication:

```ts
const verificationRouter = Router();
verificationRouter.use(authenticate);
```

### User Verification

```text
POST  /api/v1/verifications/user
GET   /api/v1/verifications/user/me
```

### Ownership Verification

```text
POST  /api/v1/verifications/ownership/properties/:propertyId
GET   /api/v1/verifications/ownership/properties/:propertyId
```

### Business Verification

```text
POST  /api/v1/verifications/business
GET   /api/v1/verifications/business/me
```

### Administrative Review

```text
PATCH /api/v1/verifications/user/:verificationId/approve
PATCH /api/v1/verifications/user/:verificationId/reject

PATCH /api/v1/verifications/ownership/:verificationId/approve
PATCH /api/v1/verifications/ownership/:verificationId/reject

PATCH /api/v1/verifications/business/:verificationId/approve
PATCH /api/v1/verifications/business/:verificationId/reject
```

The router is registered with:

```ts
app.use("/api/v1/verifications", verificationRouter);
```

---

## Phase 14.8 — Authorization

Authorization follows the established Giggler Homes pattern:

```text
authenticate
      ↓
role authorization where appropriate
      ↓
resource ownership checks where required
      ↓
service-level business rules
```

### User Verification

Any authenticated user can submit and view their own verification.

### Ownership Verification

Ownership is checked against the actual property record rather than relying only on a role.

```text
Authenticated user
       ↓
Property lookup
       ↓
property.ownerId === req.user.id
       ↓
Allow / Reject
```

This is intentionally not implemented as a simple `authorizeRoles(...)` rule because being an OWNER role does not prove ownership of every property.

### Business Verification

Business verification routes use:

```ts
authorizeRoles("AGENCY", "HOTEL")
```

The service additionally verifies that the submitted `businessType` matches the user's actual role.

### Administrative Review

Approval and rejection routes use:

```ts
authorizeRoles("ADMIN")
```

ADMIN has unrestricted review access but does not impersonate the original submitter.

---

## Phase 14.9 — Testing

Phase 14 was tested across normal flows, invalid input, authorization boundaries, lifecycle transitions, and security-sensitive behavior.

### User Verification Tests

```text
Create verification                         PASS
Retrieve own verification                  PASS
Duplicate PENDING submission               PASS → 409
Invalid document type                      PASS → 400
Empty identity number                      PASS → 400
Unauthenticated request                    PASS → 401
Non-admin approval                         PASS → 403
Admin approval                             PASS → 200
Approve already VERIFIED                   PASS → 409
Admin rejection                            PASS
Missing rejection reason                   PASS → 400
Rejected verification resubmission         PASS → PENDING
```

### Ownership Verification Tests

```text
Create for owned property                  PASS
Cross-owner submission                     PASS → 403
Owner retrieval                            PASS → 200
Other-owner retrieval                      PASS → 403
ADMIN retrieval                            PASS → 200
Duplicate PENDING submission               PASS → 409
Admin approval                             PASS
Admin rejection                            PASS
Rejected resubmission                      PASS → PENDING
```

### Business Verification Tests

```text
AGENCY submission                           PASS
HOTEL submission                            PASS
USER submission                             PASS → 403
Business type mismatch                      PASS → 400
Duplicate PENDING submission                PASS → 409
Admin approval                              PASS
Admin rejection                             PASS
Rejected resubmission                       PASS → PENDING
```

### Security Tests

The following security boundaries were explicitly tested:

```text
Client-controlled userId                    BLOCKED
Client-controlled ownerId                   BLOCKED
Client-controlled submittedById             BLOCKED
Client-controlled reviewer                   BLOCKED
Client-controlled verification status        BLOCKED
Cross-user ownership access                  BLOCKED
Cross-user verification access               BLOCKED
Non-admin review                             BLOCKED
Unsupported document types                   BLOCKED
Invalid UUID/CUID identifiers                BLOCKED
Private verification evidence exposure      BLOCKED
```

### VerificationDocument Tests

The document/evidence layer was also tested for:

- allowed document/file types
- file-size/security handling
- cross-user protection
- document-type protection
- multiple documents per verification
- exactly-one-parent integrity at the service layer
- public API exposure prevention
- Cloudinary failure handling
- database failure followed by Cloudinary cleanup/rollback

All Phase 14 tests passed.

---

## Phase 14.10 — VerificationDocument Security and Failure Handling

Verification documents are more sensitive than ordinary property media because they can contain identity, ownership, or business-registration information.

### Separate From Public Media

`VerificationDocument` is not part of the normal public `Media` system.

The Media module is intended for property-facing images/videos, while VerificationDocument exists for private compliance/evidence workflows.

### Storage Metadata

The model stores:

```text
storageKey
fileUrl (optional)
docType
uploadedAt
```

The storage key acts as the server-side reference to the stored evidence.

### Parent Integrity

The schema contains three optional parent foreign keys because the document can belong to one of three verification types. Prisma alone does not express the rule that exactly one must be populated.

Therefore the V1 service layer enforces:

```text
Exactly one parent verification
        ↓
Accept

Zero parents
        ↓
Reject

Multiple parents
        ↓
Reject
```

### Failure Handling

Where external storage is involved, the implementation follows the same compensating-failure philosophy established by the Media module:

```text
Upload external document
        ↓
Persist database metadata
        ↓
If database operation fails
        ↓
Remove uploaded external object
```

This prevents orphaned private evidence from remaining in storage after a failed database operation.

---

## Phase 14.11 — Problems Encountered and Resolved

### Problem 1 — Verification IDs Were CUIDs, Not UUIDs

The verification models use:

```prisma
@default(cuid())
```

but route validation initially treated verification IDs as UUIDs.

This was corrected by changing the verification route schemas to:

```ts
z.cuid()
```

while property IDs continue to use:

```ts
z.uuid()
```

### Problem 2 — Prisma Reviewer Relation Assignment

The Prisma generated client did not accept a direct scalar assignment in the implemented create/update shape for the reviewer relation.

The service was corrected to use the relation API:

```ts
reviewer: {
  connect: { id: adminId },
}
```

This keeps the Prisma relation semantics explicit.

### Problem 3 — Rejection Reason Field Typo

A field reference was incorrectly written as `rejectedReason` instead of the actual schema field:

```text
rejectionReason
```

The service was corrected to use the schema's exact field name.

### Problem 4 — Sensitive Evidence Requires Stronger Security Boundaries

Verification documents cannot be treated like ordinary public property media. The implementation therefore keeps verification evidence behind authenticated verification workflows and explicitly tests against public API exposure and cross-user access.

---

## Phase 14.12 — Important Design Decisions

### 1. Identity, Ownership, and Business Legitimacy Are Different Claims

A verified user is not automatically the verified owner of every property they create. Likewise, an agency/hotel business verification does not itself prove ownership of a particular property.

Keeping these claims separate prevents one verification type from being incorrectly interpreted as another.

### 2. No ListingVerification Model in V1

Listing verification is not stored as a separate verification record. A listing is associated with a property, so the V1 design avoids duplicating verification state at the listing level.

### 3. One Current Verification Record

Each user has one current UserVerification. Each property has one current OwnershipVerification. Each business account has one current BusinessVerification.

Rejected submissions update the existing verification record instead of creating an unlimited sequence of current records.

### 4. Rejected Submissions Can Be Resubmitted

A rejection is not a terminal state. The verification can move back to `PENDING` after the applicant corrects or replaces the evidence.

### 5. ADMIN Is the Only Reviewer

Verification decisions are administrative actions. Regular users, property owners, agencies, and hotels cannot approve themselves or one another.

### 6. Ownership Uses Resource Authorization

A user's role is not enough to establish property ownership. The property record is checked directly.

### 7. Verification Evidence Is Private

Verification documents are deliberately separated from normal public property media and should not be exposed through public listing/property endpoints.

### 8. V1 Does Not Support Agency Delegation

An agency cannot submit ownership verification on behalf of another property owner in V1. Supporting that properly requires an explicit delegation/authorization model.

### 9. No Expiration in V1

Verification expiry and periodic re-verification can be added later if the product requirements justify it. They are intentionally outside the current lifecycle.

### 10. Database Constraints and Service Rules Work Together

Unique constraints such as `userId @unique`, `propertyId @unique`, and `ownerId @unique` prevent multiple current verification records, while service-layer rules control lifecycle and authorization.

---

## Phase 14.13 — Verification Module Structure

The verification domain follows the same modular backend structure used throughout the project:

```text
src/
├── modules/
│   └── verifications/
│       ├── verification.controller.ts
│       ├── verification.routes.ts
│       ├── verification.service.ts
│       └── verification.validation.ts
│
├── middleware/
│   ├── authenticate.ts
│   ├── authorizeRoles.ts
│   └── validateRequest.ts
│
└── lib/
    └── prisma.ts
```

The exact filenames may evolve as the codebase is refactored, but the architectural responsibility remains:

```text
Validation → request shape
Controller → HTTP layer
Service → business rules
Prisma → persistence
Middleware → authentication/authorization
```

---

## Phase 14.14 — Result

Phase 14 is complete.

```text
Business Rules             ✅
Data Model                 ✅
Migration                  ✅
Validation                 ✅
Services                   ✅
Controllers                ✅
Routes                     ✅
Authorization              ✅
VerificationDocument       ✅
Security Testing           ✅
Failure Testing            ✅
Documentation              ✅
```

The Verification domain is ready for frontend integration and for future administrative tooling.

---

# Latest Project Status

## Current Progress Summary

```text
Phase 1  ✅ Backend Project Setup
Phase 2  ✅ Express Configuration
Phase 3  ✅ API Structure and Error Handling
Phase 4  ✅ PostgreSQL + Neon + Prisma
Phase 5  ✅ User Database Foundation
Phase 6  ✅ Authentication
Phase 7  ✅ Role-Based Authorization
Phase 8  ✅ Property Foundation
Phase 9  ✅ Listing Module
Phase 10 ✅ Media Management
Phase 11 ✅ Amenities
Phase 12 ✅ Favorites
Phase 13 ✅ Inquiries
Phase 14 ✅ Verification
Phase 15 ⏭️ Reports and Moderation
```

## Current Project Structure

```text
Authentication       ✅
Authorization        ✅
Property Foundation  ✅
Listing Module       ✅
Media Module         ✅
Amenities Module     ✅
Favorites Module     ✅
Inquiry Module       ✅
Verification Module  ✅
Reports Module       ⏭️
Administration       ⏳
```

## Current API Endpoints

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Verification

```text
POST  /api/v1/verifications/user
GET   /api/v1/verifications/user/me

POST  /api/v1/verifications/ownership/properties/:propertyId
GET   /api/v1/verifications/ownership/properties/:propertyId

POST  /api/v1/verifications/business
GET   /api/v1/verifications/business/me

PATCH /api/v1/verifications/user/:verificationId/approve
PATCH /api/v1/verifications/user/:verificationId/reject

PATCH /api/v1/verifications/ownership/:verificationId/approve
PATCH /api/v1/verifications/ownership/:verificationId/reject

PATCH /api/v1/verifications/business/:verificationId/approve
PATCH /api/v1/verifications/business/:verificationId/reject
```

The full historical API documentation for the earlier modules remains in their respective phase sections above.

## Current Security Model

```text
JWT authentication
      ↓
Role-based authorization where applicable
      ↓
Resource ownership checks
      ↓
Service-level business rules
      ↓
Centralized error handling
```

Verification adds a particularly important rule:

```text
Sensitive evidence
      ↓
Authenticated verification workflow
      ↓
No public listing/property exposure
```

## Current Migration State

The database contains the schema required by the completed phases through Verification. Migration history is preserved and applied migrations are treated as immutable.

## Documentation Milestone

**Status:** Complete through Phase 14.

Phase 14 — Verification has been implemented, tested, and documented. The backend documentation is now synchronized with the completed Verification domain.

### Documentation Order

```text
Phase 14 Complete
      ↓
Update backend-dev.md
      ↓
Review architecture against actual implementation
      ↓
Phase 15 — Reports and Moderation
```

---

# Next Phase

## Phase 15 — Reports and Moderation

The next planned backend domain is **Reports and Moderation**.

The exact Phase 15 design should be finalized before implementation, following the established process:

```text
Business Rules
      ↓
Data Model
      ↓
Migration
      ↓
Validation
      ↓
Service
      ↓
Controller
      ↓
Routes
      ↓
Authorization
      ↓
Testing
      ↓
Documentation
```

Potential areas to define during Phase 15 planning include:

- What users can report.
- Which resources can receive reports.
- Report categories and severity.
- Duplicate-report rules.
- Report lifecycle.
- Moderator/admin actions.
- Whether reported resources are automatically hidden or only manually moderated.
- Evidence attached to reports.
- Reporter privacy.
- Abuse prevention and rate limiting.
- Audit requirements.

These are planning questions for Phase 15 and are not treated as implemented features yet.

---

# Documentation Rule Going Forward

After each major domain is completed:

```text
Implementation
      ↓
Testing
      ↓
Documentation
      ↓
Architecture review
      ↓
Next domain
```

This keeps the documentation synchronized with the actual backend rather than allowing it to become a separate, outdated description of the system.

