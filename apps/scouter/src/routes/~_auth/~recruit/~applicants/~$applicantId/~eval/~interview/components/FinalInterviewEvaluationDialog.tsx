import { Dialog } from '@yourssu-inhouse/interior';
import { IoMdAlert } from 'react-icons/io';

import type { InterviewEvaluatorStatus } from '@/apis/interviews/evaluations/schema';

import { patchApplicant } from '@/apis/applicants';
import { applicantsQueryKeys } from '@/apis/applicants/query';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface FinalInterviewEvaluationDialogProps {
  applicantId: number;
  applicantName: string;
  close: (submitted: boolean) => void;
  isOpen: boolean;
  unsubmittedEvaluators: InterviewEvaluatorStatus[];
}

export const FinalInterviewEvaluationDialog = ({
  applicantId,
  applicantName,
  close,
  isOpen,
  unsubmittedEvaluators,
}: FinalInterviewEvaluationDialogProps) => {
  const { invalidate } = useQueryInvalidation(applicantsQueryKeys.all());

  const { isPending: isPassPending, mutateWithToast: passMutateWithToast } = useToastedMutation({
    errorText: '최종 면접 결과를 저장하지 못했어요.',
    mutationFn: () => patchApplicant({ applicantId, data: { state: 'FINAL_ACCEPTED' } }),
    onSuccess: async () => {
      await invalidate();
      close(true);
    },
    successText: '최종 면접 합격으로 결정했어요.',
  });

  const { isPending: isFailPending, mutateWithToast: failMutateWithToast } = useToastedMutation({
    errorText: '최종 면접 결과를 저장하지 못했어요.',
    mutationFn: () => patchApplicant({ applicantId, data: { state: 'INTERVIEW_REJECTED' } }),
    onSuccess: async () => {
      await invalidate();
      close(true);
    },
    successText: '최종 면접 불합격으로 결정했어요.',
  });

  const isPending = isPassPending || isFailPending;

  const handleClose = () => {
    if (!isPending) {
      close(false);
    }
  };

  return (
    <Dialog
      closeableWithOutside={!isPending}
      contentProps={{ 'aria-labelledby': 'final-interview-evaluation-title' }}
      onClose={handleClose}
      open={isOpen}
    >
      <Dialog.Header>
        <h2 className="text-xl font-semibold" id="final-interview-evaluation-title">
          최종 면접 평가
        </h2>
      </Dialog.Header>
      <Dialog.Content className="flex min-w-[420px] flex-col gap-4">
        <p className="text-neutral font-medium">
          <span className="text-violet600">{applicantName}</span>님의 최종 면접 결과를 결정해요.
        </p>

        {unsubmittedEvaluators.length > 0 && (
          <section className="bg-orange50 rounded-10 flex flex-col px-4 py-3">
            <h3 className="text-orange600 flex items-center gap-1.5 font-semibold">
              <IoMdAlert aria-hidden className="size-5 shrink-0" />
              <span>아직 평가를 제출하지 않은 평가자가 있어요.</span>
            </h3>
            <ul className="text-neutralSubtle flex flex-col text-sm" role="list">
              {unsubmittedEvaluators.map(({ name, memberId }) => (
                <li key={memberId}>{name}</li>
              ))}
            </ul>
          </section>
        )}
      </Dialog.Content>
      <Dialog.ButtonGroup>
        <Dialog.Button disabled={isPending} onClick={handleClose} type="button" variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button
          className="whitespace-nowrap"
          disabled={isPending}
          loading={isFailPending}
          onClick={() => failMutateWithToast()}
          type="button"
          variant="danger"
        >
          최종 불합격
        </Dialog.Button>
        <Dialog.Button
          className="whitespace-nowrap"
          disabled={isPending}
          loading={isPassPending}
          onClick={() => passMutateWithToast()}
          type="button"
          variant="primary"
        >
          최종 합격
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
