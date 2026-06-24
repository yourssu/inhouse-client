import type { ReactNode } from 'react';

import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

import { AttachmentUploadButton } from '@/components/MailEditor/components/AttachmentUploadButton';
import { ContentEditor } from '@/components/MailEditor/components/ContentEditor';
import { EditorToolbar } from '@/components/MailEditor/components/EditorToolbar';
import {
  MailEditorContext,
  type MailEditorContextValue,
  useMailEditorContext,
} from '@/components/MailEditor/context';

interface MailEditorProps extends MailEditorContextValue {
  children: ReactNode;
}

interface MailEditorTitleProps {
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}

interface MailEditorContentProps {
  className?: string;
  placeholder?: string;
}

interface MailEditorToolbarProps {
  className?: string;
}

const MailEditorTitle = ({
  autoFocus,
  className,
  placeholder = '제목을 입력해주세요',
}: MailEditorTitleProps) => {
  const { state, actions } = useMailEditorContext();

  return (
    <input
      autoFocus={autoFocus}
      className={cn(
        'placeholder:text-grey400 w-full text-lg font-semibold focus:outline-none',
        className,
      )}
      onChange={(e) => actions.setTitle(e.target.value)}
      placeholder={placeholder}
      value={state.title}
    />
  );
};

const MailEditorContent = ({
  className,
  placeholder = '내용을 입력하세요',
}: MailEditorContentProps) => {
  const { state, actions } = useMailEditorContext();

  return (
    <ContentEditor
      className={className}
      content={state.content}
      onEditorChange={actions.setEditor}
      onHTMLChange={actions.setContent}
      placeholder={placeholder}
      variables={state.variables}
    />
  );
};

const MailEditorToolbar = ({ className }: MailEditorToolbarProps) => {
  const { state, actions } = useMailEditorContext();

  if (!state.editor) {
    return null;
  }

  return (
    <div className={cn('-ml-1.5 flex flex-col gap-1.5', className)}>
      <EditorToolbar editor={state.editor} />
      <AttachmentUploadButton
        attachments={state.attachments}
        onRemove={(id) => actions.setAttachments((prev) => prev.filter((v) => v.fileId !== id))}
        onUpload={(attachments) => actions.setAttachments((prev) => [...prev, ...attachments])}
      />
    </div>
  );
};

export const MailEditor = ({ children, state, actions }: MailEditorProps) => {
  return (
    <MailEditorContext.Provider value={{ state, actions }}>
      <div className="flex h-full min-h-0 flex-[1_1_0] flex-col">{children}</div>
    </MailEditorContext.Provider>
  );
};

MailEditor.Title = MailEditorTitle;
MailEditor.Content = MailEditorContent;
MailEditor.Toolbar = MailEditorToolbar;
