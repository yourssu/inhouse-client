---
trigger: model_decision
description: 다이얼로그, 토스트 등 오버레이 요소를 띄울 때 읽어야 합니다.
globs: apps/*/src/components/**/*.{ts,tsx}, packages/interior/src/components/Dialog/**
---

# Overlays & Dialogs (다이얼로그 팝업/모달 띄우기)

모달, Alert 창, 다이얼로그 등을 표시할 때는 하위 컴포넌트로 마크업(Markup)을 숨겨놓고 State(`isOpen`)로 열고 닫는 방식을 지양하고, 대신 인풋과 아웃풋이 선언적인 `overlay-kit`을 사용합니다.

`overlay-kit` 의 자세한 사용법이 필요하다면 Content7 mcp를 사용해서 읽으세요.

> 📌 **import 출처**: `Dialog`/`TabDialog` 컴포넌트와 `useToast` 훅은 `@yourssu-inhouse/interior`에서, `overlay`는 `overlay-kit`에서, `useLoading`은 `react-simplikit`에서 import합니다. `useAlertDialog`/`useTabDialog`/`useToastedMutation`은 각 앱의 `@/hooks/`에 둡니다.

## 1. 기본 오버레이 열기 (`useAlertDialog`, `useTabDialog`)

기본적인 형태의 다이얼로그는 각 앱에 미리 구현된 훅(`@/hooks/useAlertDialog`, `@/hooks/useTabDialog`)을 통해 엽니다.

```tsx
const openAlertDialog = useAlertDialog();

const handleQuit = async () => {
  const isConfirmed = await openAlertDialog({
    title: '정말 종료하시겠습니까?',
    content: '저장되지 않은 내용은 사라집니다.',
    primaryButtonText: '확인',
    secondaryButtonText: '취소',
  });

  if (isConfirmed) {
    close();
  }
};
```

## 2. 상태를 가지는 복잡한 다이얼로그 분리

`overlay-kit`은 호출 시점의 스냅샷으로 오버레이를 관리하기 때문에, 다이얼로그 외부 스코프의 상태가 변경되어도 이를 가져와서 다이얼로그 내부에 '갱신(리렌더링)' 할 수 없습니다.
따라서 내부에 상태를 가지거나 복잡한 폼이 존재하는 다이얼로그의 경우, **다이얼로그 콘텐츠 자체를 별도의 새 컴포넌트로 분리해서 구현**해야 합니다.

해당 다이얼로그 컴포넌트를 `export`하고, 호출하는 측(부모 컴포넌트)에서 `overlay.openAsync` 내부의 렌더 함수로 다이얼로그를 전달하는 패턴을 권장합니다.

```tsx
// apps/<app>/src/components/SendMailDialog/index.tsx
import { useState } from 'react';
import { Dialog } from '@yourssu-inhouse/interior';

export type SendMailConfig =
  | {
      type: 'now';
    }
  | {
      type: 'reserve';
      date: Date;
    };

// 1. 다이얼로그 컴포넌트는 내부에 독자적인 state를 유지하고, close 함수를 props로 받아 결과값을 넘깁니다.
export const SendMailDialog = ({
  isOpen,
  close,
  defaultType = 'reserve',
}: {
  isOpen: boolean;
  close: (data: null | SendMailConfig) => void;
  defaultType?: 'now' | 'reserve';
}) => {
  const [type, setType] = useState<'now' | 'reserve'>(defaultType);
  const [date, setDate] = useState<Date | null>(null);

  const handleConfirm = () => {
    if (type === 'reserve') {
      close({ type });
    } else if (type === 'now') {
      close({ type, date });
    }
  };

  return (
    <Dialog closeableWithOutside onClose={() => close(null)} open={isOpen}>
      <Dialog.Header onClickCloseButton={() => close(null)}>
        <Dialog.Title>발송하기</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>{/* Type Selector, DatePicker 등 복잡한 내부 폼 요소들 */}</Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button onClick={() => close(null)} size="md" variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button onClick={handleConfirm} size="md" variant="primary">
          발송하기
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
```

```tsx
// 사용처 (부모 컴포넌트)
import { overlay } from 'overlay-kit';
import { SendMailDialog, type SendMailConfig } from '@/components/SendMailDialog'; // 앱 전용 컴포넌트

export const MailPage = () => {
  const handleClickSend = async () => {
    // 2. 외부에서 overlay.openAsync를 호출하며 다이얼로그 컴포넌트를 마운트합니다.
    const result = await overlay.openAsync<null | SendMailConfig>(({ isOpen, close }) => {
      // 컴포넌트 Props로 필요한 초기 데이터를 넘길 수 있습니다.
      return <SendMailDialog close={close} isOpen={isOpen} defaultType="reserve" />;
    });

    if (result) {
      // 다이얼로그가 닫힌 후 반환된 result(데이터)를 활용해 후속 동작을 수행합니다.
      console.log('결과:', result.type, result.date);
    }
  };

  return <button onClick={handleClickSend}>발송하기</button>;
};
```

## 3. 다이얼로그 내부에서의 Mutation (API 호출) 및 로딩 처리

다이얼로그 내부에서 비동기 작업(뮤테이션)을 수행하는 경우 사용자 액션을 막고 로딩 UI를 띄워야 합니다.

- `react-simplikit`의 `useLoading`을 활용하여 비동기 작업의 상태를 추적하고, 이를 `<Dialog.Button loading={loading}>` prop과 연결하세요.
- 비동기 작업이 완료되면 창을 닫고 토스트 피드백을 제공하는 것이 좋습니다.
- 특히 Mutation 작업 시엔 커스텀 훅인 `useToastedMutation`(`mutateWithToast`)을 활용하여 성공/에러 토스트 메시지를 쉽게 결합하세요.

### 💡 TemplateEditorDialog 예시 (`useLoading` + `useToastedMutation`)

```tsx
// apps/<app>/src/components/TemplateEditorDialog/index.tsx
import { useLoading } from 'react-simplikit';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { Dialog } from '@yourssu-inhouse/interior';

export const TemplateEditorDialog = ({ isOpen, closeAsTrue }: Props) => {
  const [loading, startLoading] = useLoading();

  // 성공 시 자동으로 Toast 알림을 띄워주는 mutation 훅
  const { mutateWithToast: createMutate } = useToastedMutation({
    mutationFn: createMailTemplate,
    successText: '템플릿이 생성되었습니다.',
  });

  const handleSubmit = async () => {
    const payload = {
      /* ... */
    };

    // startLoading으로 promise를 감싸면 완료 시점까지 loading === true 유지
    const res = await startLoading(createMutate(payload));

    if (res.success) {
      closeAsTrue(); // 완료 후 다이얼로그 닫기
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleQuit}>
      {/* ... */}
      <Dialog.Button loading={loading} onClick={handleSubmit}>
        생성하기
      </Dialog.Button>
    </Dialog>
  );
};
```

## 4. 토스트 (Toast) 메시지 띄우기

단순 메시지 알림 시에는 `useToast` 훅이 반환하는 객체의 상태 메서드(`toast.default`, `toast.success`, `toast.error`)를 상황에 맞게 사용합니다. 단, API 호출(Mutation)과 결합할 때는 가급적 위의 `useToastedMutation`을 우선적으로 고려하세요.

```tsx
import { useToast } from '@yourssu-inhouse/interior';

const toast = useToast();

const copyToClipboard = () => {
  navigator.clipboard.writeText('...');
  toast.default('클립보드에 복사되었습니다.'); // 기본 토스트
  // toast.success('성공적으로 저장되었습니다.'); // 성공 토스트
  // toast.error('네트워크 오류가 발생했습니다.'); // 에러 토스트
};
```
