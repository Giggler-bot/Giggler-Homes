# Giggler Homes Backend Architecture

> This document records the actual architecture of the Giggler Homes backend as it is built. It is intentionally being started incrementally rather than written as a complete theoretical architecture before implementation.

**Project:** Giggler Homes  
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL  
**Database:** Neon PostgreSQL  
**Validation:** Zod  
**Authentication:** JWT + bcryptjs

---

# 1. Architecture Overview

Giggler Homes uses a modular backend architecture.

The system is being built feature-by-feature rather than importing an entire generated backend.

The generated backend is used as a reference, while the actual application architecture is implemented incrementally and tested before moving to the next domain.

Current completed domains:

```text
Authentication
Authorization
Property Foundation
Listings
```

Upcoming domains will be added to this document as they are implemented.

---

# 2. Architectural Principles

The backend currently follows these principles:

* Modular feature organization
* Separation of HTTP concerns from business logic
* Centralized validation
* Centralized error handling
* Explicit authentication and authorization
* Resource ownership authorization
* Prisma as the database access layer
* Incremental database modeling
* Feature-by-feature testing
* Documentation after completed phases

A major development principle is:

```text
Do not build everything at once.

Build
  ↓
Understand
  ↓
Test
  ↓
Document
  ↓
Continue
```

---

# 3. High-Level Architecture

The current backend follows this request flow:

```text
Client
  │
  ▼
Express
  │
  ▼
Route
  │
  ▼
Middleware
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Prisma
  │
  ▼
Neon PostgreSQL
  │
  ▼
Response
```

The backend is responsible for authentication, authorization, validation, business logic, persistence, and API responses.

---

# 4. Layered Backend Architecture

## 4.1 Routes

Routes define HTTP endpoints and compose the middleware required for an operation.

Example responsibilities:

```text
HTTP method
URL
Authentication
Role authorization
Validation
Ownership authorization
Controller
```

Routes should not contain business logic.

## 4.2 Middleware

Middleware handles cross-cutting concerns and request-level authorization.

Current middleware responsibilities include:

```text
Authentication
Role authorization
Resource ownership authorization
Request validation
404 handling
Error handling
```

Middleware is executed before the controller when the route requires it.

## 4.3 Controllers

Controllers handle HTTP concerns.

They:

* Receive the Express request
* Read validated request data
* Call the appropriate service
* Select the HTTP status
* Return the JSON response

Controllers should not contain the main business rules.

## 4.4 Services

Services contain domain/business logic.

Examples:

```text
Create property
Create listing
Retrieve listings
Submit listing
Approve listing
Reject listing
Expire listing
Mark listing as SOLD
Mark listing as RENTED
Archive listing
Update property availability
```

Services use the shared Prisma client for persistence.

## 4.5 Prisma

Prisma is the application's database access layer.

The backend uses Prisma to:

* Query PostgreSQL
* Create records
* Update records
* Enforce relationships through the schema
* Run migrations
* Generate the type-safe Prisma Client

The application uses a shared Prisma client:

```text
src/lib/prisma.ts
```

---

# 5. Request Lifecycle

A typical protected request follows this structure:

```text
HTTP Request
     │
     ▼
authenticate
     │
     ▼
authorizeRoles
     │
     ▼
validateRequest
     │
     ▼
authorizePropertyOwner
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Prisma
     │
     ▼
PostgreSQL
     │
     ▼
Service result
     │
     ▼
Controller response
```

Not every endpoint requires every middleware.

For example, a public retrieval endpoint may not require authentication or ownership authorization.

---

# 6. Authentication Architecture

Authentication answers:

> Who is making this request?

The backend uses JWT access tokens.

The client sends:

```http
Authorization: Bearer ACCESS_TOKEN
```

The authentication middleware:

```text
Read Authorization header
        ↓
Extract Bearer token
        ↓
Verify JWT
        ↓
Check expiration
        ↓
Load current user
        ↓
Attach user to req.user
```

Authentication and authorization remain separate concerns.

A valid JWT proves identity; it does not automatically grant access to every operation.

---

# 7. Authorization Architecture

Authorization answers:

> What is this authenticated user allowed to do?

The backend currently has two important authorization layers.

## 7.1 Role Authorization

Role authorization checks whether the authenticated user's role is allowed to access an operation.

Example:

```ts
authorizeRoles("ADMIN");
```

Or:

```ts
authorizeRoles(
  "OWNER",
  "AGENCY",
  "HOTEL",
  "ADMIN",
);
```

Current roles:

```text
USER
OWNER
AGENCY
HOTEL
ADMIN
```

## 7.2 Resource Ownership Authorization

Role authorization alone is not enough for resources such as properties.

Example:

```text
Owner A
└── Property A

Owner B
└── Property B
```

Owner B may have the `OWNER` role but must not be able to modify Property A.

The ownership middleware checks:

```text
Authenticated user owns the resource
             OR
Authenticated user is ADMIN
```

If neither condition is true:

```text
403 Forbidden
```

---

# 8. Validation Architecture

Incoming request data is validated with Zod.

The normal flow is:

```text
Request
  ↓
validateRequest
  ↓
Zod schema
  ↓
Validated data
  ↓
Controller
  ↓
Service
```

Validation occurs before business logic.

The backend also accounts for Express 5's getter-backed `req.query`.

When validated query data needs to replace the original query object, the validation middleware uses `Object.defineProperty()` rather than direct assignment.

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

---

# 9. Error Handling Architecture

Expected application errors use the project's `AppError`.

The backend has centralized error handling.

The general model is:

```text
Service / Middleware
       │
       ▼
   AppError
       │
       ▼
Global Error Handler
       │
       ▼
Consistent JSON response
```

Example:

```json
{
  "success": false,
  "message": "Listing not found"
}
```

Development responses may also expose stack traces according to the application's development configuration.

---

# 10. Domain Architecture

The backend is organized around feature/domain modules.

Current architecture:

```text
src/
│
├── config/
├── common/
├── lib/
├── middleware/
├── modules/
│   ├── auth/
│   ├── properties/
│   └── listings/
├── types/
├── app.ts
└── server.ts
```

Future modules will be introduced only when their features are built.

Planned domains include:

```text
media
amenities
favorites
inquiries
verification
reports
admin
```

---

# 11. Module Architecture Standard

Each domain normally follows:

```text
module/
├── module.routes.ts
├── module.controller.ts
├── module.service.ts
├── module.validation.ts
├── module.types.ts       (when required)
├── module.constants.ts   (when required)
└── module.utils.ts       (when required)
```

Not every module needs every file.

The structure is determined by the responsibilities of the feature.

---

# 12. Property Domain

The Property domain currently contains:

```text
User
   │
   │ owns
   ▼
Property
   │
   ├── Location
   │
   └── PropertyType
          │
          ▼
   PropertyCategory
```

The Property model contains property-level information such as:

```text
title
slug
description
bedrooms
bathrooms
toilets
parkingSpaces
squareMeters
yearBuilt
isFurnished
isAvailable
isFeatured
viewCount
```

Property availability is intentionally separate from Listing lifecycle status.

---

# 13. Listing Domain

The Listing domain sits on top of the Property domain.

```text
Property
   │
   └── Listing[]
```

A Listing represents an offer associated with a property.

The Listing domain currently supports:

```text
Creation
Retrieval
Pagination
Filtering
Updating
Submission
Moderation
Expiration
SOLD
RENTED
ARCHIVED
Availability management
```

## 13.1 Listing Lifecycle

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

Dedicated operations control lifecycle transitions rather than allowing arbitrary status changes through a generic update request.

## 13.2 Property Availability vs Listing Status

These concepts are deliberately separate:

```text
Property.isAvailable
        ≠
Listing.status
```

`Property.isAvailable` represents property-level availability.

`Listing.status` represents the lifecycle state of a specific listing.

Changing property availability does not automatically change the listing lifecycle state.

This separation is important because a property may have multiple listings over its lifetime.

---

# 14. Database Architecture

The database is PostgreSQL hosted by Neon.

Current implemented database domains include:

```text
User
Property
Location
PropertyCategory
PropertyType
Listing
```

Relationships currently include:

```text
User
 │
 └── Property[]
        │
        ├── Location
        │
        └── PropertyType
               │
               └── PropertyCategory

Property
 │
 └── Listing[]
```

Prisma remains the source of truth for the database schema.

Models are added incrementally as features are implemented.

---

# 15. Reference Data Architecture

Reference data is seeded rather than manually entered during development.

Current seed data includes:

```text
Property Categories
Property Types
Ghana Regions
```

Seeds use Prisma `upsert()` so they can be safely rerun without creating duplicate reference records.

---

# 16. Security Architecture

Current security principles include:

* Passwords are hashed with bcryptjs.
* Password hashes are never returned through the API.
* JWT secrets remain server-side.
* Protected routes require authentication.
* Roles are checked separately from identity.
* Resource ownership is checked for protected resources.
* Validation occurs before business logic.
* Database access occurs through Prisma.
* Environment secrets are kept outside source control.
* Login failures avoid revealing whether an email exists.

---

# 17. Current Architectural State

```text
Authentication
      │
      ▼
Authorization
      │
      ▼
Property Foundation
      │
      ▼
Listing Domain
      │
      ▼
Documentation ← CURRENT
      │
      ▼
Media Management
```

The architecture document is intentionally incomplete.

It will grow with the system.

---

# 18. Next Architecture Addition

The next major architecture addition will occur when Media Management is implemented.

That section will document the actual media architecture, including its relationship with:

```text
Property
Listing
Cloudinary
Media metadata
Upload flow
```

No media architecture is being assumed here before the feature is built.

---

# Architecture Documentation Rule

The architecture should describe the system that actually exists.

Therefore:

```text
Implement
   ↓
Test
   ↓
Understand the resulting architecture
   ↓
Document
```

rather than:

```text
Invent entire architecture
   ↓
Implement later
```

This keeps `architecture.md` synchronized with the real Giggler Homes backend.
