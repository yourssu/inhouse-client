---
name: repo-skill-benchmark
description: 저장소 안의 기존 스킬을 Git baseline의 old skill과 현재 working tree의 new skill로 한 번씩 블라인드 비교한다. 스킬 eval 실행, benchmark, 회귀 확인, 릴리스 검증, old-vs-new 비교, 평가 workspace 생성이 필요할 때 반드시 사용한다. 일반 제품 코드 테스트나 스킬을 수정하지 않는 코드 리뷰에는 사용하지 않는다.
compatibility: Git 저장소, Node.js 20 이상, POSIX tar와 shell, stdin 기반 CLI agent adapter가 필요하다.
---

# Repository Skill Benchmark

대상 스킬의 프로젝트 지식과 이 스킬의 평가 절차를 분리한다. 대상 스킬은 실제 작업 규칙과 eval case만 소유하고, 이 스킬은 어떤 대상 스킬에도 동일한 old-vs-new 실행 환경을 제공한다.

대상 스킬의 frontmatter, resource 경로와 script 문법 같은 정적 검사는 `repo-skill-linter`가 소유한다. 이 스킬은 실행 결과의 의미적 차이만 비교한다.

## 고정 비교 계약

- 각 eval은 현재 skill인 `with_skill`과 Git baseline의 `old_skill`을 각각 한 번만 실행한다.
- 두 configuration은 같은 source commit, setup command, 입력 파일과 dirty fixture를 사용한다.
- 실행 agent에게는 prompt만 전달하고 expectation, expected output, evaluator 문서는 노출하지 않는다.
- 각 run은 Git history가 없는 별도 sandbox repository에서 실행한다. live checkout에서는 실행 agent가 코드를 수정하지 않는다.
- 병렬 안전한 eval의 old·new agent는 같은 batch에서 동시에 시작한다.
- 여러 번 반복해 분산을 측정하지 않는다. 사용자가 명시적으로 별도 실험을 요청하면 이 benchmark와 분리한다.

## 작업 절차

1. 대상 skill path와 eval JSON을 확인하고 `references/eval-schema.md`로 입력을 검토한다.
2. 전체 실행이 필요한지, 변경 영역의 eval ID만 실행할지 정한다. 사용자가 전체를 요구하지 않으면 targeted eval을 우선한다.
3. `references/executor-adapters.md`에서 실행 agent adapter를 정하고 `references/evaluation-environment.md`의 격리 조건을 확인한 뒤 runner를 실행한다.
4. runner가 동작하는 동안 expectation이 결과물로 검증 가능한지 점검한다. 실행 agent에게 expectation을 추가 전달하지 않는다.
5. 실행이 끝나면 `references/grading-policy.md`에 따라 독립 grader를 병렬 배정한다.
6. grading JSON을 검증하고 benchmark를 집계한다.
7. formal score, claim 검증에서 발견한 결함, 시간·token 비용, 실행하지 못한 행동 검증을 분리해 보고한다.
8. 결과 검토가 끝나면 임시 sandbox를 정리한다. 기본 artifact workspace와 임시 sandbox는 커밋하지 않는다.

## 실행

저장소 루트에서 실행한다.

```bash
node .agents/skills/repo-skill-benchmark/scripts/run-benchmark.mjs \
  --skill .agents/skills/<target-skill> \
  --ids 1,3,5 \
  --jobs 2
```

- `--skill`: 저장소 내부 대상 skill directory
- `--evals`: 기본값은 `<skill>/evals/evals.json`
- `--ids`: 생략하면 모든 eval을 실행한다.
- `--source-ref`: 두 sandbox의 project source. 기본값은 `HEAD`다.
- `--baseline-ref`: old skill snapshot. 기본값은 `HEAD`다.
- `--jobs`: 동시에 실행할 agent 수다. 기본값은 2이며 2 이상의 짝수를 사용한다.
- `--workspace`: 생략하면 저장소 밖 OS temp 아래에 artifact를 둔다. 저장소 내부 경로를 명시하려면 해당 경로가 `git check-ignore`를 통과해야 한다.
- `--setup-command`: sandbox별 의존성 준비 명령. pnpm 저장소에서는 기본적으로 offline frozen install을 사용한다.
- `--skip-setup`: setup이 불필요한 smoke eval에서만 사용한다.
- `--adapter`: 생략하면 bundled Codex adapter를 사용한다. 다른 agent는 `references/executor-adapters.md`의 JSON 계약으로 연결한다.
- `--executor-command`: 선택한 adapter의 executable만 재정의한다.
- `--model`: 생략하면 adapter default를 양쪽에 사용한다. 다른 시점의 benchmark와 직접 비교하려면 같은 model을 명시한다.

pnpm lockfile이 없는 저장소는 setup을 자동 추측하지 않는다. 해당 저장소의 고정 설치 명령을 `--setup-command`로 명시하거나 의존성이 필요 없을 때만 `--skip-setup`을 사용한다.

runner는 adapter가 정의한 별도 subprocess agent를 사용한다. adapter 계약은 `references/executor-adapters.md`, 병렬 실행의 보장과 collaboration subagent와의 차이는 `references/parallel-execution.md`를 따른다.

## 채점과 집계

각 eval의 두 configuration을 같은 grader가 같은 증거 기준으로 채점한다. eval 수가 많으면 grader가 서로 다른 eval을 나눠 병렬 처리할 수 있다.

```bash
node .agents/skills/repo-skill-benchmark/scripts/validate-benchmark.mjs \
  --iteration <workspace>/iteration-N \
  --require-grading

node .agents/skills/repo-skill-benchmark/scripts/aggregate-benchmark.mjs \
  --iteration <workspace>/iteration-N
```

`benchmark.json`의 score는 expectation의 binary pass/fail만 반영한다. assertion 밖에서 발견한 중요 결함은 score를 임의로 바꾸지 말고 `claims`와 analyst notes에 남긴다.

`repo-skill-benchmark` 자체를 변경한 뒤에는 범용 `repo-skill-linter`에 더해 adapter 계약과 runner help까지 전용 검사한다.

```bash
node .agents/skills/repo-skill-linter/scripts/lint-skill.mjs \
  --skill .agents/skills/repo-skill-benchmark

node .agents/skills/repo-skill-benchmark/scripts/validate-skill.mjs
```

대상 스킬의 eval schema만 빠르게 검사할 수도 있다.

```bash
node .agents/skills/repo-skill-benchmark/scripts/validate-evals.mjs \
  --skill .agents/skills/<target-skill>
```

## 출력

최종 보고에는 다음을 포함한다.

- eval별 old·new 점수와 전체 macro·weighted score
- 한쪽이 우세·동률·열세인 eval 수
- 실제 품질 차이를 만든 구체적인 코드 경계
- 전체 또는 중앙 실행 시간과 adapter가 제공할 때의 output token 차이
- 변별력이 없거나 검증 불가능했던 expectation
- browser, 인증 환경, 자동 테스트 부재 등 남은 위험
- 단회 실행이므로 agent 간 분산은 측정하지 않았다는 사실

평가 workspace 전체를 커밋하지 않는다. 감사 이력이 필요하면 민감 정보가 없는지 확인한 뒤 `benchmark.md`만 PR이나 이슈에 첨부한다.