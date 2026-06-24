import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MdArrowForwardIos } from 'react-icons/md';

import { logout } from '@/apis/auth';
import { disablePrivileged, enablePrivileged } from '@/apis/internal';
import { meOption } from '@/apis/members/query';
import { Button } from '@/components/_ui/Button';
import { Divider } from '@/components/_ui/Divider';
import { Popover } from '@/components/_ui/Popover';
import { STAGE } from '@/config';
import { useToast } from '@yourssu-inhouse/interior';
import { useToastedMutation } from '@/hooks/useToastedMutation';

export const ProfileButton = () => {
  const { data: me } = useSuspenseQuery(meOption());
  const toast = useToast();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateWithToast, isPending } = useToastedMutation({
    mutationFn: logout,
    successText: '인하우스에서 로그아웃했어요',
  });

  const { mutateWithToast: enablePrivilegedWithToast } = useToastedMutation({
    mutationFn: enablePrivileged,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    successText: '권한자로 복원되었어요',
  });

  const { mutateWithToast: disablePrivilegedWithToast } = useToastedMutation({
    mutationFn: disablePrivileged,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    successText: '비권한자로 전환되었어요',
  });

  return (
    <Popover>
      <Popover.Target asChild>
        <button className="bg-grey100 size-8 cursor-pointer overflow-hidden rounded-full">
          <img alt="프로필 사진" referrerPolicy="no-referrer" src={me.profileImageUrl} />
        </button>
      </Popover.Target>
      <Popover.Content align="end" side="right" sideOffset={10}>
        <div className="bg-background shadow-dialog min-w-80 rounded-[20px]">
          <div className="flex items-center px-5 py-5">
            <div className="size-9 overflow-hidden rounded-full">
              <img alt="프로필 사진" src={me.profileImageUrl} />
            </div>
            <div className="ml-3">
              <p className="text-15 font-semibold">{me.nickname}</p>
              <p className="text-neutralSubtle text-13">{me.email}</p>
            </div>
          </div>
          <Divider />
          <div className="flex flex-col px-3 py-3.5">
            <Button
              className="w-full px-2"
              onClick={() => toast.default('아직 준비중인 기능이에요')}
              right={<MdArrowForwardIos className="text-neutralSubtle text-sm" />}
              size="md"
              variant="transparent"
            >
              <div className="w-full text-left">내 정보 수정</div>
            </Button>
            <Button
              className="w-full px-2"
              loading={isPending}
              onClick={() => {
                mutateWithToast();
                navigate({ to: '/signin', replace: true });
              }}
              size="md"
              variant="transparent"
            >
              <div className="w-full text-left">로그아웃</div>
            </Button>
          </div>
          <Divider />
          {STAGE === 'dev' && (
            <div className="flex flex-col px-3 py-3.5">
              <div className="text-neutralSubtle text-13 px-2 pb-2">(테스트) 권한 변경</div>
              <Button
                className="w-full px-2"
                onClick={() => enablePrivilegedWithToast()}
                size="md"
                variant="transparent"
              >
                <div className="w-full text-left">권한자로 변경</div>
              </Button>
              <Button
                className="w-full px-2"
                onClick={() => disablePrivilegedWithToast()}
                size="md"
                variant="transparent"
              >
                <div className="w-full text-left">비권한자로 변경</div>
              </Button>
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};
