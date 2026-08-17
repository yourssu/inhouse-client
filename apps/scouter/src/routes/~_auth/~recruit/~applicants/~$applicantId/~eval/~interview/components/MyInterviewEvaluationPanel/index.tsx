import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQueries } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Divider,
  Fieldset,
  MultilineTextField,
  Select,
} from '@yourssu-inhouse/interior';
import { invert } from 'es-toolkit';
import { type Control, Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import type {
  InterviewEvaluationItem,
  MyInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';
import type {
  InterviewRubric,
  InterviewRubricGroup,
  InterviewRubricGroupName,
} from '@/apis/interviews/rubrics/schema';
import type {
  MyInterviewEvaluationForm,
  MyInterviewEvaluationFormInput,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/MyInterviewEvaluationPanel/formValidationSchema';

import { saveMyInterviewEvaluation } from '@/apis/interviews/evaluations';
import {
  interviewEvaluationsQueryKeys,
  myInterviewEvaluationOption,
} from '@/apis/interviews/evaluations/query';
import { interviewRubricOption } from '@/apis/interviews/rubrics/query';
import { interviewRubricGroupNames } from '@/apis/interviews/rubrics/schema';
import { meOption } from '@/apis/members/query';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { MyInterviewEvaluationFormSchema } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/MyInterviewEvaluationPanel/formValidationSchema';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/InterviewScoreInput';
import {
  interviewResultKo,
  interviewResultsKo,
  interviewRubricFitTypeKo,
} from '@/types/interviews';

interface MyInterviewEvaluationPanelProps {
  applicantId: number;
  partId: number;
  semester: string;
}

export const MyInterviewEvaluationPanel = ({
  applicantId,
  partId,
  semester,
}: MyInterviewEvaluationPanelProps) => {
  const [{ data: orderedRubricGroups }, { data: myEvaluation }, { data: me }] = useSuspenseQueries({
    queries: [
      {
        ...interviewRubricOption({ partId, semester }),
        select: (data: InterviewRubric) =>
          interviewRubricGroupNames.flatMap(
            (groupName) => data.groups.find(({ group }) => group === groupName) ?? [],
          ),
      },
      myInterviewEvaluationOption(applicantId),
      meOption(),
    ],
  });

  const isRubricSet = orderedRubricGroups.every(({ groupMaxScore }) => groupMaxScore !== 0);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(MyInterviewEvaluationFormSchema),
    values: toFormValues(orderedRubricGroups, myEvaluation),
  });

  // 모든 항목 점수의 합을 실시간으로 보여줘요.
  const watchedGroups = useWatch({ control, name: 'groups' });
  const quantitativeScore = watchedGroups.reduce(
    (sum, { items }) => sum + items.reduce((itemSum, { score }) => itemSum + toScore(score), 0),
    0,
  );

  const { invalidate: invalidateMyEvaluation } = useQueryInvalidation(
    interviewEvaluationsQueryKeys.my(applicantId),
  );
  const { invalidate: invalidateEvaluatorStatuses } = useQueryInvalidation(
    interviewEvaluationsQueryKeys.statuses(applicantId),
  );

  const { isPending, mutateWithToast: mutateMyInterviewEvaluation } = useToastedMutation({
    mutationFn: saveMyInterviewEvaluation,
    onSuccess: () => {
      invalidateMyEvaluation();
      invalidateEvaluatorStatuses();
    },
    successText: '평가를 제출했어요.',
  });

  const onSubmit: SubmitHandler<MyInterviewEvaluationForm> = ({ groups, overallComment, result }) =>
    mutateMyInterviewEvaluation({
      applicantId,
      data: {
        items: groups.flatMap(({ items }) => items.map(({ itemId, score }) => ({ itemId, score }))),
        overallComment,
        result: invert(interviewResultKo)[result],
        // submit 필드는 추후 제거될 예정이에요. (SCO-239)
        submit: true,
      },
    });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">내 평가</h2>
      </header>
      <div className="flex flex-col gap-3">
        {orderedRubricGroups.map(
          ({ group: fitType, groupMaxScore: fitMaxScore, items: requirements }, groupIndex) => (
            <EvaluationCardByFit
              fitMaxScore={fitMaxScore}
              fitType={fitType}
              groupErrorMessage={errors.groups?.[groupIndex]?.groupMaxScore?.message}
              isRubricSet={isRubricSet}
              key={fitType}
            >
              {requirements.map(({ itemId, title, maxScore }, itemIndex) => (
                <EvaluationField
                  control={control}
                  groupIndex={groupIndex}
                  itemIndex={itemIndex}
                  key={itemId}
                  maxScore={maxScore}
                  title={title}
                />
              ))}
            </EvaluationCardByFit>
          ),
        )}
      </div>

      <EvaluationSummarySection
        control={control}
        nickname={me.nickname}
        quantitativeScore={quantitativeScore}
      />

      {!isRubricSet && <FieldErrorMessage>배점 설정 후 평가를 제출할 수 있어요.</FieldErrorMessage>}

      <Button
        className="w-full"
        disabled={!isRubricSet}
        loading={isPending}
        size="md"
        type="submit"
      >
        {myEvaluation.submittedAt == null ? '내 평가 제출하기' : '내 평가 다시 제출하기'}
      </Button>
    </form>
  );
};

interface EvaluationCardByFitProps {
  children: ReactNode;
  fitMaxScore: number;
  fitType: InterviewRubricGroupName;
  groupErrorMessage: string | undefined;
  isRubricSet: boolean;
}

const EvaluationCardByFit = ({
  children,
  fitMaxScore,
  fitType,
  groupErrorMessage,
  isRubricSet,
}: EvaluationCardByFitProps) => (
  <div className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border py-3">
    <div className="flex items-center justify-between gap-2 px-4">
      <h4 className="text-14 text-neutralMuted font-semibold">
        {interviewRubricFitTypeKo[fitType]}
      </h4>
      <Badge color="grey" size="sm">
        {`${fitMaxScore}점`}
      </Badge>
    </div>
    {isRubricSet && (
      <>
        <Divider />
        <div className="flex flex-col justify-between gap-2 px-4">
          {groupErrorMessage != null && <FieldErrorMessage>{groupErrorMessage}</FieldErrorMessage>}
          {children}
        </div>
      </>
    )}
  </div>
);

interface EvaluationFieldProps {
  control: Control<MyInterviewEvaluationFormInput, unknown, MyInterviewEvaluationForm>;
  groupIndex: number;
  itemIndex: number;
  maxScore: number;
  title: string;
}

const EvaluationField = ({
  control,
  groupIndex,
  itemIndex,
  maxScore,
  title,
}: EvaluationFieldProps) => (
  <Controller
    control={control}
    name={`groups.${groupIndex}.items.${itemIndex}.score`}
    render={({ field, fieldState }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-neutral text-13">{title}</span>

          <div className="flex items-center gap-1">
            <InterviewScoreInput
              ariaLabel={`${title} 점수`}
              invalid={fieldState.invalid}
              maxScore={maxScore}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
            <span className="text-13 text-neutralMuted shrink-0">{`/ ${maxScore}`}</span>
          </div>
        </div>
        {fieldState.error?.message && (
          <FieldErrorMessage>{fieldState.error.message}</FieldErrorMessage>
        )}
      </div>
    )}
  />
);

interface EvaluationSummarySectionProps {
  control: Control<MyInterviewEvaluationFormInput, unknown, MyInterviewEvaluationForm>;
  nickname: string;
  quantitativeScore: number;
}

const EvaluationSummarySection = ({
  control,
  nickname,
  quantitativeScore,
}: EvaluationSummarySectionProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <span className="text-14 font-semibold">{`${nickname} 총평`}</span>
      <div className="flex items-center gap-2">
        <Badge color="yellow" size="sm">
          {`정량평가 ${quantitativeScore}점`}
        </Badge>
        <Controller
          control={control}
          name="result"
          render={({ field }) => (
            <Select
              className="w-fit"
              items={interviewResultsKo}
              onValueChange={field.onChange}
              placeholder="평가 결과를 선택하세요"
              size="md"
              value={field.value}
              variant="dimmed"
            />
          )}
        />
      </div>
    </div>

    <Fieldset>
      <Controller
        control={control}
        name="overallComment"
        render={({ field }) => <MultilineTextField {...field} withHeightAutoResize />}
      />
    </Fieldset>
  </div>
);

const findScore = (
  items: InterviewEvaluationItem[],
  itemId: number,
): InterviewEvaluationItem | undefined => items.find((item) => item.itemId === itemId);

const toScore = (value: string) => {
  const numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue;
};

const toFormValues = (
  rubricGroups: InterviewRubricGroup[],
  myEvaluation: MyInterviewEvaluation,
): MyInterviewEvaluationFormInput => {
  const groups = rubricGroups.map(({ group, groupMaxScore, items }) => {
    const evaluationItems =
      myEvaluation.groups.find((evaluationGroup) => evaluationGroup.group === group)?.items ?? [];

    return {
      group,
      groupMaxScore,
      items: items.map(({ itemId, maxScore, title }) => {
        const score = findScore(evaluationItems, itemId)?.score;
        const isScored = score != null && score > 0;

        return {
          itemId,
          title,
          maxScore,
          score: isScored ? score.toString() : '',
        };
      }),
    };
  });

  return {
    groups,
    overallComment: myEvaluation.overallComment,
    result: interviewResultKo[myEvaluation.result],
  };
};
