import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, Divider, Fieldset, MultilineTextField, Select } from '@yourssu-inhouse/interior';
import { invert } from 'es-toolkit';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useLoading } from 'react-simplikit';

import { putApplicantDocumentEvaluations } from '@/apis/applicants';
import {
  applicantByIdOption,
  getApplicantDocumentsEvaluationsOption,
} from '@/apis/applicants/query';
import {
  documentKoreanResults,
  UpdateApplicantDocumentEvaluationFormSchema,
  type UpdateApplicantDocumentEvaluationFormType,
} from '@/apis/applicants/schema';
import { getPartDocumentsRubricsOption, partsOption } from '@/apis/parts/query';
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

  const [{ data: applicant }, { data: parts }] = useSuspenseQueries({
    queries: [applicantByIdOption(Number(applicantId)), partsOption()],
  });

  const part = parts.find((part) => part.partName === applicant.part) ?? parts[0];

  const [{ data: evaluations }, { data: rubrics }] = useSuspenseQueries({
    queries: [
      getApplicantDocumentsEvaluationsOption(Number(applicantId)),
      getPartDocumentsRubricsOption(part.partId),
    ],
  });

  const { handleSubmit, control } = useForm({
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold">질문별 서류평가</h3>

            <div className="flex flex-col gap-4">
              {rubrics.map((rubric, idx) => (
                <div className="flex flex-col" key={rubric.sectionId}>
                  <span className="text-15">{`${idx + 1}. ${rubric.question}`}</span>

                  <Fieldset label="배점">
                    <Controller
                      control={control}
                      name={`items.${idx}.score`}
                      render={({ field }) => (
                        <div>
                          <input
                            className="h-lg rounded-8 border-grey200 focus:border-violet500 hover:not-focus:not-disabled:border-violetOpacity200 border px-3 outline-none"
                            {...field}
                            onChange={(event) => {
                              const value = event.target.value;

                              if (!/^\d*$/.test(value)) {
                                return;
                              }

                              field.onChange(value);
                            }}
                            type="text"
                          />
                          {` / ${rubric.maxScore}`}
                        </div>
                      )}
                    />
                  </Fieldset>

                  <Fieldset label="코멘트">
                    <Controller
                      control={control}
                      name={`items.${idx}.memo`}
                      render={({ field }) => <MultilineTextField {...field} withHeightAutoResize />}
                    />
                  </Fieldset>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">총평 및 평가결과</h3>
            <Fieldset label="총평">
              <Controller
                control={control}
                name="overallComment"
                render={({ field }) => <MultilineTextField {...field} withHeightAutoResize />}
              />
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

      <Divider className="my-6" />

      <div className="flex flex-col">
        <Button size="lg">최종 서류 평가 제출하기</Button>
      </div>
    </div>
  );
};
