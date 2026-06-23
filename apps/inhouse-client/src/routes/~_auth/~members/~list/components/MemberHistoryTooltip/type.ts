import type { MemberState } from '@/apis/members/schema';

export type GroupedHistoryItem = {
  semesters: string[];
  status: MemberState;
};
