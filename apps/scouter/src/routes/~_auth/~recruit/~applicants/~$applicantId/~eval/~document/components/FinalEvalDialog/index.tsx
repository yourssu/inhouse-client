import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, Select } from '@yourssu-inhouse/interior';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useLoading } from 'react-simplikit';
import z from 'zod/v4';

import { patchApplicant } from '@/apis/applicants';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

const applicantDocumentKoreanStates = ['최종 서류 합격', '최종 서류 불합격'] as const;

const applicantDocumentStateMapping = {
  '최종 서류 합격': 'DOCUMENT_ACCEPTED',
  '최종 서류 불합격': 'DOCUMENT_REJECTED',
} as const;

const finalEvalFormSchema = z.object({
  finalState: z
    .enum(applicantDocumentKoreanStates)
    .transform((state) => applicantDocumentStateMapping[state]),
});

interface FinalEvalDialogProps {
  applicantId: number;
  close: () => void;
  isOpen: boolean;
}

export const FinalEvalDialog = ({ isOpen, close, applicantId }: FinalEvalDialogProps) => {
  const openAlertDialog = useAlertDialog();

  const mutation = useToastedMutation({
    mutationFn: patchApplicant,
    successText: '최종 서류 평가를 제출했어요.',
  });

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(finalEvalFormSchema),
  });

  const [loading, startLoading] = useLoading();

  const onSubmit: SubmitHandler<z.infer<typeof finalEvalFormSchema>> = async ({ finalState }) => {
    // TODO: 멤버 조회 스키마 정상화 이후에 모든 멤버가 각자 서류 평가를 제출했는지 확인하는 로직이 들어가야 함
    const closeWithTrue = await openAlertDialog({
      title: '정말 최종 서류 평가를 제출할까요?',
      content: '최종 서류 평가는 나중에 다시 수정할 수 있어요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (!closeWithTrue) {
      return;
    }

    const { success } = await startLoading(
      mutation.mutateWithToast({ applicantId, data: { state: finalState } }),
    );

    if (success) {
      close();
    }
  };

  return (
    <Dialog closeableWithOutside={true} onClose={close} open={isOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Dialog.Header onClickCloseButton={close}>
          <Dialog.Title>최종 서류 평가 제출</Dialog.Title>
        </Dialog.Header>
        <Dialog.Content className="flex flex-col gap-4">
          다른 평가자의 상세 평가는 서류 평가 화면에서 확인할 수 있어요. <br /> 최종 서류 결과는
          개별 평가자의 평가결과와 별도로 지원자 상태에 저장돼요.
          <Controller
            control={control}
            name="finalState"
            render={({ field }) => (
              <Select
                className="w-fit"
                items={applicantDocumentKoreanStates}
                onValueChange={field.onChange}
                placeholder="최종 합/불 여부"
                size="lg"
                value={field.value}
                variant="dimmed"
              />
            )}
          />
        </Dialog.Content>
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={close} type="button" variant="secondary">
            취소
          </Dialog.Button>
          <Dialog.Button loading={loading} type="submit" variant="primary">
            제출
          </Dialog.Button>
        </Dialog.ButtonGroup>
      </form>
    </Dialog>
  );
};
