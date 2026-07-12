#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "사용법: $0 <workspace-name>" >&2
}

if [[ $# -ne 1 ]]; then
  usage
  exit 2
fi

workspace="$1"
log_file="$(mktemp)"

trap 'rm -f "$log_file"' EXIT

resolved_workspace="$(
  pnpm --silent --filter "$workspace" exec node -e \
    "process.stdout.write(require('./package.json').name)"
)"

if [[ "$resolved_workspace" != "$workspace" ]]; then
  echo "workspace를 정확히 찾지 못했습니다: $workspace" >&2
  exit 1
fi

build_script="$(
  pnpm --silent --filter "$workspace" exec node -e \
    "process.stdout.write(require('./package.json').scripts?.build ?? '')"
)"

if [[ -z "$build_script" ]]; then
  echo "$workspace: build script 없음" >&2
  exit 1
fi

if pnpm --filter "$workspace" run build >"$log_file" 2>&1; then
  echo "$workspace: build 성공"
else
  exit_code=$?
  echo "$workspace: build 실패" >&2
  cat "$log_file" >&2
  exit "$exit_code"
fi
