# 평가 실행 환경

## 목적

실행 agent의 우연한 공유 상태와 평가 정답 노출을 제거하고, 대상 skill만 다른 두 환경을 비교한다.

## history-free sandbox

일반 Git worktree는 원 저장소의 object database와 refs를 공유한다. executor가 `git show <ref>:<eval-path>`로 제거한 expectation을 복구할 수 있으므로 블라인드 환경으로 충분하지 않다.

runner는 `git archive <source-ref>`로 source seed를 만들고 run별 directory에 압축을 푼 뒤 새 Git repository를 초기화한다. 새 repository에는 정제된 project source를 한 번 commit한 history만 존재한다.

## 격리 불변식

1. `with_skill`과 `old_skill`의 project source는 같은 `source-ref`다.
2. current skill은 live working tree의 tracked file과 ignore되지 않은 untracked file로 snapshot하고 old skill은 `baseline-ref`에서 snapshot한다. ignored cache와 secret은 current snapshot에도 넣지 않는다.
3. 두 snapshot에서 `evals/`를 제거한 뒤 executor sandbox에 설치한다.
4. 대상과 다른 `repo-skill-benchmark` 사본은 executor sandbox에서 제거한다.
5. eval prompt, expected output, expectations와 grader policy는 sandbox 밖에 둔다.
6. 각 eval·configuration은 별도 history-free Git repository를 사용한다.
7. setup command, 입력 파일과 fixture patch는 두 configuration에 동일하게 적용한다.
8. snapshot 설치와 evaluator 제거는 sandbox initial commit에 포함한다. 그 뒤의 diff에는 fixture와 실행 agent 변경만 남긴다.
9. setup과 fixture 적용 뒤 target skill과 sandbox marker를 제외한 Git-visible project tree hash가 old·new에서 같아야 실행한다.
10. setup과 fixture 적용 뒤 실제 target skill hash가 해당 검사 snapshot hash와 같아야 executor를 시작한다.

이 구조는 정상적인 repository 탐색에서 evaluation data를 숨긴다. 같은 OS user가 checkout 밖 절대 경로를 의도적으로 탐색하는 adversarial executor까지 막는 보안 경계는 아니다. 그 수준의 블라인드가 필요하면 별도 container나 OS user를 사용한다.

## 입력과 dirty fixture

- `files`와 `fixture_patch`는 iteration audit directory에 먼저 고정하고 SHA-256을 기록한다. 양쪽 sandbox는 live 원본을 다시 읽지 않고 같은 고정 사본을 사용한다.
- `files`는 대상 skill directory를 기준으로 해석해 sandbox의 `.benchmark-inputs/<eval-id>/`로 복사하고 executor prompt에 경로만 전달한다.
- `fixture_patch`는 대상 skill directory 기준 상대 경로다.
- fixture를 적용한 직후 `initial.patch`와 `initial-status.txt`를 저장한다.
- `preserve_paths`가 있으면 실행 전후 SHA-256을 `preservation.json`에 기록한다.
- grader는 최종 patch만 보고 fixture를 agent 변경으로 오해하지 말고 initial artifact와 대조한다.

## 실행 결과물

각 configuration directory에 다음을 저장한다.

- `executor-prompt.md`: expectation이 없는 실제 실행 prompt
- `transcript.log`, `transcript.md`: adapter raw output과 읽기용 기록
- `initial.patch`, `initial-status.txt`: 실행 전 fixture
- `outputs/changes.patch`: 신규 파일을 포함한 최종 binary diff
- `outputs/commits.txt`: executor가 만든 commit 내역
- `outputs/ignored-untracked-*`: ignored 파일의 실행 전후 inventory와 새 파일의 크기 제한 archive
- `outputs/status.txt`: 최종 Git 상태
- `outputs/commands.txt`: 실행 명령과 종료 코드
- `outputs/report.md`: 실행 agent 최종 응답
- `outputs/metrics.json`: command 수와 오류 수
- `timing.json`: 시작·종료·token 사용량
- `run.json`: source commit, configuration, sandbox와 blind 상태

## lifecycle

1. runner가 source archive와 정제된 두 skill snapshot을 준비한다.
2. 모든 sandbox를 순차 준비해 setup 경합과 fixture 오류를 실행 전에 발견한다.
3. 준비가 끝나면 eval pair를 제한된 concurrency로 실행한다.
4. grader가 필요하면 sandbox source와 output artifact를 함께 확인한다.
5. executor가 모두 종료된 뒤 정제된 old·current skill archive와 입력 사본을 artifact workspace로 승격한다.
6. 집계와 사용자 검토가 끝난 후 cleanup script로 임시 sandbox를 제거한다.

```bash
node .agents/skills/repo-skill-benchmark/scripts/cleanup-sandboxes.mjs \
  --iteration <workspace>/iteration-N
```

기본 artifact workspace는 `$TMPDIR/repo-skill-benchmark-artifacts/` 아래다. 재현성을 위해 정제된 skill snapshot archive, 입력 파일과 fixture 사본 및 `node_modules` 전체는 보존하지 않는다. snapshot archive는 executor가 모두 끝난 뒤에만 기록하므로 old executor가 current candidate를 artifact에서 읽지 못한다.

transcript, command output, 입력 사본과 새 ignored file archive에는 경로, 환경 진단값 또는 민감한 내용이 포함될 수 있다. artifact를 외부 공유하기 전에 내용을 검토한다.