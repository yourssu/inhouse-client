import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { Suspense, useState } from 'react';
import { z } from 'zod';

import type { MailTemplateDetail } from '@/apis/mails/schema';
import type { VariableTypeName } from '@/apis/mails/schema';
import type {
  VariableTab,
  VariableValueType,
} from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { applicantsOption } from '@/apis/applicants/query';
import { mailsQueryKeys, mailTemplateDetailOption } from '@/apis/mails/query';
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
import { useLoadTemplate } from '@/routes/~_auth/~recruit/~mail/hooks/useLoadTemplate';

const MailContent = ({
  initialTemplate,
  loadTemplateLoading,
  onLoadTemplate,
}: {
  initialTemplate: MailTemplateDetail;
  loadTemplateLoading: boolean;
  onLoadTemplate: () => void;
}) => {
  const { mailSelection } = useMailSelectionContext();
  const [formData] = useTemplateFormData(initialTemplate);

  const { data: parts } = useSuspenseQuery(partsOption());
  const { data: activeMembersRes } = useSuspenseQuery(activeMembersOption());
  const activeMembers = activeMembersRes.members;

  const selectedPart = parts.find((p) => p.partName === mailSelection.partName);
  const { data: applicants } = useSuspenseQuery(
    applicantsOption({ partId: selectedPart?.partId, states: ['UNDER_REVIEW'] }),
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
        receivers={receivers}
        templateId={mailSelection.templateId ?? initialTemplate.id}
        variableValues={variableValues}
      />
    ));
  };

  return (
    <VariableContext.Provider value={{ setVariableValue, variableValues }}>
      <PageLayout.Content
        maxWidth="full"
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
          <div className="flex h-full gap-3">
            <div className="flex flex-[10_1_0]">
              <MailPreview
                applicants={receivers}
                formData={formData}
                loadTemplateLoading={loadTemplateLoading}
                onLoadTemplate={onLoadTemplate}
                onVariableClick={handleVariableClick}
              />
            </div>
            <div className="flex max-w-150 flex-[9_1_0] flex-col gap-3">
              <RecipientSelectionPaper
                applicants={applicants}
                bccMembers={bccMembers}
                members={activeMembers}
                receivers={receivers}
                setBccMembers={setBccMembers}
                setReceivers={setReceivers}
              />
              <div className="flex min-h-0 flex-[1_1_0]">
                <MailEditPaper
                  applicants={receivers}
                  formData={formData}
                  members={activeMembers}
                  onVariableTabChange={setVariableTab}
                  variableTab={variableTab}
                />
              </div>
            </div>
          </div>
        </Suspense>
      </PageLayout.Content>
    </VariableContext.Provider>
  );
};

const ResolvedMailContent = ({
  tid,
  loadTemplateLoading,
  onLoadTemplate,
}: {
  loadTemplateLoading: boolean;
  onLoadTemplate: () => void;
  tid: number;
}) => {
  const { data: initialTemplate } = useSuspenseQuery(mailTemplateDetailOption(tid));
  // 템플릿이 갱신되면(updatedAt 변경) MailContent를 리마운트해 formData가 최신 내용으로 초기화되게 한다.
  return (
    <MailContent
      initialTemplate={initialTemplate}
      key={initialTemplate.updatedAt}
      loadTemplateLoading={loadTemplateLoading}
      onLoadTemplate={onLoadTemplate}
    />
  );
};

const RouteComponent = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/mail/new/' });
  const { data: me } = useSuspenseQuery(meOption());
  const { loading: isLoadTemplateLoading, openLoadTemplateDialog } = useLoadTemplate();

  const initialPartName = me.parts?.[0]?.part ?? null;

  const [mailSelection, setMailSelection] = useState<MailSelection>({
    partName: initialPartName === 'Head lead' ? null : initialPartName,
    templateId: search.tid ?? null,
  });

  const handleLoadTemplate = async () => {
    const template = await openLoadTemplateDialog({ currentTemplateId: search.tid });
    if (template) {
      // 같은 템플릿을 다시 불러올 때 tid가 안 바뀌어도 최신 내용으로 갱신되도록 상세 쿼리를 무효화한다.
      await queryClient.invalidateQueries({ queryKey: mailsQueryKeys.templateDetail(template.id) });
      setSearch((prev) => ({ ...prev, tid: template.id }));
      setMailSelection((prev) => ({ ...prev, templateId: template.id }));
    }
  };

  const templateId = search.tid;
  // beforeLoad가 tid 없는 접근을 /recruit/mail로 리다이렉트하므로 여기엔 항상 tid가 있다.
  if (!templateId) {
    return null;
  }

  return (
    <MailSelectionContext.Provider value={{ mailSelection, setMailSelection }}>
      <ResolvedMailContent
        key={`${mailSelection.partName ?? 'all'}-${templateId}`}
        loadTemplateLoading={isLoadTemplateLoading}
        onLoadTemplate={handleLoadTemplate}
        tid={templateId}
      />
    </MailSelectionContext.Provider>
  );
};

export const Route = createFileRoute('/_auth/recruit/mail/new/')({
  validateSearch: z.object({
    tid: z.number().optional(),
  }),
  beforeLoad: ({ search }) => {
    // tid 없이 /recruit/mail/new로 직접 접근한 경우 메일 목록으로 되돌린다.
    if (!search.tid) {
      throw redirect({ to: '/recruit/mail' });
    }
  },
  component: () => (
    <Suspense>
      <RouteComponent />
    </Suspense>
  ),
});
