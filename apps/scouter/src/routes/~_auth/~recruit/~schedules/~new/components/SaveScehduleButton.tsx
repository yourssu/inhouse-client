import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Button } from '@yourssu-inhouse/interior';
import { Dialog } from '@yourssu-inhouse/interior';
import { useToast } from '@yourssu-inhouse/interior';
import { compareAsc } from 'date-fns';
import { assert } from 'es-toolkit';
import { useMemo } from 'react';
import { useLoading } from 'react-simplikit';

import type { PartType } from '@/apis/parts/schema';
import type { DraftScheduleType } from '@/types/schedule';

import { deleteInterviewSchedulesByPart, postInterviewSchedules } from '@/apis/schedule';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduleApplicants } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import { partNameKo } from '@/types/parts';
import { handleError } from '@/utils/error';

const SaveDialogContent = ({
  closeAsFalse,
  closeAsTrue,
  draftSchedules,
  selectedPart,
}: {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  draftSchedules: DraftScheduleType[];
  selectedPart: PartType;
}) => {
  const [isLoading, startLoading] = useLoading();
  const toast = useToast();
  const { mutateAsync: mutateDeletePartSchedules } = useMutation({
    mutationFn: deleteInterviewSchedulesByPart,
  });
  const { mutateAsync: mutatePostSchedules } = useMutation({
    mutationFn: postInterviewSchedules,
  });
  const { invalidate: invalidateSchedules } = useQueryInvalidation(['interview', 'schedules']);

  const onSubmit = async () => {
    try {
      await startLoading(
        (async () => {
          // NOTE: post에서 에러 발생 시 delete된 채로 끝나므로 일정을 되돌리는 로직이 필요함
          await mutateDeletePartSchedules(selectedPart.partId);
          await mutatePostSchedules(
            draftSchedules.map((v) => ({
              ...v,
              startTime: v.startTime.toISOString(),
              endTime: v.endTime.toISOString(),
            })),
          );
          await invalidateSchedules();
        })(),
      );
    } catch (e) {
      const { message } = handleError(e);
      toast.error(typeof message === 'string' ? message : await message());
      throw e;
    }
    closeAsTrue();
  };

  return (
    <>
      <Dialog.Content>
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-15 font-semibold">
            {partNameKo[selectedPart.partName]}팀 지원자 일정
          </span>
          {draftSchedules
            .toSorted((a, b) => compareAsc(a.startTime, b.startTime))
            .map((schedule) => (
              <div
                className="bg-greyOpacity100 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
                key={schedule.applicantId}
              >
                <span className="font-semibold">{schedule.applicantName}</span>
                <span className="font-medium">
                  {formatTemplates['1.01 (월) 23:00'](schedule.startTime)} ~{' '}
                  {formatTemplates['23:00'](schedule.endTime)}
                </span>
              </div>
            ))}
        </div>
      </Dialog.Content>
      <Dialog.ButtonGroup>
        <Dialog.Button onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button loading={isLoading} onClick={onSubmit} variant="primary">
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};

export const SaveScehduleButton = () => {
  const navigate = useNavigate();
  const { draftSchedules } = useScheduleCreationContext();

  const openAlertDialog = useAlertDialog();
  const toast = useToast();

  const { applicants, selectedPart } = useScheduleApplicants();

  // 모든 지원자가 일정을 가지고 있는지 확인
  const allApplicantsScheduled = useMemo(() => {
    if (applicants.length === 0) {
      return false;
    }
    const scheduledIds = new Set(draftSchedules.map((s) => s.applicantId));
    return applicants.every((applicant) => scheduledIds.has(applicant.applicantId));
  }, [applicants, draftSchedules]);

  const handleSubmit = async () => {
    assert(!!selectedPart, '선택된 파트가 없어요.');

    const result = await openAlertDialog({
      title: '이대로 면접 일정을 저장할까요?',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <SaveDialogContent
          closeAsFalse={closeAsFalse}
          closeAsTrue={closeAsTrue}
          draftSchedules={draftSchedules}
          selectedPart={selectedPart}
        />
      ),
      customized: true,
    });

    if (result) {
      navigate({
        to: '/recruit/schedules',
      });
      toast.success('면접 일정을 저장했어요');
    }
  };

  return (
    <Button disabled={!allApplicantsScheduled} onClick={handleSubmit} size="lg">
      저장하기
    </Button>
  );
};
