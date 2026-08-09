import type { Merge } from '@yourssu-inhouse/inhouse-utils/type';

import { useSuspenseQueries } from '@tanstack/react-query';
import { Select, type SelectProps } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { assert } from 'es-toolkit';

import type { SemesterType } from '@/apis/semesters/schema';

import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { formatRecruitingSemester } from '@/utils/semester';

type SemesterSelectProps = Omit<
  Merge<SelectProps<string>, { onValueChange?: (v: SemesterType) => void }>,
  'items' | 'placeholder'
>;

export const SemesterSelect = ({ onValueChange, className, ...props }: SemesterSelectProps) => {
  const [{ data: now }, { data: semesters }] = useSuspenseQueries({
    queries: [semestersNowOption(), semestersOption()],
  });

  const sortedSemesters = semesters
    // 최신 학기부터 연도와 학기순으로 정렬해요.
    .toSorted((a, b) => b.year - a.year || b.term - a.term);

  const availableSemesters = sortedSemesters.slice(
    sortedSemesters.findIndex(({ semesterId }) => semesterId === now.semesterId),
  );
  const semesterOptions = availableSemesters.map(formatRecruitingSemester);

  return (
    <Select
      {...props}
      className={cn(className, 'w-fit')}
      items={semesterOptions}
      onValueChange={(v) => {
        const semester = availableSemesters.find(
          (semester) => formatRecruitingSemester(semester) === v,
        );
        assert(!!semester, `학기를 찾을 수 없어요: ${v}`);
        onValueChange?.(semester);
      }}
      placeholder="학기"
    />
  );
};
