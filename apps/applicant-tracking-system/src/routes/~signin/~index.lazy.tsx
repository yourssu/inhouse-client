import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { FcGoogle } from 'react-icons/fc';
import { useLoading } from 'react-simplikit';

import { googleLogin } from '@/apis/auth';
import { Button } from '@/components/_ui/Button';
import { AdaptiveLogo } from '@/components/AdaptiveLogo';
import { useTheme } from '@yourssu-inhouse/interior';
import { config } from '@/config';
import { useGoogleOAuthPopup } from '@/hooks/useGoogleOAuthPopup';
import { useToast } from '@yourssu-inhouse/interior';
import { setAuthTokens } from '@/utils/auth';

const Signin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const open = useGoogleOAuthPopup();
  const toast = useToast();
  const [isLoading, startLoading] = useLoading();

  const onClickSignin = async () => {
    const signin = async () => {
      const code = await open(config.googleOAuthURL, 580, 720);
      if (!code) {
        return;
      }
      return await googleLogin(code);
    };

    const tokens = await startLoading(signin());
    if (tokens) {
      setAuthTokens(tokens);
      toast.success('인하우스에 로그인했어요');
      navigate({ to: '/', replace: true });
    }
  };

  return (
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
          <Button disabled={isLoading} onClick={onClickSignin} size="lg" variant="secondary">
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
  );
};

export const Route = createLazyFileRoute('/signin/')({
  component: Signin,
});
