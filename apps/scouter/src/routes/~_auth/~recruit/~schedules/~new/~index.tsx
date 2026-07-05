import { createFileRoute, useRouter } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button } from '@yourssu-inhouse/interior';
import { useToast } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { IoSparkles } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';

import { SaveScehduleButton } from '@/routes/~_auth/~recruit/~schedules/~new/components/SaveScehduleButton';

import { ScheduleCreationView } from './components/ScheduleCreationView';
import { ScheduleCreationProvider } from './context';

const ScheduleNewPageContent = () => {
  const router = useRouter();
  const toast = useToast();

  return (
    <PageLayout.Content
      maxWidth="full"
      right={
        <div className="flex w-full justify-between">
          <Button
            left={<MdArrowBack />}
            onClick={() => router.history.back()}
            size="lg"
            variant="secondary"
          >
            뒤로가기
          </Button>
          <div className="flex gap-2">
            <Button
              left={<IoSparkles />}
              onClick={() => toast.default('아직 준비중인 기능이에요.')}
              size="lg"
              variant="subPrimary"
            >
              자동 생성
            </Button>
            <SaveScehduleButton />
          </div>
        </div>
      }
    >
      <Suspense>
        <ScheduleCreationView />
      </Suspense>
    </PageLayout.Content>
  );
};

const RouteComponent = () => {
  return (
    <ScheduleCreationProvider>
      <Suspense>
        <ScheduleNewPageContent />
      </Suspense>
    </ScheduleCreationProvider>
  );
};

export const Route = createFileRoute('/_auth/recruit/schedules/new/')({
  component: RouteComponent,
});
