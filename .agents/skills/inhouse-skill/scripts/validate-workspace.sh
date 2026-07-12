#!/usr/bin/env bash

set -uo pipefail

usage() {
  echo "사용법: $0 <workspace-name> [--build] [--test-if-present] [--dry-run]" >&2
}

if [[ $# -lt 1 ]]; then
  usage
  exit 2
fi

workspace="$1"
shift

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
run_test_if_present=false
run_build=false
dry_run=false
failed_scripts=()

for option in "$@"; do
  case "$option" in
    --build) run_build=true ;;
    --test-if-present) run_test_if_present=true ;;
    --dry-run) dry_run=true ;;
    *)
      echo "알 수 없는 옵션: $option" >&2
      usage
      exit 2
      ;;
  esac
done

run_workspace_script() {
  local script="$1"

  if [[ "$dry_run" == true ]]; then
    printf "pnpm --filter %q run %q\n" "$workspace" "$script"
    return
  fi

  if pnpm --filter "$workspace" run "$script"; then
    echo "$workspace: $script 성공"
  else
    failed_scripts+=("$script")
  fi
}

if [[ "$dry_run" == false ]]; then
  if ! resolved_workspace="$(
    pnpm --silent --filter "$workspace" exec node -e \
      "process.stdout.write(require('./package.json').name)"
  )"; then
    echo "workspace를 찾지 못했습니다: $workspace" >&2
    exit 1
  fi

  if [[ "$resolved_workspace" != "$workspace" ]]; then
    echo "workspace를 정확히 찾지 못했습니다: $workspace" >&2
    exit 1
  fi
fi

run_workspace_script check:type
run_workspace_script check:lint
run_workspace_script check:format

if [[ "$run_build" == true ]]; then
  if [[ "$dry_run" == true ]]; then
    printf "%q %q\n" "$script_dir/silent-build.sh" "$workspace"
  elif "$script_dir/silent-build.sh" "$workspace"; then
    :
  else
    failed_scripts+=("build")
  fi
fi

if [[ "$run_test_if_present" == true ]]; then
  if [[ "$dry_run" == true ]]; then
    echo "test script가 있으면 실행하고, 없으면 'test script 없음'을 보고"
  else
    test_script="$(
      pnpm --silent --filter "$workspace" exec node -e \
        "process.stdout.write(require('./package.json').scripts?.test ?? '')"
    )"

    if [[ -n "$test_script" ]]; then
      run_workspace_script test
    else
      echo "$workspace: test script 없음"
    fi
  fi
fi

if [[ ${#failed_scripts[@]} -gt 0 ]]; then
  echo "$workspace: 검증 실패 (${failed_scripts[*]})" >&2
  exit 1
fi

if [[ "$dry_run" == false ]]; then
  echo "$workspace: 검증 완료"
fi
