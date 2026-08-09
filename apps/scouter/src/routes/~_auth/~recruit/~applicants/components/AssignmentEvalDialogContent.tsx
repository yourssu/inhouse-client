import { Dialog } from '@yourssu-inhouse/interior';

import { patchApplicant } from '@/apis/applicants';
import { applicantsQueryKeys } from '@/apis/applicants/query';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface AssignmentEvalDialogContentProps {
  applicantId: number;
  applicantName: string;
  closeAsTrue: () => void;
}

export const AssignmentEvalDialogContent = ({
  applicantName,
  applicantId,
  closeAsTrue,
}: AssignmentEvalDialogContentProps) => {
  const { invalidate } = useQueryInvalidation(applicantsQueryKeys.all());

  const { isPending: isFailPending, mutateWithToast: failMutateWithToast } = useToastedMutation({
    mutationFn: () => patchApplicant({ applicantId, data: { state: 'ASSIGNMENT_REJECTED' } }),
    onSuccess: () => {
      invalidate();
      closeAsTrue();
    },
    successText: '과제 전형 불합격',
  });

  const { isPending: isPassPending, mutateWithToast: passMutateWithToast } = useToastedMutation({
    mutationFn: () => patchApplicant({ applicantId, data: { state: 'ASSIGNMENT_ACCEPTED' } }),
    onSuccess: () => {
      invalidate();
      closeAsTrue();
    },
    successText: '과제 전형 합격',
  });

  const isPending = isFailPending || isPassPending;

  return (
    <>
      <Dialog.Content className="flex flex-col gap-2">
        <p className="text-neutral font-medium">
          <span className="text-violet600">{applicantName}</span>님의 과제 평가 결과를 선택해요.
        </p>
        <p className="text-neutralSubtle text-xs">
          지원자의 과제 평가 결과는 면접 평가 전까지 다시 수정 가능해요.
        </p>
      </Dialog.Content>
      <Dialog.ButtonGroup>
        <Dialog.Button
          className="bg-red600 hover:bg-red700 text-white"
          loading={isPending}
          onClick={() => failMutateWithToast()}
          variant="secondary"
        >
          불합격
        </Dialog.Button>
        <Dialog.Button loading={isPending} onClick={() => passMutateWithToast()} variant="primary">
          합격
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
