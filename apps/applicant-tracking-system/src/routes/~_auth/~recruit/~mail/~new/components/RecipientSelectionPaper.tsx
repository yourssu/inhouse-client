import { Combobox } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import { Paper } from '@/components/Paper';

interface RecipientSelectionPaperProps {
  applicants: ApplicantType[];
  bccMembers: ActiveMemberType[];
  members: ActiveMemberType[];
  receivers: ApplicantType[];
  setBccMembers: (v: ActiveMemberType[]) => void;
  setReceivers: (v: ApplicantType[]) => void;
}

export const RecipientSelectionPaper = ({
  applicants,
  bccMembers,
  members,
  receivers,
  setBccMembers,
  setReceivers,
}: RecipientSelectionPaperProps) => {
  const [isBccOpen, setIsBccOpen] = useState(false);
  const [isReceiversOpen, setIsReceiversOpen] = useState(false);

  const applicantNames = applicants.map((a) => a.name);
  const receiverNames = receivers.map((a) => a.name);
  const memberNames = members.map((m) => m.nickname);
  const bccNicknames = bccMembers.map((m) => m.nickname);

  return (
    <Paper className="flex gap-4 pt-2.5 pb-4">
      <Combobox
        className={clsx('grow overflow-y-auto', !isReceiversOpen && 'max-h-9.5')}
        items={applicantNames}
        label={`받는사람 (${receivers.length})`}
        onOpenChange={(v) => setIsReceiversOpen(v)}
        onValueChange={(names) => {
          setReceivers(applicants.filter((a) => names.includes(a.name)));
        }}
        placeholder="지원자를 선택해주세요"
        value={receiverNames}
      />
      <Combobox
        className={clsx('grow overflow-y-auto', !isBccOpen && 'max-h-9.5')}
        items={memberNames}
        label={`숨은참조 (${bccMembers.length})`}
        onOpenChange={(v) => setIsBccOpen(v)}
        onValueChange={(nicknames) => {
          setBccMembers(members.filter((m) => nicknames.includes(m.nickname)));
        }}
        placeholder="멤버를 선택해주세요"
        value={bccNicknames}
      />
    </Paper>
  );
};
