import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useLoading } from 'react-simplikit';

import { mailTemplateDetailOption, mailTemplatesInfiniteOption } from '@/apis/mails/query';
import { type MailTemplateDetail, type MailTemplateType } from '@/apis/mails/schema';
import { Button } from '@/components/_ui/Button';
import { Dialog } from '@/components/_ui/Dialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToast } from '@yourssu-inhouse/interior';
import { formatTemplates } from '@/utils/date';
import { handleError } from '@/utils/error';

interface LoadTemplateDialogProps {
  onClose: (v: MailTemplateDetail | null) => void;
  open: boolean;
}

interface TemplateListProps {
  onClose: (v: MailTemplateDetail | null) => void;
}

const TemplateList = ({ onClose }: TemplateListProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const openAlertDialog = useAlertDialog();
  const [isLoadingDetail, startLoadingDetail] = useLoading();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    mailTemplatesInfiniteOption(),
  );

  const templates = data.pages.flatMap((page) => page.content).toSorted((a, b) => b.id - a.id);

  const handleSelect = async (template: MailTemplateType) => {
    const res = await openAlertDialog({
      title: '이 템플릿을 불러올까요?',
      content: '기존에 작성된 메일 내용은 사라져요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (!res) {
      return;
    }

    try {
      const detail = await startLoadingDetail(
        queryClient.fetchQuery(mailTemplateDetailOption(template.id)),
      );
      onClose(detail);
    } catch (e) {
      const { message } = handleError(e);
      toast.error(typeof message === 'function' ? await message() : message);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-neutralSubtle flex h-[300px] items-center justify-center">
        저장된 템플릿이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {templates.map((template) => (
          <button
            className="hover:bg-greyOpacity100 transition-ease flex w-full cursor-pointer flex-col items-start rounded-lg px-4 py-3 text-left transition-colors duration-200"
            disabled={isLoadingDetail}
            key={template.id}
            onClick={() => handleSelect(template)}
          >
            <div className="text-15 text-neutralMuted font-medium">{template.title}</div>
            <div className="text-neutralSubtle mt-1 text-xs">
              {formatTemplates['(2026년)? 1월 1일, 오후 11:00'](template.updatedAt)}
            </div>
          </button>
        ))}
      </div>
      {hasNextPage && (
        <div className="p-4">
          <Button
            className="w-full"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            size="lg"
            variant="secondary"
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export const LoadTemplateDialog = ({ onClose, open }: LoadTemplateDialogProps) => {
  return (
    <Dialog onClose={() => onClose(null)} open={open}>
      <Dialog.Header className="pb-2" onClickCloseButton={() => onClose(null)}>
        <Dialog.Title>템플릿 불러오기</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content className="max-h-100 w-200 px-2 pt-0">
        <TemplateList onClose={onClose} />
      </Dialog.Content>
    </Dialog>
  );
};
