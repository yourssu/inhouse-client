---
name: repo-skill-linter
description: 저장소 내부 agent skill의 frontmatter, resource 경로, JSON, eval schema와 script 문법을 빠르고 정적으로 검사한다. `.agents/skills/*`의 스킬을 생성, 수정, 리팩터링 또는 리뷰할 때 반드시 사용한다. old-vs-new 결과 품질 비교나 agent 실행에는 사용하지 않고 repo-skill-benchmark를 사용한다.
---

# Repository Skill Linter

스킬의 구조적 유효성과 이식성을 검사한다. agent를 실행하거나 prompt를 평가하지 않으므로 benchmark와 분리해 자주 실행한다.

## 실행

저장소 루트에서 대상 스킬을 지정한다.

```bash
node .agents/skills/repo-skill-linter/scripts/lint-skill.mjs \
  --skill .agents/skills/<target-skill>
```

기본 실행은 `HEAD`와 비교한 변경·추가 파일만 검사한다. 문서만 바뀌었다면 eval과 script 검사를 실행하지 않는다. 전체 파일을 다시 검사해야 할 때만 `--all`을 사용한다.

```bash
node .agents/skills/repo-skill-linter/scripts/lint-skill.mjs \
  --skill .agents/skills/<target-skill> \
  --all
```

## 검사 계약

- `SKILL.md`의 name·description과 디렉터리 이름을 확인한다.
- `SKILL.md`가 가리키는 `references/`, `scripts/`, `assets/` 경로의 존재를 확인한다.
- 변경된 JSON은 parse하고, 변경 범위가 `evals/`에 걸치면 `repo-skill-benchmark`의 eval validator를 실행한다.
- 변경된 `.sh`는 `bash -n`, 변경된 `.js`·`.mjs`·`.cjs`는 `node --check`로 검사한다.
- 변경된 텍스트 resource에 사용자 홈 절대 경로가 들어가면 이식성 결함으로 실패한다.
- 삭제된 resource가 `SKILL.md`에서 계속 참조되면 실패한다.

검사 실패를 자동 수정하지 않는다. 원인을 고친 뒤 같은 명령을 다시 실행한다.

## Benchmark 경계

이 lint의 성공은 스킬이 좋은 결과를 만든다는 뜻이 아니다. prompt, 규칙, 가드레일 또는 eval expectation의 의미가 바뀌었다면 관련 eval ID만 `repo-skill-benchmark`로 비교한다. 문구·경로·script 문법만 바뀌어 결과 품질에 영향이 없다면 benchmark를 실행하지 않는다.

## 자체 변경 검증

이 linter를 변경하면 단위 테스트와 전체 lint를 실행한다.

```bash
node --test .agents/skills/repo-skill-linter/scripts/lint-skill.test.mjs
node .agents/skills/repo-skill-linter/scripts/lint-skill.mjs \
  --skill .agents/skills/repo-skill-linter \
  --all
```