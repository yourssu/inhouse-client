import { useSuspenseQuery } from '@tanstack/react-query';
import { Select, type SelectProps } from '@yourssu-inhouse/interior';
import { assert } from 'es-toolkit';

import type { Merge } from '@/types/misc';

import { partsOption } from '@/apis/parts/query';
import { type PartNameType, type PartType as PartTypeOrigin } from '@/apis/parts/schema';
import { partNameKo } from '@/types/parts';

type PartType<LeadExcluded extends boolean> = LeadExcluded extends true
  ? Merge<PartTypeOrigin, { partName: Exclude<PartNameType, 'Head lead'> }>
  : PartTypeOrigin;

type PartSelectProps<LeadExcluded extends boolean> = {
  omitHeadLead?: LeadExcluded;
  onValueChange?: (v: PartType<LeadExcluded>) => void;
  placeholder?: string;
  value?: PartType<LeadExcluded>['partName'];
};

type Props<LeadExcluded extends boolean> = Omit<
  Merge<SelectProps<PartType<LeadExcluded>['partName']>, PartSelectProps<LeadExcluded>>,
  'items'
>;

export const PartSelect = <LeadExcluded extends boolean = false>({
  onValueChange,
  value,
  omitHeadLead = false as LeadExcluded,
  placeholder = '파트',
  ...props
}: Props<LeadExcluded>) => {
  const { data: parts } = useSuspenseQuery(partsOption());

  const partOptions = omitHeadLead ? parts.filter((p) => p.partName !== 'Head lead') : parts;

  return (
    <Select
      {...props}
      items={partOptions.map((p) => partNameKo[p.partName])}
      onValueChange={(v) => {
        const part = partOptions.find(
          (p) => partNameKo[p.partName] === v,
        ) as PartType<LeadExcluded>;
        assert(!!part, `파트를 찾을 수 없어요: ${v}`);
        onValueChange?.(part);
      }}
      placeholder={placeholder}
      value={value ? partNameKo[value] : undefined}
    />
  );
};
