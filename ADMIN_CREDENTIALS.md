# Admin Default Credentials

## Default Admin Account

**Username:** `admin`
**Password:** `admin`

## How to Change Admin Password

You can set custom admin credentials via environment variables in `docker-compose.dev.yml`:

```yaml
environment:
  - ADMIN_USERNAME=your_username
  - ADMIN_PASSWORD=your_password
  - ADMIN_EMAIL=your_email@example.com
```

Or set them directly when running the application:

```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypassword docker-compose up
```

## Security Note

⚠️ **IMPORTANT**: Change the default admin password in production environments!

The default credentials are defined in `backend/src/main/java/com/example/demo/init/AdminInitializer.java`

