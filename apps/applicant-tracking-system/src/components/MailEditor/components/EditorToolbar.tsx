import { type Editor, useEditorState } from '@tiptap/react';
import { IconButton, type IconButtonProps } from '@yourssu-inhouse/interior';
import { Select } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { overlay } from 'overlay-kit';
import { useCallback } from 'react';
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatItalic,
  MdFormatStrikethrough,
  MdFormatUnderlined,
  MdImage,
} from 'react-icons/md';

import { ImageUploadDialog } from '@/components/MailEditor/components/ImageUploadDialog';

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButton extends Omit<IconButtonProps, 'size' | 'variant'> {
  active: boolean;
}

const ToolbarButton = ({ active, children, ...props }: ToolbarButton) => {
  return (
    <IconButton
      className={clsx('text-grey500', active && 'bg-greyOpacity200 text-neutralMuted')}
      size="sm"
      variant="inline"
      {...props}
    >
      {children}
    </IconButton>
  );
};

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      fontSize:
        (editor?.getAttributes('textStyle').fontSize as (typeof fontSizes)[number]) ?? '15px',
      bold: editor?.isActive('bold') ?? false,
      italic: editor?.isActive('italic') ?? false,
      underline: editor?.isActive('underline') ?? false,
      strike: editor?.isActive('strike') ?? false,
      alignLeft: editor?.isActive({ textAlign: 'left' }) ?? false,
      alignCenter: editor?.isActive({ textAlign: 'center' }) ?? false,
      alignRight: editor?.isActive({ textAlign: 'right' }) ?? false,
    }),
  });

  const addImage = useCallback(() => {
    overlay.open(({ close, isOpen }) => (
      <ImageUploadDialog
        close={close}
        isOpen={isOpen}
        onUploadComplete={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
        }}
      />
    ));
  }, [editor]);

  return (
    <div className="flex items-center gap-0.5">
      <Select
        className="text-neutralSubtle min-w-17 text-sm"
        items={fontSizes}
        onValueChange={(val) => {
          if (val) {
            editor.chain().focus().setFontSize(val).run();
          }
        }}
        placeholder="크기"
        size="xs"
        value={editorState.fontSize}
        variant="inline"
      />

      <div className="text-grey300 mx-1">|</div>

      <ToolbarButton
        active={editorState.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        tooltipContent="굵게"
      >
        <MdFormatBold className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editorState.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        tooltipContent="기울임"
      >
        <MdFormatItalic className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editorState.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        tooltipContent="밑줄"
      >
        <MdFormatUnderlined className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editorState.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        tooltipContent="취소선"
      >
        <MdFormatStrikethrough className="size-4.5" />
      </ToolbarButton>

      <div className="text-grey300 mx-1">|</div>

      <ToolbarButton
        active={editorState.alignLeft}
        onClick={() => editor.chain().focus().toggleTextAlign('left').run()}
        tooltipContent="왼쪽 정렬"
      >
        <MdFormatAlignLeft className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editorState.alignCenter}
        onClick={() => editor.chain().focus().toggleTextAlign('center').run()}
        tooltipContent="가운데 정렬"
      >
        <MdFormatAlignCenter className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editorState.alignRight}
        onClick={() => editor.chain().focus().toggleTextAlign('right').run()}
        tooltipContent="오른쪽 정렬"
      >
        <MdFormatAlignRight className="size-4.5" />
      </ToolbarButton>

      <div className="text-grey300 mx-1">|</div>

      <ToolbarButton active={false} onClick={addImage} tooltipContent="이미지">
        <MdImage className="size-4.5" />
      </ToolbarButton>
    </div>
  );
};

const fontSizes = [
  '11px',
  '12px',
  '13px',
  '14px',
  '15px',
  '16px',
  '17px',
  '18px',
  '20px',
  '24px',
  '30px',
  '36px',
  '48px',
] as const;
