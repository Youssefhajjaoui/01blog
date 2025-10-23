# Emergency Admin Unban Solutions

If you accidentally banned your admin account, here are several ways to fix it:

## Method 1: Direct Database Update (Fastest)

```bash
# Connect to the database and run:
docker exec -i blogdb psql -U admin -d blogdb -c "UPDATE users SET banned = false, ban_end = NULL WHERE role = 'ADMIN';"
```

## Method 2: Using the SQL Script

```bash
# Run the pre-made SQL script:
docker exec -i blogdb psql -U admin -d blogdb < unban_admin.sql
```

## Method 3: Using the Emergency Script

```bash
# Make sure backend is running, then:
./emergency_unban_admin.sh
```

## Method 4: Using the Emergency API Endpoint

```bash
# Direct API call:
curl -X POST "http://localhost:9090/api/admin/emergency/unban-admin?secretKey=EMERGENCY_ADMIN_UNBAN_2024"
```

## Method 5: Manual Database Access

1. Connect to PostgreSQL:
   ```bash
   docker exec -it blogdb psql -U admin -d blogdb
   ```

2. Run the update command:
   ```sql
   UPDATE users SET banned = false, ban_end = NULL WHERE role = 'ADMIN';
   ```

3. Verify the change:
   ```sql
   SELECT id, username, email, role, banned, ban_end FROM users WHERE role = 'ADMIN';
   ```

4. Exit PostgreSQL:
   ```sql
   \q
   ```

## Prevention Tips

1. **Test with non-admin users first** before banning admin accounts
2. **Create a backup admin account** with a different username
3. **Use the emergency endpoint** as a safety net
4. **Keep the secret key** `EMERGENCY_ADMIN_UNBAN_2024` safe but accessible

## Emergency Secret Key

The emergency endpoint uses this secret key: `EMERGENCY_ADMIN_UNBAN_2024`

Keep this key safe but accessible in case you need to unban admin accounts in the future.
