import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Button, Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdPerson } from 'react-icons/md';
import { SwitchCase } from 'react-simplikit';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/eval/comments/query';
import { Paper } from '@/components/Paper';
import { EvalForm } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm';
import { QuestionSetting } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/QuestionSetting';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

import { Comments } from '../components/Comments';
import { groupThreadsBySection } from '../utils/groupThreadsBySection';
import { Answer } from './components/Answer';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();

  const [{ data: applicant }, { data: answers }, { data: comments }] = useSuspenseQueries({
    queries: [
      applicantByIdOption(Number(applicantId)),
      applicantDocumentAnswersOption(Number(applicantId)),
      applicantDocumentCommentsOption(Number(applicantId)),
    ],
  });

  const [sidebarView, setSidebarView] = useState<'문항 설정' | '평가 폼'>('평가 폼');

  const [selectedSectionId, setSelectedSectionId] = useState<null | number>(null);
  const threadsBySection = groupThreadsBySection(comments);
  const threadsBySectionId = new Map(
    threadsBySection.map(({ sectionId, threads }) => [sectionId, threads]),
  );

  const handleSelectSection = (sectionId: number) => {
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());

  const registerSectionRef = (sectionId: number) => {
    const ss = (el: HTMLDivElement | null) => {
      if (el) {
        sectionRefs.current.set(sectionId, el);
      } else {
        sectionRefs.current.delete(sectionId);
      }
    };

    return ss;
  };
  useEffect(() => {
    if (selectedSectionId == null) {
      return;
    }

    const containerEl = scrollContainerRef.current;
    const targetEl = sectionRefs.current.get(selectedSectionId);
    if (!containerEl || !targetEl) {
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const nextScrollTop = containerEl.scrollTop + (targetRect.top - containerRect.top);

    containerEl.scrollTo({ behavior: 'smooth', top: nextScrollTop });
  }, [selectedSectionId]);

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
        <ErrorBoundary
          fallback={
            <Paper className="flex size-full items-center justify-center">
              <Result
                description="지원자가 제출한 서류 응답이 아직 연동되지 않았어요."
                figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
                title="연동된 서류 응답이 없어요"
              />
            </Paper>
          }
        >
          <Paper className="flex-[1_1_0]">
            <div className="flex flex-col gap-4 px-5">
              {answers.sections.map((section) => {
                return (
                  <Answer
                    key={section.sectionId}
                    {...section}
                    isSelected={section.sectionId === selectedSectionId}
                    onAddComment={() => handleSelectSection(section.sectionId)}
                    onClick={() => handleSelectSection(section.sectionId)}
                  />
                );
              })}
            </div>
            <div className="relative px-5">
              <div
                className="sticky top-3 -mx-4 flex max-h-[calc(100vh-1.5rem)] flex-col gap-5 overflow-y-auto px-4"
                ref={scrollContainerRef}
              >
                {answers.sections.map((section) => {
                  const threads = threadsBySectionId.get(section.sectionId) ?? [];

                  return (
                    <div
                      className="flex flex-col gap-5"
                      key={section.sectionId}
                      ref={registerSectionRef(section.sectionId)}
                    >
                      {threads.map((thread) => (
                        <Comments
                          applicantId={Number(applicantId)}
                          key={thread[0].commentId}
                          onClick={() => handleSelectSection(section.sectionId)}
                          selectedSectionId={selectedSectionId}
                          thread={thread}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </Paper>
          <Paper className="relative w-100">
            <SwitchCase
              caseBy={{
                '평가 폼': () => (
                  <>
                    <EvalForm />
                    <Button
                      className="absolute top-4 right-4"
                      onClick={() => setSidebarView('문항 설정')}
                      size="sm"
                    >
                      문항 설정
                    </Button>
                  </>
                ),
                '문항 설정': () => <QuestionSetting onClose={() => setSidebarView('평가 폼')} />,
              }}
              value={sidebarView}
            />
          </Paper>
        </ErrorBoundary>
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
