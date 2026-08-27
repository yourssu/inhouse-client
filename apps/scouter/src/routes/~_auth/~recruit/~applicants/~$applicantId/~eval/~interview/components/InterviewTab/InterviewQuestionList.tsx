import { Badge, Divider } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { groupBy } from 'es-toolkit';
import { Fragment } from 'react';

import type { AssignedQuestion, QuestionCategory } from '@/apis/interviews/questions/schema';

import { useInterviewAnalytics } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/analytics';
import {
  INTRO_SCRIPT,
  OUTRO_SCRIPT,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/introScript';
import { questionCategoryKo } from '@/types/questions';

const CATEGORY_ORDER: QuestionCategory[] = [
  'INTRO',
  'CULTURE',
  'PART',
  'PERSONAL',
  'OUTRO',
] as const;

interface InterviewQuestionListProps {
  onSelectQuestion: (questionId: number) => void;
  questions: AssignedQuestion[];
  selectedQuestionId: number;
}

export const InterviewQuestionList = ({
  onSelectQuestion,
  questions,
  selectedQuestionId,
}: InterviewQuestionListProps) => {
  const { trackInterviewEvent } = useInterviewAnalytics();
  const questionsByCategory = groupBy(questions, (question) => question.category);
  const questionSections = CATEGORY_ORDER.map((category) => ({
    category,
    categoryQuestions: questionsByCategory[category] ?? [],
  })).filter(({ categoryQuestions }) => categoryQuestions.length > 0);

  return (
    <div className="w-full">
      <InterviewScript
        isSelected={selectedQuestionId === INTRO_SCRIPT.id}
        onClickScript={() => onSelectQuestion(INTRO_SCRIPT.id)}
        summary={INTRO_SCRIPT.summary}
        title={INTRO_SCRIPT.title}
      />
      <Divider />

      {questionSections.map(({ category, categoryQuestions }, sectionIndex) => (
        <div className="flex flex-col" key={category}>
          <span className="text-neutralMuted px-4 py-2 text-base font-bold">
            {questionCategoryKo[category]}
          </span>
          <Divider />
          {categoryQuestions.map((question, index) => {
            const isInterviewerAssignedQuestion = question.id != null;
            return (
              <Fragment key={question.id ?? index}>
                <InterviewQuestion
                  isSelected={isInterviewerAssignedQuestion && question.id === selectedQuestionId}
                  onClickQuestion={() => {
                    if (question.id != null) {
                      if (question.id !== selectedQuestionId && question.assignedMemberId != null) {
                        trackInterviewEvent('interview_question_card_open', {
                          assigned_member_id: question.assignedMemberId,
                          question_id: question.id,
                        });
                      }
                      onSelectQuestion(question.id);
                    }
                  }}
                  question={question}
                />
                {index < categoryQuestions.length - 1 && <Divider />}
              </Fragment>
            );
          })}
          {sectionIndex < questionSections.length - 1 && <Divider />}
        </div>
      ))}
      <Divider />
      <InterviewScript
        isSelected={selectedQuestionId === OUTRO_SCRIPT.id}
        onClickScript={() => onSelectQuestion(OUTRO_SCRIPT.id)}
        summary={OUTRO_SCRIPT.summary}
        title={OUTRO_SCRIPT.title}
      />
    </div>
  );
};

interface InterviewQuestionProps {
  isSelected: boolean;
  onClickQuestion: () => void;
  question: AssignedQuestion;
}

const InterviewQuestion = ({ isSelected, onClickQuestion, question }: InterviewQuestionProps) => {
  const { assignedMemberName, content, id, requirements } = question;
  const isSelectable = id != null;

  return (
    <button
      className={clsx(
        'flex w-full flex-col items-start gap-3 p-4 text-left transition-colors',
        isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
        isSelected ? 'bg-violet50' : 'bg-grey50',
      )}
      disabled={!isSelectable}
      onClick={onClickQuestion}
      type="button"
    >
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'text-14 font-semibold',
            isSelected ? 'text-violet600' : 'text-neutralMuted',
          )}
        >
          {assignedMemberName}
        </span>
        {requirements.map(({ content: requirementContent, id: requirementId }) => (
          <Badge color="violet" key={requirementId} size="sm">
            {requirementContent}
          </Badge>
        ))}
      </div>
      <span className="text-neutral text-15 font-medium">{content}</span>
    </button>
  );
};

interface InterviewScriptProps {
  isSelected: boolean;
  onClickScript: () => void;
  summary: string;
  title: string;
}

const InterviewScript = ({ summary, isSelected, onClickScript, title }: InterviewScriptProps) => {
  return (
    <button
      className={clsx(
        'flex w-full cursor-pointer flex-col items-start gap-2 p-4 text-left transition-colors',
        isSelected ? 'bg-violet50' : 'bg-lightBackground',
      )}
      onClick={onClickScript}
      type="button"
    >
      <span className="text-lg font-semibold">{title}</span>
      <span className="text-neutralMuted text-14">{summary}</span>
    </button>
  );
};
