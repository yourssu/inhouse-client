import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdAttachment, MdClose } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import type { AttachmentReference } from '@/apis/mails/schema';

import { uploadMailFiles } from '@/apis/mails';
import { Badge } from '@/components/_ui/Badge';
import { IconButton } from '@/components/_ui/IconButton';
import { InlineButton } from '@/components/_ui/InlineButton';
import { useToast } from '@yourssu-inhouse/interior';

interface AttachmentUploadButtonProps {
  attachments: AttachmentReference[];
  onRemove?: (id: number) => void;
  onUpload?: (attachments: AttachmentReference[]) => void;
}

export const AttachmentUploadButton = ({
  attachments = [],
  onUpload,
  onRemove,
}: AttachmentUploadButtonProps) => {
  const [isUploading, startLoading] = useLoading();
  const toast = useToast();

  const handleAttachmentUpload = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const results = await uploadMailFiles(acceptedFiles, 'ATTACHMENT');
        onUpload?.(
          results.map((v) => ({
            contentType: v.contentType,
            storageKey: v.cid,
            fileId: v.fileId,
            fileName: v.fileName,
          })),
        );
      } catch {
        toast.error('파일 업로드에 실패했어요. 잠시 후에 다시 시도해주세요.');
      }
    },
    [toast, onUpload],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        startLoading(handleAttachmentUpload(acceptedFiles));
      }
    },
    [handleAttachmentUpload, startLoading],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    noClick: false,
    noDrag: false,
  });

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attachments.map((attachment) => (
            <Badge
              className="flex items-center gap-1"
              color="violet"
              key={attachment.fileId}
              size="md"
            >
              {attachment.fileName}
              <IconButton
                className="-mr-0.5 shrink-0"
                onClick={() => onRemove?.(attachment.fileId)}
                size="xxs"
                variant="inline"
              >
                <MdClose className="size-3.5" />
              </IconButton>
            </Badge>
          ))}
        </div>
      )}
      <div {...getRootProps()} className="flex items-center">
        <input {...getInputProps()} />
        <InlineButton className={isDragActive ? 'bg-grey100' : ''} disabled={isUploading}>
          <div className="text-13 text-neutralSubtle flex items-center gap-1">
            <MdAttachment className="size-4.5" />
            {isDragActive ? '여기에 놓아주세요' : '클릭 또는 드래그로 파일 첨부'}
          </div>
        </InlineButton>
      </div>
    </div>
  );
};
