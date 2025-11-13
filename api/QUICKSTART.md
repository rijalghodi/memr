# 🚀 Quick Start Guide

Get your Go Clean Architecture API running in 5 minutes!

## ⚡ Fastest Way - Docker Compose

```bash
# Navigate to the API directory
cd /home/rijalghodi/Documents/projects/personal/memr/api

# Start everything (PostgreSQL + API)
make docker-up
```

That's it! 🎉

**Access your API:**
- API Base: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html
- Health Check: http://localhost:8080/api/v1/health

## 🧪 Test It Out

### 1. Create a User (Register)

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from the response!**

### 3. Get All Users (Protected)

```bash
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Pre-seeded Users

The database comes with 5 pre-seeded users (all with password `password123`):
- john@example.com
- jane@example.com
- bob@example.com
- alice@example.com
- charlie@example.com

Try logging in with any of these!

## 🔧 Local Development (Without Docker)

### Prerequisites
```bash
# Install required tools
make install-tools

# This installs:
# - Google Wire (dependency injection)
# - Swag (Swagger docs)
# - golangci-lint (code linting)
```

### Setup

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Ensure PostgreSQL is running** (locally or via Docker):
```bash
# If using Docker for PostgreSQL only:
docker run -d \
  --name memr_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

3. **Generate Wire DI code:**
```bash
make wire
```

4. **Generate Swagger docs:**
```bash
make swagger
```

5. **Run the application:**
```bash
make run
```

## 🛠️ Essential Commands

```bash
# Development
make run              # Run locally
make dev              # Run with hot reload (requires air)
make test             # Run tests
make wire             # Generate DI code
make swagger          # Generate API docs

# Docker
make docker-up        # Start all services
make docker-down      # Stop all services
make docker-rebuild   # Rebuild and restart

# Code Quality
make fmt              # Format code
make lint             # Lint code

# Database
make migrate          # Run migrations
make seed             # Seed database

# Help
make help             # Show all commands
```

## 📖 Swagger UI

Open in your browser: http://localhost:8080/swagger/index.html

You can test all endpoints directly from Swagger UI:
1. Try the `/auth/login` endpoint to get a token
2. Click the "Authorize" button (top right)
3. Enter: `Bearer YOUR_TOKEN`
4. Now you can test protected endpoints!

## 🐛 Troubleshooting

### Port already in use
```bash
# Stop existing services
make docker-down

# Or change the port in .env:
PORT=8081
```

### Database connection failed
```bash
# Check if PostgreSQL is running:
docker ps | grep postgres

# Check database logs:
docker logs memr_postgres
```

### Wire generation failed
```bash
# Make sure Wire is installed:
go install github.com/google/wire/cmd/wire@latest

# Then regenerate:
make wire
```

### Swagger not showing
```bash
# Regenerate Swagger docs:
make swagger

# Restart the application:
make docker-rebuild
```

## 📚 Next Steps

1. **Read the full documentation**: `README.md`
2. **Explore the code structure**: `PROJECT_STRUCTURE.md`
3. **Understand the architecture**: See `README.md` architecture section
4. **Add your own features**: Follow the extension guide in `README.md`

## 🎯 Project Highlights

✅ **Clean Architecture** - Proper separation of concerns  
✅ **Wire DI** - Compile-time dependency injection  
✅ **JWT Auth** - Secure authentication  
✅ **Swagger Docs** - Auto-generated API documentation  
✅ **Unit Tests** - Example tests with mocks  
✅ **Docker Ready** - One command deployment  
✅ **Production Ready** - Best practices throughout  

## 💡 Pro Tips

1. **Use Swagger UI** for API testing (easier than curl)
2. **Check logs** with: `docker logs -f memr_api`
3. **Auto-reload** during dev: `make dev` (requires air)
4. **Test coverage**: `make test` generates `coverage.html`

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `PROJECT_STRUCTURE.md` for file organization
- Open an issue on GitHub for bugs or questions

---

**Happy Coding! 🎉**

Start exploring the codebase in `internal/` to understand the Clean Architecture pattern!


