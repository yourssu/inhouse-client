import { overlay } from 'overlay-kit';
import React, { type Dispatch, type SetStateAction, startTransition, useState } from 'react';

import type { EmptyObjectType } from '@/types/misc';

import { TabDialog } from '@/components/_ui/Dialog/TabDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';

type ContextType = Record<number | string | symbol, unknown>;

type OpenPayload<T extends ContextType> = {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  context: T;
  setContext: Dispatch<SetStateAction<T>>;
};

type RenderButtonGroupPayload<T extends ContextType> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Button: typeof TabDialog.Button;
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  context: T;
  setContext: Dispatch<SetStateAction<T>>;
};

type Option<T extends string, TContext extends ContextType> = {
  askBeforeClose?: boolean;
  caseBy: (payload: OpenPayload<TContext>) => Record<T, null | React.ReactElement>;
  closeableWithOutside?: boolean;
  closeButton?: boolean;
  context?: TContext;
  renderButtonGroup?: (p: RenderButtonGroupPayload<TContext>) => React.ReactElement;
  tabs: T[];
};

interface RenderTargetProps<T extends string, TContext extends ContextType> {
  close: (v: boolean) => void;
  isOpen: boolean;
  option: Option<T, TContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
const RenderTarget = <T extends string, TContext extends ContextType>({
  close,
  isOpen,
  option,
}: RenderTargetProps<T, TContext>) => {
  const {
    tabs,
    closeableWithOutside = true,
    closeButton = true,
    caseBy,
    askBeforeClose = true,
    renderButtonGroup,
    context = {},
  } = option;

  const [tab, setTab] = useState(tabs[0]);
  const [ctx, setCtx] = useState<TContext>(context as TContext);
  const openDirtyFormAlertDialog = useAlertDialog();

  const askClose = async () => {
    if (
      await openDirtyFormAlertDialog({
        title: '수정을 그만할까요?',
        content: '지금까지 입력한 정보는 저장되지 않아요.',
        primaryButtonText: '그만하기',
        secondaryButtonText: '계속하기',
      })
    ) {
      close(false);
    }
  };

  const closeAsTrue = () => close(true);
  const closeAsFalse = askBeforeClose ? askClose : () => close(false);

  const content = caseBy({
    closeAsFalse,
    closeAsTrue,
    context: ctx,
    setContext: setCtx,
  })[tab];

  return (
    <TabDialog closeableWithOutside={closeableWithOutside} onClose={closeAsFalse} open={isOpen}>
      <TabDialog.PannelGroup>
        <TabDialog.NavPannel>
          {tabs.map((t) => (
            <TabDialog.NavButton
              active={tab === t}
              key={t}
              onClick={() => startTransition(() => setTab(t))}
            >
              {t}
            </TabDialog.NavButton>
          ))}
        </TabDialog.NavPannel>
        <TabDialog.ContentPannel>
          <TabDialog.Header onClickCloseButton={closeButton ? closeAsFalse : undefined}>
            <TabDialog.Title>{tab}</TabDialog.Title>
          </TabDialog.Header>
          <TabDialog.Content>{content}</TabDialog.Content>
        </TabDialog.ContentPannel>
      </TabDialog.PannelGroup>
      {renderButtonGroup && (
        <TabDialog.ButtonGroup>
          {renderButtonGroup({
            Button: TabDialog.Button,
            context: ctx,
            setContext: setCtx,
            closeAsFalse,
            closeAsTrue,
          })}
        </TabDialog.ButtonGroup>
      )}
    </TabDialog>
  );
};

export const useTabDialog = () => {
  const open = async <T extends string, TContext extends ContextType = EmptyObjectType>(
    option: Option<T, TContext>,
  ) =>
    await overlay.openAsync<boolean>(({ isOpen, close }) => {
      return <RenderTarget close={close} isOpen={isOpen} option={option} />;
    });
  return open;
};
