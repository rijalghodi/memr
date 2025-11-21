FROM golang:1.24-alpine AS build

# Install swag tool for Swagger generation
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Ensure GOPATH/bin is in PATH (where go install puts binaries)
ENV PATH=$PATH:/go/bin

WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Generate Swagger documentation
RUN swag init --dir . --output ./docs --parseDependency --parseInternal

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest

RUN apk add --no-cache curl ca-certificates

WORKDIR /root

# Copy the binary from build stage
COPY --from=build /app/main .

# Copy .env if it exists (optional, might not be in repo)
COPY --from=build /app/.env* ./

EXPOSE 8000

CMD ["./main", "http"]
