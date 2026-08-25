import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Button } from '@yourssu-inhouse/interior';
import { Dialog } from '@yourssu-inhouse/interior';
import { useToast } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import clsx from 'clsx';
import { useLoading } from 'react-simplikit';

import { mailTemplateDetailOption, mailTemplatesInfiniteOption } from '@/apis/mails/query';
import { type MailTemplateDetail, type MailTemplateType } from '@/apis/mails/schema';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { handleError } from '@/utils/error';

interface LoadTemplateDialogProps {
  currentTemplateId?: number;
  onClose: (v: MailTemplateDetail | null) => void;
  open: boolean;
  requireConfirm?: boolean;
}

interface TemplateListProps {
  currentTemplateId?: number;
  onClose: (v: MailTemplateDetail | null) => void;
  requireConfirm: boolean;
}

const TemplateList = ({ onClose, requireConfirm, currentTemplateId }: TemplateListProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const openAlertDialog = useAlertDialog();
  const [isLoadingDetail, startLoadingDetail] = useLoading();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    mailTemplatesInfiniteOption(),
  );

  const templates = data.pages.flatMap((page) => page.content).toSorted((a, b) => b.id - a.id);

  const handleSelect = async (template: MailTemplateType) => {
    // 재진입(기존 작성 내용이 날아갈 수 있을 때)만 확인 다이얼로그를 띄운다.
    if (requireConfirm) {
      const res = await openAlertDialog({
        title: '이 템플릿을 불러올까요?',
        content: '기존에 작성한 내용은 사라져요.',
        primaryButtonText: '확인',
        secondaryButtonText: '취소',
      });

      if (!res) {
        return;
      }
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
        {templates.map((template) => {
          const isCurrent = template.id === currentTemplateId;
          return (
            <button
              className={cn(
                'transition-ease flex w-full flex-col items-start rounded-lg px-4 py-3 text-left transition-colors duration-200',
                isCurrent ? 'bg-greyOpacity50' : 'hover:bg-greyOpacity100 cursor-pointer',
              )}
              disabled={isLoadingDetail || isCurrent}
              key={template.id}
              onClick={() => handleSelect(template)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-15 text-neutralMuted font-medium">{template.title}</div>
                {isCurrent && (
                  <span className="text-violet600 text-xs font-semibold">현재 템플릿</span>
                )}
              </div>
              <div className="text-neutralSubtle mt-1 text-xs">
                {formatTemplates['(2026년)? 1월 1일, 오후 11:00'](template.updatedAt)}
              </div>
            </button>
          );
        })}
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

export const LoadTemplateDialog = ({
  onClose,
  open,
  requireConfirm = true,
  currentTemplateId,
}: LoadTemplateDialogProps) => {
  return (
    <Dialog onClose={() => onClose(null)} open={open}>
      <Dialog.Header className="pb-2" onClickCloseButton={() => onClose(null)}>
        <Dialog.Title>템플릿 불러오기</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content className={clsx('max-h-100 w-200 px-2', requireConfirm ? 'pt-1' : 'pt-0')}>
        <TemplateList
          currentTemplateId={currentTemplateId}
          onClose={onClose}
          requireConfirm={requireConfirm}
        />
      </Dialog.Content>
    </Dialog>
  );
};
