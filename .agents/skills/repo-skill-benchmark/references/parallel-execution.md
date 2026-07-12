# 병렬 실행

## executor process

executor는 collaboration subagent가 아니라 adapter가 시작한 새 CLI process를 사용한다. 두 방식 모두 agent 병렬화이지만 격리 보장이 다르다.

- collaboration subagent는 root와 filesystem을 공유하고 동시 slot 제한을 받는다. 주변 대화를 fork하면 eval expectation까지 문맥으로 전달될 수 있고 available skill이 live checkout의 절대 경로를 가리킬 수 있다.
- fresh adapter process는 cwd로 지정한 history-free sandbox에서 AGENTS.md와 repo-local skill을 다시 발견한다. old agent가 current skill을 읽는 오염을 막기 쉽다.

bundled Codex adapter의 기본 sandbox는 `workspace-write`다. 다른 agent adapter는 동등한 repository 경계와 승인 옵션을 `safe_args`에 선언한다. 위험한 우회 옵션은 사용자가 명시적으로 요청한 경우에만 adapter의 `unsafe_args`를 사용한다.

grader는 source를 수정하지 않으므로 collaboration subagent로 eval 단위 병렬화할 수 있다.

## scheduling

- `jobs`는 2 이상의 짝수다.
- 한 batch는 `jobs / 2`개의 eval을 포함한다.
- `parallel_safe != false`인 eval의 `with_skill`과 `old_skill`은 하나의 `Promise.all`에서 시작한다.
- `parallel_safe: false` eval은 fixed port, browser profile, database처럼 공유 자원이 있어 old·new도 순차 실행한다.
- 병렬 안전하지 않은 eval은 단독 batch로 실행한다.
- 직렬 pair의 선행 configuration은 eval ID에 따라 번갈아 배치해 한쪽만 항상 먼저 실행되는 편향을 줄인다. persistent 외부 상태가 있으면 idempotent한 `serial_reset_command`를 양쪽 run 직전에 각각 실행하고 checkout 불변을 확인한다.
- 다음 batch는 현재 batch의 artifact 수집이 끝난 뒤 시작한다.

기본값 2는 old·new 한 쌍을 동시에 실행한다. 여러 가벼운 eval을 함께 실행하려면 4로 높일 수 있다. 6 이상은 API rate limit과 build CPU 경합을 확인한 뒤 사용한다.

## 검증 기준

`validate-benchmark.mjs`는 병렬 안전한 각 pair의 시간 구간이 겹쳤는지 계산한다.

```text
overlap = min(new.end, old.end) - max(new.start, old.start)
```

`overlap > 0`이고 sandbox path가 다르며 source commit과 초기 project tree hash가 같아야 병렬 격리 실행으로 인정한다. `parallel_safe: false` pair는 반대로 overlap이 없어야 한다. 단순히 background process를 시작했다는 로그만으로 통과시키지 않는다.

실행 환경 문제나 rate limit으로 한 configuration만 실패하면 해당 결과를 채점하지 않는다. 같은 pair를 새 iteration에서 함께 다시 실행한다.

## bundled Codex adapter smoke 결과

2026-07-12, `codex-cli 0.144.1`에서 history-free sandbox 두 개를 `jobs=2`로 실행했다.

- old·new 시작 차이: 1ms
- 실행 구간 overlap: 36.26초
- 병렬 wall time: 37.90초
- 두 run 시간 합계: 73.95초
- 같은 두 run을 직렬로 합산한 시간 대비 약 1.95배 처리량
- 서로 다른 skill snapshot hash와 예상한 규칙 차이를 정확히 확인
- 양쪽 executor exit 0, Git history 1개, live repository 상태 보존

Codex CLI의 process·sandbox 동작이 바뀌거나 새 adapter를 추가하면 같은 기준으로 smoke를 다시 수행한다.