# Executor adapters

benchmark core는 특정 agent 제품을 호출하지 않는다. adapter JSON이 실행 파일과 인자, report·transcript 계약을 선언한다. bundled Codex adapter는 기본값일 뿐이며 다른 CLI agent도 같은 sandbox와 artifact 계약을 사용한다.

## Adapter schema

```json
{
  "schema_version": 1,
  "name": "my-agent-cli",
  "command": "my-agent",
  "version_args": ["--version"],
  "base_args": ["run", "--non-interactive"],
  "safe_args": ["--permission-mode", "workspace"],
  "unsafe_args": ["--permission-mode", "unrestricted"],
  "model_args": ["--model", "{model}"],
  "trailing_args": ["--cwd", "{sandbox}"],
  "environment": {
    "BENCHMARK_PROMPT_PATH": "{prompt_path}",
    "BENCHMARK_REPORT_PATH": "{report_path}"
  },
  "prompt_mode": "stdin",
  "report_mode": "stdout",
  "transcript_format": "text"
}
```

지원 placeholder는 `{sandbox}`, `{prompt_path}`, `{report_path}`, `{model}`이다.

- `command`: PATH에서 찾을 executable 또는 절대 경로다.
- `base_args`: 모든 run에 전달한다.
- `safe_args`: 기본 실행에서 전달한다. agent 자체의 repository 경계·승인 정책을 여기에 둔다.
- `unsafe_args`: 사용자가 `--unsafe-bypass-sandbox`를 명시했을 때만 `safe_args` 대신 전달한다. 선언이 없으면 unsafe 실행을 거부한다.
- `model_args`: `--model`이 있을 때만 전달한다.
- `trailing_args`: safety·model 인자 뒤에 전달한다.
- `environment`: literal secret을 넣지 않는다. 필요한 인증은 실행 process의 기존 환경이나 agent 자체 credential store를 사용한다.
- `prompt_mode`: 현재 `stdin`만 지원한다.
- `report_mode`: `stdout`이면 raw stdout을 report로도 저장하고, `file`이면 agent가 `{report_path}`를 작성해야 한다. 어느 방식이든 공백이 아닌 최종 report가 없으면 run 실패다.
- `transcript_format`: `text`는 범용 raw transcript다. `codex-jsonl`은 bundled parser로 command와 token telemetry를 추출한다.

adapter 파일 자체는 SHA-256과 함께 iteration의 `audit/executor-adapter.json`에 복사한다. old·new는 반드시 같은 adapter, executable과 model 설정을 사용한다.

## 실행

```bash
node .agents/skills/repo-skill-benchmark/scripts/run-benchmark.mjs \
  --skill .agents/skills/<target-skill> \
  --adapter path/to/agent-adapter.json \
  --jobs 2
```

adapter의 command만 다른 설치 경로로 바꿀 때는 `--executor-command /absolute/path/to/agent`를 사용한다.

agent CLI가 prompt를 stdin으로 받을 수 없거나 final report를 분리할 수 없다면 작은 wrapper executable을 두고 adapter의 `command`로 지정한다. wrapper는 stdin prompt를 전달하고 현재 working directory 안에서 agent를 실행하며, stdout 또는 `BENCHMARK_REPORT_PATH` 계약을 맞춘다.

## 동등성 조건

- runner가 각 process의 cwd를 서로 다른 history-free sandbox로 지정한다.
- adapter는 cwd 밖의 live checkout이나 다른 run artifact를 탐색하지 않도록 자체 permission 옵션을 선언한다.
- 두 configuration에 같은 adapter hash, command, model과 환경 계약을 사용한다.
- token telemetry를 제공하지 않는 adapter는 timing의 token 필드를 `null`로 남긴다. score에는 영향이 없고 집계에는 `n/a`로 표시한다.
- 새 adapter를 도입하면 lightweight old·new pair로 start overlap, snapshot 판별, root 보존과 cleanup을 smoke 검증한다.

collaboration subagent는 cwd와 대화 문맥을 공유하므로 executor adapter를 대신하지 않는다. source를 수정하지 않는 grader·analyst 병렬화에만 사용한다.