import { Dialog } from '@yourssu-inhouse/interior';

import { patchApplicantAssignment } from '@/apis/applicants';
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
    mutationFn: () =>
      patchApplicantAssignment({ applicantId, data: { assignmentResult: 'FAILED' } }),
    onSuccess: () => {
      invalidate();
      closeAsTrue();
    },
    successText: '과제 전형 불합격',
  });

  const { isPending: isPassPending, mutateWithToast: passMutateWithToast } = useToastedMutation({
    mutationFn: () =>
      patchApplicantAssignment({ applicantId, data: { assignmentResult: 'PASSED' } }),
    onSuccess: () => {
      invalidate();
      closeAsTrue();
    },
    successText: '과제 전형 합격',
  });

  const isPending = isFailPending || isPassPending;

  return (
    <>
      <Dialog.Content className="flex flex-col">
        <p>{`${applicantName}의 과제 평가 결과를 선택해요.`}</p>
        <p>{`지원자가 과제 평가에 합격하면\n지원자에 대한 면접 평가를 진행할 수 있어요.`}</p>
        <p>지원자의 과제 평가 결과는 평가 후에도 수정 가능해요.</p>
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
