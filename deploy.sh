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
  -a, --all               Deploy all services (db, adminer, api, web)
  -f, --frontend, --web   Deploy frontend web service (web)
  -b, --backend, --api    Deploy backend API service (api)
  -d, --db                Deploy PostgreSQL + pgvector service (db)
      --adminer           Deploy Adminer DB UI service (adminer)

Actions & Options:
  -m, --migrate           Run database migrations (up to latest)
      --down              Stop and remove selected services (or all if none specified)
      --restart           Restart selected services
      --logs              Tail logs for selected services
      --status, --ps      Show running status of services
      --no-build          Do not build images before starting
      --no-cache          Force rebuild images without Docker cache
      --no-deps           Do not start linked dependent services (e.g. skip db when starting api)
  -h, --help              Show this help message

Examples:
  ./deploy.sh --all                    # Build and start db, adminer, api, and web
  ./deploy.sh --all --migrate          # Deploy everything and run DB migrations
  ./deploy.sh --frontend               # Rebuild and redeploy only the frontend
  ./deploy.sh --backend --migrate      # Rebuild and redeploy backend + run migrations
  ./deploy.sh --db --adminer           # Start only database and Adminer
  ./deploy.sh --backend --down         # Stop and remove only the backend container
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
ACTION="up"
BUILD=true
NO_CACHE=false
NO_DEPS=false
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
      add_service "db"
      add_service "adminer"
      add_service "api"
      add_service "web"
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
      add_service "db"
      shift
      ;;
    --adminer)
      add_service "adminer"
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
    --no-deps)
      NO_DEPS=true
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

# Ensure env files exist before running
ensure_env_files() {
  if [[ ! -f "$ROOT_DIR/api/.env" && -f "$ROOT_DIR/api/.env.example" ]]; then
    warn "api/.env not found. Copying from api/.env.example..."
    cp "$ROOT_DIR/api/.env.example" "$ROOT_DIR/api/.env"
  fi
  if [[ ! -f "$ROOT_DIR/web/.env" && -f "$ROOT_DIR/web/.env.example" ]]; then
    warn "web/.env not found. Copying from web/.env.example..."
    cp "$ROOT_DIR/web/.env.example" "$ROOT_DIR/web/.env"
  fi
}

ensure_env_files

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
  info "Running database migrations up to version ${latest_version}..."
  "${COMPOSE_CMD[@]}" run --rm api ./main migrate up "$latest_version"
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
      info "Restarting all services..."
      "${COMPOSE_CMD[@]}" restart
    else
      info "Restarting services: ${SERVICES[*]}..."
      "${COMPOSE_CMD[@]}" restart "${SERVICES[@]}"
    fi
    ok "Restart complete."
    ;;
  down)
    if [[ ${#SERVICES[@]} -eq 0 ]] || [[ ${#SERVICES[@]} -eq 4 ]]; then
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

    info "Deploying services: ${SERVICES[*]}"

    if [[ "$NO_CACHE" == true ]]; then
      info "Building images without cache..."
      "${COMPOSE_CMD[@]}" build --no-cache "${SERVICES[@]}"
    fi

    UP_ARGS=(-d)
    if [[ "$BUILD" == true && "$NO_CACHE" == false ]]; then
      UP_ARGS+=(--build)
    fi
    if [[ "$NO_DEPS" == true ]]; then
      UP_ARGS+=(--no-deps)
    fi

    "${COMPOSE_CMD[@]}" up "${UP_ARGS[@]}" "${SERVICES[@]}"
    ok "Deployed: ${SERVICES[*]}"

    if [[ "$RUN_MIGRATE" == true ]]; then
      run_migrations
    fi

    "${COMPOSE_CMD[@]}" ps "${SERVICES[@]}"
    ;;
esac

