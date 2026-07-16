import { objectEntries } from '@yourssu-inhouse/inhouse-utils/object';
import { tv } from '@yourssu-inhouse/interior-tailwind/utils';

import type { Member } from '@/apis/members/schema';

import { groupHistory } from '@/routes/~_auth/~members/~list/components/MemberHistoryTooltip/utils';
import { memberStateKo } from '@/types/member';

interface MemberHistoryBarProps {
  history: Member['history'];
}

const barItem = tv({
  base: 'border-backgroundLevel02 h-full border-r-2 last:border-0',
  variants: {
    status: {
      active: 'bg-blue500',
      inactive: 'bg-grey500',
      completed: 'bg-green500',
      withdrawn: 'bg-red500',
    },
  },
});

const timelineLabel = tv({
  base: 'text-neutralMuted text-tiny absolute font-medium',
  variants: {
    align: {
      left: 'left-0.5',
      right: 'right-0.5',
      center: '-translate-x-1/2',
    },
  },
});

const legendDot = tv({
  base: 'size-1.5 rounded-full',
  variants: {
    status: {
      active: 'bg-blue500',
      inactive: 'bg-grey500',
      completed: 'bg-green500',
      withdrawn: 'bg-red500',
    },
  },
});

export const MemberHistoryBar = ({ history: memberHistory }: MemberHistoryBarProps) => {
  const { history, semesterCount } = groupHistory(memberHistory);

  const entries = memberHistory
    .map((item) => objectEntries(item)[0])
    .map(([semester, status]) => ({
      semester,
      status,
    }));

  const breakPoints = entries
    .map((entry, i) => {
      const isStart = i === 0;
      const isEnd = i === entries.length - 1;
      const isTransition = !isStart && entry.status !== entries[i - 1].status;

      if (!isStart && !isTransition && !isEnd) {
        return undefined;
      }

      return {
        percent: (i / semesterCount) * 100,
        label: entry.semester,
        align: isStart ? 'left' : isTransition ? 'center' : 'right',
      } as const;
    })
    .filter((item) => !!item);

  return (
    <div className="flex flex-col gap-1">
      <div className="bg-grey100 flex h-3 w-full overflow-hidden rounded-full">
        {history.map((group, index) => {
          const widthPercent = (group.semesters.length / semesterCount) * 100;
          return (
            <div
              className={barItem({ status: group.status })}
              key={index}
              style={{ width: `${widthPercent}%` }}
            />
          );
        })}
      </div>
      <div className="relative h-4 w-full px-0.5">
        {breakPoints.map((point) => (
          <span
            className={timelineLabel({ align: point.align })}
            key={point.label}
            style={{
              left: point.align === 'center' ? `${point.percent}%` : undefined,
            }}
          >
            {point.label}
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 px-0.5">
        {objectEntries(memberStateKo).map(([status, label]) => (
          <div
            className="text-tiny text-neutralSubtle flex items-center gap-1 font-medium"
            key={status}
          >
            <span className={legendDot({ status })} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
