# Giggler Homes Backend Development

> This document records the step-by-step development of the Giggler Homes backend. It explains what has been built, why each system exists, the technologies used, important implementation decisions, testing performed, and the next development steps.

**Project:** Giggler Homes
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
**Database:** Neon PostgreSQL
**Authentication:** JWT and bcryptjs
**Validation:** Zod
**Current Progress:** Phase 6 Complete — Authentication
**Next Phase:** Phase 7 — Role-Based Authorization

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
17. [Next Phase](#next-phase)
18. [Development Update Template](#development-update-template)

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

| Phase    | Feature                             | Status   |
| -------- | ------------------------------------ | -------- |
| Phase 1  | Express + TypeScript foundation     | Complete |
| Phase 2  | Environment configuration           | Complete |
| Phase 3  | API structure and error handling    | Complete |
| Phase 4  | Neon PostgreSQL + Prisma            | Complete |
| Phase 5  | User database model                 | Complete |
| Phase 6A | User registration                   | Complete |
| Phase 6B | Login + JWT generation              | Complete |
| Phase 6C | JWT verification + protected routes | Complete |
| Phase 7  | Role-Based Authorization            | Next     |
| Phase 8  | User management                     | Planned  |
| Phase 9  | Property management                 | Planned  |
| Phase 10 | Listings                            | Planned  |
| Phase 11 | Media uploads                       | Planned  |
| Phase 12 | Amenities                           | Planned  |
| Phase 13 | Favorites                           | Planned  |
| Phase 14 | Inquiries                           | Planned  |
| Phase 15 | Reports and moderation              | Planned  |
| Phase 16 | Verification                        | Planned  |
| Phase 17 | Admin features                      | Planned  |
| Phase 18 | Testing and API documentation       | Planned  |
| Phase 19 | Deployment                          | Planned  |

---

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

| Method | Endpoint                | Authentication | Status   |
| ------ | ------------------------ | --------------- | -------- |
| GET    | `/health`               | Public         | Complete |
| POST   | `/api/v1/auth/register` | Public         | Complete |
| POST   | `/api/v1/auth/login`    | Public         | Complete |
| GET    | `/api/v1/auth/me`       | Required       | Complete |

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
