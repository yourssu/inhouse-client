import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { Suspense, useState } from 'react';
import { z } from 'zod';

import type { VariableTypeName } from '@/apis/mails/schema';
import type { MailTemplateDetail } from '@/apis/mails/schema';
import type {
  VariableTab,
  VariableValueType,
} from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { applicantsOption } from '@/apis/applicants/query';
import { mailTemplateDetailOption } from '@/apis/mails/query';
import { activeMembersOption, meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { useTemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import { useSearchState } from '@/hooks/useSearchState';
import { MailEditPaper } from '@/routes/~_auth/~recruit/~mail/~new/components/MailEditPaper';
import { MailPreview } from '@/routes/~_auth/~recruit/~mail/~new/components/MailPreview';
import { RecipientSelectionPaper } from '@/routes/~_auth/~recruit/~mail/~new/components/RecipientSelectionPaper';
import { SendMailDialog } from '@/routes/~_auth/~recruit/~mail/~new/components/SendMailDialog';
import { TestMailDialog } from '@/routes/~_auth/~recruit/~mail/~new/components/TestMailDialog';
import { VariableContext } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/context';
import { WarningCallout } from '@/routes/~_auth/~recruit/~mail/~new/components/WarningCallout';
import {
  type MailSelection,
  MailSelectionContext,
  useMailSelectionContext,
} from '@/routes/~_auth/~recruit/~mail/~new/context';
import { useMailValidation } from '@/routes/~_auth/~recruit/~mail/~new/hooks/useMailValidation';

const MailContent = ({ initialTemplate }: { initialTemplate?: MailTemplateDetail }) => {
  const { mailSelection } = useMailSelectionContext();
  const [formData, setFormData] = useTemplateFormData(initialTemplate);

  const { data: parts } = useSuspenseQuery(partsOption());
  const { data: activeMembersRes } = useSuspenseQuery(activeMembersOption());
  const activeMembers = activeMembersRes.members;

  const selectedPart = parts.find((p) => p.partName === mailSelection.partName);
  const { data: applicants } = useSuspenseQuery(
    applicantsOption({ partId: selectedPart?.partId, state: 'UNDER_REVIEW' }),
  );

  const [receivers, setReceivers] = useState(applicants);
  const [bccMembers, setBccMembers] = useState(
    activeMembers.filter((m) => {
      const isSelectedPartMember = m.parts.some((p) => p.part === mailSelection.partName);
      const isHrLead = m.parts.some((p) => p.part === 'HR') && m.role === 'Lead';
      return isSelectedPartMember || isHrLead;
    }),
  );
  const [variableValues, setVariableValues] = useState<Record<string, VariableValueType>>({});
  const setVariableValue = (key: string, value: VariableValueType) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  };

  const [mainTab, setMainTab] = useState<'메일' | '변수'>('메일');
  const [variableTab, setVariableTab] = useState<VariableTab>('전체');

  const handleVariableClick = (type: VariableTypeName) => {
    const map = {
      APPLICANT: '사람',
      DATE: '날짜',
      LINK: '링크',
      PERSON: '사람',
      TEXT: '텍스트',
      PARTNAME: '전체',
    } as const satisfies Record<VariableTypeName, VariableTab>;

    setMainTab('변수');
    setVariableTab(map[type]);
  };

  const { isSendDisabled, warningMessage } = useMailValidation({
    formData,
    receivers,
    variableValues,
  });

  const handleTestSend = async () => {
    overlay.open(({ isOpen, close }) => (
      <TestMailDialog
        close={close}
        formData={formData}
        isOpen={isOpen}
        partName={mailSelection.partName}
        variableValues={variableValues}
      />
    ));
  };

  const handleSend = async () => {
    overlay.open(({ isOpen, close }) => (
      <SendMailDialog
        bccMembers={bccMembers}
        close={close}
        formData={formData}
        isOpen={isOpen}
        partName={mailSelection.partName}
        receivers={receivers}
        variableValues={variableValues}
      />
    ));
  };

  return (
    <VariableContext.Provider value={{ setVariableValue, variableValues }}>
      <PageLayout.Content
        right={
          <div className="flex items-center gap-4">
            {warningMessage && <WarningCallout message={warningMessage} />}
            <div className="flex gap-2">
              <Button
                disabled={isSendDisabled}
                onClick={handleTestSend}
                size="lg"
                variant="subPrimary"
              >
                테스트 발송하기
              </Button>
              <Button disabled={isSendDisabled} onClick={handleSend} size="lg" variant="primary">
                발송하기
              </Button>
            </div>
          </div>
        }
        title="메일 발송"
      >
        <Suspense>
          <div className="flex h-full flex-col gap-3">
            <div className="pr-153">
              <RecipientSelectionPaper
                applicants={applicants}
                bccMembers={bccMembers}
                members={activeMembers}
                receivers={receivers}
                setBccMembers={setBccMembers}
                setReceivers={setReceivers}
              />
            </div>
            <div className="flex flex-[1_1_0] gap-3">
              <div className="flex flex-[10_1_0]">
                <MailEditPaper
                  applicants={receivers}
                  formData={formData}
                  mainTab={mainTab}
                  members={activeMembers}
                  onMainTabChange={setMainTab}
                  onVariableTabChange={setVariableTab}
                  setFormData={setFormData}
                  variableTab={variableTab}
                />
              </div>
              <div className="flex max-w-150 flex-[9_1_0]">
                <MailPreview
                  applicants={receivers}
                  formData={formData}
                  onVariableClick={handleVariableClick}
                />
              </div>
            </div>
          </div>
        </Suspense>
      </PageLayout.Content>
    </VariableContext.Provider>
  );
};

const ResolvedMailContent = ({ tid }: { tid: number }) => {
  const { data: initialTemplate } = useSuspenseQuery(mailTemplateDetailOption(tid));
  return <MailContent initialTemplate={initialTemplate} />;
};

const RouteComponent = () => {
  const [search] = useSearchState({ from: '/_auth/recruit/mail/new/' });
  const { data: me } = useSuspenseQuery(meOption());

  const initialPartName = me.parts?.[0]?.part ?? null;

  const [mailSelection, setMailSelection] = useState<MailSelection>({
    partName: initialPartName === 'Head lead' ? null : initialPartName,
    templateId: search.tid ?? null,
  });

  return (
    <MailSelectionContext.Provider value={{ mailSelection, setMailSelection }}>
      {search.tid ? (
        <ResolvedMailContent key={mailSelection.partName ?? 'all'} tid={search.tid} />
      ) : (
        <MailContent key={mailSelection.partName ?? 'all'} />
      )}
    </MailSelectionContext.Provider>
  );
};

export const Route = createFileRoute('/_auth/recruit/mail/new/')({
  validateSearch: z.object({
    tid: z.number().optional(),
  }),
  component: () => (
    <Suspense>
      <RouteComponent />
    </Suspense>
  ),
});
