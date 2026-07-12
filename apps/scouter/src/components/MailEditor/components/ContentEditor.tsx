import Image from '@tiptap/extension-image';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffectOnce } from '@yourssu-inhouse/inhouse-react/hooks';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { useEffect, useMemo } from 'react';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { InlineVariableExtension } from '@/utils/tiptap/extensions/InlineVariable';
import {
  SlashCommandExtension,
  slashCommandName,
  type SlashCommandStorage,
} from '@/utils/tiptap/extensions/SlashCommand';
import { getEditorStorage } from '@/utils/tiptap/storage';

import { VariableSlashMenu } from './VariableSlashMenu';

interface ContentEditorProps {
  className?: string;
  content?: string;
  limit?: number;
  onEditorChange?: (editor: Editor) => void;
  onHTMLChange?: (html: string) => void;
  placeholder?: string;
  variables?: VariableItem[];
}

export const ContentEditor = ({
  content = '',
  onHTMLChange,
  onEditorChange,
  placeholder,
  variables = [],
  className,
}: ContentEditorProps) => {
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
      extensions: [
        StarterKit.configure({
          paragraph: false,
        }),
        Paragraph.extend({
          parseHTML() {
            return [{ tag: 'div' }];
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
            const style = HTMLAttributes.style
              ? `font-size: 15px; line-height: 1.5; ${HTMLAttributes.style}`
              : 'font-size: 15px; line-height: 1.5;';
            return ['div', { ...HTMLAttributes, style }, 0];
          },
        }),
        TextStyleKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass:
            'before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-none before:text-grey400',
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Image.configure({
          resize: {
            enabled: true,
            alwaysPreserveAspectRatio: true,
          },
        }),
        SlashCommandExtension.configure({
          items: slashItems,
        }),
        InlineVariableExtension,
      ],
      content,
      onUpdate: ({ editor }) => {
        onHTMLChange?.(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: 'focus:outline-none flex-1',
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
    <div
      className={cn('relative flex min-h-0 flex-[1_1_0] flex-col pt-6', className)}
      data-content-editor
    >
      <EditorContent className="flex min-h-0 flex-1 flex-col overflow-y-auto" editor={editor} />
      <VariableSlashMenu editor={editor} variables={variables} />
    </div>
  );
};
