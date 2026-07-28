---
name: inhouse-git-workflow
description: >-
  Yourssu inhouse-client 저장소에서 사용자가 커밋, 푸시, PR 생성·갱신 중 하나를
  명시적으로 요청했을 때 브랜치·부분 스테이징·Conventional Commit·검증·Draft
  PR 게시를 저장소 관행에 맞게 수행한다. 커밋·푸시·PR 요청을 포함하지 않은 일반
  구현, 코드 리뷰, 디버깅, 읽기 전용 Git 상태 확인, Git 개념 설명 또는 브랜치
  생성만 요청한 경우에는 사용하지 않는다.
---

# 인하우스 Git/PR 워크플로

사용자 변경을 보존하면서 현재 작업만 커밋하고 Draft PR로 게시한다. 저장소
루트의 `AGENTS.md`와 충돌하면 더 구체적인 현재 지침을 우선한다.

## 작업 순서

### 1. 범위와 현재 상태 확정

1. `git status --short --branch`, unstaged diff, staged diff를 확인한다.
2. 사용자 요청과 diff를 대조해 이번 작업 경로와 범위 밖 변경을 분리한다.
3. 제품·기능 작업인지 이슈 없는 저장소 관리 작업인지 분류한다.
4. 제품 작업이면 명시된 요청, 이미 제공되는 Linear 문맥, 현재 브랜치 순으로
   `SCO-번호`를 식별한다. Linear CLI가 없으면 설치하지 않는다.
5. 브랜치와 base를 확정한다. 기본 base는 `main`이고 stacked PR은 실제 선행
   브랜치를 base로 사용한다.

이슈 번호가 필요한데 찾을 수 없거나, 서로 다른 번호가 충돌하거나, 선행
브랜치가 확인되지 않으면 Git 상태를 바꾸기 전에 사용자에게 확인한다.

### 2. 브랜치 네이밍

- 제품 브랜치는 `SCO-번호`, 이슈 없는 저장소 관리 브랜치는
  `chore/<kebab-case-slug>`를 사용한다.

### 3. 부분 스테이징과 커밋

1. 대상 path나 hunk만 스테이징한다. 전체 작업 트리가 현재 범위라고 확인하지
   않았다면 전역 `git add -A`를 사용하지 않는다.
2. `git diff --cached --check`, staged name/status, staged diff를 다시 확인한다.
3. 범위 밖 path나 hunk가 있으면 커밋 전에 index에서만 제거하고 working tree는
   보존한다.
4. `<type>(<scope>): <subject>` 형식으로 커밋한다. scope는 영향 앱이나
   패키지가 명확할 때만 넣고, 개별 커밋 subject에 SCO 번호를 반복하지 않는다.
5. 커밋 뒤 commit diff와 `git status --short --branch`를 다시 읽어 남은 사용자
   변경을 확인한다.

명시적 요청 없이 amend, rebase, reset, force push 등 history rewrite를 수행하지
않는다.

### 4. 푸시와 Draft PR

1. 검증 결과와 남은 변경을 확인한 뒤 일반 push로 head 브랜치를 게시한다.
2. PR 생성 직전에 현재 `.github/pull_request_template.md`를 다시 읽는다.
3. 템플릿의 제목·섹션 순서·heading 계층을 유지하고 실제 diff와 검증 근거로
   모든 섹션을 채운다. HTML 안내 주석은 제거하고 자료가 없는 Figma·Slack
   섹션은 `해당 없음`으로 남긴다.
4. 제품 PR은 `[SCO-번호] type(scope): 요약`, 이슈 없는 저장소 관리 PR은
   `type(scope): 요약` 형식으로 제목을 작성한다. stacked PR은 제목 끝에
   `(현재 순서/전체 PR 수)`를 붙인다. 예: `[SCO-번호] type(scope): 요약 (1/2)`.
5. push 뒤 사용 가능한 GitHub 연결 게시 도구를 우선 사용한다. 해당 기능이
   없을 때만 `gh`로 fallback한다.
6. PR은 기본적으로 Draft로 만들고, 검증이 실패했거나 실행되지 않았다면 Ready로
   전환하지 않는다. stacked PR에는 실제 선행 브랜치를 base로 지정하고 의존
   관계와 병합 순서를 본문에 적는다.
7. 생성 결과를 다시 읽어 URL, Draft 상태, head/base, 제목과 본문을 확인한다.
   결과가 불확실하면 중복 생성 전에 기존 PR을 조회한다.

## 완료 보고

다음을 사실과 증거만으로 간단히 보고한다.

- 사용한 head/base 브랜치와 생성한 commit
- push 및 PR URL·Draft 상태
- 실행한 검증 명령과 성공·실패
- 실행하지 못한 검증과 남은 위험
- 스테이징하지 않고 보존한 범위 밖 변경

push나 PR 생성이 불가능하면 로컬에서 끝낸 범위와 정확한 차단 원인을 밝히고,
수행하지 못한 외부 작업을 성공했다고 표현하지 않는다.
