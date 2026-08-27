import { zodResolver } from '@hookform/resolvers/zod';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import {
  Badge,
  Button,
  Divider,
  Fieldset,
  MultilineTextField,
  Result,
  Select,
} from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { invert } from 'es-toolkit';
import { useState } from 'react';
import {
  Controller,
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';
import { MdAdd, MdRemove } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { applicantByIdOption } from '@/apis/applicants/query';
import { putApplicantDocumentEvaluations } from '@/apis/documents';
import {
  getApplicantDocumentsEvaluationsOption,
  getApplicantDocumentsOthersEvaluationsOption,
  getPartDocumentsRubricsOption,
} from '@/apis/documents/query';
import {
  DOCUMENT_EVALUATION_RESULT_REQUIRED_ERROR,
  DOCUMENT_EVALUATION_SCORE_MINIMUM_ERROR,
  documentKoreanResults,
  type UpdateApplicantDocumentEvaluationFormInputType,
  UpdateApplicantDocumentEvaluationFormSchema,
  type UpdateApplicantDocumentEvaluationFormType,
} from '@/apis/documents/schema';
import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { DocumentRubricSettingButton } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/DocumentRubricSettingButton';
import { OtherEvaluationsCollapsible } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm/OtherEvaluationsCollapsible';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/InterviewScoreInput';
import { isDocumentEvalActionAllowed } from '@/types/applicants';

import { useDocumentAnalytics } from '../../analytics';

const documentResultMapping = {
  PENDING: '보류',
  DOCUMENT_PASS: '서류 합격',
  DOCUMENT_FAIL: '서류 불합격',
} as const;

const documentResultByKoreanResult = invert(documentResultMapping);

export const EvalForm = () => {
  const { applicantId } = useParams({
    from: '/_auth/recruit/applicants/$applicantId/eval/document/',
  });

  const [{ data: applicant }, { data: parts }, { data: me }] = useSuspenseQueries({
    queries: [applicantByIdOption(Number(applicantId)), partsOption(), meOption()],
  });

  const part = parts.find((part) => part.partName === applicant.part) ?? parts[0];

  const isDocumentEvaluationDisabled = !isDocumentEvalActionAllowed(applicant.state);

  const [
    { data: evaluations },
    {
      data: { rubrics },
    },
    { data: othersEvaluations },
  ] = useSuspenseQueries({
    queries: [
      getApplicantDocumentsEvaluationsOption(Number(applicantId)),
      getPartDocumentsRubricsOption(part.partId),
      getApplicantDocumentsOthersEvaluationsOption(Number(applicantId)),
    ],
  });

  const isMyEvaluationSubmitted = evaluations.submittedAt != null;
  const trackDocumentEvent = useDocumentAnalytics();

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<
    UpdateApplicantDocumentEvaluationFormInputType,
    undefined,
    UpdateApplicantDocumentEvaluationFormType
  >({
    resolver: zodResolver(UpdateApplicantDocumentEvaluationFormSchema),
    defaultValues: {
      items:
        evaluations.items.length === 0
          ? rubrics.map(({ sectionId }) => ({ sectionId, score: '0', memo: '' }))
          : evaluations.items.map((item) => ({ ...item, score: item.score.toString() })),
      overallComment: evaluations.overallComment,
      // 미제출 상태에서는 평가 결과를 반드시 선택하도록 기본값을 비워 placeholder를 노출해요.
      result:
        evaluations.items.length === 0 ? undefined : documentResultMapping[evaluations.result],
    },
  });

  const isScoringComplete = rubrics.reduce((sum, rubric) => sum + rubric.maxScore, 0) === 100;

  const watchedItems = useWatch({ control, name: 'items' });
  const quantitativeScore = watchedItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

  const [loading, startLoading] = useLoading();

  const queryClient = useQueryClient();

  const mutation = useToastedMutation({
    mutationFn: putApplicantDocumentEvaluations,
    successText: '평가 제출에 성공했어요.',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApplicantDocumentsEvaluationsOption(Number(applicantId)).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: applicantByIdOption(Number(applicantId)).queryKey,
      });
    },
  });

  const onSubmit: SubmitHandler<UpdateApplicantDocumentEvaluationFormType> = async (data) => {
    const result = await startLoading(
      mutation.mutateWithToast({
        applicantId: Number(applicantId),
        data: {
          ...data,
          result: documentResultByKoreanResult[data.result],
          submit: true,
        },
      }),
    );

    if (result.success) {
      trackDocumentEvent('document_evaluation_submit', {});
    }
  };

  const onInvalid: SubmitErrorHandler<UpdateApplicantDocumentEvaluationFormInputType> = (
    formErrors,
  ) => {
    const hasScoreBelowMinimum =
      Array.isArray(formErrors.items) &&
      formErrors.items.some(
        (itemError) => itemError?.score?.message === DOCUMENT_EVALUATION_SCORE_MINIMUM_ERROR,
      );

    if (hasScoreBelowMinimum) {
      trackDocumentEvent('policy_error_view', {
        action_name: 'document_evaluation_submit',
        reason_code: 'quantitative_score_below_minimum',
      });
    }

    if (formErrors.result?.message === DOCUMENT_EVALUATION_RESULT_REQUIRED_ERROR) {
      trackDocumentEvent('policy_error_view', {
        action_name: 'document_evaluation_submit',
        reason_code: 'status_evaluation_missing',
      });
    }
  };

  const header = (
    <header className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">질문별 서류평가</h2>
      {isMyEvaluationSubmitted ? (
        <Badge color="green" size="md">
          제출 완료
        </Badge>
      ) : (
        <DocumentRubricSettingButton applicant={applicant} />
      )}
    </header>
  );

  if (!isScoringComplete) {
    return (
      <div className="flex flex-[1_1_0] flex-col gap-4">
        {header}
        <div className="flex flex-[1_1_0] items-center justify-center">
          <Result
            description="상단의 문항 설정 버튼을 눌러서 진행할 수 있어요."
            figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
            title="문항별 배점 설정을 완료해주세요"
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {header}
          <div className="flex flex-col gap-4">
            {rubrics.map((rubric, idx) => (
              <div
                className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border py-3"
                key={rubric.sectionId}
              >
                <div className="flex items-center justify-between gap-2 px-4">
                  <h4 className="text-14 text-neutral font-semibold break-keep">
                    {rubric.question}
                  </h4>
                  <Controller
                    control={control}
                    name={`items.${idx}.score`}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <InterviewScoreInput
                            ariaLabel={`문항 ${idx + 1} 점수`}
                            className="text-13"
                            disabled={isDocumentEvaluationDisabled}
                            invalid={fieldState.invalid}
                            maxScore={rubric.maxScore}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                            value={field.value}
                          />
                          <span className="text-13 text-neutral shrink-0 font-semibold">{`/ ${rubric.maxScore}`}</span>
                        </div>
                        {fieldState.error?.message && (
                          <FieldErrorMessage>{fieldState.error.message}</FieldErrorMessage>
                        )}
                      </div>
                    )}
                  />
                </div>

                <Divider className="my-1" />

                <QualitativeEvaluationCollapsible
                  defaultOpen={evaluations.items.length !== 0}
                  onOpen={() =>
                    trackDocumentEvent('document_evaluation_section_open', {
                      section_type: 'qualitative',
                    })
                  }
                >
                  <Controller
                    control={control}
                    name={`items.${idx}.memo`}
                    render={({ field }) => (
                      <MultilineTextField
                        {...field}
                        disabled={isDocumentEvaluationDisabled}
                        placeholder="평가 내용을 작성해주세요..."
                        withHeightAutoResize
                      />
                    )}
                  />
                </QualitativeEvaluationCollapsible>

                {evaluations.items.length !== 0 && (
                  <>
                    <Divider className="my-1" />
                    <OtherEvaluationsCollapsible
                      isEvaluationDone={evaluations.items.length !== 0}
                      othersEvaluations={othersEvaluations}
                      rubric={rubric}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-14 font-semibold">{`${me.nickname} 총평`}</span>
              <div className="flex items-center gap-2">
                <Badge color="yellow" size="sm">
                  {`정량평가 ${quantitativeScore}점`}
                </Badge>
                <Controller
                  control={control}
                  name="result"
                  render={({ field, fieldState }) => (
                    <Select
                      className="w-fit"
                      disabled={isDocumentEvaluationDisabled}
                      invalid={fieldState.invalid}
                      items={documentKoreanResults}
                      onOpenChange={(open) => {
                        if (open) {
                          trackDocumentEvent('document_result_dropdown_open', {});
                        }
                      }}
                      onValueChange={(value) => {
                        if (value === field.value) {
                          return;
                        }

                        trackDocumentEvent('document_result_selected', {
                          evaluation_result: documentResultByKoreanResult[value],
                        });
                        field.onChange(value);
                      }}
                      placeholder="평가 결과"
                      size="md"
                      value={field.value}
                      variant="dimmed"
                    />
                  )}
                />
              </div>
            </div>
            {errors.result?.message && (
              <FieldErrorMessage>{errors.result.message}</FieldErrorMessage>
            )}
          </div>

          <Fieldset>
            <Controller
              control={control}
              name="overallComment"
              render={({ field }) => (
                <MultilineTextField
                  disabled={isDocumentEvaluationDisabled}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="총평을 작성해주세요..."
                  ref={field.ref}
                  value={field.value}
                  withHeightAutoResize
                />
              )}
            />
          </Fieldset>
        </div>

        <Button
          disabled={(isMyEvaluationSubmitted && !isDirty) || isDocumentEvaluationDisabled}
          loading={loading}
          onClick={() => {
            trackDocumentEvent('document_evaluation_submit_click', {});
          }}
          size="lg"
          type="submit"
        >
          {isMyEvaluationSubmitted ? '내 평가 수정하기' : '내 평가 제출하기'}
        </Button>
      </div>
    </form>
  );
};

const QualitativeEvaluationCollapsible = ({
  children,
  defaultOpen = false,
  onOpen,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpen: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      className="flex flex-col"
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          onOpen();
        }
      }}
      open={open}
    >
      <Collapsible.Trigger className="text-14 text-neutral flex cursor-pointer items-center justify-between px-4 py-1 font-semibold">
        정성평가
        {open ? <MdRemove className="text-16" /> : <MdAdd className="text-16" />}
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-4 px-4 pt-3 pb-2">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
