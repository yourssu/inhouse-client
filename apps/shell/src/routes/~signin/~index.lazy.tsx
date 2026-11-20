import { createLazyFileRoute } from '@tanstack/react-router';
import { Button, useTheme } from '@yourssu-inhouse/interior';
import { images } from '@yourssu-inhouse/resources';
import { FcGoogle } from 'react-icons/fc';

import { AdaptiveLogo } from '@/components';
import { config } from '@/config';

const Signin = () => {
  const { theme } = useTheme();

  const login = () => window.location.assign(config.googleOAuthURL);

  return (
    <div className="bg-lightBackground flex size-full items-center justify-center px-8">
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
          <Button onClick={login} size="lg" variant="secondary">
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
            src={guideAssets[theme]}
          />
        </div>
      </div>
    </div>
  );
};

const guideAssets = {
  dark: images.loginGuideDark,
  light: images.loginGuideLight,
} as const;

export const Route = createLazyFileRoute('/signin/')({
  component: Signin,
});
