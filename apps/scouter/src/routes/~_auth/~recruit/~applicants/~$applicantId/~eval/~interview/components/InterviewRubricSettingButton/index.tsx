import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, Dialog, Divider } from '@yourssu-inhouse/interior';
import { Suspense, useEffect } from 'react';
import {
  Controller,
  type FieldErrors,
  type SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';

import type { InterviewRubricGroup } from '@/apis/interviews/rubrics/schema';
import type {
  UpdateInterviewRubricForm,
  UpdateInterviewRubricFormInput,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSettingButton/formValidationSchema';

import { updateInterviewRubric } from '@/apis/interviews/rubrics';
import { interviewRubricOption, interviewRubricQueryKeys } from '@/apis/interviews/rubrics/query';
import { interviewRubricGroupNames } from '@/apis/interviews/rubrics/schema';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { UpdateInterviewRubricFormSchema } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSettingButton/formValidationSchema';
import { TotalInterviewScore } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewRubricSettingButton/TotalInterviewScore';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/InterviewScoreInput';
import { interviewRubricFitTypeKo } from '@/types/interviews';

interface InterviewRubricSettingButtonProps {
  isLocked: boolean;
  partId: number;
  semester: string;
}

export const InterviewRubricSettingButton = ({
  isLocked,
  partId,
  semester,
}: InterviewRubricSettingButtonProps) => {
  const openRubricSettingDialog = useAlertDialog();

  const handleDialogTrigger = () => {
    if (isLocked) {
      return openRubricSettingDialog({
        title: '배점 변경 불가',
        content: '파트 내 지원자에 대한 면접 평가가 시작돼서 배점을 변경할 수 없어요.',
        primaryButtonText: '확인',
      });
    }

    return openRubricSettingDialog({
      title: '면접 평가 문항 설정',
      content: ({ closeAsTrue }) => (
        <Suspense fallback={<InterviewRubricSettingFormSkeleton />}>
          <InterviewRubricSettingForm
            closeAsTrue={closeAsTrue}
            partId={partId}
            semester={semester}
          />
        </Suspense>
      ),
      customized: true,
    });
  };

  return (
    <Button onClick={handleDialogTrigger} size="sm" type="button" variant="subPrimary">
      배점 설정
    </Button>
  );
};

interface InterviewRubricSettingFormProps {
  closeAsTrue: () => void;
  partId: number;
  semester: string;
}

/** footer에 보여줄 오류 하나와, 그 오류가 어느 범위에서 났는지 보여줘요. */
interface RubricFormError {
  message: string;
  scope: 'group' | 'item' | 'total';
}

const InterviewRubricSettingForm = ({
  closeAsTrue,
  partId,
  semester,
}: InterviewRubricSettingFormProps) => {
  const { data: rubric } = useSuspenseQuery(interviewRubricOption({ partId, semester }));

  const orderedGroups = interviewRubricGroupNames.flatMap(
    (groupName) => rubric.groups.find(({ group }) => group === groupName) ?? [],
  );

  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    trigger,
  } = useForm({
    resolver: zodResolver(UpdateInterviewRubricFormSchema),
    values: toFormValues(orderedGroups),
  });

  const watchedGroups = useWatch({ control, name: 'groups' });

  /**
   * 합계 검증은 `superRefine`으로 얹은 규칙이라, 오류가 방금 고친 입력칸이 아니라
   * 그룹 총점이나 `groups` 전체에 붙어요. RHF는 바뀐 입력칸의 오류만 다시 계산하니
   * 낡은 문구가 남지 않도록 폼 전체를 다시 검증해요.
   */
  useEffect(() => {
    if (isSubmitted) {
      trigger();
    }
  }, [isSubmitted, trigger, watchedGroups]);

  const formError = findFirstError(errors, orderedGroups);
  const isTotalScoreMismatch = formError?.scope === 'total';

  const { invalidate: invalidateRubric } = useQueryInvalidation(
    interviewRubricQueryKeys.part({ partId, semester }),
  );

  const { isPending, mutateWithToast: mutateInterviewRubric } = useToastedMutation({
    mutationFn: updateInterviewRubric,
    onSuccess: () => {
      closeAsTrue();
      invalidateRubric();
    },
    successText: '배점 설정을 저장했어요.',
  });

  const onSubmit: SubmitHandler<UpdateInterviewRubricForm> = ({ groups }) =>
    mutateInterviewRubric({
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Dialog.Content className="w-180 gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-neutralSubtle text-13">
            배점은 같은 파트 지원자 전체에게 공통으로 적용돼요.
          </span>
          <TotalInterviewScore control={control} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {orderedGroups.map(({ group, items: requirements }, groupIndex) => (
            <div
              className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border py-3"
              key={group}
            >
              <div className="flex items-center justify-between gap-2 px-3">
                <h4 className="text-14 text-neutralMuted font-semibold">
                  {interviewRubricFitTypeKo[group]}
                </h4>
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.groupMaxScore`}
                  render={({ field, fieldState }) => (
                    <InterviewScoreInput
                      ariaLabel={`${interviewRubricFitTypeKo[group]} 총점`}
                      disabled={rubric.isLocked}
                      invalid={fieldState.invalid || isTotalScoreMismatch}
                      maxScore={100}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
              </div>
              <Divider />
              <div className="flex flex-col justify-between gap-2 px-3">
                {requirements.map(({ itemId, title }, itemIndex) => (
                  <div className="flex items-center justify-between gap-2" key={itemId}>
                    <span className="text-neutral text-13 min-w-0 break-keep">{title}</span>

                    <Controller
                      control={control}
                      name={`groups.${groupIndex}.items.${itemIndex}.maxScore`}
                      render={({ field, fieldState }) => (
                        <InterviewScoreInput
                          ariaLabel={`${title} 배점`}
                          disabled={rubric.isLocked}
                          invalid={fieldState.invalid}
                          maxScore={100}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          value={field.value}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Dialog.Content>

      <div className="flex items-center justify-between gap-3 px-6 pb-5">
        <div className="min-w-0">
          {formError != null && <FieldErrorMessage>{formError.message}</FieldErrorMessage>}
        </div>
        <Dialog.Button
          className="min-w-24 shrink-0"
          disabled={rubric.isLocked}
          loading={isPending}
          type="submit"
          variant="primary"
        >
          저장하기
        </Dialog.Button>
      </div>
    </form>
  );
};

const InterviewRubricSettingFormSkeleton = () => (
  <Dialog.Content aria-busy className="w-180 gap-3">
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((index) => (
        <div
          className="bg-greyOpacity100 rounded-10 h-40 animate-pulse motion-reduce:animate-none"
          key={index}
        />
      ))}
    </div>
  </Dialog.Content>
);

/**
 * 카드마다 에러를 붙이면 입력할 때마다 열 높이가 출렁여서, footer에 한 번에 하나만 보여줘요.
 * 에러 메시지 노출 순서: 항목 -> 그룹 총점 -> 모든 fit 총점의 합.
 */
const findFirstError = (
  errors: FieldErrors<UpdateInterviewRubricFormInput>,
  groups: InterviewRubricGroup[],
): RubricFormError | undefined => {
  const groupErrors = errors.groups;

  if (groupErrors == null) {
    return undefined;
  }

  const itemMessage = groups
    .flatMap(({ items }, groupIndex) =>
      items.flatMap(({ title }, itemIndex) => {
        const message = groupErrors[groupIndex]?.items?.[itemIndex]?.maxScore?.message;
        return message == null ? [] : `${title} · ${message}`;
      }),
    )
    .at(0);

  if (itemMessage != null) {
    return { scope: 'item', message: itemMessage };
  }

  const groupMessage = groups
    .flatMap(({ group }, groupIndex) => {
      const message = groupErrors[groupIndex]?.groupMaxScore?.message;
      return message == null ? [] : `${interviewRubricFitTypeKo[group]} · ${message}`;
    })
    .at(0);

  if (groupMessage != null) {
    return { scope: 'group', message: groupMessage };
  }

  /**
   * `groups` 자체(배열 필드)에 붙는 총합 오류는 RHF가 인덱스별 오류와 구분하려고
   * `groupErrors.message`가 아니라 `groupErrors.root.message`에 넣어요.
   */
  const totalMessage = groupErrors.root?.message;

  return totalMessage == null ? undefined : { scope: 'total', message: totalMessage };
};

const toFormValues = (groups: InterviewRubricGroup[]): UpdateInterviewRubricFormInput => ({
  groups: groups.map(({ group, groupMaxScore, items }) => ({
    group,
    groupMaxScore: groupMaxScore.toString(),
    items: items.map(({ itemId, maxScore, title }) => ({
      itemId,
      title,
      maxScore: maxScore.toString(),
    })),
  })),
});
