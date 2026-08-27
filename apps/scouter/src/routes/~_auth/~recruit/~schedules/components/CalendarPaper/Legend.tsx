import { useSuspenseQuery } from '@tanstack/react-query';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { objectEntries } from '@yourssu-inhouse/inhouse-utils/object';
import { InlineButton } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { startTransition } from 'react';

import { partsOption } from '@/apis/parts/query';
import { useSearchState } from '@/hooks/useSearchState';
import { useScheduleAnalytics } from '@/routes/~_auth/~recruit/~schedules/analytics';
import { divisionColorMap } from '@/types/divisions';
import { partColorMap, partNameKo } from '@/types/parts';

export const PartLegend = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/schedules/' });
  const setPartId = useSetStateSelector(setSearch, 'pid');
  const { data: parts } = useSuspenseQuery(partsOption());
  const trackScheduleEvent = useScheduleAnalytics();

  return (
    <div className="flex items-center gap-1 pt-3">
      {parts
        .filter((part) => part.partName !== 'Head lead')
        .map((part) => {
          const color = partColorMap[part.partName];
          const isActive = search.pid === part.partId;
          return (
            <InlineButton
              className={cn(
                'text-13 flex items-center gap-1.5',
                isActive ? 'text-neutral bg-greyOpacity100 font-medium' : 'text-neutralMuted',
              )}
              key={part.partId}
              onClick={() => {
                trackScheduleEvent(
                  'schedule_part_filter_changed',
                  isActive
                    ? { is_filter_applied: false }
                    : {
                        is_filter_applied: true,
                        selected_part: part.partName,
                        selected_part_id: part.partId,
                      },
                );
                startTransition(() => setPartId(isActive ? undefined : part.partId));
              }}
            >
              <div className="size-1.5 rounded-full" style={{ backgroundColor: color.base }} />
              {partNameKo[part.partName]}
            </InlineButton>
          );
        })}
    </div>
  );
};

export const DivisionLegend = () => {
  return (
    <div className="flex items-center gap-3 pt-3">
      {objectEntries(divisionColorMap).map(([division, color]) => (
        <div className="flex items-center gap-1.5" key={division}>
          <div className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-neutralMuted text-13">{division}</span>
        </div>
      ))}
    </div>
  );
};
