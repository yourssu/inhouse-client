import { useSuspenseQueries } from '@tanstack/react-query';
import { assert } from 'es-toolkit';

import type { SemesterType } from '@/apis/semesters/schema';
import type { Merge } from '@/types/misc';

import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { Select, type SelectProps } from '@/components/_ui/Select';

type SemesterSelectProps = Omit<
  Merge<SelectProps<string>, { onValueChange?: (v: SemesterType) => void }>,
  'items' | 'placeholder'
>;

export const SemesterSelect = ({ onValueChange, ...props }: SemesterSelectProps) => {
  const [{ data: now }, { data: semesters }] = useSuspenseQueries({
    queries: [semestersNowOption(), semestersOption()],
  });

  const sortedSemesters = semesters
    // 최신 학기부터 이름순으로 정렬해요.
    .toSorted((a, b) => b.semester.localeCompare(a.semester))
    .map(({ semester }) => semester);

  const semesterOptions = sortedSemesters.slice(
    sortedSemesters.findIndex((v) => v === now.semester),
  );

  return (
    <Select
      {...props}
      items={semesterOptions}
      onValueChange={(v) => {
        const semester = semesters.find(({ semester }) => semester === v);
        assert(!!semester, `학기를 찾을 수 없어요: ${v}`);
        onValueChange?.(semester);
      }}
      placeholder="학기"
    />
  );
};
