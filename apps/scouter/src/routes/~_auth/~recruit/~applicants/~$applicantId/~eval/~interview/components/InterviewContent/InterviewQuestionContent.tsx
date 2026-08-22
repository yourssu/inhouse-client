import { Badge, Divider } from '@yourssu-inhouse/interior';

import type { AssignedQuestion } from '@/apis/interviews/questions/schema';

import { questionCategoryKo } from '@/types/questions';

interface InterviewQuestionContentProps {
  question: AssignedQuestion;
}

export const InterviewQuestionContent = ({ question }: InterviewQuestionContentProps) => {
  const { assignedMemberName, category, requirements, content } = question;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 p-5">
        <span className="text-18 font-semibold">답변 기록</span>
        <span className="text-neutralMuted text-xs font-semibold">
          {questionCategoryKo[category]}
        </span>
      </div>
      <Divider />
      <div className="flex flex-col gap-2 p-6">
        <div className="flex gap-2">
          {requirements.map(({ id, content: requirement }) => (
            <Badge color="violet" key={id} size="sm">
              {requirement}
            </Badge>
          ))}
        </div>
        <span className="text-neutral font-medium">{content}</span>
        <span className="text-neutralMuted text-15">
          질문자: <span className="text-violet600">{assignedMemberName}</span>
        </span>
        <span />
      </div>
    </div>
  );
};
