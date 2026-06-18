#!/usr/bin/env bash
#
# Matcha — one-command setup & launch.
#
# - Ensures app/backend/.env and app/frontend/.env exist with all required vars
#   (generates JWT secrets, auto-provisions a test email mailbox for the
#    verification + "forgot password" flows if none is configured).
# - Builds and starts the Docker stack (db + backend + frontend).
# - Waits until the backend is healthy and prints how to use the app.
#
# Usage:
#   ./setup.sh            # setup env (if missing) + build + start
#   ./setup.sh --reset    # wipe the database volume, rebuild, reseed from scratch
#   ./setup.sh --no-build # start without rebuilding images
#   ./setup.sh --help
#
set -euo pipefail

# ---------------------------------------------------------------------------
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ENV="$ROOT/app/backend/.env"
FRONTEND_ENV="$ROOT/app/frontend/.env"
BACKEND_ENV_EXAMPLE="$ROOT/app/backend/.env.example"

RESET=0
BUILD=1
for arg in "$@"; do
  case "$arg" in
    --reset)    RESET=1 ;;
    --no-build) BUILD=0 ;;
    -h|--help)
      grep -E '^#( |$)' "$0" | sed 's/^# \{0,1\}//' | head -20
      exit 0 ;;
    *) echo "Unknown option: $arg (use --help)"; exit 1 ;;
  esac
done

c_green=$'\033[0;32m'; c_blue=$'\033[0;34m'; c_yellow=$'\033[0;33m'; c_red=$'\033[0;31m'; c_off=$'\033[0m'
info()  { echo "${c_blue}▸${c_off} $*"; }
ok()    { echo "${c_green}✓${c_off} $*"; }
warn()  { echo "${c_yellow}!${c_off} $*"; }
err()   { echo "${c_red}✗${c_off} $*" >&2; }

# ---------------------------------------------------------------------------
# Small .env helpers (pure bash, portable mac/linux)
ensure_env() { # file key value  -> append "key=value" only if key absent
  local file="$1" key="$2" val="$3"
  grep -qE "^${key}=" "$file" 2>/dev/null && return 0
  printf '%s=%s\n' "$key" "$val" >> "$file"
  echo "    + ${key}"
}
get_env() { grep -E "^$2=" "$1" 2>/dev/null | head -1 | cut -d= -f2-; }

gen_secret() {
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex 48
  elif command -v python3 >/dev/null 2>&1; then python3 -c "import secrets;print(secrets.token_hex(48))"
  else head -c 48 /dev/urandom | od -An -tx1 | tr -d ' \n'; fi
}

# ---------------------------------------------------------------------------
# 0. Pre-flight
command -v docker >/dev/null 2>&1 || { err "Docker is not installed."; exit 1; }
if ! docker info >/dev/null 2>&1; then
  err "Docker daemon is not running. Start Docker Desktop and retry."
  exit 1
fi
ok "Docker is running"

# ---------------------------------------------------------------------------
# 1. Backend .env
info "Configuring backend env (app/backend/.env)"
if [ ! -f "$BACKEND_ENV" ]; then
  if [ -f "$BACKEND_ENV_EXAMPLE" ]; then cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"; ok "created from .env.example"
  else : > "$BACKEND_ENV"; ok "created empty .env"; fi
fi

# Database (these match docker-compose; in Docker the host is overridden to "db")
ensure_env "$BACKEND_ENV" POSTGRES_USER     matcha_user
ensure_env "$BACKEND_ENV" POSTGRES_PASSWORD matcha_password
ensure_env "$BACKEND_ENV" POSTGRES_DB       matcha_db
ensure_env "$BACKEND_ENV" POSTGRES_HOST     localhost
ensure_env "$BACKEND_ENV" POSTGRES_PORT     5432
ensure_env "$BACKEND_ENV" DB_USER           matcha_user
ensure_env "$BACKEND_ENV" DB_PASSWORD       matcha_password
ensure_env "$BACKEND_ENV" DB_NAME           matcha_db
ensure_env "$BACKEND_ENV" DB_HOST           localhost
ensure_env "$BACKEND_ENV" DB_PORT           5432

# Server / CORS / JWT
ensure_env "$BACKEND_ENV" PORT       3000
ensure_env "$BACKEND_ENV" NODE_ENV   development
ensure_env "$BACKEND_ENV" FRONTEND_URL "http://localhost:5173"
ensure_env "$BACKEND_ENV" CORS_ORIGIN  "http://localhost:5173"
ensure_env "$BACKEND_ENV" JWT_ACCESS_SECRET  "$(gen_secret)"
ensure_env "$BACKEND_ENV" JWT_REFRESH_SECRET "$(gen_secret)"
ensure_env "$BACKEND_ENV" JWT_ACCESS_EXPIRES_IN  15m
ensure_env "$BACKEND_ENV" JWT_REFRESH_EXPIRES_IN 7d

# Email (verification + forgot-password). Auto-provision an Ethereal test
# mailbox if none/placeholder is set, so the email flows work out of the box.
EMAIL_USER_CUR="$(get_env "$BACKEND_ENV" EMAIL_USER || true)"
case "$EMAIL_USER_CUR" in
  ""|*your_email*|*your_password*)
    info "Provisioning a test email mailbox (Ethereal) for verification / reset emails…"
    resp="$(curl -s --max-time 20 -X POST https://api.nodemailer.com/user \
      -H 'Content-Type: application/json' -H 'User-Agent: matcha-setup' \
      -d '{"requestor":"matcha-setup","version":"1.0.0"}' | tr -d '\n' || true)"
    e_user="$(printf '%s' "$resp" | sed -n 's/.*"user": *"\([^"]*\)".*/\1/p')"
    e_pass="$(printf '%s' "$resp" | sed -n 's/.*"pass": *"\([^"]*\)".*/\1/p')"
    e_host="$(printf '%s' "$resp" | sed -n 's/.*"smtp":[^}]*"host": *"\([^"]*\)".*/\1/p')"
    if [ -n "$e_user" ] && [ -n "$e_pass" ]; then
      # remove any placeholder lines first, then add real values
      grep -vE '^(EMAIL_HOST|EMAIL_PORT|EMAIL_USER|EMAIL_PASS|EMAIL_FROM)=' "$BACKEND_ENV" > "$BACKEND_ENV.tmp" && mv "$BACKEND_ENV.tmp" "$BACKEND_ENV"
      {
        echo "EMAIL_HOST=${e_host:-smtp.ethereal.email}"
        echo "EMAIL_PORT=587"
        echo "EMAIL_USER=${e_user}"
        echo "EMAIL_PASS=${e_pass}"
        echo "EMAIL_FROM=noreply@matcha.com"
      } >> "$BACKEND_ENV"
      ok "Email ready — view sent emails at https://ethereal.email"
      echo "    ${c_yellow}Ethereal login:${c_off} ${e_user}  /  ${e_pass}"
      ETHEREAL_USER="$e_user"; ETHEREAL_PASS="$e_pass"
    else
      warn "Could not auto-provision email. Set EMAIL_* in app/backend/.env manually (see LAUNCH.md)."
    fi
    ;;
  *) ok "Email already configured (EMAIL_USER=${EMAIL_USER_CUR})" ;;
esac

# ---------------------------------------------------------------------------
# 2. Frontend .env
info "Configuring frontend env (app/frontend/.env)"
[ -f "$FRONTEND_ENV" ] || : > "$FRONTEND_ENV"
ensure_env "$FRONTEND_ENV" VITE_API_URL "http://localhost:3000"
ok "frontend env ready"

# ---------------------------------------------------------------------------
# 3. Start the stack
if [ "$RESET" -eq 1 ]; then
  warn "Reset requested: removing containers + database volume…"
  docker compose down -v || true
fi

if [ "$BUILD" -eq 1 ]; then
  info "Building & starting containers (this can take a few minutes the first time)…"
  docker compose up -d --build
else
  info "Starting containers…"
  docker compose up -d
fi

# ---------------------------------------------------------------------------
# 4. Wait for the backend (runs migrations + seeds 500+ profiles on first boot)
info "Waiting for the backend to be ready (migrations + seeding)…"
tries=0
until curl -sf http://localhost:3000/health >/dev/null 2>&1; do
  tries=$((tries+1))
  if [ "$tries" -gt 90 ]; then
    err "Backend did not become healthy in time. Check: docker compose logs backend"
    exit 1
  fi
  sleep 2
done
ok "Backend is healthy"

profiles="$(docker exec matcha_db psql -U matcha_user -d matcha_db -t -c 'SELECT COUNT(*) FROM profiles;' 2>/dev/null | tr -d ' \n' || echo '?')"

# ---------------------------------------------------------------------------
# 5. Summary
cat <<EOF

${c_green}========================================================${c_off}
${c_green}  Matcha is up and running 🍵${c_off}
${c_green}========================================================${c_off}

  Frontend : ${c_blue}http://localhost:5173${c_off}
  Backend  : ${c_blue}http://localhost:3000${c_off}  (health: /health)
  Database : localhost:5432  (matcha_db)
  Profiles seeded: ${profiles}

  Seeded test accounts (password for all: ${c_yellow}P${c_off})
    helena.morel@example.com   (username: smallmouse465)  — F / bi
    abel.riviere@example.com   (username: ticklishcat4201) — M / hetero

  Emails (verification + forgot password) are NOT really sent —
  view them on Ethereal:
EOF
if [ -n "${ETHEREAL_USER:-}" ]; then
  echo "    https://ethereal.email  →  login: ${ETHEREAL_USER} / ${ETHEREAL_PASS}"
else
  echo "    https://ethereal.email  →  login with EMAIL_USER / EMAIL_PASS from app/backend/.env"
fi
cat <<EOF

  Useful commands:
    docker compose logs -f backend     # backend logs
    docker exec matcha_backend npm test# run the test suite (69 tests)
    ./setup.sh --reset                 # wipe DB + reseed from scratch
    docker compose down                # stop everything

EOF
