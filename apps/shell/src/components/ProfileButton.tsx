import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@yourssu-inhouse/auth';
import { Button, Divider, Popover, useToast } from '@yourssu-inhouse/interior';
import { MdArrowForwardIos, MdPerson } from 'react-icons/md';

import { meOption } from '@/apis/me';

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
  const { api, logout } = useAuth();
  const { data: me } = useQuery(meOption(api));

  const profileImageUrl = me?.profileImageUrl || undefined;

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
      </Popover.Content>
    </Popover>
  );
};
