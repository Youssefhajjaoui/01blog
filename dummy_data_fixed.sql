-- Clear existing data
DELETE FROM reports;
DELETE FROM notifications;
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM subscriptions;
DELETE FROM post_tags;
DELETE FROM posts;
DELETE FROM users;

-- Insert dummy users (with proper banned field)
INSERT INTO users (username, email, password_hash, image, bio, role, banned, created_at) VALUES
('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K', 'uploads/avatar1.jpg', 'Software developer passionate about clean code', 'USER', false, NOW()),
('jane_smith', 'jane@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K8K', 'uploads/avatar2.jpg', 'Full-stack developer and tech blogger', 'USER', false, NOW()),
('mike_wilson', 'mike@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K8K', 'uploads/avatar3.jpg', 'DevOps engineer and cloud enthusiast', 'USER', false, NOW()),
('sarah_jones', 'sarah@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K8K', 'uploads/avatar4.jpg', 'UI/UX designer with a passion for accessibility', 'USER', false, NOW()),
('alex_brown', 'alex@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K8K', 'uploads/avatar5.jpg', 'Data scientist and machine learning researcher', 'USER', false, NOW()),
('admin_user', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjJ8K8K8K8K8K8K8K8K8K8K8K', 'uploads/admin.jpg', 'System administrator', 'ADMIN', false, NOW());

-- Insert dummy posts (without tags column)
INSERT INTO posts (creator_id, title, content, media_url, media_type, created_at) VALUES
(1, 'Getting Started with React Hooks', 'React Hooks revolutionized how we write functional components. In this post, I''ll walk you through the most commonly used hooks and how to implement them effectively...', 'uploads/react-hooks.jpg', 'IMAGE', NOW() - INTERVAL '2 days'),
(2, 'Building Scalable Microservices', 'Microservices architecture has become the go-to solution for large-scale applications. Here are the key principles and patterns you need to know...', 'uploads/microservices.jpg', 'IMAGE', NOW() - INTERVAL '1 day'),
(3, 'Docker Best Practices', 'After working with Docker for several years, I''ve learned some valuable lessons. Here are the best practices that will save you time and headaches...', 'uploads/docker.jpg', 'IMAGE', NOW() - INTERVAL '3 days'),
(4, 'Design Systems: A Complete Guide', 'Design systems are essential for maintaining consistency across large applications. Let me share my experience building and maintaining design systems...', 'uploads/design-system.jpg', 'IMAGE', NOW() - INTERVAL '4 days'),
(5, 'Machine Learning with Python', 'Python has become the de facto language for machine learning. In this comprehensive guide, I''ll show you how to get started with popular ML libraries...', 'uploads/ml-python.jpg', 'IMAGE', NOW() - INTERVAL '5 days'),
(1, 'TypeScript Tips and Tricks', 'TypeScript can be tricky at first, but once you master these patterns, you''ll wonder how you ever lived without it. Here are my favorite TypeScript tips...', 'uploads/typescript.jpg', 'IMAGE', NOW() - INTERVAL '6 days'),
(2, 'API Design Principles', 'Good API design is crucial for developer experience. Here are the principles I follow when designing RESTful APIs...', 'uploads/api-design.jpg', 'IMAGE', NOW() - INTERVAL '7 days'),
(3, 'Kubernetes for Beginners', 'Kubernetes can seem overwhelming at first, but it''s actually quite logical once you understand the core concepts. Let me break it down for you...', 'uploads/kubernetes.jpg', 'IMAGE', NOW() - INTERVAL '8 days');

-- Insert dummy comments
INSERT INTO comments (content, creator_id, post_id, created_at) VALUES
('Great post! I''ve been struggling with useState, this really helped.', 2, 1, NOW() - INTERVAL '1 day'),
('Thanks for sharing! The useEffect examples were particularly useful.', 3, 1, NOW() - INTERVAL '2 days'),
('Excellent overview of microservices patterns. Bookmarked!', 1, 2, NOW() - INTERVAL '1 day'),
('I''ve been using Docker for a while but learned some new tricks here.', 4, 3, NOW() - INTERVAL '2 days'),
('Design systems are so important for team collaboration. Great insights!', 5, 4, NOW() - INTERVAL '3 days'),
('Python ML ecosystem is amazing. Thanks for the comprehensive guide!', 1, 5, NOW() - INTERVAL '4 days'),
('TypeScript has definitely improved my code quality. Great tips!', 3, 6, NOW() - INTERVAL '5 days'),
('API design is an art. These principles are spot on.', 4, 7, NOW() - INTERVAL '6 days'),
('Kubernetes is complex but this explanation makes it clearer.', 2, 8, NOW() - INTERVAL '7 days');

-- Insert dummy likes
INSERT INTO likes (creator_id, post_id, created_at) VALUES
(2, 1, NOW() - INTERVAL '1 day'),
(3, 1, NOW() - INTERVAL '2 days'),
(4, 1, NOW() - INTERVAL '1 day'),
(5, 1, NOW() - INTERVAL '3 days'),
(1, 2, NOW() - INTERVAL '1 day'),
(3, 2, NOW() - INTERVAL '2 days'),
(4, 2, NOW() - INTERVAL '1 day'),
(1, 3, NOW() - INTERVAL '2 days'),
(2, 3, NOW() - INTERVAL '1 day'),
(5, 3, NOW() - INTERVAL '3 days'),
(1, 4, NOW() - INTERVAL '3 days'),
(2, 4, NOW() - INTERVAL '2 days'),
(3, 4, NOW() - INTERVAL '1 day'),
(1, 5, NOW() - INTERVAL '4 days'),
(2, 5, NOW() - INTERVAL '3 days'),
(3, 5, NOW() - INTERVAL '2 days'),
(4, 5, NOW() - INTERVAL '1 day'),
(2, 6, NOW() - INTERVAL '5 days'),
(3, 6, NOW() - INTERVAL '4 days'),
(4, 6, NOW() - INTERVAL '3 days'),
(5, 6, NOW() - INTERVAL '2 days'),
(1, 7, NOW() - INTERVAL '6 days'),
(3, 7, NOW() - INTERVAL '5 days'),
(4, 7, NOW() - INTERVAL '4 days'),
(5, 7, NOW() - INTERVAL '3 days'),
(1, 8, NOW() - INTERVAL '7 days'),
(2, 8, NOW() - INTERVAL '6 days'),
(4, 8, NOW() - INTERVAL '5 days'),
(5, 8, NOW() - INTERVAL '4 days');

-- Insert dummy subscriptions (follow relationships)
INSERT INTO subscriptions (follower_id, followed_id, created_at) VALUES
(2, 1, NOW() - INTERVAL '10 days'),  -- jane follows john
(3, 1, NOW() - INTERVAL '9 days'),   -- mike follows john
(4, 1, NOW() - INTERVAL '8 days'),   -- sarah follows john
(5, 1, NOW() - INTERVAL '7 days'),   -- alex follows john
(1, 2, NOW() - INTERVAL '6 days'),   -- john follows jane
(3, 2, NOW() - INTERVAL '5 days'),   -- mike follows jane
(4, 2, NOW() - INTERVAL '4 days'),   -- sarah follows jane
(1, 3, NOW() - INTERVAL '3 days'),    -- john follows mike
(2, 3, NOW() - INTERVAL '2 days'),   -- jane follows mike
(5, 3, NOW() - INTERVAL '1 day'),    -- alex follows mike
(1, 4, NOW() - INTERVAL '5 days'),   -- john follows sarah
(2, 4, NOW() - INTERVAL '4 days'),   -- jane follows sarah
(3, 4, NOW() - INTERVAL '3 days'),    -- mike follows sarah
(1, 5, NOW() - INTERVAL '6 days'),   -- john follows alex
(2, 5, NOW() - INTERVAL '5 days'),   -- jane follows alex
(3, 5, NOW() - INTERVAL '4 days'),   -- mike follows alex
(4, 5, NOW() - INTERVAL '3 days');   -- sarah follows alex

-- Insert dummy notifications
INSERT INTO notifications (creator_id, receiver_id, content, created_at, is_read) VALUES
(2, 1, 'jane_smith liked your post "Getting Started with React Hooks"', NOW() - INTERVAL '1 day', false),
(3, 1, 'mike_wilson commented on your post "Getting Started with React Hooks"', NOW() - INTERVAL '2 days', true),
(4, 1, 'sarah_jones started following you', NOW() - INTERVAL '8 days', true),
(1, 2, 'john_doe liked your post "Building Scalable Microservices"', NOW() - INTERVAL '1 day', false),
(3, 2, 'mike_wilson started following you', NOW() - INTERVAL '5 days', true),
(1, 3, 'john_doe liked your post "Docker Best Practices"', NOW() - INTERVAL '2 days', false),
(2, 3, 'jane_smith started following you', NOW() - INTERVAL '2 days', true),
(1, 4, 'john_doe liked your post "Design Systems: A Complete Guide"', NOW() - INTERVAL '3 days', false),
(2, 4, 'jane_smith started following you', NOW() - INTERVAL '4 days', true),
(1, 5, 'john_doe liked your post "Machine Learning with Python"', NOW() - INTERVAL '4 days', false),
(2, 5, 'jane_smith started following you', NOW() - INTERVAL '5 days', true);

-- Insert dummy reports
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at) VALUES
(1, 2, NULL, 'Inappropriate content in posts', 'PENDING', NOW() - INTERVAL '1 day'),
(2, NULL, 3, 'Spam content', 'RESOLVED', NOW() - INTERVAL '2 days'),
(3, 4, NULL, 'Harassment in comments', 'PENDING', NOW() - INTERVAL '3 days');
