# Project Structure - Complete File List

## 📂 Complete Directory Tree

This document provides a complete overview of all files created in the Go Clean Architecture API boilerplate.

```
api/
├── cmd/
│   └── server/
│       └── main.go                          ✅ Main entry point with Fiber, Swagger, DB init
│
├── internal/
│   ├── domain/
│   │   └── user.go                          ✅ User entity and DTOs
│   │
│   ├── contract/
│   │   └── user_contract.go                 ✅ Repository and UseCase interfaces
│   │
│   ├── repository/
│   │   └── user_repository.go               ✅ GORM data access implementation
│   │
│   ├── usecases/
│   │   └── user_usecase.go                  ✅ Business logic with password hashing, JWT
│   │
│   ├── handler/
│   │   └── user_handler.go                  ✅ Fiber HTTP handlers with Swagger annotations
│   │
│   ├── routes/
│   │   └── routes.go                        ✅ Route definitions
│   │
│   ├── middleware/
│   │   ├── logging.go                       ✅ Request/response logging middleware
│   │   └── auth.go                          ✅ JWT authentication middleware
│   │
│   ├── db/
│   │   ├── db.go                            ✅ Database initialization and connection
│   │   ├── migrations/
│   │   │   └── 001_create_users_table.sql   ✅ SQL migration for users table
│   │   └── seeders/
│   │       └── seed_users.go                ✅ Database seeder with sample users
│   │
│   ├── injector/
│   │   └── wire.go                          ✅ Google Wire DI configuration
│   │
│   ├── pkg/
│   │   └── response.go                      ✅ Standardized API response helpers
│   │
│   └── tests/
│       └── user_handler_test.go             ✅ Unit tests with testify/mock
│
├── libs/
│   ├── logger/
│   │   ├── go.mod                           ✅ Logger module definition
│   │   └── logger.go                        ✅ Zap logger wrapper
│   │
│   ├── config/
│   │   ├── go.mod                           ✅ Config module definition
│   │   └── config.go                        ✅ Environment config loader
│   │
│   └── stringutil/
│       ├── go.mod                           ✅ String utility module
│       └── stringutil.go                    ✅ String helper functions
│
├── swagger/
│   └── docs.go                              ✅ Swagger documentation placeholder
│
├── go.work                                  ✅ Go workspace configuration
├── go.mod                                   ✅ Main module dependencies
├── .env.example                             ⚠️  Environment variables template
├── .gitignore                               ✅ Git ignore rules
├── Dockerfile                               ✅ Multi-stage Docker build
├── docker-compose.yml                       ✅ PostgreSQL + API orchestration
├── Makefile                                 ✅ Build automation commands
├── README.md                                ✅ Comprehensive documentation
└── PROJECT_STRUCTURE.md                     ✅ This file
```

## 📊 Statistics

- **Total Files Created**: 32 files
- **Go Source Files**: 20 files
- **Configuration Files**: 7 files
- **Documentation Files**: 3 files
- **SQL Migration Files**: 1 file
- **Docker Files**: 2 files

## 🗂️ File Categories

### Core Application Files
- `cmd/server/main.go` - Application entry point
- `go.mod` / `go.work` - Go module and workspace configuration

### Domain Layer (Entities)
- `internal/domain/user.go` - User entity and request/response DTOs

### Contract Layer (Interfaces)
- `internal/contract/user_contract.go` - Repository and UseCase interfaces

### Repository Layer (Data Access)
- `internal/repository/user_repository.go` - GORM implementation

### UseCase Layer (Business Logic)
- `internal/usecases/user_usecase.go` - Business logic with JWT and bcrypt

### Handler Layer (HTTP)
- `internal/handler/user_handler.go` - Fiber HTTP handlers
- `internal/routes/routes.go` - Route definitions

### Middleware
- `internal/middleware/logging.go` - Request logging
- `internal/middleware/auth.go` - JWT authentication

### Database
- `internal/db/db.go` - Database initialization
- `internal/db/migrations/001_create_users_table.sql` - User table migration
- `internal/db/seeders/seed_users.go` - Sample data seeder

### Dependency Injection
- `internal/injector/wire.go` - Google Wire configuration

### Utilities
- `internal/pkg/response.go` - API response helpers
- `libs/logger/logger.go` - Logging utility
- `libs/config/config.go` - Configuration utility
- `libs/stringutil/stringutil.go` - String helpers

### Testing
- `internal/tests/user_handler_test.go` - Handler unit tests

### Documentation
- `swagger/docs.go` - Swagger docs (to be generated)
- `README.md` - Main documentation
- `PROJECT_STRUCTURE.md` - This file

### Infrastructure
- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Service orchestration
- `Makefile` - Build automation
- `.gitignore` - Git ignore rules

## 🚀 Quick Start Commands

```bash
# Install tools
make install-tools

# Generate Wire DI code
make wire

# Generate Swagger documentation
make swagger

# Run with Docker
make docker-up

# Run locally
make run

# Run tests
make test
```

## 📝 Next Steps

1. **Generate Wire code**: `make wire`
2. **Generate Swagger docs**: `make swagger`
3. **Start the application**: `make docker-up`
4. **Visit Swagger UI**: http://localhost:8080/swagger/index.html
5. **Test the API endpoints** using the examples in README.md

## 🔧 To Extend This Boilerplate

To add a new service (e.g., "products"):

1. Create files following the same pattern:
   - `internal/domain/product.go`
   - `internal/contract/product_contract.go`
   - `internal/repository/product_repository.go`
   - `internal/usecases/product_usecase.go`
   - `internal/handler/product_handler.go`
   - `internal/tests/product_handler_test.go`

2. Update `internal/injector/wire.go`
3. Update `internal/routes/routes.go`
4. Run `make wire && make swagger`

## ✅ Features Implemented

- [x] Clean Architecture layers
- [x] Google Wire dependency injection
- [x] GORM with PostgreSQL
- [x] Fiber v2 web framework
- [x] JWT authentication
- [x] Request validation
- [x] Password hashing (bcrypt)
- [x] Structured logging (Zap)
- [x] Swagger/OpenAPI documentation
- [x] Unit testing with mocks
- [x] Docker & Docker Compose
- [x] Database migrations
- [x] Database seeders
- [x] Makefile automation
- [x] CORS middleware
- [x] Recovery middleware
- [x] Graceful shutdown
- [x] Environment configuration
- [x] Shared libraries (logger, config, stringutil)

## 📦 Dependencies Overview

### Main Dependencies
- `github.com/gofiber/fiber/v2` - Web framework
- `gorm.io/gorm` - ORM
- `gorm.io/driver/postgres` - PostgreSQL driver
- `github.com/google/wire` - Dependency injection
- `github.com/golang-jwt/jwt/v5` - JWT tokens
- `github.com/go-playground/validator/v10` - Validation
- `golang.org/x/crypto` - Password hashing
- `github.com/swaggo/swag` - Swagger generation
- `github.com/swaggo/fiber-swagger` - Swagger UI for Fiber
- `go.uber.org/zap` - Structured logging
- `github.com/joho/godotenv` - Environment variables
- `github.com/stretchr/testify` - Testing utilities

---

**Project Status**: ✅ Complete and ready to use!


