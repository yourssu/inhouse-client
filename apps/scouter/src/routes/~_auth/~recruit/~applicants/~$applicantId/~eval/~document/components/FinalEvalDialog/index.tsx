import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Dialog } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { IoMdAlert } from 'react-icons/io';

import { patchApplicant } from '@/apis/applicants';
import { applicantByIdOption } from '@/apis/applicants/query';
import {
  documentEvaluatorStatusesOption,
  getApplicantDocumentsEvaluationsOption,
} from '@/apis/documents/query';
import { partsOption } from '@/apis/parts/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface FinalEvalDialogProps {
  applicantId: number;
  close: () => void;
  isOpen: boolean;
}

export const FinalEvalDialog = ({ isOpen, close, applicantId }: FinalEvalDialogProps) => {
  const queryClient = useQueryClient();

  const mutation = useToastedMutation({
    mutationFn: patchApplicant,
    successText: '최종 서류 평가를 제출했어요.',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApplicantDocumentsEvaluationsOption(applicantId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: applicantByIdOption(applicantId).queryKey });
    },
  });

  const { data: applicant } = useSuspenseQuery(applicantByIdOption(applicantId));
  const { data: evaluatorStatuses } = useSuspenseQuery(
    documentEvaluatorStatusesOption(applicantId),
  );
  const { data: parts } = useSuspenseQuery(partsOption());
  const part = parts.find((p) => p.partName === applicant.part);
  const hasAssignment = part?.hasAssignment ?? false;

  const [finalState, setFinalState] = useState<'DOCUMENT_ACCEPTED' | 'DOCUMENT_REJECTED' | null>(
    null,
  );

  const unsubmittedEvaluators = evaluatorStatuses.filter(({ status }) => status !== 'SUBMITTED');

  const onSubmit = async (finalState: 'DOCUMENT_ACCEPTED' | 'DOCUMENT_REJECTED') => {
    const { success } = await mutation.mutateWithToast({
      applicantId,
      data: { state: finalState },
    });
    if (success) {
      close();
    }
  };

  return (
    <Dialog closeableWithOutside={true} onClose={close} open={isOpen}>
      <Dialog.Header onClickCloseButton={close}>
        <Dialog.Title>최종 서류 평가</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content className="flex w-100 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-neutral font-medium">
            <span className="text-violet600">{applicant.name}</span>님의 최종 서류 결과를 결정해요.
          </p>
          <p className="text-neutralSubtle text-xs">
            {hasAssignment
              ? '서류 평가 결과는 과제 평가 전까지 다시 수정 가능해요.'
              : '서류 평가 결과는 면접 평가 전까지 다시 수정 가능해요.'}
          </p>
        </div>
        {unsubmittedEvaluators.length > 0 && (
          <section className="bg-orange50 rounded-10 flex flex-col px-4 py-3">
            <h3 className="text-orange600 flex items-center gap-1.5 font-semibold">
              <IoMdAlert aria-hidden className="size-5 shrink-0" />
              <span>아직 평가를 제출하지 않은 평가자가 있어요.</span>
            </h3>
            <ul className="text-neutralSubtle flex flex-col text-sm" role="list">
              {unsubmittedEvaluators.map((evaluator) => (
                <li key={evaluator.memberId}>{evaluator.nickname}</li>
              ))}
            </ul>
          </section>
        )}
      </Dialog.Content>
      <Dialog.ButtonGroup>
        <Dialog.Button
          className="w-[104px]"
          disabled={finalState !== 'DOCUMENT_REJECTED' && mutation.isPending}
          loading={finalState === 'DOCUMENT_REJECTED' && mutation.isPending}
          onClick={() => {
            setFinalState('DOCUMENT_REJECTED');
            onSubmit('DOCUMENT_REJECTED');
          }}
          type="button"
          variant="danger"
        >
          최종 불합격
        </Dialog.Button>
        <Dialog.Button
          className="w-[104px]"
          disabled={finalState !== 'DOCUMENT_ACCEPTED' && mutation.isPending}
          loading={finalState === 'DOCUMENT_ACCEPTED' && mutation.isPending}
          onClick={() => {
            setFinalState('DOCUMENT_ACCEPTED');
            onSubmit('DOCUMENT_ACCEPTED');
          }}
          type="button"
          variant="primary"
        >
          최종 합격
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
