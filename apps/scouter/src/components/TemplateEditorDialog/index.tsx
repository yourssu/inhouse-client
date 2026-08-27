import { type Editor } from '@tiptap/react';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { Dialog } from '@yourssu-inhouse/interior';
import { josa } from 'es-hangul';
import { useEffect, useRef, useState } from 'react';
import { useLoading } from 'react-simplikit';

import type { MailTemplateDetail } from '@/apis/mails/schema';

import {
  createMailTemplate,
  toAttachmentReferenceRequests,
  updateMailTemplate,
} from '@/apis/mails';
import { mailsQueryKeys } from '@/apis/mails/query';
import { MailEditor } from '@/components/MailEditor';
import { TitleEditor } from '@/components/MailEditor/components/TitleEditor';
import { VariablePannel } from '@/components/TemplateEditorDialog/components/VariablePannel';
import { VariableContext } from '@/components/TemplateEditorDialog/context';
import { useTemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import { useVariableActions } from '@/components/TemplateEditorDialog/hooks/useVariableActions';
import {
  extractUsedVariableKeys,
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
  onSubmitComplete: () => void;
}

export const TemplateEditorDialog = ({
  closeAsTrue,
  isOpen,
  closeAsFalse,
  mode,
  initialData,
  onSubmitComplete,
}: TemplateEditorDialogProps) => {
  const openAlertDialog = useAlertDialog();
  const [loading, startLoading] = useLoading();
  const [formData, setFormData] = useTemplateFormData(initialData);
  const setters = {
    title: useSetStateSelector(setFormData, 'title'),
    subject: useSetStateSelector(setFormData, 'subject'),
    content: useSetStateSelector(setFormData, 'content'),
    attachments: useSetStateSelector(setFormData, 'attachments'),
    variables: useSetStateSelector(setFormData, 'variables'),
  };

  const [editor, setEditor] = useState<Editor | null>(null);
  const [titleEditor, setTitleEditor] = useState<Editor | null>(null);
  // 변수 패널에서 변수를 삽입할 때 어느 에디터(본문/제목)로 넣을지 결정하기 위해 마지막 포커스 에디터를 추적한다.
  const activeEditorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const markBodyActive = () => {
      activeEditorRef.current = editor;
    };
    const markTitleActive = () => {
      activeEditorRef.current = titleEditor;
    };
    editor?.on('focus', markBodyActive);
    titleEditor?.on('focus', markTitleActive);
    return () => {
      editor?.off('focus', markBodyActive);
      titleEditor?.off('focus', markTitleActive);
    };
  }, [editor, titleEditor]);

  const { addVariable, insertVariable, removeVariable } = useVariableActions({
    editors: [editor, titleEditor].filter((e): e is Editor => e != null),
    getActiveEditor: () => activeEditorRef.current ?? editor,
    isVariableUsed: (id) => formData.content.includes(id) || formData.subject.includes(id),
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
  const { invalidate } = useQueryInvalidation(mailsQueryKeys.templates());

  const handleSubmit = async () => {
    const serializedBody = serializeBodyHtml(formData.content);
    // 서버가 subject·body에 사용되지 않은 변수 선언을 거절하므로 참조된 변수만 보낸다.
    const usedKeys = extractUsedVariableKeys(formData.subject, serializedBody);
    const payload = {
      title: formData.title,
      subject: formData.subject,
      bodyHtml: serializedBody,
      variables: formData.variables.map(toDetailVariable).filter((v) => usedKeys.has(v.key)),
      attachmentReferences: toAttachmentReferenceRequests(formData.attachments),
    };

    const res = await startLoading(
      mode === '생성'
        ? createMutate(payload)
        : updateMutate({ templateId: initialData!.id, data: payload }),
    );

    if (res.success) {
      invalidate();
      onSubmitComplete();
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
                setTitle: setters.subject,
                setContent: setters.content,
                setAttachments: setters.attachments,
                setEditor,
                setTitleEditor,
              }}
              state={{
                title: formData.subject,
                content: formData.content,
                attachments: formData.attachments,
                variables: formData.variables,
                editor,
                titleEditor,
              }}
            >
              <Dialog.Header onClickCloseButton={handleQuit}>
                <div className="flex w-full flex-col gap-3 pt-1.5">
                  <TitleEditor
                    autoFocus
                    className="text-neutralSubtle text-base font-semibold"
                    content={formData.title}
                    onHTMLChange={setters.title}
                    placeholder="템플릿 이름을 입력해주세요"
                    plain
                  />
                  <MailEditor.Title placeholder="메일 제목을 입력해주세요" />
                </div>
              </Dialog.Header>
              <Dialog.Content className="flex w-180 max-w-full flex-col gap-6 pt-0 pb-2">
                <MailEditor.Content className="max-h-150 min-h-100" />
              </Dialog.Content>
              {editor && (
                <div className="flex items-end justify-between px-6 pb-5">
                  <MailEditor.Toolbar />
                  <Dialog.Button
                    disabled={
                      !formData.title.trim() ||
                      !formData.subject.trim() ||
                      (editor?.isEmpty ?? true)
                    }
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
