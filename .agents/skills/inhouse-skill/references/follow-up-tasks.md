# 확정 후속 작업

이 문서는 현재 코드에서 확인된 결함과 미완료 마이그레이션을 기록한다. 아래 구현은 새로운 코드의 선례가 아니다. 사용자의 현재 요청에 포함되지 않은 항목을 기회주의적으로 함께 수정하지 말고, 관련 작업을 수행할 때 독립된 범위로 완료한다.

## scouter 공용 패키지 전환

- [x] `apps/scouter`에 `@yourssu-inhouse/inhouse-react`, `@yourssu-inhouse/inhouse-utils` workspace 의존성을 선언한다.
- [x] 로컬 `useDelayedValue`, `useEffectOnce`, `useSetStateSelector` 소비처를 `@yourssu-inhouse/inhouse-react/hooks`로 전환하고 동일 복사본을 제거한다.
- [x] 로컬 `utils/date.ts` 소비처를 `@yourssu-inhouse/inhouse-utils/date`로 전환하고 동일 복사본을 제거한다.
- [x] `types/misc.ts`, `utils/misc.ts`, `utils/object.ts`의 공용 export 소비처를 공용 import로 전환하고, 사용되지 않는 앱 전용 함수를 함께 제거한다.
- [x] scouter type·lint·format·build와 공용 날짜·객체 유틸의 runtime 계약을 검증한다.
- [x] applicants·mail-templates·schedules route의 search schema를 실행해 기본값, 잘못된 enum 복구와 검색어·페이지·필터 보존 계약을 검증한다.
- [ ] scouter remote preview와 shell에서 주요 날짜 표시와 검색 URL 상태의 실제 렌더링·상호작용을 확인한다.

## interior import alias 정리

- [x] `packages/interior`의 `tsconfig.app.json`과 `tsdown` alias 해석을 다시 확인한다.
- [x] 다른 JIT 패키지와 섞지 않고 interior 내부 상대 import만 독립적으로 정리한다.
- [x] interior type·lint·format·build와 소비 앱의 타입·스타일 산출물을 검증한다.