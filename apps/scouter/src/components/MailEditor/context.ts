import { type Editor } from '@tiptap/react';
import { assert } from 'es-toolkit';
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';

import type { AttachmentReference } from '@/apis/mails/schema';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';

interface MailEditorState {
  attachments: AttachmentReference[];
  content: string;
  editor: Editor | null;
  title: string;
  variables: VariableItem[];
}

interface MailEditorActions {
  setAttachments: Dispatch<SetStateAction<AttachmentReference[]>>;
  setContent: (html: string) => void;
  setEditor: (editor: Editor | null) => void;
  setTitle: (title: string) => void;
}

export interface MailEditorContextValue {
  actions: MailEditorActions;
  state: MailEditorState;
}

export const MailEditorContext = createContext<MailEditorContextValue | null>(null);

export const useMailEditorContext = () => {
  const context = useContext(MailEditorContext);
  assert(!!context, 'useMailEditorContext는 MailEditor 하위에서 사용해야해요.');
  return context;
};
