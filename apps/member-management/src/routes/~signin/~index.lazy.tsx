import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Login } from '@yourssu-inhouse/auth';
import { Button, useToast } from '@yourssu-inhouse/interior';
import { FcGoogle } from 'react-icons/fc';

// pre-MF standalone용 얇은 /signin. Module Federation(#5)에서 앱별 signin 제거 후 shell만 사용해요.
const Signin = () => {
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
          <div className="flex flex-col gap-8">
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
        </div>
      )}
    </Login>
  );
};

export const Route = createLazyFileRoute('/signin/')({
  component: Signin,
});
