import { objectEntries } from '@yourssu-inhouse/inhouse-utils/object';

import type { Member } from '@/apis/members/schema';
import type { GroupedHistoryItem } from '@/routes/~_auth/~members/~list/components/MemberHistoryTooltip/type';

export const groupHistory = (history: Member['history']) => {
  if (history.length === 0) {
    return {
      start: null,
      latest: null,
      semesterCount: 0,
      history: [],
    };
  }

  const entries = history
    .map((item) => objectEntries(item)[0])
    .map(([semester, status]) => ({
      semester,
      status,
    }));

  const grouped = entries.reduce<GroupedHistoryItem[]>((acc, entry) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.status === entry.status) {
      return [
        ...acc.slice(0, -1),
        { ...lastGroup, semesters: [...lastGroup.semesters, entry.semester] },
      ];
    }
    return [...acc, { status: entry.status, semesters: [entry.semester] }];
  }, []);

  return {
    start: history[0],
    latest: history[history.length - 1],
    semesterCount: entries.length,
    history: grouped,
  };
};

export const formatSemesterRange = (semesters: string[]): string => {
  if (semesters.length === 0) {
    return '';
  }
  if (semesters.length === 1) {
    return semesters[0];
  }
  return `${semesters[0]} ~ ${semesters[semesters.length - 1]}`;
};
