import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

export type RequirementCategory = keyof InterviewRequirements;
type RequirementColor = 'blue' | 'green' | 'grey' | 'yellow';

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
  },
  {
    color: 'green',
    key: 'job',
    label: 'Job fit',
  },
  {
    color: 'grey',
    key: 'other',
    label: '기타',
  },
] as const satisfies ReadonlyArray<{
  color: RequirementColor;
  key: RequirementCategory;
  label: string;
}>;

export const teamJobRequirementCategories = [
  'team',
  'job',
] as const satisfies ReadonlyArray<RequirementCategory>;

export const teamJobOtherRequirementCategories = [
  ...teamJobRequirementCategories,
  'other',
] as const satisfies ReadonlyArray<RequirementCategory>;

type TeamJobOtherRequirementCategory = (typeof teamJobOtherRequirementCategories)[number];

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
