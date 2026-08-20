import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { Badge, Button, Dialog, Divider } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { Suspense } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import z from 'zod/v4';

import { applicantByIdOption } from '@/apis/applicants/query';
import { putPartDocumentsRubrics } from '@/apis/documents';
import {
  getApplicantDocumentsEvaluationsOption,
  getPartDocumentsRubricsOption,
} from '@/apis/documents/query';
import { UpdatePartDocumentsRubricsFormSchema } from '@/apis/documents/schema';
import { partsOption } from '@/apis/parts/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { InterviewScoreInput } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/InterviewScoreInput';

interface QuestionSettingProps {
  applicantId: number;
}

export const QuestionSetting = ({ applicantId }: QuestionSettingProps) => {
  const openQuestionSettingDialog = useAlertDialog();

  const handleDialogTrigger = () => {
    return openQuestionSettingDialog({
      title: '문항 배점 설정',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <Suspense fallback={<QuestionSettingFormSkeleton />}>
          <QuestionSettingForm
            applicantId={applicantId}
            closeAsFalse={closeAsFalse}
            closeAsTrue={closeAsTrue}
          />
        </Suspense>
      ),
      customized: true,
      closeableWithOutside: false,
      closeButton: false,
    });
  };

  return (
    <Button onClick={handleDialogTrigger} size="sm" type="button" variant="subPrimary">
      문항 설정
    </Button>
  );
};

interface QuestionSettingFormProps {
  applicantId: number;
  closeAsFalse: () => void;
  closeAsTrue: () => void;
}

type UpdatePartDocumentsRubricsFormInput = z.input<typeof UpdatePartDocumentsRubricsFormSchema>;
type UpdatePartDocumentsRubricsFormOutput = z.output<typeof UpdatePartDocumentsRubricsFormSchema>;

const QuestionSettingForm = ({
  applicantId,
  closeAsFalse,
  closeAsTrue,
}: QuestionSettingFormProps) => {
  const [{ data: applicant }, { data: parts }] = useSuspenseQueries({
    queries: [applicantByIdOption(applicantId), partsOption()],
  });

  const part = parts.find((p) => p.partName === applicant.part) ?? parts[0];

  const { data: rubrics } = useSuspenseQuery(getPartDocumentsRubricsOption(part.partId));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePartDocumentsRubricsFormInput, unknown, UpdatePartDocumentsRubricsFormOutput>({
    resolver: zodResolver(UpdatePartDocumentsRubricsFormSchema),
    defaultValues: {
      rubrics: rubrics.map((rubric) => ({
        sectionId: rubric.sectionId,
        maxScore: rubric.maxScore.toString(),
        criterionDetail: rubric.criterionDetail,
      })),
    },
  });

  const { invalidate: invalidateRubrics } = useQueryInvalidation(
    getPartDocumentsRubricsOption(part.partId).queryKey,
  );
  const { invalidate: invalidateEvaluations } = useQueryInvalidation(
    getApplicantDocumentsEvaluationsOption(applicantId).queryKey,
  );

  const { isPending, mutateWithToast } = useToastedMutation({
    mutationFn: putPartDocumentsRubrics,
    onSuccess: () => {
      closeAsTrue();
      invalidateRubrics();
      invalidateEvaluations();
    },
    successText: '문항 설정을 완료했어요.',
  });

  const currentRubrics = useWatch({
    control,
    name: 'rubrics',
  });

  const totalScore = (currentRubrics ?? []).reduce((acc, cur) => {
    const val = Number(cur?.maxScore);
    return acc + (Number.isNaN(val) ? 0 : val);
  }, 0);

  const isScoreValid = totalScore === 100;

  const onSubmit: SubmitHandler<UpdatePartDocumentsRubricsFormOutput> = (data) => {
    if (!isScoreValid) {
      return;
    }

    mutateWithToast({ partId: part.partId, data: data.rubrics });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Dialog.Content className="w-160 gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-14 text-neutral font-semibold">{part.partName} 서류평가 문항 설정</h3>
          <TotalDocumentScore totalScore={totalScore} />
        </div>

        <div className="border-greyOpacity200 bg-lightBackground rounded-10 flex max-h-96 flex-col gap-3 overflow-y-auto border py-4">
          <div className="text-13 text-neutralMuted flex items-center justify-between px-5 font-semibold">
            <span>구글폼 질문</span>
            <span>배점</span>
          </div>
          <Divider />
          <div className="flex flex-col gap-3 px-4">
            {rubrics.map((rubric, idx) => (
              <div
                className="border-greyOpacity100 bg-greyOpacity50 rounded-8 flex items-center justify-between gap-3 border p-3"
                key={rubric.sectionId}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-14 text-neutral font-medium break-keep">
                    {rubric.question}
                  </span>
                  <Badge className="shrink-0" color="yellow" size="md">
                    고정
                  </Badge>
                </div>
                <Controller
                  control={control}
                  name={`rubrics.${idx}.maxScore`}
                  render={({ field, fieldState }) => (
                    <InterviewScoreInput
                      ariaLabel={`${rubric.question} 배점`}
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
      </Dialog.Content>

      <div className="flex items-center justify-between gap-3 px-6 pt-2 pb-5">
        <div className="text-13 text-red600 min-w-0 font-semibold">
          {!isScoreValid && '배점 합계가 100점일 때만 저장할 수 있습니다.'}
          {isScoreValid && errors.rubrics?.message && String(errors.rubrics.message)}
        </div>
        <div className="flex gap-2">
          <Dialog.Button onClick={closeAsFalse} type="button" variant="secondary">
            취소
          </Dialog.Button>

          <Dialog.Button
            disabled={!isScoreValid}
            loading={isPending}
            type="submit"
            variant="primary"
          >
            저장
          </Dialog.Button>
        </div>
      </div>
    </form>
  );
};

interface TotalDocumentScoreProps {
  totalScore: number;
}

const TotalDocumentScore = ({ totalScore }: TotalDocumentScoreProps) => {
  const isCompleted = totalScore === 100;
  return (
    <div
      className={cn(
        'text-13 rounded-full px-3 py-1 font-semibold transition-colors',
        isCompleted ? 'bg-tealOpacity100 text-teal600' : 'bg-redOpacity100 text-red600',
      )}
    >
      현재 합계 {totalScore}/100
    </div>
  );
};

const QuestionSettingFormSkeleton = () => (
  <Dialog.Content aria-busy className="w-160 gap-3">
    <div className="flex items-center justify-between gap-3">
      <div className="bg-greyOpacity100 rounded-4 h-5 w-40 animate-pulse" />
      <div className="bg-greyOpacity100 h-6 w-28 animate-pulse rounded-full" />
    </div>
    <div className="bg-greyOpacity100 rounded-8 h-10 w-full animate-pulse" />
    <div className="bg-greyOpacity100 rounded-10 h-60 w-full animate-pulse" />
  </Dialog.Content>
);
