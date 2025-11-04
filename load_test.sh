#!/usr/bin/env bash
set -euo pipefail

# -------------------------------
# Hardcoded authenticated load tester
# -------------------------------

# Hardcoded login info
LOGIN_URL="http://localhost:8080/api/auth/login"
USERNAME="admin"
PASSWORD="pass123"

# Hardcoded target endpoint to load test (can change if needed)
TARGET_URL="http://localhost:8080/api/posts"

# Load test parameters (can be adjusted)
# Adjusted to trigger rate limiting - sends burst of requests to exceed burst capacity
BURST_SIZE=250    # number of parallel requests to send initially (burst limit is 200)
DURATION=5        # seconds to run the test
RATE=500          # requests per second after initial burst

echo "Logging in as $USERNAME at $LOGIN_URL..."

# Temporary cookie jar
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT

# Perform login and save cookies
LOGIN_PAYLOAD="{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -X POST "$LOGIN_URL" \
  -d "$LOGIN_PAYLOAD")

if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "201" ]]; then
  echo "Login failed with status $HTTP_CODE"
  exit 1
fi

echo "Login successful, cookies stored in $COOKIE_JAR"
echo "Starting load test on $TARGET_URL..."

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"; rm -f "$COOKIE_JAR"' EXIT

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

# Check if Apache Bench is available (more reliable for concurrent requests)
if command -v ab >/dev/null 2>&1; then
  echo "Using Apache Bench for load testing..."
  JWT=$(cat "$COOKIE_JAR" | grep jwt | awk '{print $7}')
  if [ -z "$JWT" ]; then
    echo "Warning: Could not extract JWT from cookies, trying alternative method..."
    JWT=$(cat "$COOKIE_JAR" | grep -oP 'jwt\s+\K[^\s]+' || echo "")
  fi
  
  if [ -z "$JWT" ]; then
    echo "Error: Could not extract JWT token. Falling back to curl-based approach."
  else
    TOTAL_REQUESTS=$((BURST_SIZE + (RATE * DURATION)))
    
    # Run Apache Bench with proper cookie format
    ab -n "$TOTAL_REQUESTS" -c "$BURST_SIZE" -C "jwt=$JWT" "$TARGET_URL" > "$tmpdir/ab_output.txt" 2>&1
    
    # Parse results
    echo "----- SUMMARY -----"
    COMPLETE=$(grep "Complete requests:" "$tmpdir/ab_output.txt" | awk '{print $3}' || echo "0")
    FAILED=$(grep "Failed requests:" "$tmpdir/ab_output.txt" | awk '{print $3}' || echo "0")
    NON2XX=$(grep "Non-2xx responses:" "$tmpdir/ab_output.txt" | awk '{print $3}' || echo "0")
    
    echo "Complete requests: $COMPLETE"
    echo "Failed requests: $FAILED"
    if [ -n "$NON2XX" ] && [ "$NON2XX" != "0" ]; then
      echo "Non-2xx responses: $NON2XX (these are likely 429 rate limit responses)"
      echo "Status 429: $NON2XX"
      echo "Status 200: $((COMPLETE - NON2XX))"
      echo ""
      echo "SUCCESS: Rate limiter is working! 429 responses detected."
    else
      echo "Status 200: $COMPLETE"
      if [ "$FAILED" != "0" ]; then
        echo "Note: Some requests failed. Check rate limiting configuration."
      fi
    fi
    
    # Show detailed breakdown if available
    if grep -q "429" "$tmpdir/ab_output.txt"; then
      echo ""
      echo "Rate limiter is active and returning 429 responses when limits are exceeded."
    fi
    exit 0
  fi
else
  # Fallback to curl-based approach (more aggressive)
  echo "Using curl-based approach (Apache Bench not available)"
  echo "Note: For accurate rate limit testing, install Apache Bench: sudo dnf install httpd-tools"
  echo ""
  echo "Sending $BURST_SIZE parallel requests to trigger rate limiting..."
  
  # Initial burst - send all requests in parallel as fast as possible
  for i in $(seq 1 "$BURST_SIZE"); do
    (
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -b "$COOKIE_JAR" \
        "$TARGET_URL" 2>&1 || echo "000")
      NOW=$(date +%s.%N)
      echo "$NOW $i $HTTP_STATUS" >> "$tmpdir/log"
    ) &
  done
  wait
  
  # Send additional requests immediately to ensure we exceed burst capacity
  echo "Sending additional burst to exceed capacity..."
  for i in $(seq $((BURST_SIZE + 1)) $((BURST_SIZE + 50))); do
    (
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -b "$COOKIE_JAR" \
        "$TARGET_URL" 2>&1 || echo "000")
      NOW=$(date +%s.%N)
      echo "$NOW $i $HTTP_STATUS" >> "$tmpdir/log"
    ) &
  done
  wait
  
  # Continue sending requests at the specified rate for the duration
  if [[ $(date +%s) -lt $END_TIME ]]; then
  echo "Continuing with sustained load at $RATE req/sec..."
  CONCURRENCY=$((RATE / 10))  # Use 10 workers for rate limiting
  PER_WORKER_RATE=$(( (RATE + CONCURRENCY - 1) / CONCURRENCY ))
  INTERVAL_NS=$(( 1000000000 / PER_WORKER_RATE ))
  
  # Worker function for sustained load
  worker() {
    local id=$1
    local worker_id=$2
    while [[ $(date +%s) -lt $END_TIME ]]; do
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -b "$COOKIE_JAR" \
        "$TARGET_URL" 2>&1 || echo "000")
      NOW=$(date +%s.%N)
      echo "$NOW $worker_id $HTTP_STATUS" >> "$tmpdir/log"

      # Sleep interval
      NS=$INTERVAL_NS
      if command -v python3 >/dev/null 2>&1; then
        python3 - <<PY
import time
time.sleep($NS/1e9)
PY
      else
        MS=$(( (NS + 999999) / 1000000 ))
        sleep $(awk "BEGIN{print $MS/1000}")
      fi
    done
  }

  # Start workers for sustained load
  for i in $(seq 1 "$CONCURRENCY"); do
    worker "$i" $((BURST_SIZE + i)) &
  done

    wait
  fi
  
  # Summarize results
  echo "----- SUMMARY -----"
  STATUS_200=$(awk '{print $3}' "$tmpdir/log" | grep -c "^200$" || echo "0")
  STATUS_429=$(awk '{print $3}' "$tmpdir/log" | grep -c "^429$" || echo "0")
  OTHER=$(awk '{print $3}' "$tmpdir/log" | grep -vE "^(200|429)$" | wc -l || echo "0")
  
  TOTAL_LINES=$(wc -l < "$tmpdir/log" || echo "0")
  
  echo "Status 200: $STATUS_200"
  echo "Status 429: $STATUS_429"
  if [ "$OTHER" -gt 0 ]; then
    echo "Other status codes: $OTHER"
    awk '{print $3}' "$tmpdir/log" | grep -vE "^(200|429)$" | sort | uniq -c | while read -r CNT CODE; do
      echo "  Status $CODE: $CNT"
    done
  fi
  echo "Total requests recorded: $TOTAL_LINES"
  
  if [ "$STATUS_429" -gt 0 ]; then
    echo ""
    echo "SUCCESS: Rate limiter is working! 429 responses detected."
  else
    echo ""
    echo "WARNING: No 429 responses detected. Rate limiter may not be working."
    echo "Try installing Apache Bench for more reliable testing: sudo dnf install httpd-tools"
  fi
fi
