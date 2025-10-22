-- Insert dummy comments (using correct post IDs)
INSERT INTO comments (content, creator_id, post_id, created_at) VALUES
('Great post! I''ve been struggling with useState, this really helped.', 514, 10, NOW() - INTERVAL '1 day'),
('Thanks for sharing! The useEffect examples were particularly useful.', 515, 10, NOW() - INTERVAL '2 days'),
('Excellent overview of microservices patterns. Bookmarked!', 513, 11, NOW() - INTERVAL '1 day'),
('I''ve been using Docker for a while but learned some new tricks here.', 516, 12, NOW() - INTERVAL '2 days'),
('Design systems are so important for team collaboration. Great insights!', 517, 13, NOW() - INTERVAL '3 days'),
('Python ML ecosystem is amazing. Thanks for the comprehensive guide!', 513, 14, NOW() - INTERVAL '4 days'),
('TypeScript has definitely improved my code quality. Great tips!', 515, 15, NOW() - INTERVAL '5 days'),
('API design is an art. These principles are spot on.', 516, 16, NOW() - INTERVAL '6 days'),
('Kubernetes is complex but this explanation makes it clearer.', 514, 17, NOW() - INTERVAL '7 days');

-- Insert dummy likes (using correct post IDs)
INSERT INTO likes (creator_id, post_id, created_at) VALUES
(514, 10, NOW() - INTERVAL '1 day'),
(515, 10, NOW() - INTERVAL '2 days'),
(516, 10, NOW() - INTERVAL '1 day'),
(517, 10, NOW() - INTERVAL '3 days'),
(513, 11, NOW() - INTERVAL '1 day'),
(515, 11, NOW() - INTERVAL '2 days'),
(516, 11, NOW() - INTERVAL '1 day'),
(513, 12, NOW() - INTERVAL '2 days'),
(514, 12, NOW() - INTERVAL '1 day'),
(517, 12, NOW() - INTERVAL '3 days'),
(513, 13, NOW() - INTERVAL '3 days'),
(514, 13, NOW() - INTERVAL '2 days'),
(515, 13, NOW() - INTERVAL '1 day'),
(513, 14, NOW() - INTERVAL '4 days'),
(514, 14, NOW() - INTERVAL '3 days'),
(515, 14, NOW() - INTERVAL '2 days'),
(516, 14, NOW() - INTERVAL '1 day'),
(514, 15, NOW() - INTERVAL '5 days'),
(515, 15, NOW() - INTERVAL '4 days'),
(516, 15, NOW() - INTERVAL '3 days'),
(517, 15, NOW() - INTERVAL '2 days'),
(513, 16, NOW() - INTERVAL '6 days'),
(515, 16, NOW() - INTERVAL '5 days'),
(516, 16, NOW() - INTERVAL '4 days'),
(517, 16, NOW() - INTERVAL '3 days'),
(513, 17, NOW() - INTERVAL '7 days'),
(514, 17, NOW() - INTERVAL '6 days'),
(516, 17, NOW() - INTERVAL '5 days'),
(517, 17, NOW() - INTERVAL '4 days');

-- Insert dummy reports (using correct post ID)
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at) VALUES
(513, 514, NULL, 'Inappropriate content in posts', 'PENDING', NOW() - INTERVAL '1 day'),
(514, NULL, 12, 'Spam content', 'RESOLVED', NOW() - INTERVAL '2 days'),
(515, 516, NULL, 'Harassment in comments', 'PENDING', NOW() - INTERVAL '3 days');
