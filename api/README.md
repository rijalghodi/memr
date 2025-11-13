# Go Clean Architecture API Boilerplate

A production-ready Go backend boilerplate implementing Clean Architecture with Dependency Injection using Google Wire. This project demonstrates best practices for building scalable, maintainable microservices with a complete CRUD user service example.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│           HTTP/REST (Fiber)                 │
├─────────────────────────────────────────────┤
│           Handler Layer                      │
│    (HTTP request/response handling)          │
├─────────────────────────────────────────────┤
│          UseCase Layer                       │
│      (Business logic & rules)                │
├─────────────────────────────────────────────┤
│        Repository Layer                      │
│       (Data access with GORM)                │
├─────────────────────────────────────────────┤
│          Domain Layer                        │
│    (Entities & Interfaces)                   │
└─────────────────────────────────────────────┘
```

### Key Features

- ✅ **Clean Architecture** - Clear separation of concerns
- ✅ **Dependency Injection** - Google Wire for compile-time DI
- ✅ **Database ORM** - GORM with PostgreSQL
- ✅ **Validation** - go-playground/validator for request validation
- ✅ **Authentication** - JWT-based authentication
- ✅ **API Documentation** - Swagger/OpenAPI integration
- ✅ **Middleware** - Logging, CORS, JWT authentication
- ✅ **Testing** - Unit tests with testify/mock
- ✅ **Docker** - Full Docker Compose setup
- ✅ **Structured Logging** - Zap logger
- ✅ **Environment Config** - Centralized configuration management
- ✅ **Database Migrations** - SQL migrations and seeders

## 📁 Project Structure

```
api/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── internal/
│   ├── domain/
│   │   └── user.go                 # Domain entities
│   ├── contract/
│   │   └── user_contract.go        # Repository & UseCase interfaces
│   ├── repository/
│   │   └── user_repository.go      # Data access layer (GORM)
│   ├── usecases/
│   │   └── user_usecase.go         # Business logic layer
│   ├── handler/
│   │   └── user_handler.go         # HTTP handlers (Fiber)
│   ├── routes/
│   │   └── routes.go               # Route definitions
│   ├── middleware/
│   │   ├── logging.go              # Logging middleware
│   │   └── auth.go                 # JWT authentication middleware
│   ├── db/
│   │   ├── db.go                   # Database initialization
│   │   ├── migrations/
│   │   │   └── 001_create_users_table.sql
│   │   └── seeders/
│   │       └── seed_users.go       # Database seeders
│   ├── injector/
│   │   └── wire.go                 # Wire DI configuration
│   ├── pkg/
│   │   └── response.go             # Standardized API responses
│   └── tests/
│       └── user_handler_test.go    # Unit tests
├── libs/
│   ├── logger/                     # Shared logging library
│   ├── config/                     # Shared config library
│   └── stringutil/                 # Shared string utilities
├── swagger/
│   └── docs.go                     # Swagger documentation
├── go.work                         # Go workspace configuration
├── go.mod                          # Go module dependencies
├── Dockerfile                      # Docker build configuration
├── docker-compose.yml              # Docker Compose setup
├── Makefile                        # Build automation
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites

- **Go 1.22+** - [Install Go](https://golang.org/doc/install)
- **PostgreSQL 15+** - Or use Docker Compose (recommended)
- **Make** - For running build commands
- **Docker & Docker Compose** - For containerized deployment

### Installation

1. **Clone the repository**

```bash
cd /home/rijalghodi/Documents/projects/personal/memr/api
```

2. **Install development tools**

```bash
make install-tools
```

This installs:
- Google Wire (for dependency injection)
- Swag (for Swagger documentation)
- golangci-lint (for code linting)

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=8080
ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_SSLMODE=disable

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRY=24h
```

4. **Download dependencies**

```bash
make deps
```

5. **Generate Wire DI code**

```bash
make wire
```

6. **Generate Swagger documentation**

```bash
make swagger
```

## 🐳 Running with Docker (Recommended)

The easiest way to run the application is with Docker Compose:

```bash
# Start all services (API + PostgreSQL)
make docker-up

# View logs
docker-compose logs -f api

# Stop all services
make docker-down

# Rebuild and restart
make docker-rebuild
```

The API will be available at:
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **Health Check**: http://localhost:8080/api/v1/health

## 🔧 Running Locally (Without Docker)

1. **Ensure PostgreSQL is running**

2. **Run database migrations**

```bash
make migrate
```

3. **Seed the database** (optional, development only)

```bash
make seed
```

4. **Run the application**

```bash
make run
```

Or with hot reload (requires [air](https://github.com/cosmtrek/air)):

```bash
make dev
```

## 📚 API Documentation

### Swagger UI

Once the application is running, visit:
- **Swagger UI**: http://localhost:8080/swagger/index.html

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login and get JWT token | No |

#### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/users` | Create a new user (register) | No |
| GET | `/api/v1/users` | Get all users | Yes |
| GET | `/api/v1/users/:id` | Get user by ID | Yes |
| PUT | `/api/v1/users/:id` | Update user | Yes |
| DELETE | `/api/v1/users/:id` | Delete user | Yes |

### Example Requests

#### Register a new user

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-11-13T10:00:00Z",
      "updated_at": "2025-11-13T10:00:00Z"
    }
  }
}
```

#### Get all users (with authentication)

```bash
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

Run all tests:

```bash
make test
```

This will:
- Run all unit tests
- Generate coverage report
- Create `coverage.html` for viewing coverage

View coverage:

```bash
open coverage.html  # macOS
xdg-open coverage.html  # Linux
```

## 🛠️ Development

### Available Make Commands

```bash
make help           # Show all available commands
make run            # Run the application locally
make build          # Build the application binary
make test           # Run all tests
make wire           # Generate Wire DI code
make swagger        # Generate Swagger documentation
make migrate        # Run database migrations
make seed           # Seed the database
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make docker-rebuild # Rebuild Docker services
make clean          # Clean build artifacts
make install-tools  # Install development tools
make deps           # Download and update dependencies
make fmt            # Format code
make lint           # Lint code
make dev            # Run with hot reload (requires air)
```

### Project Workflow

1. **Make changes to code**

2. **Format code**
```bash
make fmt
```

3. **Lint code**
```bash
make lint
```

4. **Regenerate Wire code** (if you changed injector)
```bash
make wire
```

5. **Regenerate Swagger docs** (if you changed API endpoints)
```bash
make swagger
```

6. **Run tests**
```bash
make test
```

7. **Run application**
```bash
make run
```

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication.

### How to authenticate:

1. **Login** to get a JWT token
2. **Include the token** in the `Authorization` header for protected endpoints:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

### Protected Endpoints

The following endpoints require authentication:
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 📦 Adding New Features/Services

This architecture is designed for easy extension. To add a new service (e.g., "products"):

1. **Create domain entity** - `internal/domain/product.go`
2. **Define contracts** - `internal/contract/product_contract.go`
3. **Implement repository** - `internal/repository/product_repository.go`
4. **Implement use case** - `internal/usecases/product_usecase.go`
5. **Implement handler** - `internal/handler/product_handler.go`
6. **Update Wire injector** - `internal/injector/wire.go`
7. **Add routes** - `internal/routes/routes.go`
8. **Create migrations** - `internal/db/migrations/00X_create_products_table.sql`
9. **Write tests** - `internal/tests/product_handler_test.go`
10. **Regenerate Wire & Swagger**

```bash
make wire
make swagger
```

## 📝 Database

### Migrations

Migrations are stored in `internal/db/migrations/`. The application uses GORM's auto-migrate feature, but SQL migrations are provided for reference.

### Seeders

Seeders are in `internal/db/seeders/`. They automatically run in development mode when the application starts.

Default seeded users (all with password `password123`):
- john@example.com
- jane@example.com
- bob@example.com
- alice@example.com
- charlie@example.com

## 🔍 Code Quality

### Linting

```bash
make lint
```

### Code Formatting

```bash
make fmt
```

### Test Coverage

```bash
make test
# Open coverage.html to view detailed coverage
```

## 🚢 Deployment

### Building for Production

```bash
# Build binary
make build

# Binary will be in bin/server
./bin/server
```

### Docker Production Build

```bash
docker build -t memr-api:latest .
docker run -p 8080:8080 --env-file .env memr-api:latest
```

### Environment Variables for Production

Make sure to set these in production:

- `ENV=production`
- `JWT_SECRET=<strong-random-secret>`
- `DB_HOST=<production-db-host>`
- `DB_PASSWORD=<strong-password>`

## 📖 Technology Stack

- **Web Framework**: [Fiber v2](https://gofiber.io/)
- **ORM**: [GORM](https://gorm.io/)
- **Database**: PostgreSQL
- **Dependency Injection**: [Google Wire](https://github.com/google/wire)
- **Validation**: [go-playground/validator](https://github.com/go-playground/validator)
- **JWT**: [golang-jwt/jwt](https://github.com/golang-jwt/jwt)
- **Logging**: [Uber Zap](https://github.com/uber-go/zap)
- **Testing**: [Testify](https://github.com/stretchr/testify)
- **API Docs**: [Swaggo](https://github.com/swaggo/swag)
- **Config**: [godotenv](https://github.com/joho/godotenv)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋 Support

For questions or issues, please open an issue on GitHub.

---

**Happy Coding! 🚀**

