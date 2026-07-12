import { type Editor } from '@tiptap/react';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { Dialog } from '@yourssu-inhouse/interior';
import { josa } from 'es-hangul';
import { useState } from 'react';
import { useLoading } from 'react-simplikit';

import type { MailTemplateDetail } from '@/apis/mails/schema';

import { createMailTemplate, updateMailTemplate } from '@/apis/mails';
import { MailEditor } from '@/components/MailEditor';
import { VariablePannel } from '@/components/TemplateEditorDialog/components/VariablePannel';
import { VariableContext } from '@/components/TemplateEditorDialog/context';
import { useTemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import { useVariableActions } from '@/components/TemplateEditorDialog/hooks/useVariableActions';
import {
  serializeBodyHtml,
  toDetailVariable,
} from '@/components/TemplateEditorDialog/utils/variable';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface TemplateEditorDialogProps {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  initialData?: MailTemplateDetail;
  isOpen: boolean;
  mode: '생성' | '수정';
}

export const TemplateEditorDialog = ({
  closeAsTrue,
  isOpen,
  closeAsFalse,
  mode,
  initialData,
}: TemplateEditorDialogProps) => {
  const openAlertDialog = useAlertDialog();
  const [loading, startLoading] = useLoading();
  const [formData, setFormData] = useTemplateFormData(initialData);
  const setters = {
    title: useSetStateSelector(setFormData, 'title'),
    content: useSetStateSelector(setFormData, 'content'),
    attachments: useSetStateSelector(setFormData, 'attachments'),
    variables: useSetStateSelector(setFormData, 'variables'),
  };

  const [editor, setEditor] = useState<Editor | null>(null);
  const { addVariable, insertVariable, removeVariable } = useVariableActions({
    content: formData.content,
    editor,
    setVariables: setters.variables,
  });

  const { mutateWithToast: createMutate } = useToastedMutation({
    mutationFn: createMailTemplate,
    successText: '템플릿이 생성되었습니다.',
  });
  const { mutateWithToast: updateMutate } = useToastedMutation({
    mutationFn: updateMailTemplate,
    successText: '템플릿이 수정되었습니다.',
  });
  const { invalidate } = useQueryInvalidation(['mails', 'templates']);

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      bodyHtml: serializeBodyHtml(formData.content),
      variables: formData.variables.map(toDetailVariable),
      attachmentReferences: formData.attachments,
    };

    const res = await startLoading(
      mode === '생성'
        ? createMutate(payload)
        : updateMutate({ templateId: initialData!.id, data: payload }),
    );

    if (res.success) {
      invalidate();
      closeAsTrue();
    }
  };

  const handleQuit = async () => {
    if (
      await openAlertDialog({
        title: `템플릿 ${josa(mode, '을/를')} 그만할까요?`,
        content: '작성 중인 내용은 저장되지 않아요.',
        primaryButtonText: '확인',
        secondaryButtonText: '취소',
      })
    ) {
      closeAsFalse();
    }
  };

  return (
    <VariableContext.Provider
      value={{ addVariable, insertVariable, removeVariable, variables: formData.variables }}
    >
      <Dialog closeableWithOutside={false} onClose={handleQuit} open={isOpen}>
        <div className="flex size-full">
          <VariablePannel />
          <div className="flex-[1_1_0]">
            <MailEditor
              actions={{
                setTitle: setters.title,
                setContent: setters.content,
                setAttachments: setters.attachments,
                setEditor,
              }}
              state={{
                title: formData.title,
                content: formData.content,
                attachments: formData.attachments,
                variables: formData.variables,
                editor,
              }}
            >
              <Dialog.Header onClickCloseButton={handleQuit}>
                <MailEditor.Title autoFocus />
              </Dialog.Header>
              <Dialog.Content className="flex w-180 max-w-full flex-col gap-6 pt-0 pb-2">
                <MailEditor.Content className="max-h-150 min-h-100" />
              </Dialog.Content>
              {editor && (
                <div className="flex items-end justify-between px-6 pb-5">
                  <MailEditor.Toolbar />
                  <Dialog.Button
                    disabled={!formData.title.trim() || (editor?.isEmpty ?? true)}
                    loading={loading}
                    onClick={handleSubmit}
                    size="md"
                  >
                    {mode === '수정' ? '수정하기' : '생성하기'}
                  </Dialog.Button>
                </div>
              )}
            </MailEditor>
          </div>
        </div>
      </Dialog>
    </VariableContext.Provider>
  );
};
