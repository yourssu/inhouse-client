import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, useToast } from '@yourssu-inhouse/interior';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useLoading } from 'react-simplikit';

import { applicantByIdOption } from '@/apis/applicants/query';
import { putPartDocumentsRubrics } from '@/apis/parts';
import { getPartDocumentsRubricsOption, partsOption } from '@/apis/parts/query';
import {
  UpdatePartDocumentsRubricsFormSchema,
  type UpdatePartDocumentsRubricsFormType,
} from '@/apis/parts/schema';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface QuestionSettingProps {
  onClose: () => void;
}

export const QuestionSetting = ({ onClose }: QuestionSettingProps) => {
  const { applicantId } = useParams({
    from: '/_auth/recruit/applicants/$applicantId/eval/document/',
  });

  const [{ data: applicant }, { data: parts }] = useSuspenseQueries({
    queries: [applicantByIdOption(Number(applicantId)), partsOption()],
  });

  const part = parts.find((part) => part.partName === applicant.part) ?? parts[0];

  const { data: rubrics } = useSuspenseQuery(getPartDocumentsRubricsOption(part.partId));

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(UpdatePartDocumentsRubricsFormSchema),
    defaultValues: {
      rubrics: rubrics.map((rubric) => ({ ...rubric, maxScore: rubric.maxScore.toString() })),
    },
  });

  const mutation = useToastedMutation({
    mutationFn: putPartDocumentsRubrics,
    successText: '문항 설정을 완료했어요.',
  });

  const toast = useToast();

  const onSubmit: SubmitHandler<UpdatePartDocumentsRubricsFormType> = async (data) => {
    if (data.rubrics.map((rubric) => rubric.maxScore).reduce((acc, cur) => acc + cur, 0) != 100) {
      toast.error('배점의 총합은 100점이어야 해요.');
      return;
    }

    const { success } = await startLoading(
      mutation.mutateWithToast({ partId: part.partId, data: data.rubrics }),
    );

    if (success) {
      onClose();
    }
  };

  const [loading, startLoading] = useLoading();

  const currentRubrics = useWatch({
    control,
    name: 'rubrics',
  });

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <h3 className="font-semibold">질문별 배점 설정</h3>
              <span>
                {`${currentRubrics
                  .map((rubric) =>
                    Number.isNaN(Number(rubric.maxScore)) ? 0 : Number(rubric.maxScore),
                  )
                  .reduce((acc, cur) => acc + cur, 0)} / 100`}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {rubrics.map((rubric, idx) => (
                <div className="flex flex-col gap-1.5" key={rubric.sectionId}>
                  <span className="text-15">{`${idx + 1}. ${rubric.question}`}</span>

                  <Controller
                    control={control}
                    name={`rubrics.${idx}.maxScore`}
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
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full gap-4">
            <Button className="flex-1" onClick={onClose} size="lg" variant="secondary">
              취소
            </Button>
            <Button className="flex-1" loading={loading} size="lg" type="submit">
              설정 완료
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
