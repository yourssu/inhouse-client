import Placeholder from '@tiptap/extension-placeholder';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffectOnce } from '@yourssu-inhouse/inhouse-react/hooks';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { useEffect, useMemo } from 'react';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { parseBodyHtml, serializeSubject } from '@/components/TemplateEditorDialog/utils/variable';
import { InlineVariableExtension } from '@/utils/tiptap/extensions/InlineVariable';
import {
  SlashCommandExtension,
  slashCommandName,
  slashCommandPluginKey,
  type SlashCommandStorage,
} from '@/utils/tiptap/extensions/SlashCommand';
import { getEditorStorage } from '@/utils/tiptap/storage';

import { VariableSlashMenu } from './VariableSlashMenu';

interface TitleEditorProps {
  autoFocus?: boolean;
  className?: string;
  content?: string;
  onEditorChange?: (editor: Editor | null) => void;
  onHTMLChange?: (subject: string) => void;
  placeholder?: string;
  variables?: VariableItem[];
}

export const TitleEditor = ({
  autoFocus,
  content = '',
  onHTMLChange,
  onEditorChange,
  placeholder,
  variables = [],
  className,
}: TitleEditorProps) => {
  const slashItems = useMemo(
    () => () =>
      variables.map((v) => ({
        id: v.id,
        label: v.name,
        isDifferentPerPerson: v.isDifferentPerPerson,
      })),
    [variables],
  );

  const editor = useEditor(
    {
      shouldRerenderOnTransaction: false,
      immediatelyRender: true,
      autofocus: autoFocus ? 'end' : false,
      extensions: [
        // 단일 줄 제목 에디터: 블록 노드/마크/리스트 등은 끄고 Document·Text·Paragraph만 둔다.
        StarterKit.configure({
          blockquote: false,
          bold: false,
          bulletList: false,
          code: false,
          codeBlock: false,
          heading: false,
          horizontalRule: false,
          italic: false,
          listItem: false,
          orderedList: false,
          strike: false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass:
            'before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-none before:text-grey400',
        }),
        SlashCommandExtension.configure({
          items: slashItems,
        }),
        InlineVariableExtension,
      ],
      content: parseBodyHtml(content, variables),
      onUpdate: ({ editor }) => {
        onHTMLChange?.(serializeSubject(editor.getHTML()));
      },
      editorProps: {
        attributes: {
          class: 'focus:outline-none w-full',
        },
        // 제목은 단일 줄이므로 줄바꿈을 막는다. 단, 슬래시 메뉴가 열려 있을 때는 선택을 위해 Enter를 허용한다.
        handleKeyDown: (view, event) => {
          if (event.key === 'Enter') {
            const state = slashCommandPluginKey.getState(view.state);
            if (!state?.active) {
              return true;
            }
          }
          return false;
        },
        // 여러 줄 텍스트 붙여넣기 시 줄바꿈을 공백으로 평탄화해 단일 줄을 유지한다.
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain') ?? '';
          if (text.includes('\n')) {
            event.preventDefault();
            view.dispatch(view.state.tr.insertText(text.replace(/[\r\n]+/g, ' ')));
            return true;
          }
          return false;
        },
      },
    },
    [],
  );

  // Todo: editor 선언 위치를 상위레벨로 올리면 effect 필요없어짐
  useEffectOnce(() => {
    onEditorChange?.(editor);
  });

  // Todo: editor 선언 위치를 상위레벨로 올리면 effect 필요없어짐
  useEffect(() => {
    const storage = getEditorStorage<SlashCommandStorage>(editor, slashCommandName);
    storage.items = slashItems;
  }, [editor, slashItems]);

  return (
    <div className={cn('relative', className)} data-title-editor>
      <EditorContent editor={editor} />
      <VariableSlashMenu editor={editor} variables={variables} />
    </div>
  );
};
