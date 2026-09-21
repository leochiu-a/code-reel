#!/usr/bin/env bash
# Stop hook: format, lint and type-check the project once Claude finishes a turn.
# Passing silently keeps the transcript clean; failures are sent back to Claude.
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 0

input=$(cat)

# Guard against a stop -> fix -> stop loop: if this hook already sent Claude
# back to work once, let the turn end.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

report=""
failed=0

run() {
  local label="$1"
  shift
  local result
  if ! result=$("$@" 2>&1); then
    failed=1
    report+="### ${label} failed"$'\n'"$(printf '%s' "$result" | tail -c 2000)"$'\n\n'
  fi
}

run "oxfmt" pnpm exec oxfmt
run "oxlint" pnpm exec oxlint
run "tsc --noEmit" pnpm exec tsc --noEmit

if [ "$failed" -eq 0 ]; then
  exit 0
fi

jq -n --arg reason "$report" '{decision: "block", reason: $reason}'
