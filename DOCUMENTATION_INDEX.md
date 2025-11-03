# Documentation Index

Quick reference guide to all project documentation.

## 📚 Main Documentation

### Getting Started
- **[README.md](README.md)** - Project overview, quick start, and basic setup
- **[LOGIN_INSTRUCTIONS.md](LOGIN_INSTRUCTIONS.md)** - Default credentials and login process

### Comprehensive Guides
- **[PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md)** ⭐ - Complete audit guide covering all aspects
  - Architecture overview
  - Security features
  - Rate limiting
  - Authentication & authorization
  - API endpoints
  - Key technical concepts
  - Deployment configuration

### Database
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete database schema documentation
  - Table schemas
  - Relationships
  - Flyway migrations
  - Common queries
  - Backup/restore

### Gateway & Architecture
- **[GATEWAY_SETUP_GUIDE.md](GATEWAY_SETUP_GUIDE.md)** - Step-by-step gateway setup
- **[GATEWAY_ARCHITECTURE_EXPLANATION.md](GATEWAY_ARCHITECTURE_EXPLANATION.md)** - Gateway architecture deep dive
- **[ARCHITECTURE_COMPARISON.md](ARCHITECTURE_COMPARISON.md)** - Before/after gateway comparison

### Security & Performance
- **[RATE_LIMITING_CONFIGURATION.md](RATE_LIMITING_CONFIGURATION.md)** - Rate limiting setup and limits
- **[TROUBLESHOOTING_CORS.md](TROUBLESHOOTING_CORS.md)** - CORS issues and solutions
- **[backend/JWT_TOKEN_INVALIDATION_GUIDE.md](backend/JWT_TOKEN_INVALIDATION_GUIDE.md)** - JWT logout and blacklist

## 🎯 Quick Navigation by Topic

### For New Developers
1. Start with [README.md](README.md) for overview
2. Read [PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md) for architecture
3. Check [LOGIN_INSTRUCTIONS.md](LOGIN_INSTRUCTIONS.md) for credentials

### For Auditors
1. **[PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md)** - Security audit checklist
2. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Data integrity verification
3. **[RATE_LIMITING_CONFIGURATION.md](RATE_LIMITING_CONFIGURATION.md)** - Performance tuning

### For DevOps
1. [README.md](README.md) - Quick start commands
2. **[GATEWAY_SETUP_GUIDE.md](GATEWAY_SETUP_GUIDE.md)** - Production setup
3. **[PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md)** - Deployment configuration

### For Backend Developers
1. **[PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md)** - Backend architecture
2. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Entity relationships
3. **[backend/JWT_TOKEN_INVALIDATION_GUIDE.md](backend/JWT_TOKEN_INVALIDATION_GUIDE.md)** - Auth implementation

### For Frontend Developers
1. [README.md](README.md) - Frontend setup
2. **[PROJECT_AUDIT_GUIDE.md](PROJECT_AUDIT_GUIDE.md)** - Component structure
3. **[TROUBLESHOOTING_CORS.md](TROUBLESHOOTING_CORS.md)** - CORS issues

## 📊 Documentation Summary

| Document | Size | Purpose | Audience |
|----------|------|---------|----------|
| README.md | 8.9K | Overview & quick start | Everyone |
| PROJECT_AUDIT_GUIDE.md | 16K | Comprehensive audit | Auditors, Developers |
| DATABASE_SCHEMA.md | 10K | Database reference | Backend, DBA |
| GATEWAY_ARCHITECTURE_EXPLANATION.md | 19K | Gateway deep dive | Backend, DevOps |
| RATE_LIMITING_CONFIGURATION.md | 6.9K | Rate limits | DevOps, Security |
| GATEWAY_SETUP_GUIDE.md | 9.3K | Setup instructions | DevOps |
| ARCHITECTURE_COMPARISON.md | 12K | Performance comparison | Architects |

## 🔍 Search Guide

### Finding Information

**Security Features**:
- HttpOnly cookies → PROJECT_AUDIT_GUIDE.md
- XSS prevention → PROJECT_AUDIT_GUIDE.md
- Rate limiting → RATE_LIMITING_CONFIGURATION.md
- JWT blacklist → backend/JWT_TOKEN_INVALIDATION_GUIDE.md

**Database**:
- Table schemas → DATABASE_SCHEMA.md
- Migrations → DATABASE_SCHEMA.md
- Relationships → DATABASE_SCHEMA.md

**Architecture**:
- Request flow → GATEWAY_ARCHITECTURE_EXPLANATION.md
- Component structure → PROJECT_AUDIT_GUIDE.md
- API endpoints → PROJECT_AUDIT_GUIDE.md

**Deployment**:
- Docker setup → README.md
- Gateway setup → GATEWAY_SETUP_GUIDE.md
- Configuration → PROJECT_AUDIT_GUIDE.md

---

**Last Updated**: 2024
**Total Documentation**: 89.1 KB

