-- Drop in correct order to avoid FK issues
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ROLES ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    image TEXT,
    birthday DATE,
    role user_role NOT NULL DEFAULT 'USER',
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    ban_end TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_subscription UNIQUE (follower_id, followed_id),
    CONSTRAINT fk_sub_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_followed FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- POSTS
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type media_type,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_post_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMMENTS
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    creator_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comment_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- LIKES
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_like UNIQUE (creator_id, post_id),
    CONSTRAINT fk_like_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_notif_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- REPORTS
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT,
    reported_post_id BIGINT,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reported_post FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_sub_follower ON subscriptions(follower_id);
CREATE INDEX idx_sub_followed ON subscriptions(followed_id);
CREATE INDEX idx_posts_creator ON posts(creator_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_creator ON comments(creator_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_creator ON likes(creator_id);
CREATE INDEX idx_notif_receiver ON notifications(receiver_id);
CREATE INDEX idx_notif_is_read ON notifications(is_read);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id); 