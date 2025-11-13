.PHONY: help run build test wire swagger migrate seed docker-up docker-down docker-rebuild clean install-tools

# Default target
help:
	@echo "Available commands:"
	@echo "  make run           - Run the application locally"
	@echo "  make build         - Build the application binary"
	@echo "  make test          - Run all tests"
	@echo "  make wire          - Generate Wire dependency injection code"
	@echo "  make swagger       - Generate Swagger documentation"
	@echo "  make migrate       - Run database migrations (auto-migrate)"
	@echo "  make seed          - Seed the database with sample data"
	@echo "  make docker-up     - Start all services with Docker Compose"
	@echo "  make docker-down   - Stop all Docker Compose services"
	@echo "  make docker-rebuild- Rebuild and restart Docker services"
	@echo "  make clean         - Clean build artifacts and generated files"
	@echo "  make install-tools - Install required development tools"

# Run the application
run:
	@echo "Starting application..."
	@go run cmd/server/main.go

# Build the application
build:
	@echo "Building application..."
	@go build -o bin/server cmd/server/main.go
	@echo "Build complete: bin/server"

# Run tests
test:
	@echo "Running tests..."
	@go test -v -race -coverprofile=coverage.out ./...
	@echo "Tests completed"
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# Generate Wire dependency injection code
wire:
	@echo "Generating Wire code..."
	@cd internal/injector && wire
	@echo "Wire generation complete"

# Generate Swagger documentation
swagger:
	@echo "Generating Swagger documentation..."
	@swag init -g cmd/server/main.go -o swagger
	@echo "Swagger documentation generated: swagger/"

# Run database migrations (using GORM auto-migrate)
migrate:
	@echo "Running database migrations..."
	@go run cmd/server/main.go &
	@sleep 2
	@pkill -f "cmd/server/main.go"
	@echo "Migrations complete"

# Seed the database
seed:
	@echo "Seeding database..."
	@ENV=development go run cmd/server/main.go &
	@sleep 3
	@pkill -f "cmd/server/main.go"
	@echo "Database seeding complete"

# Start Docker Compose services
docker-up:
	@echo "Starting Docker Compose services..."
	@docker-compose up -d
	@echo "Services started. API: http://localhost:8080, Swagger: http://localhost:8080/swagger/index.html"

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker Compose services..."
	@docker-compose down
	@echo "Services stopped"

# Rebuild and restart Docker services
docker-rebuild:
	@echo "Rebuilding Docker services..."
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "Services rebuilt and started"

# Clean build artifacts and generated files
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@rm -f internal/injector/wire_gen.go
	@echo "Clean complete"

# Install required development tools
install-tools:
	@echo "Installing development tools..."
	@echo "Installing Wire..."
	@go install github.com/google/wire/cmd/wire@latest
	@echo "Installing Swag..."
	@go install github.com/swaggo/swag/cmd/swag@latest
	@echo "Installing golangci-lint..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "All tools installed successfully"

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy
	@echo "Dependencies updated"

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...
	@echo "Code formatted"

# Lint code
lint:
	@echo "Linting code..."
	@golangci-lint run ./...
	@echo "Linting complete"

# Run application with hot reload (requires air)
dev:
	@echo "Starting development server with hot reload..."
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "Air is not installed. Install it with: go install github.com/cosmtrek/air@latest"; \
		echo "Or run 'make run' for normal execution"; \
	fi


