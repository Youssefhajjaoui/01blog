-- Simple and reliable seed_data.sql
-- This script will populate the database with realistic fake data

-- =========================
-- TRUNCATE TABLES FIRST (safe for reruns)
-- =========================
TRUNCATE TABLE reports, notifications, subscriptions, likes, comments, posts, users RESTART IDENTITY CASCADE;

-- =========================
-- INSERT USERS (50 users)
-- =========================
INSERT INTO users (username, email, password_hash, image, bio, birthday, role, banned, ban_end, created_at)
VALUES 
  ('admin', 'admin@01blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'System Administrator', '1990-01-01', 'ADMIN', false, null, NOW()),
  ('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Software Developer passionate about clean code', '1992-05-15', 'USER', false, null, NOW() - INTERVAL '1 year'),
  ('sarah_smith', 'sarah@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face', 'UI/UX Designer creating beautiful experiences', '1995-08-22', 'USER', false, null, NOW() - INTERVAL '8 months'),
  ('mike_wilson', 'mike@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'DevOps Engineer automating everything', '1988-12-10', 'USER', false, null, NOW() - INTERVAL '6 months'),
  ('emma_davis', 'emma@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Data Scientist exploring AI and machine learning', '1993-03-18', 'USER', false, null, NOW() - INTERVAL '4 months');

-- Insert more users with generated data
INSERT INTO users (username, email, password_hash, image, bio, birthday, role, banned, ban_end, created_at)
SELECT
  'user' || g AS username,
  'user' || g || '@example.com' AS email,
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' AS password_hash,
  CASE WHEN random() < 0.7 THEN 'https://images.unsplash.com/photo-' || (1500000000000 + floor(random() * 1000000000)) || '?w=150&h=150&fit=crop&crop=face' ELSE NULL END AS image,
  CASE 
    WHEN random() < 0.2 THEN 'Software Developer'
    WHEN random() < 0.4 THEN 'Designer'
    WHEN random() < 0.6 THEN 'Product Manager'
    WHEN random() < 0.8 THEN 'Data Analyst'
    ELSE 'Tech Enthusiast'
  END AS bio,
  (current_date - (floor(random()*365*20 + 365*20))::int) AS birthday,
  'USER' AS role,
  false AS banned,
  null AS ban_end,
  (NOW() - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(6,50) g;

-- =========================
-- INSERT POSTS (100 posts)
-- =========================
INSERT INTO posts (creator_id, title, content, media_url, media_type, tags, created_at, updated_at)
VALUES 
  (1, 'Welcome to 01Blog', 'This is the first post on our new blogging platform! We are excited to share our journey with you.', null, null, ARRAY['announcement', 'welcome'], NOW() - INTERVAL '30 days', null),
  (2, 'Getting Started with Spring Boot', 'Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".', null, null, ARRAY['spring-boot', 'java', 'tutorial'], NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days'),
  (3, 'Design Principles for Modern Web Apps', 'Good design is not just about aesthetics, it''s about creating intuitive user experiences that solve real problems.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop', 'IMAGE', ARRAY['design', 'ux', 'web'], NOW() - INTERVAL '20 days', null),
  (4, 'Docker Best Practices', 'Containerization has revolutionized how we deploy applications. Here are some best practices to follow.', null, null, ARRAY['docker', 'devops', 'containers'], NOW() - INTERVAL '18 days', null),
  (5, 'Machine Learning Fundamentals', 'Understanding the basics of machine learning algorithms and their applications in real-world scenarios.', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop', 'IMAGE', ARRAY['machine-learning', 'ai', 'data-science'], NOW() - INTERVAL '15 days', null);

-- Insert more posts with generated data
INSERT INTO posts (creator_id, title, content, media_url, media_type, tags, created_at, updated_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  CASE 
    WHEN random() < 0.2 THEN 'How to ' || substring(md5(random()::text) from 1 for 10)
    WHEN random() < 0.4 THEN 'Understanding ' || substring(md5(random()::text) from 1 for 8)
    WHEN random() < 0.6 THEN 'Best Practices for ' || substring(md5(random()::text) from 1 for 12)
    WHEN random() < 0.8 THEN 'Introduction to ' || substring(md5(random()::text) from 1 for 9)
    ELSE 'My Experience with ' || substring(md5(random()::text) from 1 for 11)
  END AS title,
  'This is a sample blog post content. ' || repeat(substring(md5(random()::text) from 1 for 50) || ' ', 10) AS content,
  CASE WHEN random() < 0.3 THEN 'https://images.unsplash.com/photo-' || (1500000000000 + floor(random() * 1000000000)) || '?w=800&h=400&fit=crop' ELSE NULL END AS media_url,
  CASE WHEN random() < 0.3 THEN (ARRAY['IMAGE','VIDEO'])[floor(random()*2+1)] ELSE NULL END AS media_type,
  CASE 
    WHEN random() < 0.2 THEN ARRAY['tech', 'programming']
    WHEN random() < 0.4 THEN ARRAY['design', 'ui']
    WHEN random() < 0.6 THEN ARRAY['tutorial', 'learning']
    WHEN random() < 0.8 THEN ARRAY['opinion', 'thoughts']
    ELSE ARRAY['lifestyle', 'personal']
  END AS tags,
  (NOW() - (floor(random()*90) || ' days')::interval) AS created_at,
  CASE WHEN random() < 0.3 THEN (NOW() - (floor(random()*30) || ' days')::interval) ELSE NULL END AS updated_at
FROM generate_series(6,100);

-- =========================
-- INSERT COMMENTS (300 comments)
-- =========================
INSERT INTO comments (content, creator_id, post_id, created_at)
SELECT
  CASE 
    WHEN random() < 0.3 THEN 'Great post! Thanks for sharing.'
    WHEN random() < 0.6 THEN 'This is really helpful information.'
    WHEN random() < 0.8 THEN 'I learned something new today.'
    ELSE 'Interesting perspective on this topic.'
  END AS content,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM posts ORDER BY random() LIMIT 1) AS post_id,
  (NOW() - (floor(random()*60) || ' days')::interval) AS created_at
FROM generate_series(1,300);

-- =========================
-- INSERT LIKES (500 likes)
-- =========================
INSERT INTO likes (creator_id, post_id, created_at)
SELECT 
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM posts ORDER BY random() LIMIT 1) AS post_id,
  (NOW() - (floor(random()*60) || ' days')::interval) AS created_at
FROM generate_series(1,500)
ON CONFLICT (creator_id, post_id) DO NOTHING;

-- =========================
-- INSERT SUBSCRIPTIONS (200 subscriptions)
-- =========================
INSERT INTO subscriptions (follower_id, followed_id, created_at)
SELECT 
  (SELECT id FROM users WHERE id != 1 ORDER BY random() LIMIT 1) AS follower_id,
  (SELECT id FROM users WHERE id != 1 ORDER BY random() LIMIT 1) AS followed_id,
  (NOW() - (floor(random()*60) || ' days')::interval) AS created_at
FROM generate_series(1,200)
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- =========================
-- INSERT NOTIFICATIONS (150 notifications)
-- =========================
INSERT INTO notifications (creator_id, receiver_id, content, created_at, is_read)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS receiver_id,
  CASE 
    WHEN random() < 0.3 THEN 'Someone liked your post'
    WHEN random() < 0.6 THEN 'New comment on your post'
    WHEN random() < 0.8 THEN 'Someone started following you'
    ELSE 'New notification'
  END AS content,
  (NOW() - (floor(random()*30) || ' days')::interval) AS created_at,
  CASE WHEN random() < 0.6 THEN true ELSE false END AS is_read
FROM generate_series(1,150);

-- =========================
-- INSERT REPORTS (20 reports)
-- =========================
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS reporter_id,
  CASE WHEN random() < 0.5 THEN (SELECT id FROM users ORDER BY random() LIMIT 1) ELSE NULL END AS reported_user_id,
  CASE WHEN random() < 0.6 THEN (SELECT id FROM posts ORDER BY random() LIMIT 1) ELSE NULL END AS reported_post_id,
  CASE 
    WHEN random() < 0.3 THEN 'Inappropriate content'
    WHEN random() < 0.6 THEN 'Spam'
    WHEN random() < 0.8 THEN 'Harassment'
    ELSE 'Other'
  END AS reason,
  (ARRAY['PENDING','REVIEWED','RESOLVED'])[floor(random()*3+1)] AS status,
  (NOW() - (floor(random()*30) || ' days')::interval) AS created_at
FROM generate_series(1,20);

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
-- VERIFICATION QUERIES
-- =========================
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Posts: ' || COUNT(*) FROM posts;
SELECT 'Comments: ' || COUNT(*) FROM comments;
SELECT 'Likes: ' || COUNT(*) FROM likes;
SELECT 'Subscriptions: ' || COUNT(*) FROM subscriptions;
SELECT 'Notifications: ' || COUNT(*) FROM notifications;
SELECT 'Reports: ' || COUNT(*) FROM reports;
