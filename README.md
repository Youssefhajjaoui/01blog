# 01Blog - Full Stack Blog Application

A modern blog application built with Angular frontend and Spring Boot backend.

## 🏗️ Architecture

- **Frontend**: Angular 20 with Bootstrap 5
- **Backend**: Spring Boot 3.5.5 with Spring Security
- **Database**: PostgreSQL 15
- **Authentication**: JWT tokens
- **Styling**: Bootstrap 5 + Custom SCSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Java 17+
- Docker and Docker Compose
- Maven 3.6+

### 1. Start the Database

```bash
# Navigate to the infra directory
cd infra

# Start PostgreSQL with Docker
docker-compose up -d

# Verify the database is running
docker ps
```

### 2. Start the Backend (Spring Boot)

```bash
# Navigate to the backend directory
cd backend/01blog

# Run the Spring Boot application
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The backend will be available at: http://localhost:9090

### 3. Start the Frontend (Angular)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: http://localhost:4200

## 📁 Project Structure

```
01Blog/
├── backend/01blog/          # Spring Boot backend
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Configuration files
│   └── pom.xml             # Maven dependencies
├── frontend/                # Angular frontend
│   ├── src/app/            # Angular components
│   ├── src/styles.scss     # Global styles
│   └── package.json        # Node dependencies
├── infra/                   # Infrastructure
│   └── docker-compose.yml  # PostgreSQL setup
└── Design 01Blog UI/       # React design reference
```

## 🔧 Configuration

### Backend Configuration

The backend is configured in `backend/01blog/src/main/resources/application.properties`:

- **Port**: 9090
- **Database**: PostgreSQL on localhost:5432
- **Database Name**: blogdb
- **Username**: admin
- **Password**: pass

### Frontend Configuration

The frontend is configured to connect to the backend API at `http://localhost:9090`.

## 🗄️ Database Setup

The application uses PostgreSQL with the following setup:

- **Host**: localhost
- **Port**: 5432
- **Database**: blogdb
- **Username**: admin
- **Password**: pass

Tables are automatically created by Hibernate when the application starts.

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Secret Key**: Configured in application.properties
- **Expiration**: 1 hour (3600000 ms)
- **Algorithm**: HS256

## 📱 Features

### Frontend Features
- ✅ User authentication (login/signup)
- ✅ Post creation and editing
- ✅ Post feed with like/comment functionality
- ✅ User profiles
- ✅ Settings management
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Dark mode support

### Backend Features
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ User management
- ✅ Post management
- ✅ Comment system
- ✅ Security configuration
- ✅ Database integration

## 🛠️ Development

### Backend Development

```bash
# Run tests
./mvnw test

# Build the application
./mvnw clean package

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development

```bash
# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
```

## 🐳 Docker Deployment

### Database Only
```bash
cd infra
docker-compose up -d
```

### Full Stack (Optional)
You can create a full Docker setup by adding the backend and frontend to the docker-compose.yml file.

## 🔍 API Endpoints

The backend provides the following main endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/{id}` - Get post by ID
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running: `docker ps`
   - Check database credentials in application.properties

2. **Port Already in Use**
   - Backend: Change `server.port` in application.properties
   - Frontend: Use `ng serve --port 4201`

3. **CORS Issues**
   - The backend is configured to allow requests from `http://localhost:4200`

4. **Build Errors**
   - Backend: Ensure Java 17+ is installed
   - Frontend: Ensure Node.js 18+ is installed

### Logs

- **Backend logs**: Check the console output from `./mvnw spring-boot:run`
- **Frontend logs**: Check the browser console and terminal output
- **Database logs**: `docker logs blogdb`

## 📝 Notes

- The application uses mock data for development
- JWT tokens are stored in localStorage
- The frontend includes a comprehensive design system
- All components are responsive and mobile-friendly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.
