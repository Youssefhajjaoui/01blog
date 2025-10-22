-- Insert dummy posts (using correct user IDs)
INSERT INTO posts (creator_id, title, content, media_url, media_type, created_at) VALUES
(513, 'Getting Started with React Hooks', 'React Hooks revolutionized how we write functional components. In this post, I''ll walk you through the most commonly used hooks and how to implement them effectively...', 'uploads/react-hooks.jpg', 'IMAGE', NOW() - INTERVAL '2 days'),
(514, 'Building Scalable Microservices', 'Microservices architecture has become the go-to solution for large-scale applications. Here are the key principles and patterns you need to know...', 'uploads/microservices.jpg', 'IMAGE', NOW() - INTERVAL '1 day'),
(515, 'Docker Best Practices', 'After working with Docker for several years, I''ve learned some valuable lessons. Here are the best practices that will save you time and headaches...', 'uploads/docker.jpg', 'IMAGE', NOW() - INTERVAL '3 days'),
(516, 'Design Systems: A Complete Guide', 'Design systems are essential for maintaining consistency across large applications. Let me share my experience building and maintaining design systems...', 'uploads/design-system.jpg', 'IMAGE', NOW() - INTERVAL '4 days'),
(517, 'Machine Learning with Python', 'Python has become the de facto language for machine learning. In this comprehensive guide, I''ll show you how to get started with popular ML libraries...', 'uploads/ml-python.jpg', 'IMAGE', NOW() - INTERVAL '5 days'),
(513, 'TypeScript Tips and Tricks', 'TypeScript can be tricky at first, but once you master these patterns, you''ll wonder how you ever lived without it. Here are my favorite TypeScript tips...', 'uploads/typescript.jpg', 'IMAGE', NOW() - INTERVAL '6 days'),
(514, 'API Design Principles', 'Good API design is crucial for developer experience. Here are the principles I follow when designing RESTful APIs...', 'uploads/api-design.jpg', 'IMAGE', NOW() - INTERVAL '7 days'),
(515, 'Kubernetes for Beginners', 'Kubernetes can seem overwhelming at first, but it''s actually quite logical once you understand the core concepts. Let me break it down for you...', 'uploads/kubernetes.jpg', 'IMAGE', NOW() - INTERVAL '8 days');

-- Insert dummy comments
INSERT INTO comments (content, creator_id, post_id, created_at) VALUES
('Great post! I''ve been struggling with useState, this really helped.', 514, 1, NOW() - INTERVAL '1 day'),
('Thanks for sharing! The useEffect examples were particularly useful.', 515, 1, NOW() - INTERVAL '2 days'),
('Excellent overview of microservices patterns. Bookmarked!', 513, 2, NOW() - INTERVAL '1 day'),
('I''ve been using Docker for a while but learned some new tricks here.', 516, 3, NOW() - INTERVAL '2 days'),
('Design systems are so important for team collaboration. Great insights!', 517, 4, NOW() - INTERVAL '3 days'),
('Python ML ecosystem is amazing. Thanks for the comprehensive guide!', 513, 5, NOW() - INTERVAL '4 days'),
('TypeScript has definitely improved my code quality. Great tips!', 515, 6, NOW() - INTERVAL '5 days'),
('API design is an art. These principles are spot on.', 516, 7, NOW() - INTERVAL '6 days'),
('Kubernetes is complex but this explanation makes it clearer.', 514, 8, NOW() - INTERVAL '7 days');

-- Insert dummy likes
INSERT INTO likes (creator_id, post_id, created_at) VALUES
(514, 1, NOW() - INTERVAL '1 day'),
(515, 1, NOW() - INTERVAL '2 days'),
(516, 1, NOW() - INTERVAL '1 day'),
(517, 1, NOW() - INTERVAL '3 days'),
(513, 2, NOW() - INTERVAL '1 day'),
(515, 2, NOW() - INTERVAL '2 days'),
(516, 2, NOW() - INTERVAL '1 day'),
(513, 3, NOW() - INTERVAL '2 days'),
(514, 3, NOW() - INTERVAL '1 day'),
(517, 3, NOW() - INTERVAL '3 days'),
(513, 4, NOW() - INTERVAL '3 days'),
(514, 4, NOW() - INTERVAL '2 days'),
(515, 4, NOW() - INTERVAL '1 day'),
(513, 5, NOW() - INTERVAL '4 days'),
(514, 5, NOW() - INTERVAL '3 days'),
(515, 5, NOW() - INTERVAL '2 days'),
(516, 5, NOW() - INTERVAL '1 day'),
(514, 6, NOW() - INTERVAL '5 days'),
(515, 6, NOW() - INTERVAL '4 days'),
(516, 6, NOW() - INTERVAL '3 days'),
(517, 6, NOW() - INTERVAL '2 days'),
(513, 7, NOW() - INTERVAL '6 days'),
(515, 7, NOW() - INTERVAL '5 days'),
(516, 7, NOW() - INTERVAL '4 days'),
(517, 7, NOW() - INTERVAL '3 days'),
(513, 8, NOW() - INTERVAL '7 days'),
(514, 8, NOW() - INTERVAL '6 days'),
(516, 8, NOW() - INTERVAL '5 days'),
(517, 8, NOW() - INTERVAL '4 days');

-- Insert dummy subscriptions (follow relationships)
INSERT INTO subscriptions (follower_id, followed_id, created_at) VALUES
(514, 513, NOW() - INTERVAL '10 days'),  -- jane follows john
(515, 513, NOW() - INTERVAL '9 days'),   -- mike follows john
(516, 513, NOW() - INTERVAL '8 days'),   -- sarah follows john
(517, 513, NOW() - INTERVAL '7 days'),   -- alex follows john
(513, 514, NOW() - INTERVAL '6 days'),   -- john follows jane
(515, 514, NOW() - INTERVAL '5 days'),   -- mike follows jane
(516, 514, NOW() - INTERVAL '4 days'),   -- sarah follows jane
(513, 515, NOW() - INTERVAL '3 days'),    -- john follows mike
(514, 515, NOW() - INTERVAL '2 days'),   -- jane follows mike
(517, 515, NOW() - INTERVAL '1 day'),    -- alex follows mike
(513, 516, NOW() - INTERVAL '5 days'),   -- john follows sarah
(514, 516, NOW() - INTERVAL '4 days'),   -- jane follows sarah
(515, 516, NOW() - INTERVAL '3 days'),    -- mike follows sarah
(513, 517, NOW() - INTERVAL '6 days'),   -- john follows alex
(514, 517, NOW() - INTERVAL '5 days'),   -- jane follows alex
(515, 517, NOW() - INTERVAL '4 days'),   -- mike follows alex
(516, 517, NOW() - INTERVAL '3 days');   -- sarah follows alex

-- Insert dummy notifications
INSERT INTO notifications (creator_id, receiver_id, content, created_at, is_read) VALUES
(514, 513, 'jane_smith liked your post "Getting Started with React Hooks"', NOW() - INTERVAL '1 day', false),
(515, 513, 'mike_wilson commented on your post "Getting Started with React Hooks"', NOW() - INTERVAL '2 days', true),
(516, 513, 'sarah_jones started following you', NOW() - INTERVAL '8 days', true),
(513, 514, 'john_doe liked your post "Building Scalable Microservices"', NOW() - INTERVAL '1 day', false),
(515, 514, 'mike_wilson started following you', NOW() - INTERVAL '5 days', true),
(513, 515, 'john_doe liked your post "Docker Best Practices"', NOW() - INTERVAL '2 days', false),
(514, 515, 'jane_smith started following you', NOW() - INTERVAL '2 days', true),
(513, 516, 'john_doe liked your post "Design Systems: A Complete Guide"', NOW() - INTERVAL '3 days', false),
(514, 516, 'jane_smith started following you', NOW() - INTERVAL '4 days', true),
(513, 517, 'john_doe liked your post "Machine Learning with Python"', NOW() - INTERVAL '4 days', false),
(514, 517, 'jane_smith started following you', NOW() - INTERVAL '5 days', true);

-- Insert dummy reports
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at) VALUES
(513, 514, NULL, 'Inappropriate content in posts', 'PENDING', NOW() - INTERVAL '1 day'),
(514, NULL, 3, 'Spam content', 'RESOLVED', NOW() - INTERVAL '2 days'),
(515, 516, NULL, 'Harassment in comments', 'PENDING', NOW() - INTERVAL '3 days');
