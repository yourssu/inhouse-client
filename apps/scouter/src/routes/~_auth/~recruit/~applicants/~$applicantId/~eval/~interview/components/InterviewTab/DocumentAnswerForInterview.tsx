import { useSuspenseQuery } from '@tanstack/react-query';
import { Divider } from '@yourssu-inhouse/interior';

import { applicantDocumentAnswersOption } from '@/apis/applicants/query';

interface DocumentAnswerForInterviewProps {
  applicantId: number;
}

export const DocumentAnswerForInterview = ({ applicantId }: DocumentAnswerForInterviewProps) => {
  const { data: documentAnswers } = useSuspenseQuery({
    ...applicantDocumentAnswersOption(applicantId),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="flex flex-col p-2">
      {documentAnswers.map(({ sectionId, question, answer }, index) => {
        const isLastIndex = documentAnswers.length - 1 === index;
        return (
          <>
            <div className="flex h-fit w-full flex-col gap-3" key={sectionId ?? index}>
              <span className="text-neutralMuted font-semibold">{question}</span>
              <p className="text-neutral text-14 whitespace-pre-wrap">{answer}</p>
            </div>
            {!isLastIndex && <Divider className="my-4" />}
          </>
        );
      })}
    </div>
  );
};
