import { useMutation } from '@tanstack/react-query';
import { DatePicker } from '@yourssu-inhouse/interior';
import { Dialog } from '@yourssu-inhouse/interior';
import { Fieldset } from '@yourssu-inhouse/interior';
import { SegmentedControl } from '@yourssu-inhouse/interior';
import { TextField } from '@yourssu-inhouse/interior';
import { useToast } from '@yourssu-inhouse/interior';
import { set } from 'date-fns';
import { useState } from 'react';
import { SwitchCase, useLoading } from 'react-simplikit';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { PartNameType } from '@/apis/parts/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';
import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { postMailReservation } from '@/apis/mails';
import { buildMailPayload } from '@/routes/~_auth/~recruit/~mail/~new/utils/buildMailPayload';
import { handleError } from '@/utils/error';

interface SendMailDialogProps {
  bccMembers: ActiveMemberType[];
  close: () => void;
  formData: TemplateFormData;
  isOpen: boolean;
  partName: Exclude<PartNameType, 'Head lead'> | null;
  receivers: ApplicantType[];
  variableValues: Record<VariableItem['id'], VariableValueType>;
}

export const SendMailDialog = ({
  isOpen,
  close,
  formData,
  receivers,
  bccMembers,
  variableValues,
  partName,
}: SendMailDialogProps) => {
  const [type, setType] = useState<'now' | 'reserve'>('reserve');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>('00:00');
  const [loading, startLoading] = useLoading();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: postMailReservation });

  const disabled = type === 'reserve' && (!date || !time);

  const handleConfirm = async () => {
    if (disabled) {
      return;
    }

    const reservationTime = (() => {
      if (type === 'now' || !date) {
        return new Date().toISOString();
      }
      const [hours, minutes] = time.split(':').map(Number);
      return set(date, { hours, minutes, seconds: 0, milliseconds: 0 }).toISOString();
    })();

    const bccEmailAddresses = bccMembers.map((m) => m.email);

    const result = await startLoading(
      Promise.all(
        receivers.map((receiver) =>
          mutation.mutateAsync({
            ...buildMailPayload({
              formData,
              variableValues,
              partName,
              recipientName: receiver.name,
            }),
            bccEmailAddresses,
            receiverEmailAddresses: [receiver.email],
            reservationTime,
          }),
        ),
      )
        .then(() => ({
          success: true,
          message: '메일을 발송했어요.',
        }))
        .catch(async (e) => {
          const { type: errorType, message } = handleError(e);
          return {
            success: false,
            message: errorType === 'KyHTTPError' ? await message() : message,
          };
        }),
    );

    toast[result.success ? 'success' : 'error'](result.message);
    close();
  };

  return (
    <Dialog closeableWithOutside onClose={close} open={isOpen}>
      <Dialog.Header onClickCloseButton={close}>
        <Dialog.Title>발송하기</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content className="w-[600px]">
        <SegmentedControl
          className="mb-2.5 w-full"
          items={['예약 발송하기', '즉시 발송하기']}
          onValueChange={(val) => {
            if (val === '예약 발송하기') {
              setType('reserve');
            } else {
              setType('now');
            }
          }}
          value={type === 'reserve' ? '예약 발송하기' : '즉시 발송하기'}
        />

        <div className="h-21">
          <SwitchCase
            caseBy={{
              reserve: () => (
                <Fieldset label="발송 일시">
                  <div className="flex gap-2">
                    <DatePicker
                      className="w-48"
                      onChange={(d) => setDate(d)}
                      size="lg"
                      value={date}
                      variant="outline"
                    />
                    {/* Todo: TimePicker 컴포넌트 만들기 */}
                    <TextField
                      className="text-greyOpacity800 w-48"
                      onChange={(e) => setTime(e.target.value)}
                      size="lg"
                      type="time"
                      value={time}
                      variant="outline"
                    />
                  </div>
                </Fieldset>
              ),
              now: () => (
                <div className="bg-greyOpacity100 rounded-xl p-4">
                  <div className="text-15 text-neutral font-medium">참고해주세요</div>
                  <ul className="text-sm">
                    <li>발송까지 최대 1분 정도 소요될 수 있어요.</li>
                  </ul>
                </div>
              ),
            }}
            value={type}
          />
        </div>
      </Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button onClick={close} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button
          disabled={disabled}
          loading={loading}
          onClick={handleConfirm}
          variant="primary"
        >
          발송하기
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
