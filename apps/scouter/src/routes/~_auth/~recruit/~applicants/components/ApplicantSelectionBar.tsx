import { Menu } from '@yourssu-inhouse/interior';
import { BiTransferAlt } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';

import { applicantStates, type ApplicantStateType } from '@/apis/applicants/schema';
import { SelectionBar } from '@/routes/~_auth/~recruit/~applicants/components/SelectionBar';
import { useApplicantSelectionContext } from '@/routes/~_auth/~recruit/~applicants/context';
import { useApplicantsStateMutation } from '@/routes/~_auth/~recruit/~applicants/hooks/useApplicantsStateMutation';

export const ApplicantSelectionBar = () => {
  const { selectedIds, clear } = useApplicantSelectionContext();
  const { changeState, isPending } = useApplicantsStateMutation();

  const handleStateChange = async (state: ApplicantStateType) => {
    const { success } = await changeState({
      applicantIds: Array.from(selectedIds),
      state,
    });
    if (success) {
      clear();
    }
  };

  return (
    <SelectionBar count={selectedIds.size}>
      <Menu>
        <Menu.Trigger asChild>
          <SelectionBar.ActionButton
            icon={<BiTransferAlt className="size-5" />}
            loading={isPending}
          >
            상태 변경
          </SelectionBar.ActionButton>
        </Menu.Trigger>
        <Menu.Content sideOffset={14}>
          {applicantStates.map((state) => (
            <Menu.ButtonItem key={state} onClick={() => handleStateChange(state)}>
              {state}
            </Menu.ButtonItem>
          ))}
        </Menu.Content>
      </Menu>
      <SelectionBar.ActionButton onClick={clear}>
        <MdClose className="size-5" />
      </SelectionBar.ActionButton>
    </SelectionBar>
  );
};
