import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLoading } from 'react-simplikit';

import type { PartNameType } from '@/apis/parts/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';
import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { postMailSend } from '@/apis/mails';
import { meOption } from '@/apis/members/query';
import { Dialog } from '@/components/_ui/Dialog';
import { TextField } from '@/components/_ui/TextField';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { buildMailPayload } from '@/routes/~_auth/~recruit/~mail/~new/utils/buildMailPayload';

interface TestMailDialogProps {
  close: () => void;
  formData: TemplateFormData;
  isOpen: boolean;
  partName: Exclude<PartNameType, 'Head lead'> | null;
  variableValues: Record<VariableItem['id'], VariableValueType>;
}

export const TestMailDialog = ({
  close,
  formData,
  isOpen,
  partName,
  variableValues,
}: TestMailDialogProps) => {
  const { data: me } = useSuspenseQuery(meOption());

  const [email, setEmail] = useState(me.email);
  const [loading, startLoading] = useLoading();

  const { mutateWithToast } = useToastedMutation({
    mutationFn: postMailSend,
    successText: '테스트 메일을 발송했어요.',
  });

  const handleSend = async () => {
    if (!email) {
      return;
    }

    const res = await startLoading(
      mutateWithToast({
        ...buildMailPayload({ formData, variableValues, partName }),
        receiverEmailAddresses: [email],
      }),
    );

    if (res.success) {
      close();
    }
  };

  return (
    <Dialog closeableWithOutside onClose={close} open={isOpen}>
      <Dialog.Header onClickCloseButton={close}>
        <Dialog.Title>테스트 메일 발송하기</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className="min-w-80">
          <div className="bg-greyOpacity100 mb-2.5 rounded-xl p-4">
            <div className="text-15 text-neutral font-medium">테스트 메일</div>
            <ul className="text-sm">
              <li>발송까지 최대 1분 정도 소요될 수 있어요.</li>
              <li>받는사람과 숨은참조로는 발송되지 않아요.</li>
              <li>
                사람마다 다르게 지정되는 변수는{' '}
                <code className="mx-0.5">
                  {'{{'}변수이름{'}}'}
                </code>
                으로 표시돼요.
              </li>
            </ul>
          </div>
          <TextField
            defaultValue={email}
            label="받을 이메일"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            size="lg"
            variant="outline"
          />
        </div>
      </Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button onClick={close} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button disabled={!email} loading={loading} onClick={handleSend} variant="primary">
          발송
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
