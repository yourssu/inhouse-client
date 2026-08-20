import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';

import type {
  ApplicantDocumentOthersEvaluationsType,
  PartDocumentRubricType,
} from '@/apis/documents/schema';

interface OtherEvaluationsCollapsibleProps {
  isEvaluationDone: boolean;
  othersEvaluations: ApplicantDocumentOthersEvaluationsType;
  rubric: PartDocumentRubricType;
}

export const OtherEvaluationsCollapsible = ({
  othersEvaluations,
  rubric,
  isEvaluationDone,
}: OtherEvaluationsCollapsibleProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root className="flex flex-col" onOpenChange={setOpen} open={open}>
      <Collapsible.Trigger className="text-14 text-neutral flex cursor-pointer items-center justify-between px-4 py-1 font-semibold">
        다른 평가자 보기
        {open ? <MdRemove className="text-16" /> : <MdAdd className="text-16" />}
      </Collapsible.Trigger>

      <Collapsible.Content className="flex flex-col px-4 pt-3 pb-2">
        {othersEvaluations.length === 0 ? (
          <div className="text-neutralSubtle py-2 text-center text-sm">
            아직 다른 평가자가 없어요.
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {othersEvaluations.map(({ evaluatorId, evaluatorName, items }) => {
              const item = items.find(({ sectionId }) => sectionId === rubric.sectionId);

              if (!item) {
                return;
              }

              return (
                <div className="flex flex-col gap-2" key={evaluatorId}>
                  <div className="text-14 flex items-center justify-between">
                    <span className="font-semibold">{evaluatorName}</span>
                    <span className="text-neutralMuted">
                      {isEvaluationDone ? `${item.score} / ${rubric.maxScore}` : '비공개'}
                    </span>
                  </div>
                  <div className="text-14">
                    {isEvaluationDone
                      ? item.memo
                      : '내 평가 제출 후 제출 완료된 다른 평가자의 항목별 점수와 정성평가를 확인할 수 있습니다.'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
