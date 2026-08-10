import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

export type RequirementCategory = keyof InterviewRequirements;
export type RequirementColor = 'blue' | 'green' | 'grey' | 'yellow';

export const requirementOptionClassNames = {
  blue: 'bg-blueOpacity50 text-blue600',
  green: 'bg-greenOpacity50 text-green600',
  grey: 'bg-greyOpacity50 text-grey600',
  yellow: 'bg-yellow50 text-yellow600',
} as const satisfies Record<RequirementColor, string>;

export const requirementGroupConfigs = [
  {
    color: 'yellow',
    key: 'culture',
    label: 'Culture fit',
  },
  {
    color: 'blue',
    key: 'team',
    label: 'Team fit',
    placeholder: '예: 원활한 팀 커뮤니케이션',
  },
  {
    color: 'green',
    key: 'job',
    label: 'Job fit',
    placeholder: '예: React 기반 웹 개발 경험',
  },
  {
    color: 'grey',
    key: 'other',
    label: '기타',
    placeholder: '예: 정기 활동 참여 가능',
  },
] as const satisfies ReadonlyArray<{
  color: RequirementColor;
  key: RequirementCategory;
  label: string;
  placeholder?: string;
}>;

export const teamJobOtherRequirementCategories = [
  'team',
  'job',
  'other',
] as const satisfies ReadonlyArray<RequirementCategory>;

export type TeamJobOtherRequirementCategory = (typeof teamJobOtherRequirementCategories)[number];

const isTeamJobOtherRequirementCategory = (
  category: RequirementCategory,
): category is TeamJobOtherRequirementCategory =>
  teamJobOtherRequirementCategories.some((candidate) => candidate === category);

export const teamJobOtherRequirementGroupConfigs = requirementGroupConfigs.filter(
  (
    config,
  ): config is (typeof requirementGroupConfigs)[number] & {
    key: TeamJobOtherRequirementCategory;
  } => isTeamJobOtherRequirementCategory(config.key),
);
