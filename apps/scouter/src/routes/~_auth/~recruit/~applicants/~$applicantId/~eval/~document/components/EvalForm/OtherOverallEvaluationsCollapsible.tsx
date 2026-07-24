import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, Divider, useToast } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';
import { SwitchCase } from 'react-simplikit';

import type { ApplicantDocumentOthersEvaluationsType } from '@/apis/applicants/schema';

interface OtherOverallEvaluationsCollapsibleProps {
  isEvaluationDone: boolean;
  othersEvaluations: ApplicantDocumentOthersEvaluationsType;
}

export const OtherOverallEvaluationsCollapsible = ({
  othersEvaluations,
  isEvaluationDone,
}: OtherOverallEvaluationsCollapsibleProps) => {
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
    <Collapsible.Root
      className="border-grey200 rounded-8 flex flex-col border"
      onOpenChange={onOpenChange}
      open={open}
    >
      <Collapsible.Trigger className="flex cursor-pointer items-center justify-between px-3 py-2">
        다른 평가자 보기 {open ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />}\
      </Collapsible.Trigger>

      <Collapsible.Content>
        <Divider />
        <div className="flex flex-col gap-4 px-3 py-2">
          {othersEvaluations.map(
            ({ evaluatorId, evaluatorName, totalScore, overallComment, result }) => {
              return (
                <div className="flex flex-col gap-2" key={evaluatorId}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{evaluatorName}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{`${totalScore} / 100`}</span>
                      <SwitchCase
                        caseBy={{
                          DOCUMENT_PASS: () => (
                            <Badge color="green" size="sm">
                              서류 합격
                            </Badge>
                          ),
                          DOCUMENT_FAIL: () => (
                            <Badge color="red" size="sm">
                              서류 불합격
                            </Badge>
                          ),
                          PENDING: () => (
                            <Badge color="yellow" size="sm">
                              보류
                            </Badge>
                          ),
                        }}
                        value={result}
                      />
                    </div>
                  </div>
                  <div>{overallComment}</div>
                </div>
              );
            },
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
