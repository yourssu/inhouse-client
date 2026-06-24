import { Dialog } from '@yourssu-inhouse/interior';
import { merge } from 'es-toolkit';
import { overlay } from 'overlay-kit';
import React from 'react';

type OpenPayload = {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
};

type Option = {
  closeableWithOutside?: boolean;
  closeButton?: boolean;
  content: ((payload: OpenPayload) => React.ReactNode) | React.ReactNode;
  customized?: boolean; // Dialog 콘텐츠를 전부 커스텀할지 여부를 결정해요. true면 Dialog.Content와 Dialog.ButtonGroup을 직접 렌더링해야해요.
  primaryButtonText?: string;
  secondaryButtonText?: string;
  title: string;
};

// Todo: 복잡한 콘텐츠의 경우 overlay.openAsync의 콜백 함수에서 직접 Dialog를 렌더링하는 것이 더 나을 수 있음. customized 제거하고 이건 단순 alert 렌더링으로 제약걸기?
export const useAlertDialog = (option: Partial<Option> = {}) => {
  const fallbackOption = (option: Partial<Option>) => {
    return {
      ...option,
      closeableWithOutside: option.closeableWithOutside ?? true,
      closeButton: option.closeButton ?? true,
      customized: option.customized ?? false,
    };
  };

  const open = async (renderOption: Option) =>
    await overlay.openAsync<boolean>(({ isOpen, close }) => {
      const closeAsTrue = () => close(true);
      const closeAsFalse = () => close(false);

      const {
        primaryButtonText,
        secondaryButtonText,
        customized,
        content,
        closeButton,
        closeableWithOutside,
        title,
      } = merge(fallbackOption(option), fallbackOption(renderOption));

      const renderAnyButton = !!primaryButtonText || !!secondaryButtonText;
      const renderedContent =
        typeof content === 'function' ? content({ closeAsTrue, closeAsFalse }) : content;

      return (
        <Dialog closeableWithOutside={closeableWithOutside} onClose={closeAsFalse} open={isOpen}>
          <Dialog.Header onClickCloseButton={closeButton ? closeAsFalse : undefined}>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          {customized ? renderedContent : <Dialog.Content>{renderedContent}</Dialog.Content>}
          {!customized && renderAnyButton && (
            <Dialog.ButtonGroup>
              {!!secondaryButtonText && (
                <Dialog.Button onClick={closeAsFalse} size="lg" variant="secondary">
                  {secondaryButtonText}
                </Dialog.Button>
              )}
              {!!primaryButtonText && (
                <Dialog.Button onClick={closeAsTrue} size="lg" variant="primary">
                  {primaryButtonText}
                </Dialog.Button>
              )}
            </Dialog.ButtonGroup>
          )}
        </Dialog>
      );
    });

  return open;
};
