-- Enhanced Data Seeding for Suggestions and Trending Tags
-- This script creates realistic data for testing suggestions and trending features

-- =========================
-- TRUNCATE TABLES FIRST
-- =========================
TRUNCATE TABLE reports, notifications, subscriptions, likes, comments, posts, users RESTART IDENTITY CASCADE;

-- =========================
-- CONFIG: Enhanced numbers for suggestions
-- =========================
-- USERS = 500, POSTS = 2000, COMMENTS = 5000, LIKES = 8000
-- SUBSCRIPTIONS = 2000, NOTIFICATIONS = 1000

-- =========================
-- REALISTIC USER DATA
-- =========================
INSERT INTO users (username, email, password_hash, image, bio, birthday, role, banned, created_at)
SELECT
  CASE 
    WHEN g <= 50 THEN 'dev' || g
    WHEN g <= 100 THEN 'designer' || (g-50)
    WHEN g <= 150 THEN 'writer' || (g-100)
    WHEN g <= 200 THEN 'photographer' || (g-150)
    WHEN g <= 250 THEN 'traveler' || (g-200)
    WHEN g <= 300 THEN 'foodie' || (g-250)
    WHEN g <= 350 THEN 'musician' || (g-300)
    WHEN g <= 400 THEN 'artist' || (g-350)
    WHEN g <= 450 THEN 'gamer' || (g-400)
    ELSE 'user' || g
  END AS username,
  CASE 
    WHEN g <= 50 THEN 'dev' || g || '@tech.com'
    WHEN g <= 100 THEN 'designer' || (g-50) || '@design.com'
    WHEN g <= 150 THEN 'writer' || (g-100) || '@blog.com'
    WHEN g <= 200 THEN 'photographer' || (g-150) || '@photo.com'
    WHEN g <= 250 THEN 'traveler' || (g-200) || '@travel.com'
    WHEN g <= 300 THEN 'foodie' || (g-250) || '@food.com'
    WHEN g <= 350 THEN 'musician' || (g-300) || '@music.com'
    WHEN g <= 400 THEN 'artist' || (g-350) || '@art.com'
    WHEN g <= 450 THEN 'gamer' || (g-400) || '@gaming.com'
    ELSE 'user' || g || '@example.com'
  END AS email,
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' AS password_hash, -- "password"
  CASE WHEN random() < 0.7 THEN 'avatar_' || ((g % 20) + 1) || '.jpg' ELSE NULL END AS image,
  CASE 
    WHEN g <= 50 THEN 'Full-stack developer passionate about ' || (ARRAY['React', 'Node.js', 'Python', 'Rust', 'Go'])[floor(random()*5+1)]
    WHEN g <= 100 THEN 'UI/UX Designer specializing in ' || (ARRAY['mobile apps', 'web design', 'branding', 'illustration'])[floor(random()*4+1)]
    WHEN g <= 150 THEN 'Content creator and blogger writing about ' || (ARRAY['technology', 'lifestyle', 'travel', 'food'])[floor(random()*4+1)]
    WHEN g <= 200 THEN 'Professional photographer capturing ' || (ARRAY['nature', 'portraits', 'events', 'street photography'])[floor(random()*4+1)]
    WHEN g <= 250 THEN 'Travel enthusiast exploring ' || (ARRAY['Europe', 'Asia', 'Americas', 'Africa'])[floor(random()*4+1)]
    WHEN g <= 300 THEN 'Food blogger and chef specializing in ' || (ARRAY['Italian cuisine', 'Asian fusion', 'vegan recipes', 'baking'])[floor(random()*4+1)]
    WHEN g <= 350 THEN 'Musician and composer creating ' || (ARRAY['electronic music', 'acoustic songs', 'classical pieces', 'jazz'])[floor(random()*4+1)]
    WHEN g <= 400 THEN 'Digital artist working with ' || (ARRAY['digital painting', '3D modeling', 'animation', 'concept art'])[floor(random()*4+1)]
    WHEN g <= 450 THEN 'Gaming content creator focused on ' || (ARRAY['RPGs', 'FPS games', 'indie games', 'retro gaming'])[floor(random()*4+1)]
    ELSE 'Passionate about sharing knowledge and experiences'
  END AS bio,
  (current_date - (floor(random()*365*30 + 365*20))::int) AS birthday,
  CASE WHEN random() < 0.02 THEN 'ADMIN' ELSE 'USER' END AS role,
  CASE WHEN random() < 0.01 THEN TRUE ELSE FALSE END AS banned,
  (CURRENT_TIMESTAMP - (floor(random()*730) || ' days')::interval) AS created_at
FROM generate_series(1,500) g;

-- =========================
-- REALISTIC POSTS WITH TRENDING TAGS
-- =========================
INSERT INTO posts (creator_id, title, content, media_url, media_type, tags, created_at, updated_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  CASE 
    WHEN random() < 0.15 THEN 'How to ' || (ARRAY['build', 'create', 'design', 'implement', 'optimize'])[floor(random()*5+1)] || ' ' || (ARRAY['React components', 'REST APIs', 'mobile apps', 'web applications', 'databases'])[floor(random()*5+1)]
    WHEN random() < 0.25 THEN 'The future of ' || (ARRAY['web development', 'artificial intelligence', 'blockchain', 'cloud computing', 'mobile technology'])[floor(random()*5+1)]
    WHEN random() < 0.35 THEN 'My experience with ' || (ARRAY['TypeScript', 'Docker', 'Kubernetes', 'AWS', 'GraphQL'])[floor(random()*5+1)]
    WHEN random() < 0.45 THEN 'Tips for ' || (ARRAY['beginners', 'intermediate developers', 'senior engineers', 'designers', 'product managers'])[floor(random()*5+1)]
    WHEN random() < 0.55 THEN 'Why I switched from ' || (ARRAY['JavaScript to TypeScript', 'React to Vue', 'MongoDB to PostgreSQL', 'AWS to GCP'])[floor(random()*4+1)]
    WHEN random() < 0.65 THEN 'Building ' || (ARRAY['scalable', 'secure', 'fast', 'user-friendly'])[floor(random()*4+1)] || ' applications'
    WHEN random() < 0.75 THEN 'Learning ' || (ARRAY['machine learning', 'data science', 'cybersecurity', 'DevOps'])[floor(random()*4+1)] || ' in 2024'
    WHEN random() < 0.85 THEN 'The best ' || (ARRAY['tools', 'frameworks', 'libraries', 'resources'])[floor(random()*4+1)] || ' for developers'
    ELSE 'Thoughts on ' || (ARRAY['technology trends', 'industry changes', 'career development', 'work-life balance'])[floor(random()*4+1)]
  END AS title,
  CASE 
    WHEN random() < 0.2 THEN 'In this comprehensive guide, I''ll walk you through the process of ' || (ARRAY['building', 'creating', 'implementing', 'designing'])[floor(random()*4+1)] || ' a ' || (ARRAY['modern web application', 'mobile app', 'API', 'database'])[floor(random()*4+1)] || '. This tutorial covers everything from setup to deployment, including best practices and common pitfalls to avoid.'
    WHEN random() < 0.4 THEN 'After working with ' || (ARRAY['React', 'Vue', 'Angular', 'Node.js', 'Python'])[floor(random()*5+1)] || ' for several years, I''ve learned some valuable lessons that I want to share. Here are the key insights that have helped me become a better developer.'
    WHEN random() < 0.6 THEN 'The technology landscape is constantly evolving, and staying up-to-date can be challenging. In this post, I''ll discuss the latest trends in ' || (ARRAY['web development', 'mobile development', 'cloud computing', 'artificial intelligence'])[floor(random()*4+1)] || ' and what they mean for developers.'
    WHEN random() < 0.8 THEN 'As a ' || (ARRAY['frontend', 'backend', 'full-stack', 'mobile', 'DevOps'])[floor(random()*5+1)] || ' developer, I often get asked about the best practices for ' || (ARRAY['code organization', 'testing', 'deployment', 'performance optimization'])[floor(random()*4+1)] || '. Here''s what I''ve learned from my experience.'
    ELSE 'Today I want to share my thoughts on ' || (ARRAY['career development', 'work-life balance', 'learning new technologies', 'industry trends'])[floor(random()*4+1)] || '. These are personal reflections based on my journey as a developer.'
  END AS content,
  CASE WHEN random() < 0.3 THEN 'media_' || (floor(random()*1000)::text) || '.jpg' ELSE NULL END AS media_url,
  CASE WHEN random() < 0.3 THEN (ARRAY['IMAGE', 'VIDEO'])[floor(random()*2+1)] ELSE NULL END AS media_type,
  CASE 
    WHEN random() < 0.1 THEN ARRAY['javascript', 'react', 'webdev']
    WHEN random() < 0.2 THEN ARRAY['python', 'machine-learning', 'ai']
    WHEN random() < 0.3 THEN ARRAY['typescript', 'nodejs', 'backend']
    WHEN random() < 0.4 THEN ARRAY['css', 'design', 'frontend']
    WHEN random() < 0.5 THEN ARRAY['docker', 'devops', 'cloud']
    WHEN random() < 0.6 THEN ARRAY['react', 'javascript', 'tutorial']
    WHEN random() < 0.7 THEN ARRAY['python', 'data-science', 'analytics']
    WHEN random() < 0.8 THEN ARRAY['vue', 'frontend', 'javascript']
    WHEN random() < 0.9 THEN ARRAY['nodejs', 'api', 'backend']
    ELSE ARRAY['tech', 'programming', 'development']
  END AS tags,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at,
  CASE WHEN random() < 0.2 THEN (CURRENT_TIMESTAMP - (floor(random()*100) || ' days')::interval) ELSE NULL END AS updated_at
FROM generate_series(1,2000);

-- =========================
-- REALISTIC COMMENTS
-- =========================
INSERT INTO comments (content, creator_id, post_id, created_at)
SELECT
  CASE 
    WHEN random() < 0.2 THEN 'Great post! This really helped me understand ' || (ARRAY['the concept', 'how to implement this', 'the best practices', 'the common pitfalls'])[floor(random()*4+1)] || '. Thanks for sharing!'
    WHEN random() < 0.4 THEN 'I''ve been struggling with this exact issue. Your solution worked perfectly for my use case. Much appreciated!'
    WHEN random() < 0.6 THEN 'Interesting perspective! I''ve tried a different approach using ' || (ARRAY['React hooks', 'Vue composition API', 'Angular services', 'Node.js modules'])[floor(random()*4+1)] || ', but this seems more elegant.'
    WHEN random() < 0.8 THEN 'Could you elaborate on ' || (ARRAY['the performance implications', 'how this scales', 'the security considerations', 'the testing strategy'])[floor(random()*4+1)] || '? I''d love to learn more.'
    ELSE 'Thanks for the detailed explanation! This is exactly what I needed for my project.'
  END AS content,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM posts ORDER BY random() LIMIT 1) AS post_id,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,5000);

-- =========================
-- REALISTIC LIKES (with some posts getting more likes)
-- =========================
INSERT INTO likes (creator_id, post_id, created_at)
SELECT u, p, (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval)
FROM (
  SELECT
    (SELECT id FROM users ORDER BY random() LIMIT 1) AS u,
    (SELECT id FROM posts ORDER BY random() LIMIT 1) AS p
  FROM generate_series(1,8000)
) t
ON CONFLICT (creator_id, post_id) DO NOTHING;

-- =========================
-- REALISTIC SUBSCRIPTIONS (users following others with similar interests)
-- =========================
INSERT INTO subscriptions (follower_id, followed_id, created_at)
SELECT follower, followed, (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval)
FROM (
  SELECT
    (SELECT id FROM users ORDER BY random() LIMIT 1) AS follower,
    (SELECT id FROM users ORDER BY random() LIMIT 1) AS followed
  FROM generate_series(1,2000)
) s
WHERE follower <> followed
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- =========================
-- NOTIFICATIONS
-- =========================
INSERT INTO notifications (creator_id, receiver_id, content, created_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS creator_id,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS receiver_id,
  CASE 
    WHEN random() < 0.3 THEN 'liked your post'
    WHEN random() < 0.6 THEN 'commented on your post'
    WHEN random() < 0.8 THEN 'started following you'
    ELSE 'mentioned you in a comment'
  END AS content,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,1000);

-- =========================
-- REPORTS
-- =========================
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, description, status, created_at)
SELECT
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS reporter_id,
  (SELECT id FROM users ORDER BY random() LIMIT 1) AS reported_user_id,
  CASE WHEN random() < 0.7 THEN (SELECT id FROM posts ORDER BY random() LIMIT 1) ELSE NULL END AS reported_post_id,
  (ARRAY['spam', 'inappropriate content', 'harassment', 'copyright violation', 'misinformation'])[floor(random()*5+1)] AS reason,
  'Reported content that violates community guidelines' AS description,
  (ARRAY['pending', 'reviewed', 'resolved', 'dismissed'])[floor(random()*4+1)] AS status,
  (CURRENT_TIMESTAMP - (floor(random()*365) || ' days')::interval) AS created_at
FROM generate_series(1,100);

-- =========================
-- CREATE SOME TRENDING POSTS (recent posts with many likes)
-- =========================
-- Add extra likes to recent posts to make them trend
INSERT INTO likes (creator_id, post_id, created_at)
SELECT 
  (SELECT id FROM users ORDER BY random() LIMIT 1),
  p.id,
  CURRENT_TIMESTAMP - (floor(random()*7) || ' days')::interval
FROM posts p
WHERE p.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
AND random() < 0.3  -- 30% chance for each recent post to get extra likes
LIMIT 500;

-- =========================
-- SUMMARY
-- =========================
SELECT 
  'Data seeding completed!' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM comments) as total_comments,
  (SELECT COUNT(*) FROM likes) as total_likes,
  (SELECT COUNT(*) FROM subscriptions) as total_subscriptions;
