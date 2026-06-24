import { useQueryClient } from '@tanstack/react-query';
import { type Editor } from '@tiptap/react';
import { Button } from '@yourssu-inhouse/interior';
import { Tab } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from 'react';
import { SwitchCase, useLoading } from 'react-simplikit';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { MailTemplateDetail } from '@/apis/mails/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { VariableTab } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { mailTemplatesInfiniteOption } from '@/apis/mails/query';
import { MailEditor } from '@/components/MailEditor';
import { Paper } from '@/components/Paper';
import {
  type TemplateFormData,
  transformDetailToFormData,
} from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { LoadTemplateDialog } from '@/routes/~_auth/~recruit/~mail/~new/components/LoadTemplateDialog';
import { VariableList } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList';

interface MailEditPaperProps {
  applicants: ApplicantType[];
  formData: TemplateFormData;
  mainTab?: '메일' | '변수';
  members: ActiveMemberType[];
  onMainTabChange?: (tab: '메일' | '변수') => void;
  onVariableTabChange?: (tab: VariableTab) => void;
  setFormData: Dispatch<SetStateAction<TemplateFormData>>;
  variableTab?: VariableTab;
}

export const MailEditPaper = ({
  formData,
  setFormData,
  applicants,
  members,
  mainTab,
  onMainTabChange,
  variableTab,
  onVariableTabChange,
}: MailEditPaperProps) => {
  const applicantNames = applicants.map((a) => a.name);
  const memberNames = members.map((m) => m.nickname);
  const editorRef = useRef<Editor | null>(null);
  const [editor, setEditorState] = useState<Editor | null>(null);
  const setEditor = useCallback((e: Editor | null) => {
    editorRef.current = e;
    setEditorState(e);
  }, []);

  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();
  const [loading, startLoading] = useLoading();

  const setters = {
    title: useSetStateSelector(setFormData, 'title'),
    content: useSetStateSelector(setFormData, 'content'),
    attachments: useSetStateSelector(setFormData, 'attachments'),
  };

  const handleOpenTemplateDialog = async () => {
    await startLoading(queryClient.fetchInfiniteQuery(mailTemplatesInfiniteOption()));
    const template = await overlay.openAsync<MailTemplateDetail | null>(({ close, isOpen }) => (
      <LoadTemplateDialog onClose={close} open={isOpen} />
    ));
    if (template) {
      const nextFormData = transformDetailToFormData(template);
      setFormData(nextFormData);
      // key 변경으로 ContentEditor를 새 content로 리마운트
      setEditorKey((prev) => prev + 1);
    }
  };

  return (
    <Paper className="min-h-0 flex-[1_1_0] flex-col pt-3.5">
      <Tab
        className="min-h-0 flex-1"
        defaultTab="메일"
        onTabChange={onMainTabChange}
        right={
          <Button
            loading={loading}
            onClick={handleOpenTemplateDialog}
            size="md"
            variant="secondary"
          >
            템플릿 불러오기
          </Button>
        }
        tabs={['메일', '변수']}
        value={mainTab}
      >
        {({ tab }) => {
          return (
            <SwitchCase
              caseBy={{
                메일: () => (
                  <div className="mt-6 h-full">
                    <MailEditor
                      actions={{
                        setTitle: setters.title,
                        setContent: setters.content,
                        setAttachments: setters.attachments,
                        setEditor,
                      }}
                      key={editorKey}
                      state={{
                        title: formData.title,
                        content: formData.content,
                        attachments: formData.attachments,
                        variables: formData.variables,
                        editor,
                      }}
                    >
                      <MailEditor.Title />
                      <MailEditor.Content />
                      {editor && <MailEditor.Toolbar className="pt-4" />}
                    </MailEditor>
                  </div>
                ),
                변수: () => (
                  <div className="mt-6 overflow-y-auto">
                    <VariableList
                      applicantNames={applicantNames}
                      memberNames={memberNames}
                      onTabChange={onVariableTabChange}
                      selectedTab={variableTab}
                      variables={formData.variables}
                    />
                  </div>
                ),
              }}
              value={tab}
            />
          );
        }}
      </Tab>
    </Paper>
  );
};
