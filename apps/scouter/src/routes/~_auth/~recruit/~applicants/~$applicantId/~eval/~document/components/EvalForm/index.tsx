import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, Divider, Fieldset, MultilineTextField, Select } from '@yourssu-inhouse/interior';
import { invert } from 'es-toolkit';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useLoading } from 'react-simplikit';

import { putApplicantDocumentEvaluations } from '@/apis/applicants';
import { getApplicantDocumentsEvaluationsOption } from '@/apis/applicants/query';
import {
  documentKoreanResults,
  UpdateApplicantDocumentEvaluationFormSchema,
  type UpdateApplicantDocumentEvaluationFormType,
} from '@/apis/applicants/schema';
import { useToastedMutation } from '@/hooks/useToastedMutation';

const documentResultMapping = {
  PENDING: '보류',
  DOCUMENT_PASS: '서류 합격',
  DOCUMENT_FAIL: '서류 불합격',
} as const;

export const EvalForm = () => {
  const { applicantId } = useParams({
    from: '/_auth/recruit/applicants/$applicantId/eval/document/',
  });
  const { data: evaluations } = useSuspenseQuery(
    getApplicantDocumentsEvaluationsOption(Number(applicantId)),
  );

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(UpdateApplicantDocumentEvaluationFormSchema),
    defaultValues: {
      items: evaluations.items,
      overallComment: evaluations.overallComment,
      result: documentResultMapping[evaluations.result],
    },
  });

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
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 p-6">
          <h3 className="font-semibold">질문별 서류평가</h3>

          <div>
            <h3 className="font-semibold">총평 및 평가결과</h3>
            <Fieldset label="총평">
              <MultilineTextField withHeightAutoResize />
            </Fieldset>

            <Fieldset label="평가결과">
              <Controller
                control={control}
                name="result"
                render={({ field }) => (
                  <Select
                    className="w-fit"
                    items={documentKoreanResults}
                    onValueChange={field.onChange}
                    placeholder="평가 결과를 선택하세요"
                    size="lg"
                    value={field.value}
                    variant="dimmed"
                  />
                )}
              />
            </Fieldset>
          </div>

          <Button loading={loading} size="lg" type="submit">
            내 평가 제출하기
          </Button>
        </div>
      </form>

      <Divider />

      <div className="flex flex-col p-6">
        <Button size="lg">최종 서류 평가 제출하기</Button>
      </div>
    </div>
  );
};
