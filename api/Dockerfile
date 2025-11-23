FROM golang:1.24-alpine AS build

# Install swag
RUN go install github.com/swaggo/swag/cmd/swag@latest

ENV PATH=$PATH:/go/bin

WORKDIR /app

# Better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Generate Swagger docs
RUN swag init --dir . --output ./docs --parseDependency --parseInternal

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# ------------------------------

FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy binary
COPY --from=build /app/main .

# Copy assets folder
COPY --from=build /app/assets ./assets

EXPOSE 8000

CMD ["./main", "http"]
