# 채점 정책

## 증거 우선순위

1. 실제 sandbox의 최종 코드와 programmatic check
2. `changes.patch`, `initial.patch`, Git status
3. command transcript의 명령·종료 코드
4. 최종 report

report의 주장만으로 expectation을 통과시키지 않는다.

## 판정

- 각 expectation은 `passed: true | false`만 사용한다. 부분 점수는 없다.
- 명확한 증거가 없으면 fail이다.
- old·new에 같은 burden of proof를 적용한다.
- 자동 검사는 대상 workspace가 실제 scope에 포함됐을 때만 인정한다. 0개 task build는 통과가 아니다.
- 수동 행동 검증은 재현 기록이나 상호작용 증거가 있을 때만 인정한다.
- initial dirty fixture가 최종 상태에서 유지됐는지 확인한다.

## grading.json

각 configuration directory에 저장한다.

```json
{
  "expectations": [
    {
      "text": "원본 expectation",
      "passed": true,
      "evidence": "구체적인 파일·명령·동작 증거"
    }
  ],
  "summary": {
    "passed": 1,
    "failed": 0,
    "total": 1,
    "pass_rate": 1
  },
  "claims": [
    {
      "claim": "실행 report의 추가 주장",
      "type": "factual",
      "verified": true,
      "evidence": "검증 근거"
    }
  ],
  "eval_feedback": {
    "suggestions": [],
    "overall": "평가 assertion의 변별력"
  }
}
```

`expectations[].text`는 eval metadata의 원문과 순서가 같아야 한다. `execution_metrics`와 `timing`은 runner artifact를 복사해도 되지만 score 계산에는 사용하지 않는다.

## claim 검증

expectation 밖에서 중요한 결함이나 장점을 발견하면 `claims`에 기록한다. claim 결과로 formal expectation score를 사후 변경하지 않는다. 다음 iteration의 assertion 개선 근거로 사용한다.

## grader 병렬화

한 grader가 같은 eval의 old·new를 함께 맡는다. 서로 다른 eval은 독립 grader에게 병렬 배정할 수 있다. grader는 source를 변경하지 않고 지정된 `grading.json`만 작성한다.