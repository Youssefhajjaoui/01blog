# Database Schema Documentation

## Overview

The database uses **PostgreSQL 15** with **Flyway** for version-controlled migrations.

## Table Schemas

### users

Stores user accounts and profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment user ID |
| `username` | VARCHAR(255) | NOT NULL, UNIQUE | Username |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `role` | VARCHAR(50) | NOT NULL | ADMIN or USER |
| `banned` | BOOLEAN | NOT NULL, DEFAULT FALSE | Account banned status |
| `image` | VARCHAR(255) | | Avatar URL |
| `bio` | VARCHAR(500) | | User biography |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | | Last update time |

**Indexes**:
- `idx_users_username`
- `idx_users_email`

---

### posts

Stores blog posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment post ID |
| `creator_id` | BIGINT | NOT NULL, FK → users(id) | Post author |
| `title` | VARCHAR(255) | NOT NULL | Post title |
| `content` | TEXT | NOT NULL | Post content |
| `media_url` | VARCHAR(255) | | Media file URL (Supabase) |
| `media_type` | VARCHAR(50) | | IMAGE, VIDEO, or AUDIO |
| `hidden` | BOOLEAN | NOT NULL, DEFAULT FALSE | Hidden by admin |
| `hide_reason` | TEXT | | Reason for hiding |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Post creation time |
| `updated_at` | TIMESTAMP | | Last update time |

**Indexes**:
- `idx_posts_creator`
- `idx_posts_created_at`

**Relations**:
- `creator_id` → `users.id`
- One-to-many with `post_tags`
- One-to-many with `comments`
- One-to-many with `likes`
- One-to-many with `reports`

---

### post_tags

Stores tags associated with posts (ElementCollection mapping).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | BIGINT | NOT NULL, FK → posts(id) ON DELETE CASCADE | Post reference |
| `tag` | VARCHAR(255) | NOT NULL | Tag name |

**Constraints**:
- `PK (post_id, tag)` - Composite primary key
- `FK (post_id)` → `posts(id) ON DELETE CASCADE`

**Indexes**:
- `idx_post_tags_post_id`
- `idx_post_tags_tag`

---

### comments

Stores comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment comment ID |
| `post_id` | BIGINT | NOT NULL, FK → posts(id) | Commented post |
| `user_id` | BIGINT | NOT NULL, FK → users(id) | Comment author |
| `content` | TEXT | NOT NULL | Comment text |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Comment creation time |
| `updated_at` | TIMESTAMP | | Last update time |

**Indexes**:
- `idx_comments_post_id`
- `idx_comments_user_id`
- `idx_comments_created_at`

**Relations**:
- `post_id` → `posts.id`
- `user_id` → `users.id`

---

### likes

Stores post likes (composite key).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE | User who liked |
| `post_id` | BIGINT | NOT NULL, FK → posts(id) ON DELETE CASCADE | Liked post |

**Constraints**:
- `PK (user_id, post_id)` - Composite primary key
- `FK (user_id)` → `users(id) ON DELETE CASCADE`
- `FK (post_id)` → `posts(id) ON DELETE CASCADE`

**Indexes**:
- `idx_likes_user_id`
- `idx_likes_post_id`

---

### subscriptions

Stores user follows/subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `subscriber_id` | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE | Follower |
| `target_user_id` | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE | Followed user |

**Constraints**:
- `PK (subscriber_id, target_user_id)` - Composite primary key
- `FK (subscriber_id)` → `users(id) ON DELETE CASCADE`
- `FK (target_user_id)` → `users(id) ON DELETE CASCADE`

**Indexes**:
- `idx_subscriptions_subscriber_id`
- `idx_subscriptions_target_user_id`

---

### reports

Stores reports on posts or users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment report ID |
| `reporter_id` | BIGINT | NOT NULL, FK → users(id) | Report author |
| `reported_user_id` | BIGINT | FK → users(id) ON DELETE SET NULL | Reported user (nullable) |
| `reported_post_id` | BIGINT | FK → posts(id) ON DELETE SET NULL | Reported post (nullable) |
| `reason` | TEXT | NOT NULL | Report reason code |
| `description` | VARCHAR(1000) | | Additional details |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Report creation time |

**Indexes**:
- `idx_reports_reporter`
- `idx_reports_status`
- `idx_reports_created_at`

**Relations**:
- `reporter_id` → `users.id`
- `reported_user_id` → `users.id ON DELETE SET NULL`
- `reported_post_id` → `posts.id ON DELETE SET NULL`

**Note**: Either `reported_user_id` or `reported_post_id` must be set.

---

### notifications

Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment notification ID |
| `user_id` | BIGINT | NOT NULL, FK → users(id) ON DELETE CASCADE | Notification recipient |
| `type` | VARCHAR(50) | NOT NULL | Notification type |
| `content` | TEXT | NOT NULL | Notification message |
| `read` | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Notification creation time |

**Indexes**:
- `idx_notifications_user_id`
- `idx_notifications_read`
- `idx_notifications_created_at`

**Relations**:
- `user_id` → `users.id ON DELETE CASCADE`

---

## Flyway Migrations

### V1__Create_initial_tables.sql

Creates all core tables and indexes.

**Tables**: users, posts, post_tags, comments, likes, subscriptions, reports, notifications

**Key Points**:
- `post_tags` table for ElementCollection mapping
- Composite primary keys for likes and subscriptions
- Foreign keys with appropriate ON DELETE actions

### V2__Add_cleanup_reports.sql

Updates foreign keys to handle deletions gracefully:
```sql
ALTER TABLE reports
DROP CONSTRAINT IF EXISTS fk_reports_reported_post;

ALTER TABLE reports
ADD CONSTRAINT fk_reports_reported_post 
FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE SET NULL;
```

### V3__Add_post_hiding.sql

Adds admin post hiding feature:
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hide_reason TEXT;
```

### V4__Fix_post_text_fields.sql

Converts VARCHAR(255) to TEXT for large content:
```sql
ALTER TABLE posts ALTER COLUMN content TYPE TEXT;
ALTER TABLE posts ALTER COLUMN hide_reason TYPE TEXT;
```

**Idempotent**: Checks column type before altering

---

## Entity Relationships

### Hibernate/JPA Mappings

#### User Entity
```java
@OneToMany(mappedBy = "creator")
private List<Post> posts;

@OneToMany(mappedBy = "user")
private List<Comment> comments;

@OneToMany(mappedBy = "subscriber")
private List<Subscription> subscriptions;
```

#### Post Entity
```java
@ManyToOne
@JoinColumn(name = "creator_id")
private User creator;

@ElementCollection
@CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
@Column(name = "tag")
private List<String> tags;

@OneToMany(mappedBy = "post")
private List<Comment> comments;

@OneToMany(mappedBy = "post")
private List<Like> likes;
```

#### Comment Entity
```java
@ManyToOne
@JoinColumn(name = "post_id")
private Post post;

@ManyToOne
@JoinColumn(name = "user_id")
private User user;
```

#### Like Entity
```java
@EmbeddedId
private LikeId id;

@ManyToOne
@MapsId("userId")
private User user;

@ManyToOne
@MapsId("postId")
private Post post;
```

---

## Indexes Summary

**Performance indexes**:
- All foreign keys are indexed
- `posts.created_at` for chronological ordering
- `reports.status` for filtering
- `notifications.user_id` and `notifications.read` for queries

---

## Data Integrity

### Cascade Deletes

**User deleted**:
- Posts: Deleted (FK: ON DELETE CASCADE not set, handled in service layer)
- Comments: Kept (no cascade)
- Likes: Deleted (`ON DELETE CASCADE`)
- Subscriptions: Deleted (`ON DELETE CASCADE`)
- Notifications: Deleted (`ON DELETE CASCADE`)

**Post deleted**:
- Tags: Deleted (`ON DELETE CASCADE`)
- Comments: Kept (no cascade)
- Likes: Deleted (`ON DELETE CASCADE`)
- Reports: Set to NULL (`ON DELETE SET NULL`)

---

## Admin Default User

Created by `AdminInitializer.java` on first startup:

```java
username: admin (env: ADMIN_USERNAME)
email: admin@example.com (env: ADMIN_EMAIL)
password: admin (env: ADMIN_PASSWORD)
role: ADMIN
avatar: /uploads/admin.png (env: ADMIN_AVATAR)
bio: Nothing (env: ADMIN_BIO)
```

---

## Common Queries

### Post Feed with Pagination
```sql
SELECT p.*, u.username, u.image as author_avatar,
       COUNT(DISTINCT l.user_id) as likes_count,
       COUNT(DISTINCT c.id) as comments_count,
       EXISTS(SELECT 1 FROM subscriptions s WHERE s.subscriber_id = ? AND s.target_user_id = p.creator_id) as is_subscribed
FROM posts p
JOIN users u ON p.creator_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.hidden = FALSE
GROUP BY p.id, u.username, u.image
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;
```

### User Statistics
```sql
SELECT 
    (SELECT COUNT(*) FROM posts WHERE creator_id = ?) as posts,
    (SELECT COUNT(*) FROM subscriptions WHERE subscriber_id = ?) as following,
    (SELECT COUNT(*) FROM subscriptions WHERE target_user_id = ?) as followers;
```

---

## Backup & Restore

**Backup**:
```bash
docker exec blogdb pg_dump -U admin blogdb > backup.sql
```

**Restore**:
```bash
docker exec -i blogdb psql -U admin blogdb < backup.sql
```

---

**Last Updated**: 2024

