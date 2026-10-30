#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: ./deploy.sh [TARGETS...] [OPTIONS...]

Targets (combine one or more):
  -a, --all               Deploy all services (api + web, plus db & adminer unless --external-db)
  -f, --frontend, --web   Deploy frontend web service (web)
  -b, --backend, --api    Deploy backend API service (api)
  -d, --db                Deploy PostgreSQL + pgvector container (db)
      --adminer           Deploy Adminer DB UI service (adminer)

Database Mode Options:
      --external-db       Use existing Postgres on VPS/host (do not start 'db' container)

Actions & Options:
  -m, --migrate           Run database migrations (up to latest)
      --down              Stop and remove selected services (or all if none specified)
      --restart           Restart selected services
      --logs              Tail logs for selected services
      --status, --ps      Show running status of services
      --no-build          Do not build images before starting
      --no-cache          Force rebuild images without Docker cache
  -h, --help              Show this help message

Examples:
  # Using existing Postgres on VPS:
  ./deploy.sh --all --external-db --migrate
  ./deploy.sh --backend --frontend

  # Creating & using the Docker Postgres container:
  ./deploy.sh --all --migrate
  ./deploy.sh --db --backend --migrate

  # Single service updates:
  ./deploy.sh --frontend               # Rebuild and redeploy only frontend
  ./deploy.sh --backend                # Rebuild and redeploy only backend
  ./deploy.sh --down                   # Stop and remove the entire stack
EOF
}

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  error "Neither 'docker compose' nor 'docker-compose' was found. Please install Docker Compose."
fi

SERVICES=()
ALL_REQUESTED=false
EXTERNAL_DB=false
USE_DOCKER_DB=false
ACTION="up"
BUILD=true
NO_CACHE=false
RUN_MIGRATE=false

add_service() {
  local svc="$1"
  local existing
  for existing in "${SERVICES[@]+"${SERVICES[@]}"}"; do
    [[ "$existing" == "$svc" ]] && return 0
  done
  SERVICES+=("$svc")
}

if [[ $# -eq 0 ]]; then
  usage
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a|--all)
      ALL_REQUESTED=true
      shift
      ;;
    -f|--frontend|--web)
      add_service "web"
      shift
      ;;
    -b|--backend|--api)
      add_service "api"
      shift
      ;;
    -d|--db)
      USE_DOCKER_DB=true
      add_service "db"
      shift
      ;;
    --adminer)
      add_service "adminer"
      shift
      ;;
    --external-db)
      EXTERNAL_DB=true
      shift
      ;;
    -m|--migrate)
      RUN_MIGRATE=true
      shift
      ;;
    --down)
      ACTION="down"
      shift
      ;;
    --restart)
      ACTION="restart"
      shift
      ;;
    --logs)
      ACTION="logs"
      shift
      ;;
    --status|--ps)
      ACTION="ps"
      shift
      ;;
    --no-build)
      BUILD=false
      shift
      ;;
    --no-cache)
      NO_CACHE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      error "Unknown option: $1 (run ./deploy.sh --help for usage)"
      ;;
  esac
done

if [[ "$ALL_REQUESTED" == true ]]; then
  if [[ "$EXTERNAL_DB" == false ]]; then
    USE_DOCKER_DB=true
    add_service "db"
    add_service "adminer"
  fi
  add_service "api"
  add_service "web"
fi

# Ensure env files exist before running
if [[ ! -f "$ROOT_DIR/api/.env" && -f "$ROOT_DIR/api/.env.example" ]]; then
  warn "api/.env not found. Copying from api/.env.example..."
  cp "$ROOT_DIR/api/.env.example" "$ROOT_DIR/api/.env"
fi
if [[ ! -f "$ROOT_DIR/web/.env" && -f "$ROOT_DIR/web/.env.example" ]]; then
  warn "web/.env not found. Copying from web/.env.example..."
  cp "$ROOT_DIR/web/.env.example" "$ROOT_DIR/web/.env"
fi

# Configure DB host resolution for the api container
if [[ "$USE_DOCKER_DB" == true ]]; then
  export DOCKER_POSTGRES_HOST="db"
  export DOCKER_POSTGRES_PORT="5432"
else
  # Check if memr-db container is already running and --external-db wasn't forced
  if [[ "$EXTERNAL_DB" == false ]] && docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'memr-db'; then
    export DOCKER_POSTGRES_HOST="db"
    export DOCKER_POSTGRES_PORT="5432"
  else
    # Using existing Postgres on VPS/host: read POSTGRES_HOST from api/.env
    ENV_PG_HOST=$(grep -E '^POSTGRES_HOST=' "$ROOT_DIR/api/.env" 2>/dev/null | tail -n1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" || true)
    if [[ -z "$ENV_PG_HOST" || "$ENV_PG_HOST" == "127.0.0.1" || "$ENV_PG_HOST" == "localhost" ]]; then
      export DOCKER_POSTGRES_HOST="host.docker.internal"
    else
      export DOCKER_POSTGRES_HOST="$ENV_PG_HOST"
    fi
  fi
fi

# Enable profiles so docker compose can manage db/adminer when requested
COMPOSE_CMD+=(--profile db --profile adminer)

# Pass api/.env for variable interpolation in docker-compose.yml
if [[ -f "$ROOT_DIR/api/.env" ]]; then
  COMPOSE_CMD+=(--env-file "$ROOT_DIR/api/.env")
fi

run_migrations() {
  local latest_version
  latest_version=$(ls -1 "$ROOT_DIR/api/internal/database/migrations/"*.sql 2>/dev/null | wc -l | tr -d ' ')
  if [[ -z "$latest_version" || "$latest_version" -eq 0 ]]; then
    warn "No migration files found in api/internal/database/migrations/"
    return 0
  fi
  info "Running database migrations up to version ${latest_version} (DB host: ${DOCKER_POSTGRES_HOST})..."
  "${COMPOSE_CMD[@]}" run --rm --no-deps api ./main migrate up "$latest_version"
  ok "Database migrations completed."
}

case "$ACTION" in
  ps)
    "${COMPOSE_CMD[@]}" ps "${SERVICES[@]+"${SERVICES[@]}"}"
    ;;
  logs)
    "${COMPOSE_CMD[@]}" logs -f "${SERVICES[@]+"${SERVICES[@]}"}"
    ;;
  restart)
    if [[ ${#SERVICES[@]} -eq 0 ]]; then
      info "Restarting running services..."
      "${COMPOSE_CMD[@]}" restart
    else
      info "Restarting services: ${SERVICES[*]}..."
      "${COMPOSE_CMD[@]}" restart "${SERVICES[@]}"
    fi
    ok "Restart complete."
    ;;
  down)
    if [[ ${#SERVICES[@]} -eq 0 ]] || [[ "$ALL_REQUESTED" == true ]]; then
      info "Stopping and removing all containers..."
      "${COMPOSE_CMD[@]}" down --remove-orphans
    else
      info "Stopping and removing services: ${SERVICES[*]}..."
      "${COMPOSE_CMD[@]}" rm -s -f "${SERVICES[@]}"
    fi
    ok "Stopped."
    ;;
  up)
    if [[ ${#SERVICES[@]} -eq 0 && "$RUN_MIGRATE" == true ]]; then
      run_migrations
      exit 0
    fi

    if [[ ${#SERVICES[@]} -eq 0 ]]; then
      error "No target specified. Choose --all, --frontend, --backend, --db, or --migrate (see ./deploy.sh --help)."
    fi

    info "Deploying services: ${SERVICES[*]} (DB host: ${DOCKER_POSTGRES_HOST})"

    if [[ "$NO_CACHE" == true ]]; then
      info "Building images without cache..."
      "${COMPOSE_CMD[@]}" build --no-cache "${SERVICES[@]}"
    fi

    UP_ARGS=(-d)
    if [[ "$BUILD" == true && "$NO_CACHE" == false ]]; then
      UP_ARGS+=(--build)
    fi

    "${COMPOSE_CMD[@]}" up "${UP_ARGS[@]}" "${SERVICES[@]}"
    ok "Deployed: ${SERVICES[*]}"

    if [[ "$RUN_MIGRATE" == true ]]; then
      run_migrations
    fi

    "${COMPOSE_CMD[@]}" ps "${SERVICES[@]}"
    ;;
esac
