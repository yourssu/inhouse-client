import clsx from 'clsx';
import { type Control, useWatch } from 'react-hook-form';

import type {
  UpdateInterviewRubricForm,
  UpdateInterviewRubricFormInput,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/formValidationSchema';

import { INTERVIEW_RUBRIC_TOTAL_SCORE } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/formValidationSchema';

interface TotalInterviewScoreProps {
  control: Control<UpdateInterviewRubricFormInput, unknown, UpdateInterviewRubricForm>;
}

/** 모든 fit 총점의 현재 합계를 실시간으로 보여줘요. */
export const TotalInterviewScore = ({ control }: TotalInterviewScoreProps) => {
  const groups = useWatch({ control, name: 'groups' });
  const totalScore = groups.reduce((sum, { groupMaxScore }) => sum + toScore(groupMaxScore), 0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-14 font-semibold">총점</span>
      <span
        className={clsx(
          'text-14 font-semibold',
          totalScore === INTERVIEW_RUBRIC_TOTAL_SCORE ? 'text-neutral' : 'text-red600',
        )}
      >
        {`${totalScore} / ${INTERVIEW_RUBRIC_TOTAL_SCORE}`}
      </span>
    </div>
  );
};

const toScore = (value: string) => {
  const numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue;
};
