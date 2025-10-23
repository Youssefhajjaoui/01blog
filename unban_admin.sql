-- Emergency script to unban admin users
-- Run this if you accidentally banned your admin account

UPDATE users 
SET banned = false, 
    ban_end = NULL 
WHERE role = 'ADMIN';

-- Verify the change
SELECT id, username, email, role, banned, ban_end 
FROM users 
WHERE role = 'ADMIN';
