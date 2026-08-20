import { zodResolver } from '@hookform/resolvers/zod';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Divider,
  Fieldset,
  MultilineTextField,
  Select,
} from '@yourssu-inhouse/interior';
import { invert } from 'es-toolkit';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
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
  documentKoreanResults,
  UpdateApplicantDocumentEvaluationFormSchema,
  type UpdateApplicantDocumentEvaluationFormType,
} from '@/apis/documents/schema';
import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { OtherEvaluationsCollapsible } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm/OtherEvaluationsCollapsible';
import { QuestionSetting } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/QuestionSetting';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/InterviewScoreInput';

const documentResultMapping = {
  PENDING: '보류',
  DOCUMENT_PASS: '서류 합격',
  DOCUMENT_FAIL: '서류 불합격',
} as const;

export const EvalForm = () => {
  const { applicantId } = useParams({
    from: '/_auth/recruit/applicants/$applicantId/eval/document/',
  });

  const [{ data: applicant }, { data: parts }, { data: me }] = useSuspenseQueries({
    queries: [applicantByIdOption(Number(applicantId)), partsOption(), meOption()],
  });

  const part = parts.find((part) => part.partName === applicant.part) ?? parts[0];

  const [{ data: evaluations }, { data: rubrics }, { data: othersEvaluations }] =
    useSuspenseQueries({
      queries: [
        getApplicantDocumentsEvaluationsOption(Number(applicantId)),
        getPartDocumentsRubricsOption(part.partId),
        getApplicantDocumentsOthersEvaluationsOption(Number(applicantId)),
      ],
    });

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm({
    resolver: zodResolver(UpdateApplicantDocumentEvaluationFormSchema),
    defaultValues: {
      items:
        evaluations.items.length === 0
          ? rubrics.map(({ sectionId }) => ({ sectionId, score: '0', memo: '' }))
          : evaluations.items.map((item) => ({ ...item, score: item.score.toString() })),
      overallComment: evaluations.overallComment,
      result: documentResultMapping[evaluations.result],
    },
  });

  const watchedItems = useWatch({ control, name: 'items' });
  const quantitativeScore = watchedItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

  const [loading, startLoading] = useLoading();

  const mutation = useToastedMutation({
    mutationFn: putApplicantDocumentEvaluations,
    successText: '평가 제출에 성공했어요.',
  });

  const onSubmit: SubmitHandler<UpdateApplicantDocumentEvaluationFormType> = async (data) =>
    await startLoading(
      mutation.mutateWithToast({
        applicantId: Number(applicantId),
        data: {
          ...data,
          result: invert(documentResultMapping)[data.result],
          submit: true,
        },
      }),
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">질문별 서류평가</h2>
            {evaluations.items.length === 0 ? (
              <QuestionSetting applicantId={Number(applicantId)} />
            ) : (
              <Badge color="green" size="md">
                제출 완료
              </Badge>
            )}
          </header>

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
                      <div className="flex items-center gap-1">
                        <InterviewScoreInput
                          ariaLabel={`문항 ${idx + 1} 점수`}
                          className="text-13"
                          invalid={fieldState.invalid}
                          maxScore={rubric.maxScore}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          value={field.value}
                        />
                        <span className="text-13 text-neutral shrink-0 font-semibold">{`/ ${rubric.maxScore}`}</span>
                      </div>
                    )}
                  />
                </div>

                <Divider className="my-1" />

                <QualitativeEvaluationCollapsible defaultOpen={evaluations.items.length !== 0}>
                  <Controller
                    control={control}
                    name={`items.${idx}.memo`}
                    render={({ field }) => (
                      <MultilineTextField
                        {...field}
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-14 font-semibold">{`${me.nickname} 총평`}</span>
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
                    items={documentKoreanResults}
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
              render={({ field }) => (
                <MultilineTextField
                  {...field}
                  placeholder="총평을 작성해주세요..."
                  withHeightAutoResize
                />
              )}
            />
          </Fieldset>
        </div>

        <Button
          disabled={evaluations.items.length !== 0 && !isDirty}
          loading={loading}
          size="lg"
          type="submit"
        >
          {evaluations.items.length === 0 ? '내 평가 제출하기' : '내 평가 수정하기'}
        </Button>
      </div>
    </form>
  );
};

const QualitativeEvaluationCollapsible = ({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root className="flex flex-col" onOpenChange={setOpen} open={open}>
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
