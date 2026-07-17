import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { Suspense } from 'react';
import { MdPerson } from 'react-icons/md';

import { applicantByIdOption } from '@/apis/applicants/query';
import { Paper } from '@/components/Paper';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

import { AnswerList } from './components/AnswerList';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();

  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));
  const isError = true; // TODO: 구글 응답폼 API 연동 시 수정
  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <div className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-3">
          <div className="bg-grey200 flex size-12 items-center justify-center rounded-lg">
            <MdPerson className="size-7" />
          </div>
          <div>
            <div className="text-sm">
              <span className="text-violet600 font-medium">서류 평가</span>
              <span className="text-neutralSubtle mx-1.5">·</span>
              {/* TODO: GET /parts/{partId}/documents/deadline 생기면 연결하기 */}
              <span className="text-neutralSubtle">3일 4시간 23분 남음</span>
            </div>
            <div className="text-xl font-semibold">{applicant.name} 지원자</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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

      <div className="flex flex-[1_1_0] gap-4 pt-7">
        <Paper className="flex-[1_1_0]">
          {/* TODO: API 연동 시 length 체크가 아니라 쿼리의 에러 상태(isError 등)로 분기 필요 */}
          {isError ? (
            <div className="flex size-full items-center justify-center">
              <Result
                description="지원자가 제출한 서류 응답이 아직 연동되지 않았어요."
                figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
                title="연동된 서류 응답이 없어요"
              />
            </div>
          ) : (
            <AnswerList answers={[]} />
          )}
        </Paper>
        {/* TODO: 평가 폼 */}
        <Paper className="w-100" />
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
