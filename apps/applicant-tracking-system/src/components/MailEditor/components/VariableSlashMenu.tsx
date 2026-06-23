import { DismissableLayer } from '@radix-ui/react-dismissable-layer';
import * as PopperPrimitive from '@radix-ui/react-popper';
import { Portal } from '@radix-ui/react-portal';
import { type Editor, useEditorState } from '@tiptap/react';

import { variableIconMap, type VariableItem } from '@/components/TemplateEditorDialog/type';
import {
  executeDeactivateSlash,
  executeInsertVariable,
  inactiveSlashCommandState,
  slashCommandPluginKey,
  type SlashCommandState,
  slashElementDataAttribute,
} from '@/utils/tiptap/extensions/SlashCommand';
import { cn } from '@/utils/tw';

interface VariableSlashMenuProps {
  editor: Editor;
  variables: VariableItem[];
}

const getSlashEl = (editor: Editor, state: SlashCommandState) => {
  if (!state.active || !state.range) {
    return null;
  }
  return editor.view.dom.querySelector<Element>(`[${slashElementDataAttribute}]`);
};

export const VariableSlashMenu = ({ editor, variables }: VariableSlashMenuProps) => {
  const { state, slashEl } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const pluginState = slashCommandPluginKey.getState(editor.state) ?? inactiveSlashCommandState;
      return {
        state: pluginState,
        slashEl: getSlashEl(editor, pluginState) ?? {
          getBoundingClientRect: () => new DOMRect(),
        },
      };
    },
  });

  if (!state.active) {
    return null;
  }

  // NOTE: React createPortal을 사용하면 dialog 바깥에 렌더링되므로 radix dialog와의 호환이 어려워요.
  // 하지만 Portal을 사용하지 않으면 dialog 내부의 overflow-scroll로 인해 제대로된 오버레이가 렌더링되지 않아요.
  // 게다가 Popover는 내부 및 외부 focus 구현을 자유롭게 컨트롤하지 못하는 이슈가 있어요.
  // 슬래시 커맨드와 에디터 인라인 검색을 위해 에디터에 키보드 포커스를 유지해야 해요.
  // 따라서 radix popper를 사용하여 직접 원하는 Popover를 세팅하고, dialog 내부에 렌더링해요.
  return (
    <PopperPrimitive.Root>
      <PopperPrimitive.Anchor
        // NOTE: 가상 엘리먼트를 사용하여 렌더링 위치를 제어해요.
        virtualRef={{
          current: slashEl,
        }}
      />
      <Portal asChild>
        <DismissableLayer
          asChild
          disableOutsidePointerEvents={false}
          onDismiss={() => executeDeactivateSlash(editor.view)}
          onEscapeKeyDown={() => executeDeactivateSlash(editor.view)}
          onFocusOutside={(e) => {
            // NOTE: 더 나은 UX를 위해 focus가 밖으로 나가는 것을 막아요.
            e.preventDefault();
            editor.commands.focus();
          }}
          onPointerDownOutside={() => {
            executeDeactivateSlash(editor.view);
          }}
        >
          <PopperPrimitive.Content
            align="start"
            className="bg-floatBackground shadow-select fixed z-500 flex min-w-60 flex-col overflow-hidden rounded-lg px-2 py-2"
            role="dialog"
            side="bottom"
            sideOffset={5}
          >
            {state.items.length > 0 ? (
              state.items.map((item, index) => {
                const variable = variables.find((v) => v.id === item.id);
                const isSelected = index === state.selectedIndex;
                return (
                  <button
                    className={cn(
                      'text-15 flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg p-2 text-left font-medium outline-0 transition-colors',
                      isSelected
                        ? 'bg-greyOpacity100 text-greyOpacity800'
                        : 'text-greyOpacity800 hover:bg-greyOpacity100',
                    )}
                    key={item.id}
                    onClick={() => {
                      if (state.range) {
                        executeInsertVariable(editor.view, item, state.range);
                        editor.commands.focus();
                      }
                    }}
                  >
                    {variable && (
                      <span className="text-neutralDisabled">{variableIconMap[variable.type]}</span>
                    )}
                    <span className="max-w-36 min-w-25 truncate">{item.label}</span>
                    {variable?.isDifferentPerPerson && (
                      <span className="text-tiny text-teal500 min-w-25 flex-1 text-right">
                        사람마다 다르게 설정
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-13 text-greyOpacity500 mx-2 flex min-h-10 w-[calc(100%-16px)] items-center justify-center p-2 text-center font-medium">
                검색된 변수가 없어요
              </div>
            )}
          </PopperPrimitive.Content>
        </DismissableLayer>
      </Portal>
    </PopperPrimitive.Root>
  );
};
