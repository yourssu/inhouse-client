import { zodResolver } from '@hookform/resolvers/zod';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Button, Divider } from '@yourssu-inhouse/interior';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { MdKeyboardArrowDown } from 'react-icons/md';

import type {
  InterviewRubricGroup,
  InterviewRubricGroupName,
} from '@/apis/interviews/rubrics/schema';
import type {
  UpdateInterviewRubricForm,
  UpdateInterviewRubricFormInput,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/formValidationSchema';

import { interviewEvaluatorStatusesOption } from '@/apis/interviews/evaluations/query';
import {
  interviewRubricOption,
  updateInterviewRubricMutationOptions,
} from '@/apis/interviews/rubrics/query';
import { interviewRubricGroupNames } from '@/apis/interviews/rubrics/schema';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { UpdateInterviewRubricFormSchema } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/formValidationSchema';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/InterviewScoreInput';
import { RubricFieldError } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/RubricFieldError';
import { TotalInterviewScore } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSetting/TotalInterviewScore';

const groupLabels: Record<InterviewRubricGroupName, string> = {
  CULTURE_FIT: '컬쳐핏',
  TEAM_FIT: '팀핏',
  JOB_FIT: '잡핏',
};

interface InterviewRubricSettingProps {
  applicantId: number;
  partId: number;
  semester: string;
}

export const InterviewRubricSetting = ({
  applicantId,
  partId,
  semester,
}: InterviewRubricSettingProps) => {
  const [{ data: rubric }, { data: evaluatorStatuses }] = useSuspenseQueries({
    queries: [
      interviewRubricOption({ partId, semester }),
      interviewEvaluatorStatusesOption(applicantId),
    ],
  });

  const isEvaluationSubmitted = evaluatorStatuses.some(({ status }) => status === 'SUBMITTED');
  const orderedGroups = interviewRubricGroupNames.flatMap(
    (groupName) => rubric.groups.find(({ group }) => group === groupName) ?? [],
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(UpdateInterviewRubricFormSchema),
    values: toFormValues(orderedGroups),
  });

  const { isPending, mutateWithToast } = useToastedMutation({
    ...updateInterviewRubricMutationOptions,
    successText: '배점 설정을 저장했어요.',
  });

  const onSubmit: SubmitHandler<UpdateInterviewRubricForm> = ({ groups }) =>
    mutateWithToast({
      partId,
      semester,
      data: {
        deadline: rubric.deadline,
        groups: groups.map(({ group, items }) => ({
          group,
          items: items.map(({ itemId, maxScore }) => ({ itemId, maxScore })),
        })),
      },
    });

  return (
    <Collapsible.Root className="flex w-full flex-col">
      <Collapsible.Trigger asChild>
        <button
          className="group hover:bg-greyOpacity50 focus-visible:outline-violet500 flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
          type="button"
        >
          <span className="font-semibold">면접 평가 문항 설정</span>

          <MdKeyboardArrowDown
            aria-hidden
            className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </Collapsible.Trigger>
      <Divider />

      <Collapsible.Content>
        <form className="flex flex-col gap-3 p-4" onSubmit={handleSubmit(onSubmit)}>
          <span className="text-neutralSubtle text-13">
            배점은 같은 파트 지원자 전체에게 공통으로 적용돼요.
          </span>
          <TotalInterviewScore control={control} />

          {orderedGroups.map(({ group, items: requirements }, groupIndex) => (
            <div
              className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border py-3"
              key={group}
            >
              <div className="flex items-center justify-between gap-2 px-4">
                <h4 className="text-14 text-neutralMuted font-semibold">{groupLabels[group]}</h4>
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.groupMaxScore`}
                  render={({ field, fieldState }) => (
                    <InterviewScoreInput
                      ariaLabel={`${groupLabels[group]} 총점`}
                      invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
              </div>
              <Divider />
              <div className="flex flex-col justify-between gap-2 px-4">
                <RubricFieldError message={errors.groups?.[groupIndex]?.groupMaxScore?.message} />

                {requirements.map(({ itemId, title }, itemIndex) => (
                  <div className="flex flex-col gap-1" key={itemId}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral text-13">{title}</span>

                      <Controller
                        control={control}
                        name={`groups.${groupIndex}.items.${itemIndex}.maxScore`}
                        render={({ field, fieldState }) => (
                          <InterviewScoreInput
                            ariaLabel={`${title} 배점`}
                            invalid={fieldState.invalid}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                            value={field.value}
                          />
                        )}
                      />
                    </div>
                    <RubricFieldError
                      message={errors.groups?.[groupIndex]?.items?.[itemIndex]?.maxScore?.message}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <RubricFieldError message={errors.groups?.message} />

          {isEvaluationSubmitted && (
            <span className="text-13 text-neutralSubtle">
              이미 제출된 면접 평가가 있어 배점을 저장할 수 없어요.
            </span>
          )}

          <Button
            className="w-full"
            disabled={isEvaluationSubmitted}
            loading={isPending}
            size="md"
            type="submit"
          >
            저장하기
          </Button>
        </form>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

/** 배점이 아직 설정되지 않은 항목은 0점으로 다뤄요. */
const toFormValues = (groups: InterviewRubricGroup[]): UpdateInterviewRubricFormInput => ({
  groups: groups.map(({ group, groupMaxScore, items }) => ({
    group,
    groupMaxScore: (groupMaxScore ?? 0).toString(),
    items: items.map(({ itemId, maxScore, title }) => ({
      itemId,
      title,
      maxScore: (maxScore ?? 0).toString(),
    })),
  })),
});
