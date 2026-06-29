import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Login } from '@yourssu-inhouse/auth';
import { Button, useTheme, useToast } from '@yourssu-inhouse/interior';
import { FcGoogle } from 'react-icons/fc';

import { AdaptiveLogo } from '@/components/AdaptiveLogo';

// pre-MF standalone 용 /signin 이에요. 인증 로직은 @yourssu-inhouse/auth 가 책임지고,
// shell 이 로그인 entry 를 소유하는 MF(#5) 이후엔 이 라우트를 제거해요.
const Signin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <Login
      onSuccess={() => {
        toast.success('인하우스에 로그인했어요');
        navigate({ to: '/', replace: true });
      }}
    >
      {({ isLoading, login }) => (
        <div className="bg-lightBackground flex size-full items-center justify-center">
          <div className="flex items-center gap-20">
            <div className="flex flex-col gap-8">
              <AdaptiveLogo className="h-5" />
              <h2 className="text-2xl leading-[1.6] font-semibold">
                유어슈 인하우스 이용을 위해
                <br />
                구글 로그인이 필요해요
              </h2>
              <span className="text-neutralMuted font-medium break-keep">
                원활한 서비스 이용을 위해 모든 액세스 항목을 선택해주세요.
              </span>
              <Button disabled={isLoading} onClick={login} size="lg" variant="secondary">
                <div className="flex items-center justify-center gap-2">
                  <FcGoogle className="text-xl" />
                  <div>로그인</div>
                </div>
              </Button>
            </div>
            <div className="w-100">
              <img
                alt="구글 계정 액세스 항목 모두 선택 이미지"
                className="rounded-2xl"
                src={`/scope-${theme}.png`}
              />
            </div>
          </div>
        </div>
      )}
    </Login>
  );
};

export const Route = createLazyFileRoute('/signin/')({
  component: Signin,
});
