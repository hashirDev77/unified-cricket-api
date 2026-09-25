#!/usr/bin/env bash
# Boots both APIs against the same database and compares every endpoint.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEST_DIR="$ROOT/cricket-unified-nest"
PY_DIR="$ROOT/cricket-unified-api"
PY=http://127.0.0.1:8010
NEST=http://127.0.0.1:3000
TMP="$NEST_DIR/.verify"

mkdir -p "$TMP"
rm -f "$TMP"/*.log

# The FastAPI service is the parity reference. Without it the shared paths can
# still be smoke tested against this API, which is what COMPARE=0 does.
COMPARE=1
[ -x "$PY_DIR/.venv/bin/python" ] || COMPARE=0

cleanup() {
  [ -n "${PY_PID:-}" ] && kill "$PY_PID" 2>/dev/null
  [ -n "${NEST_PID:-}" ] && kill "$NEST_PID" 2>/dev/null
}
trap cleanup EXIT

if [ "$COMPARE" = 1 ]; then
  (cd "$PY_DIR" && .venv/bin/python -m uvicorn app.main:app --port 8010 >"$TMP/py.log" 2>&1) &
  PY_PID=$!
else
  echo "NOTE: no reference API at $PY_DIR; checking this API alone."
  py_up=skipped
fi
(cd "$NEST_DIR" && node --env-file=.env dist/main >"$TMP/nest.log" 2>&1) &
NEST_PID=$!

for _ in $(seq 40); do
  [ "$COMPARE" = 1 ] && py_up=$(curl -s -m 2 "$PY/health" | head -c 20)
  nest_up=$(curl -s -m 2 "$NEST/health" | head -c 20)
  [ -n "${py_up:-}" ] && [ -n "$nest_up" ] && break
  sleep 1
done

if [ -z "${py_up:-}" ] || [ -z "${nest_up:-}" ]; then
  echo "servers did not start"
  tail -20 "$TMP"/*.log
  exit 1
fi

pass=0
fail=0

# Five normalisations, none of them behavioural:
#   - `. + 0` drops jq's preserved number literal, so Python's 16.0 and
#     JavaScript's 16 compare equal.
#   - the provenance fields are additions the FastAPI service never had. The
#     events `source` predates them and is kept, hence the `sources` guard.
#   - `pagination` is another addition; the FastAPI service caps its lists with
#     no way to ask for the rows past them.
#   - the match search orders only by rank and start_date, so rows sharing a
#     date come back in arbitrary order from Postgres on either API.
#   - search gained a `venues` block that the FastAPI service has no equivalent for.
NORMALISE='
  walk(if type == "number" then . + 0 else . end)
  | walk(
      if type != "object" then .
      # `scorecard.source` and the events `source` predate provenance and stay.
      elif has("innings") or has("matchups") then del(.sources, .source_label)
      else del(.sources, .source, .source_label, .pagination) end
    )
  | if type == "object" and has("query") and has("matches")
    then (.matches |= sort_by(.start_date, .id)) | del(.venues)
    else . end
'

check_body() {
  local path="$1"
  local a b
  a=$(curl -s "${PY}${path}" | jq -S "$NORMALISE" 2>/dev/null)
  b=$(curl -s "${NEST}${path}" | jq -S "$NORMALISE" 2>/dev/null)
  if [ "$a" = "$b" ]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "BODY DIFF  ${path}"
    diff <(echo "$a") <(echo "$b") | head -30
  fi
}

check_status() {
  local path="$1"
  local a b
  a=$(curl -s -o "$TMP/body" -w '%{http_code}' "${PY}${path}")
  b=$(curl -s -o "$TMP/body" -w '%{http_code}' "${NEST}${path}")
  if [ "$a" = "$b" ]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "STATUS DIFF  py=${a} nest=${b}  ${path}"
  fi
}

check_both() {
  check_body "$1"
  check_status "$1"
}

# Fallback when there is no reference to diff against: the route must still
# answer with an expected status class and a parseable JSON body.
check_reachable() {
  local path="$1" code
  code=$(curl -s -o "$TMP/nest-body" -w '%{http_code}' "${NEST}${path}")
  case "$code" in
    200 | 400 | 404) ;;
    *)
      fail=$((fail + 1))
      echo "UNEXPECTED STATUS  ${code}  ${path}"
      return
      ;;
  esac
  pass=$((pass + 1))

  if jq -e . <"$TMP/nest-body" >/dev/null 2>&1; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "INVALID JSON  ${path}"
  fi
}

# Routes that exist only here, so there is nothing to diff against. Checked for
# status and then for a jq assertion describing the shape or the row counts.
check_nest() {
  local path="$1" want="$2" assertion="$3"
  local code
  code=$(curl -s -o "$TMP/nest-body" -w '%{http_code}' "${NEST}${path}")
  if [ "$code" != "$want" ]; then
    fail=$((fail + 1))
    echo "NEST STATUS  want=${want} got=${code}  ${path}"
    return
  fi
  pass=$((pass + 1))

  [ -z "$assertion" ] && return
  if jq -e "$assertion" <"$TMP/nest-body" >/dev/null 2>&1; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "NEST ASSERT  ${path}"
    echo "             ${assertion}"
    head -c 400 "$TMP/nest-body"
    echo
  fi
}

while IFS= read -r path; do
  [ -z "$path" ] && continue
  if [ "$COMPARE" = 1 ]; then check_both "$path"; else check_reachable "$path"; fi
done <"$NEST_DIR/verify-paths.txt"

while IFS=$'\t' read -r path want assertion; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  check_nest "$path" "$want" "$assertion"
done <"$NEST_DIR/verify-nest-only.txt"

[ "$COMPARE" = 1 ] || echo "---- reference API absent: shared paths were smoke tested, not diffed"
echo "---- ${pass} checks passed, ${fail} failed"
[ "$fail" -eq 0 ]
