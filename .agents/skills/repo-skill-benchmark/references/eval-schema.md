# Eval schema

대상 skill은 기본적으로 `<skill>/evals/evals.json`에 평가 case를 둔다. 실행 규칙은 대상 skill에 복사하지 않는다.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "name": "descriptive-name",
      "prompt": "실제 사용자가 요청할 작업",
      "expected_output": "성공 결과의 요약",
      "files": ["files/input.json"],
      "fixture_patch": "fixtures/preserve-user-change.patch",
      "preserve_paths": ["README.md"],
      "parallel_safe": true,
      "expectations": ["실제 output과 transcript에서 검증할 수 있는 조건"]
    }
  ]
}
```

## 필드

- `skill_name`: 대상 skill frontmatter name과 일치한다.
- `id`: 중복되지 않는 양의 정수다.
- `name`: 선택 사항이다. 생략하면 prompt에서 안전한 directory name을 만든다.
- `prompt`, `expected_output`: 비어 있지 않은 문자열이다.
- `files`: 대상 skill directory 기준 상대 regular file 목록이다. 기본값은 빈 배열이다. symlink, directory, eval spec directory 안의 파일은 허용하지 않는다.
- `fixture_patch`: 선택 사항이며 대상 skill directory 기준 Git patch 경로다.
- `preserve_paths`: fixture나 기존 입력 중 실행 뒤 byte-for-byte 보존해야 하는 sandbox 상대 경로다.
- `parallel_safe`: 기본값은 true다. fixed port, browser profile, database 등 old·new가 공유할 자원이 있으면 false로 둔다.
- `serial_reset_command`: `parallel_safe: false`인 각 configuration 실행 직전에 persistent 외부 상태를 동일하게 초기화하는 선택 명령이다. idempotent해야 하고 sandbox checkout을 변경하면 안 된다. fixed port처럼 process 종료만으로 상태가 사라지면 생략할 수 있다.
- `expectations`: binary pass/fail로 판정할 수 있는 문자열 목록이다.

## 작성 원칙

- 프로젝트 문장을 되풀이했는지가 아니라 처음 보는 경계에서 같은 결정을 내리는지 검사한다.
- reference 선택 expectation은 실제 실행 과정이 품질에 중요한 경우에만 둔다.
- 파일 존재만 검사하지 말고 공개 계약, 상태 수명, 실패 경로와 검증 결과를 함께 확인한다.
- report에 적었다는 사실과 행동을 실제로 실행했다는 사실을 분리한다.
- 모든 configuration이 쉽게 통과하는 expectation은 더 구체적으로 만들거나 제거한다.
- 이미 요구 상태를 만족하는 no-op fixture는 구현 능력을 거의 측정하지 못하므로 피한다.
- fixture가 변경한 모든 path는 `preserve_paths`에 선언한다. runner가 누락을 거부한다.
- fixture가 기존 파일을 삭제하는 dirty state도 지원한다. 실행 뒤 같은 path가 계속 없어야 preservation을 통과한다.
- 직렬 실행은 동시 경합만 막는다. DB, browser profile, rate limit처럼 첫 run의 흔적이 남으면 reset command나 eval별 독립 자원을 제공한다.