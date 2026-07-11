---
trigger: model_decision
description: 코드 작성이 마무리되고 반환하기 직전, 또는 Type, Linter 및 Formatter 검증이 필요할 때 읽어야 합니다.
globs: src/**/*.{ts,tsx}
---

# 코드 반영 후 검증 (Post-Generation Checks)

이 문서는 AI가 코드를 작성하거나 수정한 **이후에** 코드를 쾌적한 상태로 유지하기 위해 거쳐야 하는 마무리 스텝을 안내합니다.

## 1. Linter & Formatter 실행

- 프로젝트에는 `eslint` 및 `prettier` 룰 세팅이 되어 있습니다. (공유 설정: `packages/eslint-config`, 루트 `.prettierrc.json`)
- 코드를 새로 작성하거나 수정한 이후(특히 반환하기 직전), 항상 명령어를 실행하여 린트 규칙과 포매팅이 프로젝트 컨벤션과 일치하는지 자동으로 강제해야 합니다.
- **실행해야 할 명령어** (루트에서 turbo로 워크스페이스 전체에 실행됨):
  ```bash
  pnpm check:type && pnpm fix:lint && pnpm fix:format
  ```
- 위 명령어를 통해 타입(Type) 에러가 없는지 검증하고, 문법적 오류(Lint)가 없는지 확인하며, 띄어쓰기 룰(Format)을 예쁘게 정돈하세요. 만약 오류가 발생한다면 스스로 수정한 뒤 다시 명령어를 돌려야 합니다.
- 특정 앱/패키지만 검증하려면 해당 디렉토리에서 `pnpm check:type` / `pnpm fix:lint` / `pnpm fix:format`을 실행하세요. (`dist` 산출 패키지는 소스 수정 후 `tsdown` 빌드가 선행되어야 할 수 있어요)

## 2. 누락된 Import 점검

- 외부에서 불러와야 할 컴포넌트, 유틸리티, 훅, 타입이 파일 상단에 잘 `import` 되었는지 마지막으로 눈으로 확인하세요.
- 포매터 및 린터가 미사용 임포트를 정돈해 주거나 에러를 발생시켜 파악하는 데 도움을 줄 것입니다.
