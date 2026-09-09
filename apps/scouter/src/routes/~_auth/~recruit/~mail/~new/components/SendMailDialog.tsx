import { useMutation } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { DatePicker } from '@yourssu-inhouse/interior';
import { Dialog } from '@yourssu-inhouse/interior';
import { Fieldset } from '@yourssu-inhouse/interior';
import { SegmentedControl } from '@yourssu-inhouse/interior';
import { TextField } from '@yourssu-inhouse/interior';
import { useToast } from '@yourssu-inhouse/interior';
import {
  addMinutes,
  endOfDay,
  isAfter,
  isSameDay,
  isValid,
  set,
  startOfMinute,
  subDays,
} from 'date-fns';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { SwitchCase } from 'react-simplikit';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';
import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { postMailReservation } from '@/apis/mails';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { buildReservationPayload } from '@/routes/~_auth/~recruit/~mail/~new/utils/buildMailPayload';
import { useMailAnalytics } from '@/routes/~_auth/~recruit/~mail/analytics';
import { handleError } from '@/utils/error';

interface SendMailDialogProps {
  bccMembers: ActiveMemberType[];
  close: () => void;
  formData: TemplateFormData;
  isOpen: boolean;
  receivers: ApplicantType[];
  selectedPartId?: number;
  templateId: number;
  variableValues: Record<VariableItem['id'], VariableValueType>;
}

interface SendMailFormValues {
  date: Date | null;
  time: string;
  type: 'now' | 'reserve';
}

export const SendMailDialog = ({
  isOpen,
  close,
  formData,
  receivers,
  bccMembers,
  variableValues,
  templateId,
  selectedPartId,
}: SendMailDialogProps) => {
  const trackMailEvent = useMailAnalytics();
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting: loading },
    handleSubmit,
  } = useForm<SendMailFormValues>({
    defaultValues: { date: null, time: '00:00', type: 'reserve' },
  });
  const [type, date, time] = useWatch({ control, name: ['type', 'date', 'time'] });
  const toast = useToast();
  const mutation = useMutation({ mutationFn: postMailReservation });

  const disabled = loading || (type === 'reserve' && (!date || !time));
  // 분 단위 입력이므로 현재 시각(분) + 1분부터 예약할 수 있어요.
  const earliestReservationDate = addMinutes(startOfMinute(new Date()), 1);

  const handleConfirm = handleSubmit(async ({ date, time, type }) => {
    let sendDate = new Date();
    if (type === 'reserve') {
      if (!date) {
        return;
      }
      const [hours, minutes] = time.split(':').map(Number);
      sendDate = set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
    }
    const reservationTime = sendDate.toISOString();

    const sendMode: 'immediate' | 'scheduled' = type === 'now' ? 'immediate' : 'scheduled';
    trackMailEvent('mail_send_click', {
      ...(selectedPartId === undefined
        ? { target_scope: 'all' as const }
        : { part_id: selectedPartId, target_scope: 'part' as const }),
      bcc_count: bccMembers.length,
      recipient_count: receivers.length,
      send_mode: sendMode,
      template_id: templateId,
    });
    const result = await mutation
      .mutateAsync(
        buildReservationPayload({
          templateId,
          reservationTime,
          receivers,
          bccMembers,
          variables: formData.variables,
          variableValues,
        }),
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
      });

    if (result.success) {
      trackMailEvent('mail_send_request_complete', {
        ...(selectedPartId === undefined
          ? { target_scope: 'all' as const }
          : { part_id: selectedPartId, target_scope: 'part' as const }),
        bcc_count: bccMembers.length,
        recipient_count: receivers.length,
        send_mode: sendMode,
        template_id: templateId,
      });
    }
    toast[result.success ? 'success' : 'error'](result.message);
    close();
  });

  return (
    <Dialog onClose={close} open={isOpen}>
      <form onSubmit={handleConfirm}>
        <Dialog.Header>
          <Dialog.Title>발송하기</Dialog.Title>
        </Dialog.Header>

        <Dialog.Content className="w-150">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SegmentedControl
                className="mb-2.5 w-full"
                items={['예약 발송하기', '즉시 발송하기']}
                onValueChange={(value) => {
                  field.onChange(value === '예약 발송하기' ? 'reserve' : 'now');
                  clearErrors('time');
                }}
                value={field.value === 'reserve' ? '예약 발송하기' : '즉시 발송하기'}
              />
            )}
          />

          <div className="min-h-21">
            <SwitchCase
              caseBy={{
                reserve: () => (
                  <Fieldset
                    help={
                      errors.time && <FieldErrorMessage>{errors.time.message}</FieldErrorMessage>
                    }
                    label="발송 일시"
                  >
                    <div className="flex gap-2">
                      <Controller
                        control={control}
                        name="date"
                        render={({ field }) => (
                          <DatePicker
                            className="w-48"
                            minDate={
                              // DatePicker는 minDate 자체를 제외하므로 전날 마지막 시각을 전달해요.
                              endOfDay(subDays(earliestReservationDate, 1))
                            }
                            onChange={field.onChange}
                            size="lg"
                            value={field.value}
                            variant="outline"
                          />
                        )}
                        rules={{ deps: ['time'] }}
                      />
                      <Controller
                        control={control}
                        name="time"
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            aria-invalid={fieldState.invalid}
                            aria-label="발송 시간"
                            className="text-greyOpacity800 w-48"
                            invalid={fieldState.invalid}
                            min={
                              // 가장 이른 예약 가능 날짜에만 시간을 제한하고, 이후 날짜는 00:00부터 허용해요.
                              date && isSameDay(date, earliestReservationDate)
                                ? formatTemplates['23:00'](earliestReservationDate)
                                : undefined
                            }
                            size="lg"
                            type="time"
                            variant="outline"
                          />
                        )}
                        rules={{
                          validate: (value, { date, type }) => {
                            if (type === 'now') {
                              return true;
                            }
                            if (
                              !date ||
                              !isValid(date) ||
                              !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)
                            ) {
                              return '발송 일시를 올바르게 입력해 주세요.';
                            }
                            const [hours, minutes] = value.split(':').map(Number);
                            const reservationDate = set(date, {
                              hours,
                              minutes,
                              seconds: 0,
                              milliseconds: 0,
                            });
                            return (
                              isAfter(reservationDate, new Date()) ||
                              '현재 시각 이후로 예약해 주세요.'
                            );
                          },
                        }}
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
          <Dialog.Button disabled={loading} onClick={close} type="button" variant="secondary">
            취소
          </Dialog.Button>
          <Dialog.Button disabled={disabled} loading={loading} type="submit" variant="primary">
            발송하기
          </Dialog.Button>
        </Dialog.ButtonGroup>
      </form>
    </Dialog>
  );
};
