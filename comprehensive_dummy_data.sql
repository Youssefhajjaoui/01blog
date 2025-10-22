-- Comprehensive Dummy Data for Blog Platform
-- This script creates realistic dummy data for all tables

-- =========================
-- TRUNCATE TABLES FIRST (safe for reruns)
-- =========================
TRUNCATE TABLE reports, notifications, subscriptions, likes, comments, posts, users RESTART IDENTITY CASCADE;

-- =========================
-- INSERT REALISTIC USERS
-- =========================
INSERT INTO users (username, email, password_hash, image, bio, birthday, role, banned, ban_end, created_at) VALUES
-- Admins
('admin', 'admin@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=1', 'Platform administrator and tech enthusiast', '1985-03-15', 'ADMIN', false, null, '2023-01-01 10:00:00'),
('sarah_admin', 'sarah@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=2', 'Content moderator and community manager', '1990-07-22', 'ADMIN', false, null, '2023-01-15 14:30:00'),

-- Regular Users
('john_developer', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=3', 'Full-stack developer passionate about React and Node.js', '1992-05-10', 'USER', false, null, '2023-02-01 09:15:00'),
('emma_designer', 'emma@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=4', 'UI/UX designer creating beautiful digital experiences', '1988-11-30', 'USER', false, null, '2023-02-05 16:45:00'),
('mike_writer', 'mike@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=5', 'Technical writer and documentation specialist', '1987-08-18', 'USER', false, null, '2023-02-10 11:20:00'),
('lisa_photographer', 'lisa@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=6', 'Professional photographer capturing life moments', '1991-04-25', 'USER', false, null, '2023-02-15 13:10:00'),
('alex_entrepreneur', 'alex@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=7', 'Startup founder sharing business insights and experiences', '1985-12-03', 'USER', false, null, '2023-02-20 08:30:00'),
('sophia_teacher', 'sophia@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=8', 'Educator passionate about technology in learning', '1989-09-12', 'USER', false, null, '2023-02-25 15:45:00'),
('david_chef', 'david@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=9', 'Professional chef sharing culinary adventures and recipes', '1983-06-28', 'USER', false, null, '2023-03-01 12:00:00'),
('olivia_traveler', 'olivia@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=10', 'Travel blogger exploring the world one destination at a time', '1993-01-14', 'USER', false, null, '2023-03-05 10:15:00'),
('james_artist', 'james@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=11', 'Digital artist creating stunning visual experiences', '1990-10-07', 'USER', false, null, '2023-03-10 14:30:00'),
('maria_musician', 'maria@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=12', 'Musician and composer sharing musical journey', '1986-02-19', 'USER', false, null, '2023-03-15 17:20:00'),
('robert_fitness', 'robert@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=13', 'Fitness trainer helping people achieve their health goals', '1984-07-05', 'USER', false, null, '2023-03-20 06:45:00'),
('anna_scientist', 'anna@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=14', 'Research scientist passionate about environmental conservation', '1988-03-22', 'USER', false, null, '2023-03-25 09:30:00'),
('tom_gamer', 'tom@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=15', 'Gaming enthusiast and streamer sharing gaming experiences', '1995-11-08', 'USER', false, null, '2023-03-30 20:15:00'),
('lucy_blogger', 'lucy@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=16', 'Lifestyle blogger sharing daily inspiration and tips', '1991-05-16', 'USER', false, null, '2023-04-01 11:00:00'),
('chris_developer2', 'chris@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=17', 'Backend developer specializing in microservices and cloud architecture', '1987-09-03', 'USER', false, null, '2023-04-05 13:45:00'),
('jessica_marketer', 'jessica@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=18', 'Digital marketing specialist sharing growth strategies', '1989-12-11', 'USER', false, null, '2023-04-10 16:20:00'),
('ryan_podcaster', 'ryan@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=19', 'Podcast host discussing technology and innovation', '1985-08-27', 'USER', false, null, '2023-04-15 19:30:00'),
('zoe_fashion', 'zoe@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=20', 'Fashion blogger and style influencer', '1992-06-14', 'USER', false, null, '2023-04-20 12:15:00'),
('kevin_finance', 'kevin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'https://picsum.photos/200/200?random=21', 'Financial advisor helping people make smart money decisions', '1983-04-09', 'USER', false, null, '2023-04-25 08:45:00');

-- =========================
-- INSERT REALISTIC POSTS
-- =========================
INSERT INTO posts (creator_id, title, content, media_url, media_type, tags, created_at, updated_at) VALUES
-- Tech Posts
(3, 'Building Scalable React Applications', 'In this comprehensive guide, I''ll walk you through the best practices for building scalable React applications. We''ll cover component architecture, state management, performance optimization, and testing strategies that will help you create maintainable and efficient applications.', 'https://picsum.photos/800/400?random=101', 'IMAGE', ARRAY['react', 'javascript', 'webdev', 'tutorial'], '2023-05-01 10:00:00', '2023-05-02 14:30:00'),
(4, 'The Future of UI/UX Design', 'Design trends are constantly evolving, and as designers, we need to stay ahead of the curve. Let me share my thoughts on emerging design patterns, accessibility considerations, and how AI is shaping the future of user experience.', 'https://picsum.photos/800/400?random=102', 'IMAGE', ARRAY['design', 'ui', 'ux', 'future'], '2023-05-03 15:20:00', null),
(5, 'Technical Writing Best Practices', 'Clear documentation is crucial for any project''s success. Here are the essential principles I''ve learned over years of technical writing that will help you create documentation that developers actually want to read.', 'https://picsum.photos/800/400?random=103', 'IMAGE', ARRAY['writing', 'documentation', 'tech', 'tips'], '2023-05-05 09:15:00', '2023-05-06 11:45:00'),

-- Photography Posts
(6, 'Capturing Golden Hour Magic', 'There''s something magical about golden hour photography. The warm, soft light creates an atmosphere that''s impossible to replicate. Here are my favorite techniques for making the most of this beautiful time of day.', 'https://picsum.photos/800/400?random=104', 'IMAGE', ARRAY['photography', 'golden-hour', 'tips', 'nature'], '2023-05-07 18:30:00', null),
(6, 'Street Photography Ethics', 'Street photography is a powerful art form, but it comes with important ethical considerations. Let''s discuss how to respect your subjects while creating meaningful images that tell compelling stories.', 'https://picsum.photos/800/400?random=105', 'IMAGE', ARRAY['photography', 'street', 'ethics', 'art'], '2023-05-10 14:00:00', null),

-- Business Posts
(7, 'From Idea to Startup: My Journey', 'Starting a business is never easy, but the lessons learned along the way are invaluable. I''m sharing my personal journey from initial idea to successful startup, including the mistakes I made and what I''d do differently.', 'https://picsum.photos/800/400?random=106', 'IMAGE', ARRAY['startup', 'business', 'entrepreneur', 'journey'], '2023-05-12 11:30:00', '2023-05-13 16:20:00'),
(7, 'Building a Remote Team Culture', 'Remote work has become the new normal, but building a strong team culture remotely requires intentional effort. Here are the strategies that have worked for our distributed team.', 'https://picsum.photos/800/400?random=107', 'IMAGE', ARRAY['remote-work', 'team', 'culture', 'management'], '2023-05-15 13:45:00', null),

-- Education Posts
(8, 'Teaching Technology to Kids', 'Introducing children to technology can be both exciting and challenging. I''ll share my experiences teaching coding to elementary students and the creative approaches that keep them engaged.', 'https://picsum.photos/800/400?random=108', 'IMAGE', ARRAY['education', 'kids', 'coding', 'teaching'], '2023-05-18 10:15:00', null),
(8, 'The Importance of Digital Literacy', 'In our increasingly digital world, digital literacy is no longer optional—it''s essential. Let''s explore why this skill matters and how we can help others develop it.', 'https://picsum.photos/800/400?random=109', 'IMAGE', ARRAY['education', 'digital-literacy', 'technology', 'skills'], '2023-05-20 15:30:00', null),

-- Food Posts
(9, 'Mastering the Art of Sourdough', 'Sourdough bread making is both science and art. After months of experimentation, I''ve finally cracked the code to perfect sourdough. Here''s my step-by-step process and the common mistakes to avoid.', 'https://picsum.photos/800/400?random=110', 'IMAGE', ARRAY['cooking', 'sourdough', 'bread', 'recipe'], '2023-05-22 08:00:00', '2023-05-23 12:15:00'),
(9, 'Farm-to-Table: A Chef''s Perspective', 'Working with local farmers has transformed how I approach cooking. The quality and freshness of ingredients make all the difference. Here''s why I''m passionate about farm-to-table dining.', 'https://picsum.photos/800/400?random=111', 'IMAGE', ARRAY['cooking', 'farm-to-table', 'sustainability', 'local'], '2023-05-25 17:45:00', null),

-- Travel Posts
(10, 'Hidden Gems of Southeast Asia', 'Beyond the tourist hotspots, Southeast Asia offers incredible hidden gems waiting to be discovered. From secluded beaches to ancient temples, here are my favorite off-the-beaten-path destinations.', 'https://picsum.photos/800/400?random=112', 'IMAGE', ARRAY['travel', 'southeast-asia', 'adventure', 'culture'], '2023-05-28 12:00:00', null),
(10, 'Solo Travel Safety Tips', 'Solo travel can be incredibly rewarding, but safety should always be your top priority. Here are the essential safety tips I''ve learned from years of traveling alone.', 'https://picsum.photos/800/400?random=113', 'IMAGE', ARRAY['travel', 'solo-travel', 'safety', 'tips'], '2023-05-30 14:30:00', null),

-- Art Posts
(11, 'Digital Art Techniques', 'Digital art opens up endless creative possibilities. I''ll share my favorite techniques for creating stunning digital artwork, from basic concepts to advanced methods.', 'https://picsum.photos/800/400?random=114', 'IMAGE', ARRAY['art', 'digital-art', 'techniques', 'creativity'], '2023-06-02 16:20:00', null),
(11, 'Finding Your Artistic Voice', 'Every artist struggles with finding their unique voice. Here''s my journey of self-discovery and the exercises that helped me develop my personal artistic style.', 'https://picsum.photos/800/400?random=115', 'IMAGE', ARRAY['art', 'creativity', 'personal-style', 'inspiration'], '2023-06-05 11:45:00', null),

-- Music Posts
(12, 'The Science of Music Production', 'Music production combines creativity with technical knowledge. I''ll break down the essential concepts every aspiring producer should understand, from mixing to mastering.', 'https://picsum.photos/800/400?random=116', 'IMAGE', ARRAY['music', 'production', 'audio', 'technology'], '2023-06-08 19:30:00', null),
(12, 'Collaborating with Other Musicians', 'Collaboration can take your music to new heights. Here are my tips for successful musical partnerships and how to make the most of creative collaborations.', 'https://picsum.photos/800/400?random=117', 'IMAGE', ARRAY['music', 'collaboration', 'creativity', 'partnership'], '2023-06-10 15:15:00', null),

-- Fitness Posts
(13, 'Building a Sustainable Fitness Routine', 'Consistency is key in fitness, but sustainability is what makes it last. Here''s how to create a workout routine that you''ll actually stick to long-term.', 'https://picsum.photos/800/400?random=118', 'IMAGE', ARRAY['fitness', 'routine', 'sustainability', 'health'], '2023-06-12 06:30:00', null),
(13, 'Nutrition Myths Debunked', 'There''s a lot of misinformation about nutrition out there. Let me debunk some common myths and share evidence-based nutrition advice.', 'https://picsum.photos/800/400?random=119', 'IMAGE', ARRAY['nutrition', 'health', 'myths', 'science'], '2023-06-15 08:45:00', null),

-- Science Posts
(14, 'Climate Change Solutions', 'Climate change is one of our greatest challenges, but there are solutions. I''ll explore the latest research and innovative approaches to addressing this global issue.', 'https://picsum.photos/800/400?random=120', 'IMAGE', ARRAY['climate-change', 'environment', 'science', 'solutions'], '2023-06-18 13:20:00', null),
(14, 'The Future of Renewable Energy', 'Renewable energy technology is advancing rapidly. Here''s what the future holds for solar, wind, and other clean energy sources.', 'https://picsum.photos/800/400?random=121', 'IMAGE', ARRAY['renewable-energy', 'technology', 'future', 'sustainability'], '2023-06-20 10:00:00', null),

-- Gaming Posts
(15, 'The Evolution of Gaming', 'Gaming has come a long way from simple pixelated graphics. Let''s explore how technology has transformed the gaming industry and what the future holds.', 'https://picsum.photos/800/400?random=122', 'IMAGE', ARRAY['gaming', 'technology', 'evolution', 'future'], '2023-06-22 20:15:00', null),
(15, 'Indie Game Development', 'Creating indie games is both challenging and rewarding. Here''s my experience developing my first game and the lessons I learned along the way.', 'https://picsum.photos/800/400?random=123', 'IMAGE', ARRAY['gaming', 'indie', 'development', 'creativity'], '2023-06-25 18:30:00', null),

-- Lifestyle Posts
(16, 'Minimalist Living Tips', 'Minimalism isn''t about having less—it''s about making room for what matters most. Here are practical tips for embracing a minimalist lifestyle.', 'https://picsum.photos/800/400?random=124', 'IMAGE', ARRAY['lifestyle', 'minimalism', 'simplicity', 'wellness'], '2023-06-28 12:30:00', null),
(16, 'Building Better Habits', 'Good habits are the foundation of a successful life. I''ll share the science-backed strategies for building habits that stick.', 'https://picsum.photos/800/400?random=125', 'IMAGE', ARRAY['habits', 'productivity', 'self-improvement', 'psychology'], '2023-07-01 09:15:00', null),

-- Backend Development Posts
(17, 'Microservices Architecture', 'Microservices offer flexibility and scalability, but they also introduce complexity. Here''s how to design and implement microservices effectively.', 'https://picsum.photos/800/400?random=126', 'IMAGE', ARRAY['microservices', 'architecture', 'backend', 'scalability'], '2023-07-03 14:45:00', null),
(17, 'Database Optimization Techniques', 'Database performance can make or break your application. Here are the essential optimization techniques every developer should know.', 'https://picsum.photos/800/400?random=127', 'IMAGE', ARRAY['database', 'optimization', 'performance', 'sql'], '2023-07-05 11:20:00', null),

-- Marketing Posts
(18, 'Content Marketing Strategies', 'Content marketing is more than just creating content—it''s about creating value for your audience. Here are the strategies that drive real results.', 'https://picsum.photos/800/400?random=128', 'IMAGE', ARRAY['marketing', 'content', 'strategy', 'growth'], '2023-07-08 16:30:00', null),
(18, 'Social Media Analytics', 'Understanding your social media metrics is crucial for success. Here''s how to interpret analytics and make data-driven decisions.', 'https://picsum.photos/800/400?random=129', 'IMAGE', ARRAY['social-media', 'analytics', 'data', 'marketing'], '2023-07-10 13:15:00', null),

-- Podcast Posts
(19, 'Starting Your Own Podcast', 'Podcasting is a powerful medium for sharing ideas and building communities. Here''s everything you need to know to start your own podcast.', 'https://picsum.photos/800/400?random=130', 'IMAGE', ARRAY['podcast', 'audio', 'content', 'startup'], '2023-07-12 19:45:00', null),
(19, 'Interview Techniques', 'Great interviews don''t happen by accident. Here are the techniques I''ve learned for conducting engaging and insightful conversations.', 'https://picsum.photos/800/400?random=131', 'IMAGE', ARRAY['interviewing', 'communication', 'podcast', 'skills'], '2023-07-15 17:00:00', null),

-- Fashion Posts
(20, 'Sustainable Fashion Choices', 'Fashion doesn''t have to come at the cost of the environment. Here''s how to build a sustainable wardrobe that reflects your style.', 'https://picsum.photos/800/400?random=132', 'IMAGE', ARRAY['fashion', 'sustainability', 'style', 'environment'], '2023-07-18 12:45:00', null),
(20, 'Building a Capsule Wardrobe', 'A capsule wardrobe simplifies your life while maximizing your style options. Here''s how to create a versatile wardrobe with fewer pieces.', 'https://picsum.photos/800/400?random=133', 'IMAGE', ARRAY['fashion', 'capsule-wardrobe', 'minimalism', 'style'], '2023-07-20 10:30:00', null),

-- Finance Posts
(21, 'Investment Basics for Beginners', 'Investing can seem intimidating, but it doesn''t have to be. Here''s a beginner-friendly guide to getting started with investing.', 'https://picsum.photos/800/400?random=134', 'IMAGE', ARRAY['finance', 'investing', 'beginner', 'money'], '2023-07-22 08:30:00', null),
(21, 'Building an Emergency Fund', 'An emergency fund is your financial safety net. Here''s how to build one and why it''s essential for financial security.', 'https://picsum.photos/800/400?random=135', 'IMAGE', ARRAY['finance', 'emergency-fund', 'savings', 'security'], '2023-07-25 15:20:00', null);

-- =========================
-- INSERT COMMENTS
-- =========================
INSERT INTO comments (content, creator_id, post_id, created_at) VALUES
('Great post! I''ve been struggling with React performance issues. These tips are exactly what I needed.', 4, 1, '2023-05-01 14:30:00'),
('Thanks for sharing! I''m definitely going to implement these patterns in my next project.', 5, 1, '2023-05-01 16:45:00'),
('This is so helpful! I''ve been looking for a comprehensive guide like this.', 6, 1, '2023-05-02 09:15:00'),
('Love the design insights! The future of UI/UX is definitely exciting.', 3, 2, '2023-05-03 18:20:00'),
('Accessibility is so important. Thanks for highlighting this aspect!', 7, 2, '2023-05-04 11:30:00'),
('Excellent points about technical writing. Clear documentation saves so much time.', 3, 3, '2023-05-05 12:45:00'),
('I wish more developers would follow these documentation practices!', 8, 3, '2023-05-06 08:20:00'),
('Golden hour is magical! Your photos are absolutely stunning.', 7, 4, '2023-05-07 20:15:00'),
('These photography tips are gold! Can''t wait to try them out.', 9, 4, '2023-05-08 06:30:00'),
('Ethics in street photography is such an important topic. Thanks for addressing this.', 8, 5, '2023-05-10 16:45:00'),
('Your startup journey is inspiring! The lessons learned are invaluable.', 3, 6, '2023-05-12 14:30:00'),
('Remote team culture is challenging but so rewarding when done right.', 4, 7, '2023-05-15 16:20:00'),
('Teaching kids to code is so important for the future!', 5, 8, '2023-05-18 12:15:00'),
('Digital literacy is definitely essential in today''s world.', 6, 9, '2023-05-20 18:30:00'),
('Sourdough making is an art! Your tips are spot on.', 7, 10, '2023-05-22 10:45:00'),
('Farm-to-table is the way to go! Quality ingredients make all the difference.', 8, 11, '2023-05-25 19:15:00'),
('Southeast Asia has so many hidden gems! Thanks for sharing these.', 9, 12, '2023-05-28 14:00:00'),
('Solo travel safety tips are always appreciated!', 10, 13, '2023-05-30 16:30:00'),
('Digital art techniques are fascinating! Thanks for the tutorial.', 11, 14, '2023-06-02 18:20:00'),
('Finding your artistic voice is such a personal journey.', 12, 15, '2023-06-05 13:45:00'),
('Music production science is complex but so interesting!', 13, 16, '2023-06-08 21:30:00'),
('Collaboration in music can create amazing results!', 14, 17, '2023-06-10 17:15:00'),
('Sustainable fitness routines are the key to long-term success!', 15, 18, '2023-06-12 08:30:00'),
('Nutrition myths are everywhere! Thanks for debunking them.', 16, 19, '2023-06-15 10:45:00'),
('Climate change solutions give me hope for the future.', 17, 20, '2023-06-18 15:20:00'),
('Renewable energy is the future! Exciting times ahead.', 18, 21, '2023-06-20 12:00:00'),
('Gaming evolution has been incredible to witness!', 19, 22, '2023-06-22 22:15:00'),
('Indie game development is so creative and inspiring!', 20, 23, '2023-06-25 20:30:00'),
('Minimalist living has changed my life for the better!', 21, 24, '2023-06-28 14:30:00'),
('Building better habits is a lifelong journey.', 3, 25, '2023-07-01 11:15:00'),
('Microservices architecture is powerful but complex!', 4, 26, '2023-07-03 16:45:00'),
('Database optimization is crucial for performance!', 5, 27, '2023-07-05 13:20:00'),
('Content marketing strategies are evolving constantly!', 6, 28, '2023-07-08 18:30:00'),
('Social media analytics can be overwhelming but essential!', 7, 29, '2023-07-10 15:15:00'),
('Starting a podcast is easier than I thought!', 8, 30, '2023-07-12 21:45:00'),
('Interview techniques make all the difference!', 9, 31, '2023-07-15 19:00:00'),
('Sustainable fashion is the way forward!', 10, 32, '2023-07-18 14:45:00'),
('Capsule wardrobes simplify everything!', 11, 33, '2023-07-20 12:30:00'),
('Investment basics are so important to understand!', 12, 34, '2023-07-22 10:30:00'),
('Emergency funds provide such peace of mind!', 13, 35, '2023-07-25 17:20:00');

-- =========================
-- INSERT LIKES
-- =========================
INSERT INTO likes (creator_id, post_id, created_at) VALUES
(4, 1, '2023-05-01 15:30:00'),
(5, 1, '2023-05-01 16:45:00'),
(6, 1, '2023-05-02 09:15:00'),
(7, 1, '2023-05-02 11:20:00'),
(8, 1, '2023-05-02 14:30:00'),
(3, 2, '2023-05-03 18:20:00'),
(5, 2, '2023-05-04 10:30:00'),
(7, 2, '2023-05-04 11:30:00'),
(9, 2, '2023-05-04 15:45:00'),
(3, 3, '2023-05-05 12:45:00'),
(6, 3, '2023-05-06 08:20:00'),
(8, 3, '2023-05-06 10:15:00'),
(7, 4, '2023-05-07 20:15:00'),
(9, 4, '2023-05-08 06:30:00'),
(10, 4, '2023-05-08 08:45:00'),
(8, 5, '2023-05-10 16:45:00'),
(10, 5, '2023-05-11 09:30:00'),
(11, 5, '2023-05-11 12:15:00'),
(3, 6, '2023-05-12 14:30:00'),
(4, 6, '2023-05-12 16:20:00'),
(5, 6, '2023-05-13 10:45:00'),
(4, 7, '2023-05-15 16:20:00'),
(6, 7, '2023-05-16 09:15:00'),
(8, 7, '2023-05-16 11:30:00'),
(5, 8, '2023-05-18 12:15:00'),
(7, 8, '2023-05-18 14:45:00'),
(9, 8, '2023-05-19 08:30:00'),
(6, 9, '2023-05-20 18:30:00'),
(8, 9, '2023-05-21 10:20:00'),
(10, 9, '2023-05-21 12:45:00'),
(7, 10, '2023-05-22 10:45:00'),
(9, 10, '2023-05-23 07:30:00'),
(11, 10, '2023-05-23 09:15:00'),
(8, 11, '2023-05-25 19:15:00'),
(10, 11, '2023-05-26 11:45:00'),
(12, 11, '2023-05-26 14:20:00'),
(9, 12, '2023-05-28 14:00:00'),
(11, 12, '2023-05-29 09:30:00'),
(13, 12, '2023-05-29 12:15:00'),
(10, 13, '2023-05-30 16:30:00'),
(12, 13, '2023-05-31 08:45:00'),
(14, 13, '2023-05-31 11:20:00'),
(11, 14, '2023-06-02 18:20:00'),
(13, 14, '2023-06-03 10:15:00'),
(15, 14, '2023-06-03 13:30:00'),
(12, 15, '2023-06-05 13:45:00'),
(14, 15, '2023-06-06 09:20:00'),
(16, 15, '2023-06-06 12:45:00'),
(13, 16, '2023-06-08 21:30:00'),
(15, 16, '2023-06-09 11:45:00'),
(17, 16, '2023-06-09 14:20:00'),
(14, 17, '2023-06-10 17:15:00'),
(16, 17, '2023-06-11 09:30:00'),
(18, 17, '2023-06-11 12:15:00'),
(15, 18, '2023-06-12 08:30:00'),
(17, 18, '2023-06-13 06:45:00'),
(19, 18, '2023-06-13 09:20:00'),
(16, 19, '2023-06-15 10:45:00'),
(18, 19, '2023-06-16 08:15:00'),
(20, 19, '2023-06-16 11:30:00'),
(17, 20, '2023-06-18 15:20:00'),
(19, 20, '2023-06-19 10:45:00'),
(21, 20, '2023-06-19 13:20:00'),
(18, 21, '2023-06-20 12:00:00'),
(20, 21, '2023-06-21 09:15:00'),
(3, 21, '2023-06-21 11:45:00'),
(19, 22, '2023-06-22 22:15:00'),
(21, 22, '2023-06-23 14:30:00'),
(4, 22, '2023-06-23 16:45:00'),
(20, 23, '2023-06-25 20:30:00'),
(3, 23, '2023-06-26 12:15:00'),
(5, 23, '2023-06-26 14:30:00'),
(21, 24, '2023-06-28 14:30:00'),
(4, 24, '2023-06-29 10:20:00'),
(6, 24, '2023-06-29 12:45:00'),
(3, 25, '2023-07-01 11:15:00'),
(5, 25, '2023-07-02 09:30:00'),
(7, 25, '2023-07-02 11:45:00'),
(4, 26, '2023-07-03 16:45:00'),
(6, 26, '2023-07-04 12:20:00'),
(8, 26, '2023-07-04 14:35:00'),
(5, 27, '2023-07-05 13:20:00'),
(7, 27, '2023-07-06 10:45:00'),
(9, 27, '2023-07-06 12:30:00'),
(6, 28, '2023-07-08 18:30:00'),
(8, 28, '2023-07-09 14:15:00'),
(10, 28, '2023-07-09 16:20:00'),
(7, 29, '2023-07-10 15:15:00'),
(9, 29, '2023-07-11 11:30:00'),
(11, 29, '2023-07-11 13:45:00'),
(8, 30, '2023-07-12 21:45:00'),
(10, 30, '2023-07-13 15:20:00'),
(12, 30, '2023-07-13 17:35:00'),
(9, 31, '2023-07-15 19:00:00'),
(11, 31, '2023-07-16 13:45:00'),
(13, 31, '2023-07-16 15:30:00'),
(10, 32, '2023-07-18 14:45:00'),
(12, 32, '2023-07-19 10:20:00'),
(14, 32, '2023-07-19 12:35:00'),
(11, 33, '2023-07-20 12:30:00'),
(13, 33, '2023-07-21 08:45:00'),
(15, 33, '2023-07-21 10:20:00'),
(12, 34, '2023-07-22 10:30:00'),
(14, 34, '2023-07-23 07:15:00'),
(16, 34, '2023-07-23 09:30:00'),
(13, 35, '2023-07-25 17:20:00'),
(15, 35, '2023-07-26 13:45:00'),
(17, 35, '2023-07-26 15:30:00');

-- =========================
-- INSERT SUBSCRIPTIONS
-- =========================
INSERT INTO subscriptions (follower_id, followed_id, created_at) VALUES
-- Users following each other
(3, 4, '2023-05-01 10:00:00'),
(4, 3, '2023-05-01 11:00:00'),
(3, 5, '2023-05-02 09:00:00'),
(5, 3, '2023-05-02 10:00:00'),
(4, 5, '2023-05-03 08:00:00'),
(5, 4, '2023-05-03 09:00:00'),
(6, 3, '2023-05-04 07:00:00'),
(6, 4, '2023-05-04 08:00:00'),
(6, 5, '2023-05-04 09:00:00'),
(7, 3, '2023-05-05 06:00:00'),
(7, 4, '2023-05-05 07:00:00'),
(7, 6, '2023-05-05 08:00:00'),
(8, 3, '2023-05-06 05:00:00'),
(8, 5, '2023-05-06 06:00:00'),
(8, 7, '2023-05-06 07:00:00'),
(9, 4, '2023-05-07 04:00:00'),
(9, 6, '2023-05-07 05:00:00'),
(9, 8, '2023-05-07 06:00:00'),
(10, 3, '2023-05-08 03:00:00'),
(10, 6, '2023-05-08 04:00:00'),
(10, 9, '2023-05-08 05:00:00'),
(11, 4, '2023-05-09 02:00:00'),
(11, 7, '2023-05-09 03:00:00'),
(11, 10, '2023-05-09 04:00:00'),
(12, 5, '2023-05-10 01:00:00'),
(12, 8, '2023-05-10 02:00:00'),
(12, 11, '2023-05-10 03:00:00'),
(13, 6, '2023-05-11 00:00:00'),
(13, 9, '2023-05-11 01:00:00'),
(13, 12, '2023-05-11 02:00:00'),
(14, 7, '2023-05-12 23:00:00'),
(14, 10, '2023-05-12 00:00:00'),
(14, 13, '2023-05-13 01:00:00'),
(15, 8, '2023-05-13 22:00:00'),
(15, 11, '2023-05-13 23:00:00'),
(15, 14, '2023-05-14 00:00:00'),
(16, 9, '2023-05-14 21:00:00'),
(16, 12, '2023-05-14 22:00:00'),
(16, 15, '2023-05-15 23:00:00'),
(17, 10, '2023-05-15 20:00:00'),
(17, 13, '2023-05-15 21:00:00'),
(17, 16, '2023-05-16 22:00:00'),
(18, 11, '2023-05-16 19:00:00'),
(18, 14, '2023-05-16 20:00:00'),
(18, 17, '2023-05-17 21:00:00'),
(19, 12, '2023-05-17 18:00:00'),
(19, 15, '2023-05-17 19:00:00'),
(19, 18, '2023-05-18 20:00:00'),
(20, 13, '2023-05-18 17:00:00'),
(20, 16, '2023-05-18 18:00:00'),
(20, 19, '2023-05-19 19:00:00'),
(21, 14, '2023-05-19 16:00:00'),
(21, 17, '2023-05-19 17:00:00'),
(21, 20, '2023-05-20 18:00:00'),
-- Admins following users
(1, 3, '2023-05-01 12:00:00'),
(1, 4, '2023-05-01 13:00:00'),
(1, 5, '2023-05-01 14:00:00'),
(2, 6, '2023-05-02 11:00:00'),
(2, 7, '2023-05-02 12:00:00'),
(2, 8, '2023-05-02 13:00:00'),
-- Users following admins
(3, 1, '2023-05-03 10:00:00'),
(4, 1, '2023-05-03 11:00:00'),
(5, 2, '2023-05-03 12:00:00'),
(6, 2, '2023-05-03 13:00:00');

-- =========================
-- INSERT NOTIFICATIONS
-- =========================
INSERT INTO notifications (creator_id, receiver_id, content, created_at, is_read) VALUES
(3, 4, 'john_developer created a new post: Building Scalable React Applications', '2023-05-01 10:00:00', true),
(3, 5, 'john_developer created a new post: Building Scalable React Applications', '2023-05-01 10:00:00', true),
(3, 6, 'john_developer created a new post: Building Scalable React Applications', '2023-05-01 10:00:00', false),
(4, 3, 'emma_designer created a new post: The Future of UI/UX Design', '2023-05-03 15:20:00', true),
(4, 5, 'emma_designer created a new post: The Future of UI/UX Design', '2023-05-03 15:20:00', true),
(4, 7, 'emma_designer created a new post: The Future of UI/UX Design', '2023-05-03 15:20:00', false),
(5, 3, 'mike_writer created a new post: Technical Writing Best Practices', '2023-05-05 09:15:00', true),
(5, 6, 'mike_writer created a new post: Technical Writing Best Practices', '2023-05-05 09:15:00', true),
(5, 8, 'mike_writer created a new post: Technical Writing Best Practices', '2023-05-05 09:15:00', false),
(6, 7, 'lisa_photographer created a new post: Capturing Golden Hour Magic', '2023-05-07 18:30:00', true),
(6, 9, 'lisa_photographer created a new post: Capturing Golden Hour Magic', '2023-05-07 18:30:00', true),
(6, 10, 'lisa_photographer created a new post: Capturing Golden Hour Magic', '2023-05-07 18:30:00', false),
(7, 3, 'alex_entrepreneur created a new post: From Idea to Startup: My Journey', '2023-05-12 11:30:00', true),
(7, 4, 'alex_entrepreneur created a new post: From Idea to Startup: My Journey', '2023-05-12 11:30:00', true),
(7, 5, 'alex_entrepreneur created a new post: From Idea to Startup: My Journey', '2023-05-12 11:30:00', false),
(8, 5, 'sophia_teacher created a new post: Teaching Technology to Kids', '2023-05-18 10:15:00', true),
(8, 7, 'sophia_teacher created a new post: Teaching Technology to Kids', '2023-05-18 10:15:00', true),
(8, 9, 'sophia_teacher created a new post: Teaching Technology to Kids', '2023-05-18 10:15:00', false),
(9, 6, 'david_chef created a new post: Mastering the Art of Sourdough', '2023-05-22 08:00:00', true),
(9, 8, 'david_chef created a new post: Mastering the Art of Sourdough', '2023-05-22 08:00:00', true),
(9, 11, 'david_chef created a new post: Mastering the Art of Sourdough', '2023-05-22 08:00:00', false),
(10, 9, 'olivia_traveler created a new post: Hidden Gems of Southeast Asia', '2023-05-28 12:00:00', true),
(10, 11, 'olivia_traveler created a new post: Hidden Gems of Southeast Asia', '2023-05-28 12:00:00', true),
(10, 12, 'olivia_traveler created a new post: Hidden Gems of Southeast Asia', '2023-05-28 12:00:00', false),
(11, 10, 'james_artist created a new post: Digital Art Techniques', '2023-06-02 16:20:00', true),
(11, 12, 'james_artist created a new post: Digital Art Techniques', '2023-06-02 16:20:00', true),
(11, 13, 'james_artist created a new post: Digital Art Techniques', '2023-06-02 16:20:00', false),
(12, 11, 'maria_musician created a new post: The Science of Music Production', '2023-06-08 19:30:00', true),
(12, 13, 'maria_musician created a new post: The Science of Music Production', '2023-06-08 19:30:00', true),
(12, 14, 'maria_musician created a new post: The Science of Music Production', '2023-06-08 19:30:00', false),
(13, 12, 'robert_fitness created a new post: Building a Sustainable Fitness Routine', '2023-06-12 06:30:00', true),
(13, 14, 'robert_fitness created a new post: Building a Sustainable Fitness Routine', '2023-06-12 06:30:00', true),
(13, 15, 'robert_fitness created a new post: Building a Sustainable Fitness Routine', '2023-06-12 06:30:00', false),
(14, 13, 'anna_scientist created a new post: Climate Change Solutions', '2023-06-18 13:20:00', true),
(14, 15, 'anna_scientist created a new post: Climate Change Solutions', '2023-06-18 13:20:00', true),
(14, 16, 'anna_scientist created a new post: Climate Change Solutions', '2023-06-18 13:20:00', false),
(15, 14, 'tom_gamer created a new post: The Evolution of Gaming', '2023-06-22 20:15:00', true),
(15, 16, 'tom_gamer created a new post: The Evolution of Gaming', '2023-06-22 20:15:00', true),
(15, 17, 'tom_gamer created a new post: The Evolution of Gaming', '2023-06-22 20:15:00', false),
(16, 15, 'lucy_blogger created a new post: Minimalist Living Tips', '2023-06-28 12:30:00', true),
(16, 17, 'lucy_blogger created a new post: Minimalist Living Tips', '2023-06-28 12:30:00', true),
(16, 18, 'lucy_blogger created a new post: Minimalist Living Tips', '2023-06-28 12:30:00', false),
(17, 16, 'chris_developer2 created a new post: Microservices Architecture', '2023-07-03 14:45:00', true),
(17, 18, 'chris_developer2 created a new post: Microservices Architecture', '2023-07-03 14:45:00', true),
(17, 19, 'chris_developer2 created a new post: Microservices Architecture', '2023-07-03 14:45:00', false),
(18, 17, 'jessica_marketer created a new post: Content Marketing Strategies', '2023-07-08 16:30:00', true),
(18, 19, 'jessica_marketer created a new post: Content Marketing Strategies', '2023-07-08 16:30:00', true),
(18, 20, 'jessica_marketer created a new post: Content Marketing Strategies', '2023-07-08 16:30:00', false),
(19, 18, 'ryan_podcaster created a new post: Starting Your Own Podcast', '2023-07-12 19:45:00', true),
(19, 20, 'ryan_podcaster created a new post: Starting Your Own Podcast', '2023-07-12 19:45:00', true),
(19, 21, 'ryan_podcaster created a new post: Starting Your Own Podcast', '2023-07-12 19:45:00', false),
(20, 19, 'zoe_fashion created a new post: Sustainable Fashion Choices', '2023-07-18 12:45:00', true),
(20, 21, 'zoe_fashion created a new post: Sustainable Fashion Choices', '2023-07-18 12:45:00', true),
(20, 3, 'zoe_fashion created a new post: Sustainable Fashion Choices', '2023-07-18 12:45:00', false),
(21, 20, 'kevin_finance created a new post: Investment Basics for Beginners', '2023-07-22 08:30:00', true),
(21, 3, 'kevin_finance created a new post: Investment Basics for Beginners', '2023-07-22 08:30:00', true),
(21, 4, 'kevin_finance created a new post: Investment Basics for Beginners', '2023-07-22 08:30:00', false);

-- =========================
-- INSERT REPORTS
-- =========================
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at) VALUES
(3, 4, null, 'Inappropriate behavior in comments', 'PENDING', '2023-05-15 14:30:00'),
(4, null, 1, 'Spam content detected', 'REVIEWED', '2023-05-16 10:15:00'),
(5, 6, null, 'Harassment reported', 'PENDING', '2023-05-20 16:45:00'),
(6, null, 3, 'Copyright infringement', 'RESOLVED', '2023-05-25 09:20:00'),
(7, 8, null, 'Inappropriate profile content', 'PENDING', '2023-06-01 12:30:00'),
(8, null, 5, 'Misleading information', 'REVIEWED', '2023-06-05 15:45:00'),
(9, 10, null, 'Spam account', 'PENDING', '2023-06-10 11:20:00'),
(10, null, 7, 'Inappropriate language', 'RESOLVED', '2023-06-15 14:15:00'),
(11, 12, null, 'Fake account', 'PENDING', '2023-06-20 08:30:00'),
(12, null, 9, 'Hate speech', 'REVIEWED', '2023-06-25 17:45:00'),
(13, 14, null, 'Suspicious activity', 'PENDING', '2023-07-01 13:20:00'),
(14, null, 11, 'Inappropriate content', 'RESOLVED', '2023-07-05 10:15:00'),
(15, 16, null, 'Account impersonation', 'PENDING', '2023-07-10 16:30:00'),
(16, null, 13, 'Spam post', 'REVIEWED', '2023-07-15 12:45:00'),
(17, 18, null, 'Inappropriate behavior', 'PENDING', '2023-07-20 09:30:00'),
(18, null, 15, 'Copyright violation', 'RESOLVED', '2023-07-25 15:20:00'),
(19, 20, null, 'Harassment', 'PENDING', '2023-07-30 11:15:00'),
(20, null, 17, 'Misleading information', 'REVIEWED', '2023-08-01 14:30:00'),
(21, 3, null, 'Inappropriate comments', 'PENDING', '2023-08-05 08:45:00'),
(3, null, 19, 'Spam content', 'RESOLVED', '2023-08-10 16:20:00');

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
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Likes', COUNT(*) FROM likes
UNION ALL
SELECT 'Subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports;

-- =========================
-- DONE
-- =========================
