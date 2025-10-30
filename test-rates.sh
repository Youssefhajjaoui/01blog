#!/usr/bin/env bash
set -u

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"
USERNAME="youssef"
PASSWORD="youssef123"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "Using GATEWAY_URL=$GATEWAY_URL USERNAME=$USERNAME"

http() {
  local method="$1"; shift
  local url="$1"; shift
  local data="${1:-}"
  local code
  echo "--- REQUEST: $method $url ---"
  if [[ "$method" == "GET" ]]; then
    code=$( { curl -sS --connect-timeout 3 --max-time 10 -o >(cat) -w "%{http_code}\n" \
      -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      "$url"; } || true )
  else
    code=$( { curl -sS --connect-timeout 3 --max-time 10 -o >(cat) -w "%{http_code}\n" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      -X "$method" "$url" \
      -d "$data"; } || true )
  fi
  [[ -z "$code" ]] && code="000"
  echo "\n--- STATUS: $code ---"
  echo "$code"
}

burst_test() {
  local name="$1"; shift
  local method="$1"; shift
  local url="$1"; shift
  local n="${1:-20}"
  local data="${2:-}"

  echo "== $name ($method $url) burst: $n requests =="
  local ok=0
  local r429=0
  local other=0

  for i in $(seq 1 "$n"); do
    code="$(http "$method" "$url" "$data" || true)"
    if [[ "$code" == "200" || "$code" == "201" || "$code" == "204" ]]; then
      ((ok++))
    elif [[ "$code" == "429" ]]; then
      ((r429++))
    else
      ((other++))
    fi
    printf "%s " "$code"
  done
  echo
  echo "ok=$ok 429=$r429 other=$other"
  echo
}

# 1) AUTH: Login to get JWT cookie (strict limits: 5 rps, burst 10)
LOGIN_PAYLOAD='{"username":"'"$USERNAME"'","password":"'"$PASSWORD"'"}'
burst_test "AUTH login" "POST" "$GATEWAY_URL/api/auth/login" 20 "$LOGIN_PAYLOAD"

# 2) PUBLIC: GET /posts (IP-based limits: 20 rps, burst 40)
burst_test "PUBLIC posts list" "GET" "$GATEWAY_URL/posts" 60

# 3) API: Authenticated endpoint (per-user: 50 rps, burst 100)
burst_test "API me" "GET" "$GATEWAY_URL/api/auth/me" 40

# 4) API: Create post (adjust payload to match your DTO)
CREATE_POST_PAYLOAD='{"title":"RateLimit Test","content":"Lorem ipsum"}'
burst_test "API create post" "POST" "$GATEWAY_URL/api/posts" 20 "$CREATE_POST_PAYLOAD"

echo "Done. Tip: run multiple times to observe token bucket refill behavior."
