import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Suspense } from 'react';
import { MdPerson } from 'react-icons/md';

import { applicantByIdOption } from '@/apis/applicants/query';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();

  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-grey200 flex size-12 items-center justify-center rounded-lg">
            <MdPerson className="size-7" />
          </div>
          <div>
            <div className="text-neutralSubtle text-sm font-medium">서류 평가</div>
            <div className="text-xl font-semibold">{applicant.name} 지원자</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InfoItem label="지원 파트">{partNameKo[applicant.part]}</InfoItem>
          <InfoItem label="학번">{applicant.studentId}</InfoItem>
          <InfoItem label="학과">{applicant.department}</InfoItem>
          <InfoItem label="현재 학기">{formatSemester(applicant.semester)}</InfoItem>
          <InfoItem label="나이">{applicant.age}세</InfoItem>
          <InfoItem label="지원일">
            {formatTemplates['2026-01-01'](applicant.applicationDate)}
          </InfoItem>
        </div>
      </div>
    </PageLayout.Content>
  );
};

const InfoItem = ({ label, children }: React.PropsWithChildren<{ label: string }>) => {
  return (
    <div className="text-13 border-greyOpacity200 flex items-center gap-2.5 not-first-of-type:border-l not-first-of-type:pl-3">
      <div className="text-neutralSubtle">{label}</div>
      <div className="text-neutralMuted font-medium">{children}</div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval/document/')({
  component: () => (
    <Suspense>
      <RouteComponent />
    </Suspense>
  ),
});
