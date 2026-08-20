import { HoverTooltip, type HoverTooltipContentProps } from '@yourssu-inhouse/interior';

import type { ApplicantType } from '@/apis/applicants/schema';

import { partNameKo } from '@/types/parts';

interface ScheduleTooltipProps {
  applicant: Pick<ApplicantType, 'name' | 'part'>;
  children: React.ReactElement;
  contentProps?: HoverTooltipContentProps;
  details: React.ReactNode;
  left?: string;
}

export const ScheduleTooltip = ({
  applicant,
  children,
  contentProps,
  details,
  left,
}: ScheduleTooltipProps) => (
  <HoverTooltip
    content={
      <div className="flex flex-col gap-4.5">
        <div className="flex items-baseline gap-1.5">
          <div className="text-17 font-semibold">{applicant.name}</div>
          <div className="text-neutralSubtle text-13">{partNameKo[applicant.part]} 파트</div>
        </div>
        <div className="flex flex-col gap-2">
          {details}
          {left != null && <span className="text-violet600 text-13 mt-2.5">{left}</span>}
        </div>
      </div>
    }
    contentProps={{
      align: 'start',
      ...contentProps,
    }}
    noArrow
  >
    {children}
  </HoverTooltip>
);

type ScheduleTooltipItemProps = React.PropsWithChildren<{
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
}>;

const ScheduleTooltipItem = ({ children, icon: Icon, right }: ScheduleTooltipItemProps) => {
  const content = (
    <div className="flex items-center gap-2">
      <Icon className="text-neutralDisabled size-6" />
      <span>{children}</span>
    </div>
  );

  if (right == null) {
    return content;
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {content}
      {right}
    </div>
  );
};

ScheduleTooltip.Item = ScheduleTooltipItem;
