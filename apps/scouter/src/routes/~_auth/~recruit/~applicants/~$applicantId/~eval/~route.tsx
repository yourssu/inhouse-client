import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { applicantByIdOption } from '@/apis/applicants/query';
import { semestersNowOption } from '@/apis/semesters/query';
import { formatRecruitingSemester } from '@/utils/semester';

const RouteComponent = () => {
  return <Outlet />;
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval')({
  component: RouteComponent,
  /* 이전 학기 지원자의 평가 자료는 URL 직접 접근으로도 열람할 수 없어야 해요. */
  beforeLoad: async ({ context, params }) => {
    const [applicant, currentSemester] = await Promise.all([
      context.queryClient.ensureQueryData(applicantByIdOption(Number(params.applicantId))),
      context.queryClient.ensureQueryData(semestersNowOption()),
    ]);

    if (applicant.applicationSemester !== formatRecruitingSemester(currentSemester)) {
      throw redirect({ to: '/recruit/applicants' });
    }
  },
});
