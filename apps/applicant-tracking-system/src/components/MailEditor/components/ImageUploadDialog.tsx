import { useDropzone } from 'react-dropzone';
import { MdCloudUpload } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { toMailImageUrl, uploadMailFiles } from '@/apis/mails';
import { Dialog } from '@/components/_ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/tw';

interface ImageUploadDialogProps {
  close: () => void;
  isOpen: boolean;
  onUploadComplete: (url: string) => void;
}

export const ImageUploadDialog = ({ onUploadComplete, close, isOpen }: ImageUploadDialogProps) => {
  const [isUploading, startLoading] = useLoading();
  const toast = useToast();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadMailFiles([file], 'INLINE');
      onUploadComplete(
        toMailImageUrl({
          cid: result[0].cid,
        }),
      );
      close();
    } catch {
      toast.error('이미지 업로드에 실패했어요. 잠시 후에 다시 시도해주세요.');
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      startLoading(handleUpload(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false, // TODO: 사진 다중 업로드 지원하기
    disabled: isUploading,
  });

  return (
    <Dialog closeableWithOutside onClose={close} open={isOpen}>
      <Dialog.Header onClickCloseButton={close}>
        <Dialog.Title>이미지 업로드</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className="flex min-h-45 w-70 flex-col gap-3">
          <div
            {...getRootProps()}
            aria-disabled={isUploading}
            className={cn(
              'hover:bg-greyOpacity100 flex flex-[1_1_0] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg py-10 transition-colors duration-200',
              isDragActive && 'bg-greyOpacity100',
              isUploading && 'cursor-not-allowed opacity-60',
            )}
            data-focus-visible
            role="button"
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <>
                <p className="text-neutralSubtle text-sm">사진을 업로드하고 있어요...</p>
              </>
            ) : (
              <>
                <MdCloudUpload className="text-grey400 size-10" />
                <div className="text-center">
                  <p className="text-neutralSubtle text-sm font-medium">
                    {isDragActive ? '여기에 놓아주세요' : '클릭 또는 드래그하여 이미지 업로드'}
                  </p>
                  <p className="text-grey400 mt-1 text-xs">PNG, JPG, GIF, SVG 등</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
