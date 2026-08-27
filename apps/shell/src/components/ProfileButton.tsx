import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@yourssu-inhouse/auth';
import { Button, Divider, Popover, useToast } from '@yourssu-inhouse/interior';
import { MdArrowForwardIos, MdPerson } from 'react-icons/md';

import { meOption, meQueryKey } from '@/apis/me';
import { disablePrivilegeForSelf, enablePrivilegeForSelf } from '@/apis/memberPrivacy';
import { STAGE } from '@/config';

// 프로필 이미지가 없거나 로딩 중일 때 보여줄 기본 아바타.
const ProfileAvatar = ({ src, alt }: { alt: string; src?: string }) => {
  if (src) {
    return (
      <img alt={alt} className="size-full object-cover" referrerPolicy="no-referrer" src={src} />
    );
  }
  return (
    <div className="text-neutralSubtle flex size-full items-center justify-center">
      <MdPerson className="size-5" />
    </div>
  );
};

export const ProfileButton = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { api, logout } = useAuth();
  const { data: me } = useQuery(meOption(api));

  const profileImageUrl = me?.profileImageUrl || undefined;

  const privilegeMutation = useMutation({
    mutationFn: async (target: 'privileged' | 'unprivileged') => {
      if (target === 'privileged') {
        await enablePrivilegeForSelf(api);
      } else {
        await disablePrivilegeForSelf(api);
      }
    },
    onSuccess: (_data, target) => {
      toast.success(target === 'privileged' ? '권한자로 변경했어요.' : '비권한자로 변경했어요.');
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
    onError: () => {
      toast.error('민감정보 권한을 변경하지 못했어요');
    },
  });

  const enablePrivilegedWithToast = () => privilegeMutation.mutate('privileged');
  const disablePrivilegedWithToast = () => privilegeMutation.mutate('unprivileged');

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button className="bg-grey100 size-8 cursor-pointer overflow-hidden rounded-full">
          <ProfileAvatar alt="프로필 사진" src={profileImageUrl} />
        </button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="bg-background shadow-dialog min-w-80 rounded-[20px] p-0"
        side="right"
        sideOffset={10}
      >
        <div className="flex items-center px-5 py-5">
          <div className="size-9 overflow-hidden rounded-full">
            <ProfileAvatar alt="프로필 사진" src={profileImageUrl} />
          </div>
          <div className="ml-3">
            <p className="text-15 font-semibold">{me?.nickname ?? ''}</p>
            <p className="text-neutralSubtle text-13">{me?.email ?? ''}</p>
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
            onClick={async () => {
              await logout();
              toast.success('인하우스에서 로그아웃했어요');
              navigate({ to: '/signin', replace: true });
            }}
            size="md"
            variant="transparent"
          >
            <div className="w-full text-left">로그아웃</div>
          </Button>
        </div>
        {/* [DEV] 멤버 민감정보 권한 테스트예요. prod 에서는 보여주지 않아요. */}
        {STAGE === 'dev' && (
          <>
            <Divider />
            <div className="flex flex-col px-3 py-3.5">
              <div className="text-neutralSubtle text-13 px-2 pb-2">(테스트) 권한 변경</div>
              <Button
                className="w-full px-2"
                disabled={privilegeMutation.isPending}
                loading={
                  privilegeMutation.isPending && privilegeMutation.variables === 'privileged'
                }
                onClick={() => enablePrivilegedWithToast()}
                size="md"
                variant="transparent"
              >
                <div className="w-full text-left">권한자로 변경</div>
              </Button>
              <Button
                className="w-full px-2"
                disabled={privilegeMutation.isPending}
                loading={
                  privilegeMutation.isPending && privilegeMutation.variables === 'unprivileged'
                }
                onClick={() => disablePrivilegedWithToast()}
                size="md"
                variant="transparent"
              >
                <div className="w-full text-left">비권한자로 변경</div>
              </Button>
            </div>
          </>
        )}
      </Popover.Content>
    </Popover>
  );
};
