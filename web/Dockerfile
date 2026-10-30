# ------------ Base builder image -------------
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

# Install dependencies using pnpm lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source (including .env if present for Vite build-time env vars)
COPY . .

# Optional build arguments (override .env if passed via docker compose)
ARG VITE_SITE_URL
ARG VITE_API_BASE_URL
ARG VITE_APP_URL
ARG VITE_SYNC_INTERVAL
ARG VITE_SYNC_GRACE_PERIOD
ARG VITE_AUTOSAVE_INTERVAL

# Build Vite SPA into /app/dist
RUN pnpm run build

# ------------ Production image -------------
FROM nginx:alpine AS runner

# Configure Nginx for SPA routing (fallback to index.html)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy static build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
