import { MdRefresh } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { postMembersIncludeFromApplicants } from '@/apis/members';
import { Button } from '@/components/_ui/Button';
import { HoverTooltip } from '@/components/_ui/HoverTooltip';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

export const MemberSyncButton = () => {
  const [loading, startLoading] = useLoading();
  const { mutateWithToast } = useToastedMutation({
    successText: '멤버 목록에 합격자를 갱신했어요.',
    mutationFn: postMembersIncludeFromApplicants,
  });
  const { invalidate } = useQueryInvalidation(['members', 'active']);

  const onClick = async () => {
    const res = await startLoading(mutateWithToast());
    if (res) {
      invalidate();
    }
  };

  // Note: 멤버 관리 페이지보다는 리쿠르팅 레벨에서 동기화하는게 나을 수도 있음.
  return (
    <HoverTooltip
      content="합격자를 멤버 목록에 동기화해요"
      contentProps={{
        side: 'bottom',
        sideOffset: 6,
        className: 'py-1.5 px-2.5 rounded-md font-semibold',
      }}
      disableHoverableContent
      noArrow
    >
      <Button
        className="pr-2.5 pl-2"
        left={<MdRefresh className="size-4.5" />}
        loading={loading}
        onClick={onClick}
        size="lg"
        variant="primary"
      >
        합격자 갱신
      </Button>
    </HoverTooltip>
  );
};
