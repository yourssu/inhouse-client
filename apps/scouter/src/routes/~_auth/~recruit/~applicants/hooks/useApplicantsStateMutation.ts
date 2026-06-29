import { patchApplicant } from '@/apis/applicants';
import { type ApplicantStateType } from '@/apis/applicants/schema';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

type PatchApplicantsStateParams = {
  applicantIds: number[];
  state: ApplicantStateType;
};

export const useApplicantsStateMutation = () => {
  const { invalidate } = useQueryInvalidation(['applicants']);

  const { mutateWithToast, isPending } = useToastedMutation({
    mutationFn: async ({ applicantIds, state }: PatchApplicantsStateParams) => {
      await Promise.all(
        applicantIds.map((applicantId) =>
          patchApplicant({
            applicantId,
            data: { state },
          }),
        ),
      );
    },
    successText: '지원자 상태를 변경했어요.',
  });

  const changeState = async (params: PatchApplicantsStateParams) => {
    const result = await mutateWithToast(params);
    if (result.success) {
      await invalidate();
    }
    return result;
  };

  return { changeState, isPending };
};
