import type { Editor } from '@tiptap/core';
import type { Dispatch, SetStateAction } from 'react';

import { v4 as uuidv4 } from 'uuid';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { useAlertDialog } from '@/hooks/useAlertDialog';

interface UseVariableActionsProps {
  editors: Editor[];
  getActiveEditor: () => Editor | null;
  isVariableUsed: (id: string) => boolean;
  setVariables: Dispatch<SetStateAction<VariableItem[]>>;
}

export const useVariableActions = ({
  editors,
  getActiveEditor,
  isVariableUsed,
  setVariables,
}: UseVariableActionsProps) => {
  const openAlertDialog = useAlertDialog();

  const addVariable = (variable: Omit<VariableItem, 'id'>) => {
    const newVariable = { ...variable, id: uuidv4() };
    setVariables((prev) => [...prev, newVariable]);
  };

  // 변수가 삭제되면 본문·제목 등 변수를 포함할 수 있는 모든 에디터에서 해당 칩을 제거한다.
  const removeInlineVariablesInEditors = (id: string) => {
    for (const editor of editors) {
      editor.commands.command(({ tr, state, dispatch }) => {
        const { doc } = state;
        const rangesToDelete: { from: number; to: number }[] = [];

        doc.descendants((node, pos) => {
          if (node.type.name === 'inlineVariable' && node.attrs.id === id) {
            rangesToDelete.push({ from: pos, to: pos + node.nodeSize });
          }
        });

        if (rangesToDelete.length > 0 && dispatch) {
          for (let i = rangesToDelete.length - 1; i >= 0; i--) {
            const { from, to } = rangesToDelete[i];
            tr.delete(from, to);
          }
          dispatch(tr);
          return true;
        }
        return false;
      });
    }
  };

  const removeVariable = async (id: string) => {
    if (editors.length === 0) {
      return;
    }

    if (!isVariableUsed(id)) {
      setVariables((prev) => prev.filter((v) => v.id !== id));
      return;
    }

    const confirmed = await openAlertDialog({
      title: '정말 지우시겠어요?',
      content: '내용에 포함된 변수들이 함께 지워져요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });
    if (!confirmed) {
      return;
    }

    setVariables((prev) => prev.filter((v) => v.id !== id));
    return removeInlineVariablesInEditors(id);
  };

  // 변수 칩은 포커스된 에디터(본문 또는 제목)에 삽입한다.
  const insertVariable = (variable: VariableItem) => {
    const editor = getActiveEditor();
    editor
      ?.chain()
      .focus()
      .setInlineVariable({
        id: variable.id,
        label: variable.name,
        isDifferentPerPerson: variable.isDifferentPerPerson ?? false,
      })
      .run();
  };

  return {
    addVariable,
    insertVariable,
    removeVariable,
  };
};
