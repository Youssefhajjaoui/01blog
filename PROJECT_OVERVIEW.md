# 01Blog Project

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Features](#security-features)
3. [Rate Limiting Configuration](#rate-limiting-configuration)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [API Endpoints](#api-endpoints)
9. [Key Technical Concepts](#key-technical-concepts)
10. [Deployment Configuration](#deployment-configuration)

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Angular | 20 | UI framework with SSR |
| **API Gateway** | Spring Cloud Gateway | Latest | Rate limiting, routing |
| **Backend** | Spring Boot | 3.5.5 | REST API |
| **Database** | PostgreSQL | 15 | Data persistence |
| **Cache/RL** | Redis | 7 | Rate limiting, token blacklist |
| **Styling** | Custom CSS | - | Design system |
| **Notifications** | Angular Material | Latest | UI feedback |

### Request Flow

```
Client → API Gateway (8080) → Backend (9090) → PostgreSQL
                        ↓
                     Redis (Rate Limiting + Token Blacklist)
```

---

## Security Features

### 1. JWT Authentication with HttpOnly Cookies

**Implementation**: Cookies are HttpOnly, preventing XSS attacks from JavaScript access.

**Backend**: `SecurityConfig.java`
```java
// Cookie configuration
Cookie cookie = new Cookie("token", jwtToken);
cookie.setHttpOnly(true);
cookie.setSecure(true); // HTTPS only in production
cookie.setPath("/");
response.addCookie(cookie);
```

**Frontend**: Automatic cookie handling by `HttpClient`

### 2. Redis Token Blacklist

**Purpose**: Allows logout by blacklisting tokens until expiration.

**Implementation**: 
- On logout, token is added to Redis with TTL = remaining token lifetime
- On each request, gateway checks if token is blacklisted

### 3. CORS Configuration

**Backend**: 
```properties
# Allowed origins
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000,http://localhost:8080
```

### 4. SQL Injection Prevention

- **ORM**: Spring Data JPA with parameterized queries
- **Flyway**: Database migrations are version-controlled

### 5. File Upload Security

- **Storage**: Supabase object storage
- **Validation**: File type and size checks (max 10MB)
- **Location**: Remote storage, not local filesystem

---

## Rate Limiting Configuration

### Gateway-Level Rate Limiting

**Implementation**: Spring Cloud Gateway with Redis Rate Limiter

### Rate Limits by Endpoint

| Endpoint Category | Replenish Rate | Burst Capacity | Use Case |
|------------------|----------------|----------------|----------|
| **SSE Notifications** | 1000/sec | 2000 | Keep-alive connections |
| **Posts** | 500/sec | 1000 | High traffic, mixed operations |
| **General API** | 500/sec | 1000 | General API usage |
| **Public/Read** | 300/sec | 600 | Public content access |
| **Suggestions** | 200/sec | 400 | Autocomplete/search |
| **Comments** | 100/sec | 200 | Moderate interaction |
| **Likes** | 100/sec | 200 | Moderate interaction |
| **Admin Operations** | 100/sec | 200 | Administrative tasks |
| **Files/Uploads** | 20/sec | 40 | File uploads |
| **Authentication** | 30/sec | 60 | Login/register attempts |

**Configuration**: `gateway/src/main/resources/application-docker.properties`

**Key Resolver**: User-based (authenticated) or IP-based (anonymous)

---

## Database Schema

### Flyway Migrations

All schema changes are managed via Flyway migrations:

```
V1__Create_initial_tables.sql    - Core tables
V2__Add_cleanup_reports.sql      - Foreign key constraints
V3__Add_post_hiding.sql          - Hidden posts feature
V4__Fix_post_text_fields.sql     - TEXT columns for content
```

### Core Tables

#### users
- `id` (BIGSERIAL), `username`, `email`, `password_hash`
- `role` (ENUM: ADMIN, USER), `banned`, `avatar`, `bio`
- `created_at`, `updated_at`

#### posts
- `id` (BIGSERIAL), `creator_id` (FK → users)
- `title`, `content` (TEXT), `tags` (via post_tags table)
- `media_url`, `media_type`
- `hidden`, `hide_reason` (TEXT)
- `created_at`, `updated_at`

#### post_tags
- `post_id` (FK → posts), `tag` (VARCHAR)
- Composite PK: (post_id, tag)

#### comments
- `id` (BIGSERIAL), `post_id` (FK → posts), `user_id` (FK → users)
- `content`, `created_at`, `updated_at`

#### likes
- `user_id` (FK → users), `post_id` (FK → posts)
- Composite PK: (user_id, post_id)

#### subscriptions
- `subscriber_id` (FK → users), `target_user_id` (FK → users)
- Composite PK: (subscriber_id, target_user_id)

#### reports
- `id` (BIGSERIAL), `reporter_id` (FK → users)
- `reported_user_id` (FK → users, nullable)
- `reported_post_id` (FK → posts, nullable)
- `reason`, `description` (VARCHAR(1000)), `status` (ENUM)
- `created_at`

#### notifications
- `id` (BIGSERIAL), `user_id` (FK → users), `type`, `content`, `read`, `created_at`

---

## Authentication & Authorization

### Roles

| Role | Permissions |
|------|-------------|
| **USER** | Create posts, comments, likes, follow users, report content |
| **ADMIN** | All USER permissions + ban users, hide/restore posts, manage reports |

### Token Lifecycle

1. **Login**: User → Backend → JWT → HttpOnly Cookie → Client
2. **Request**: Client → Gateway (validates JWT) → Backend
3. **Logout**: Token added to Redis blacklist
4. **Expiration**: Token expires after 1 hour

### Protected Endpoints

**Public**:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/check` (cookie-based check)

**Authenticated**:
- All `/api/posts/**` (GET, POST, PUT, DELETE)
- All `/api/comments/**`
- All `/api/likes/**`
- All `/api/users/**` (limited)

**Admin Only**:
- `POST /api/admin/users/{id}/ban`
- `POST /api/admin/users/{id}/unban`
- `POST /api/admin/posts/{id}/hide`
- `POST /api/admin/posts/{id}/restore`
- `GET /api/admin/reports`
- `PUT /api/admin/reports/{id}`

---

## Frontend Architecture

### Angular Signals

**State Management**: Angular Signals for reactive state

**Example**: `post-card.component.ts`
```typescript
localLiked = signal(false);
localSubscribed = signal(false);
editMode = signal(false);
showMenu = signal(false);
```

### Component Structure

```
app/
├── auth/           # Login, signup
├── components/
│   ├── navbar/    # Navigation bar
│   ├── post-card/ # Post display (feed/grid)
│   └── post-create/ # Post editor
├── guards/
│   ├── auth.guard.ts      # Route protection
│   └── admin.guard.ts     # Admin routes
├── home/          # Home feed
├── post-detail/   # Single post view
├── profile/       # User profiles
├── admin/         # Admin dashboard
├── models/        # TypeScript interfaces
└── services/      # API services
```

### Key Services

- **AuthService**: Authentication state, login, logout
- **PostService**: Post CRUD, upload files
- **UserService**: User profile, follow/unfollow
- **CommentService**: Comment CRUD
- **NotificationService**: Angular Material Snackbar
- **AdminService**: Admin operations

### Inline Editing

**Post Cards & Post Detail**:
- Click "Edit" → Enter edit mode
- Modify title, content, media
- Save → API call → Update UI
- Cancel → Revert changes

**Media Management**:
- Keep original, upload new, or remove all
- Preview before save
- Upload to Supabase

---

## Backend Architecture

### Package Structure

```
com.example.demo/
├── config/
│   ├── SecurityConfig.java      # Spring Security
│   └── CorsConfig.java          # CORS settings
├── controllers/
│   ├── AuthController.java
│   ├── PostController.java
│   ├── CommentController.java
│   ├── UserController.java
│   └── AdminController.java
├── services/
│   ├── JwtService.java
│   ├── UserService.java
│   └── NotificationService.java
├── repositories/
│   └── [JPA repositories]
├── models/
│   ├── User.java
│   ├── Post.java
│   ├── Comment.java
│   └── [other entities]
├── dtos/
│   └── [data transfer objects]
├── filters/
│   ├── JwtAuthenticationFilter.java
│   └── GatewayAuthenticationFilter.java
└── init/
    └── AdminInitializer.java    # Creates default admin
```

### Key Controllers

#### AuthController
- `POST /api/auth/login` - JWT + HttpOnly cookie
- `POST /api/auth/register` - New user
- `GET /api/auth/check` - Session validation
- `POST /api/auth/logout` - Token blacklist

#### PostController
- `GET /api/posts` - Paginated feed
- `POST /api/posts` - Create with media
- `GET /api/posts/{id}` - Single post
- `PUT /api/posts/{id}` - Update (owner)
- `DELETE /api/posts/{id}` - Delete (owner/admin)
- `POST /api/posts/{id}/like` - Toggle like
- `POST /api/posts/report` - Report post

#### AdminController
- `POST /api/admin/users/{id}/ban`
- `POST /api/admin/users/{id}/unban`
- `POST /api/admin/posts/{id}/hide`
- `POST /api/admin/posts/{id}/restore`
- `GET /api/admin/reports`
- `PUT /api/admin/reports/{id}/status`

### Server-Sent Events (SSE)

**Notifications**: Real-time updates via SSE stream

**Endpoint**: `GET /api/notifications/stream`
**Frontend**: Auto-connects and listens for events

---

## API Endpoints

### Complete Endpoint List

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/check` - Check session
- `POST /api/auth/logout` - Logout

#### Posts
- `GET /api/posts?page=0&size=20` - Paginated feed
- `POST /api/posts` - Create post
- `GET /api/posts/{id}` - Get post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Toggle like
- `POST /api/posts/report` - Report post

#### Comments
- `GET /api/posts/{id}/comments` - Get comments
- `POST /api/posts/{id}/comments` - Add comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment
- `POST /api/comments/{id}/like` - Like comment

#### Users
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update profile
- `POST /api/users/{id}/follow` - Follow user
- `POST /api/users/{id}/unfollow` - Unfollow user
- `GET /api/users/{id}/suggestions` - Search suggestions

#### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - All users
- `POST /api/admin/users/{id}/ban`
- `POST /api/admin/users/{id}/unban`
- `POST /api/admin/posts/{id}/hide`
- `POST /api/admin/posts/{id}/restore`
- `GET /api/admin/reports`
- `PUT /api/admin/reports/{id}`

#### Notifications
- `GET /api/notifications/stream` - SSE stream
- `GET /api/notifications` - Get all
- `PUT /api/notifications/{id}/read`

#### Files
- `POST /api/files/upload` - Upload to Supabase

---

## Key Technical Concepts

### 1. Flyway Migrations

**Purpose**: Version-controlled database schema

**Usage**:
- All DDL in migration files
- Idempotent migrations (check before alter)
- Automatic on Spring Boot startup

**Example**: `V4__Fix_post_text_fields.sql`
```sql
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'content' 
               AND data_type = 'character varying' 
               AND character_maximum_length = 255) THEN
        ALTER TABLE posts ALTER COLUMN content TYPE TEXT;
    END IF;
END $$;
```

### 2. DTO Pattern

**Purpose**: Separate API contracts from entities

**Example**: `ReportDto` with nested DTOs
- `SimpleUserDto` - User info
- `SimplePostDto` - Post info
- Prevents circular references in JSON

### 3. ElementCollection Mapping

**Post.tags**: `@ElementCollection` → `post_tags` table
- Hibernate creates separate table
- Flyway creates matching schema

### 4. Optimistic UI Updates

**Likes**: Update UI immediately, revert on error
**Follow**: Same pattern

### 5. Angular Signals vs RxJS

**Signals**: Used for local component state
**RxJS**: Used for async operations (HTTP)

### 6. Health Checks

**Docker Compose**: `depends_on` with healthcheck
```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U admin -d blogdb"]
    interval: 5s
    timeout: 5s
    retries: 5

backend:
  depends_on:
    postgres:
      condition: service_healthy
```

---

## Deployment Configuration

### Docker Compose Services

1. **gateway-dev** (8080) - API Gateway
2. **postgres** (5432) - Database
3. **redis** (6379) - Cache/RL
4. **backend-dev** (9090) - Backend API
5. **frontend-dev** (4200) - Angular app

### Environment Variables

**Gateway**:
- `REDIS_HOST=redis`
- `BACKEND_URL=http://backend:9090`
- `JWT_SECRET=[secret]`

**Backend**:
- `SPRING_PROFILES_ACTIVE=docker`
- `REDIS_HOST=redis`
- `FILE_STORAGE_LOCAL_PATH=/app/uploads/`
- `GATEWAY_ENABLED=false` (dev mode)
- `JWT_SECRET=[secret]`

**PostgreSQL**:
- `POSTGRES_USER=admin`
- `POSTGRES_PASSWORD=pass`
- `POSTGRES_DB=blogdb`

### Volumes

- `postgres_data` - Database persistence
- `redis_data` - Redis persistence
- `maven_cache` - Maven dependencies
- `node_modules` - NPM packages (dev only)

### Network

- `app-network` - All services communicate on this network

---

## Audit Checklist

### Security
- [ ] HttpOnly cookies for JWT
- [ ] Token blacklist on logout
- [ ] Rate limiting on gateway
- [ ] CORS configured
- [ ] SQL injection prevention (JPA)
- [ ] File upload validation

### Database
- [ ] Flyway migrations applied
- [ ] Indexes on foreign keys
- [ ] Cascade deletes configured
- [ ] TEXT fields for large content

### Frontend
- [ ] Auth guards on protected routes
- [ ] Admin guards on admin routes
- [ ] 404 error page
- [ ] Optimistic UI updates
- [ ] Signal-based state management

### Backend
- [ ] JWT validation in gateway
- [ ] Role-based access control
- [ ] SSE for notifications
- [ ] File upload to Supabase
- [ ] Admin initializer creates default admin

### DevOps
- [ ] Health checks in docker-compose
- [ ] Service dependencies configured
- [ ] Volume persistence
- [ ] Network isolation

---

## Quick Start Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Restart single service
docker-compose -f docker-compose.dev.yml restart backend

# Check running services
docker-compose -f docker-compose.dev.yml ps
```

---

## Troubleshooting

### Rate Limiting Too Strict
- Check: `gateway/src/main/resources/application-docker.properties`
- Redis enabled: `spring.data.redis.host=redis`

### Database Migration Errors
- Check: Flyway version in `flyway_schema_history`
- Reset: Drop volumes, restart services

### CORS Issues
- Verify: `CORS_ALLOWED_ORIGINS` in docker-compose
- Check: Gateway CORS config

### Post Edit Not Working
- Verify: User is post owner
- Check: Edit mode state in component

---

**Last Updated**: 2024
**Version**: 1.0.0

