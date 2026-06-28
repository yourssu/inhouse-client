import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior';

import { ProfileButton } from '@/components/ProfileButton';

const ShellIndex = () => {
  return (
    <PageLayout menu={[]} profile={<ProfileButton />}>
      {/* 앱 조립은 이슈 #5(Module Federation)에서 처리해요. */}
      <div className="text-neutralSubtle flex min-h-screen min-w-0 flex-[1_1_0] items-center justify-center text-lg">
        Shell — 앱이 여기에 로드돼요.
      </div>
    </PageLayout>
  );
};

export const Route = createFileRoute('/')({
  staticData: {
    shellOptions: {
      collapsible: true,
    },
  },
  component: ShellIndex,
});
