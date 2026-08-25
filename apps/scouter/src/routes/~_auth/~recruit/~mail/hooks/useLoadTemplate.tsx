import { useQueryClient } from '@tanstack/react-query';
import { overlay } from 'overlay-kit';
import { useLoading } from 'react-simplikit';

import type { MailTemplateDetail } from '@/apis/mails/schema';

import { mailTemplatesInfiniteOption } from '@/apis/mails/query';
import { LoadTemplateDialog } from '@/routes/~_auth/~recruit/~mail/~new/components/LoadTemplateDialog';

// 템플릿 목록을 프리페치한 뒤 템플릿 선택 다이얼로그를 연다.
// 메일 목록 페이지의 "메일 작성" 진입과 발송 페이지의 "템플릿 불러오기" 재선택이 같은 흐름을 공유한다.
// requireConfirm=false면 템플릿 선택 시 "기존 내용이 사라져요" 확인을 건너뛴다(첫 진입처럼 덮어쓸 내용이 없을 때).
export const useLoadTemplate = () => {
  const queryClient = useQueryClient();
  const [loading, startLoading] = useLoading();

  const openLoadTemplateDialog = async (
    options: { currentTemplateId?: number; requireConfirm?: boolean } = {},
  ): Promise<MailTemplateDetail | null> => {
    const { requireConfirm = true, currentTemplateId } = options;
    await startLoading(queryClient.fetchInfiniteQuery(mailTemplatesInfiniteOption()));
    return overlay.openAsync<MailTemplateDetail | null>(({ close, isOpen }) => (
      <LoadTemplateDialog
        currentTemplateId={currentTemplateId}
        onClose={close}
        open={isOpen}
        requireConfirm={requireConfirm}
      />
    ));
  };

  return { loading, openLoadTemplateDialog };
};
