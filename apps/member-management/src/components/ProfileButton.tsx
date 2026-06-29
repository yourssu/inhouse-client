import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@yourssu-inhouse/auth';
import { Button, Divider, Popover, useToast } from '@yourssu-inhouse/interior';
import { MdArrowForwardIos } from 'react-icons/md';

import { STAGE } from '@/config';

export const ProfileButton = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button className="bg-grey100 size-8 cursor-pointer overflow-hidden rounded-full">
          <img
            alt="프로필 사진"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/a/ACg8ocKAe_sLlHOkrZ0nEIIFjIj-7G4P4uUyTv1JeIGnVJa6TfpcjA=s100"
          />
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
            <img
              alt="프로필 사진"
              // TODO: 프로필 사진 기능 추가 후 수정
              src="https://lh3.googleusercontent.com/a/ACg8ocKAe_sLlHOkrZ0nEIIFjIj-7G4P4uUyTv1JeIGnVJa6TfpcjA=s100"
            />
          </div>
          <div className="ml-3">
            <p className="text-15 font-semibold">Feca</p>
            <p className="text-neutralSubtle text-13">user.urssu@gmail.com</p>
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
        <Divider />
        {STAGE === 'dev' && (
          <div className="flex flex-col px-3 py-3.5">
            <div className="text-neutralSubtle text-13 px-2 pb-2">(테스트) 권한 변경</div>
            <Button
              className="w-full px-2"
              onClick={() => {
                toast.success('권한자로 복원되었어요');
              }}
              size="md"
              variant="transparent"
            >
              <div className="w-full text-left">권한자로 변경</div>
            </Button>
            <Button
              className="w-full px-2"
              onClick={() => {
                toast.success('비권한자로 전환되었어요');
              }}
              size="md"
              variant="transparent"
            >
              <div className="w-full text-left">비권한자로 변경</div>
            </Button>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
