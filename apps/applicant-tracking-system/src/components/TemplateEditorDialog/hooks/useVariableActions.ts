import type { Editor } from '@tiptap/core';
import type { Dispatch, SetStateAction } from 'react';

import { v4 as uuidv4 } from 'uuid';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { useAlertDialog } from '@/hooks/useAlertDialog';

interface UseVariableActionsProps {
  content: string;
  editor: Editor | null;
  setVariables: Dispatch<SetStateAction<VariableItem[]>>;
}

export const useVariableActions = ({ editor, content, setVariables }: UseVariableActionsProps) => {
  const openAlertDialog = useAlertDialog();

  const addVariable = (variable: Omit<VariableItem, 'id'>) => {
    const newVariable = { ...variable, id: uuidv4() };
    setVariables((prev) => [...prev, newVariable]);
  };

  const removeInlineVariablesInEditor = (id: string) => {
    editor?.commands.command(({ tr, state, dispatch }) => {
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
  };

  const removeVariable = async (id: string) => {
    if (!editor) {
      return;
    }

    if (!content.includes(id)) {
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
    return removeInlineVariablesInEditor(id);
  };

  const insertVariable = (variable: VariableItem) => {
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
