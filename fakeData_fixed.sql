-- Fixed seed_data.sql
-- Fully standard SQL version — works with psql -f

-- =========================
-- TRUNCATE TABLES FIRST (safe for reruns)
-- =========================
TRUNCATE TABLE reports, notifications, subscriptions, likes, comments, posts, users RESTART IDENTITY CASCADE;

-- =========================
-- CONFIG: number of records
-- =========================
-- USERS = 50, POSTS = 200, COMMENTS = 500, LIKES = 800
-- SUBSCRIPTIONS = 300, NOTIFICATIONS = 400, REPORTS = 30

-- =====================================
-- Sample tags pool
-- =====================================
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- =========================
-- INSERT USERS
-- =========================
INSERT INTO users (username, email, password_hash, image, bio, birthday, role, banned, ban_end, created_at)
SELECT
  'user' || g AS username,
  'user' || g || '@example.test' AS email,
  md5('password' || g::text) AS password_hash,
  CASE WHEN random() < 0.6 THEN 'https://pics.example/avatar_' || ((g % 10) + 1) || '.png' ELSE NULL END AS image,
  substring(md5(random()::text) from 1 for 120) AS bio,
  (current_date - (floor(random()*365*35 + 365*18))::int) AS birthday,
  CASE WHEN random() < 0.05 THEN 'ADMIN' ELSE 'USER' END AS role,
  CASE WHEN random() < 0.02 THEN TRUE ELSE FALSE END AS banned,
  CASE WHEN random() < 0.02 THEN (CURRENT_TIMESTAMP + (floor(random()*14 + 1) || ' days')::interval) ELSE NULL END AS ban_end,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,50) g;

-- =========================
-- INSERT POSTS
-- =========================
INSERT INTO posts (creator_id, title, content, media_url, media_type, tags, created_at, updated_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  initcap((array['The','A','How','Why','When','What'])[floor(random()*6+1)] || ' ' || substring(md5(random()::text) from 1 for 8)) AS title,
  repeat(substring(md5(random()::text) from 1 for 120), ceil(random()*3)::int) AS content,
  CASE WHEN random() < 0.25 THEN 'https://cdn.example/media/' || (floor(random()*1000)::text) || '.jpg' ELSE NULL END AS media_url,
  CASE WHEN random() < 0.25 THEN (ARRAY['image','video','audio'])[floor(random()*3+1)] ELSE NULL END AS media_type,
  CASE 
    WHEN random() < 0.3 THEN ARRAY['tech','webdev']
    WHEN random() < 0.6 THEN ARRAY['javascript','tutorial']
    WHEN random() < 0.8 THEN ARRAY['design','productivity']
    ELSE ARRAY['lifestyle','travel']
  END AS tags,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at,
  CASE WHEN random() < 0.3 THEN (CURRENT_TIMESTAMP - (floor(random()*200) || ' days')::interval) ELSE NULL END AS updated_at
FROM generate_series(1,200);

-- =========================
-- INSERT COMMENTS
-- =========================
INSERT INTO comments (content, creator_id, post_id, created_at)
SELECT
  left(md5(random()::text) || ' ' || md5(random()::text), 280) AS content,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM posts ORDER BY random() LIMIT 1) AS post_id,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,500);

-- =========================
-- INSERT LIKES
-- =========================
INSERT INTO likes (creator_id, post_id, created_at)
SELECT 
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM posts ORDER BY random() LIMIT 1) AS post_id,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,800)
ON CONFLICT (creator_id, post_id) DO NOTHING;

-- =========================
-- INSERT SUBSCRIPTIONS
-- =========================
INSERT INTO subscriptions (follower_id, followed_id, created_at)
SELECT 
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS follower_id,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS followed_id,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,300)
WHERE (SELECT id FROM users ORDER BY random() LIMIT 1) <> (SELECT id FROM users ORDER BY random() LIMIT 1)
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- =========================
-- INSERT NOTIFICATIONS
-- =========================
INSERT INTO notifications (creator_id, receiver_id, content, created_at, is_read)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS receiver_id,
  left('Notification: ' || md5(random()::text) || ' ' || md5(random()::text), 240) AS content,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at,
  CASE WHEN random() < 0.6 THEN TRUE ELSE FALSE END AS is_read
FROM generate_series(1,400);

-- =========================
-- INSERT REPORTS
-- =========================
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS reporter_id,
  CASE WHEN random() < 0.5 THEN (SELECT id FROM users ORDER BY random() LIMIT 1) ELSE NULL END AS reported_user_id,
  CASE WHEN random() < 0.6 THEN (SELECT id FROM posts ORDER BY random() LIMIT 1) ELSE NULL END AS reported_post_id,
  left('Report reason: ' || md5(random()::text), 300) AS reason,
  (ARRAY['PENDING','REVIEWED','RESOLVED'])[floor(random()*3+1)] AS status,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,30);

-- =========================
-- FIX SEQUENCES
-- =========================
SELECT setval(pg_get_serial_sequence('users','id'), GREATEST((SELECT MAX(id) FROM users),1));
SELECT setval(pg_get_serial_sequence('posts','id'), GREATEST((SELECT MAX(id) FROM posts),1));
SELECT setval(pg_get_serial_sequence('comments','id'), GREATEST((SELECT MAX(id) FROM comments),1));
SELECT setval(pg_get_serial_sequence('likes','id'), GREATEST((SELECT MAX(id) FROM likes),1));
SELECT setval(pg_get_serial_sequence('subscriptions','id'), GREATEST((SELECT MAX(id) FROM subscriptions),1));
SELECT setval(pg_get_serial_sequence('notifications','id'), GREATEST((SELECT MAX(id) FROM notifications),1));
SELECT setval(pg_get_serial_sequence('reports','id'), GREATEST((SELECT MAX(id) FROM reports),1));

-- =========================
-- DONE
-- =========================
