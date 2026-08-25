import type { ApplicantType } from '@/apis/applicants/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableTab } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { Paper } from '@/components/Paper';
import { VariableList } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList';

interface MailEditPaperProps {
  applicants: ApplicantType[];
  formData: TemplateFormData;
  members: ActiveMemberType[];
  onVariableTabChange?: (tab: VariableTab) => void;
  variableTab?: VariableTab;
}

export const MailEditPaper = ({
  formData,
  applicants,
  members,
  variableTab,
  onVariableTabChange,
}: MailEditPaperProps) => {
  const applicantNames = applicants.map((a) => a.name);
  const memberNames = members.map((m) => m.nickname);

  return (
    <Paper className="min-h-0 flex-[1_1_0] flex-col pt-3.5">
      <div className="text-lg font-semibold">변수 채우기</div>
      <div className="mt-3.5 overflow-y-auto">
        <VariableList
          applicantNames={applicantNames}
          memberNames={memberNames}
          onTabChange={onVariableTabChange}
          selectedTab={variableTab}
          variables={formData.variables}
        />
      </div>
    </Paper>
  );
};
