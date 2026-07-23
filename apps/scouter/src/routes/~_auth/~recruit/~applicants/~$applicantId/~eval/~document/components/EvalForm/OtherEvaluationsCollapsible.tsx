import * as Collapsible from '@radix-ui/react-collapsible';
import { Divider, useToast } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';

import type { ApplicantDocumentOthersEvaluationsType } from '@/apis/applicants/schema';
import type { PartDocumentRubricType } from '@/apis/parts/schema';

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
  const toast = useToast();

  const onOpenChange = (open: boolean) => {
    if (open && !isEvaluationDone) {
      toast.error('내 평가 제출 후 다른 평가자를 확인할 수 있어요.');

      return;
    }

    setOpen(open);
  };

  return (
    <Collapsible.Root asChild onOpenChange={onOpenChange} open={open}>
      <div className="border-grey200 rounded-8 flex flex-col border">
        <Collapsible.Trigger asChild>
          <button className="flex cursor-pointer items-center justify-between px-3 py-2">
            다른 평가자 보기 {open ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />}
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content asChild>
          <div>
            <Divider />
            <div className="flex flex-col gap-4 px-3 py-2">
              {othersEvaluations.map(({ evaluatorId, evaluatorName, items }) => {
                const item = items.find(({ sectionId }) => sectionId === rubric.sectionId);

                if (!item) {
                  return;
                }

                return (
                  <div className="flex flex-col gap-2" key={evaluatorId}>
                    <div className="flex justify-between">
                      <span className="font-semibold">{evaluatorName}</span>
                      {`${item.score} / ${rubric.maxScore}`}
                    </div>
                    <div>{item.memo}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};
