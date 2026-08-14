import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge } from '@yourssu-inhouse/interior';
import { MdKeyboardArrowDown } from 'react-icons/md';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

import { requirementGroupConfigs } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/requirementOptions';

interface RequirementsSectionProps {
  requirements: InterviewRequirements;
}

type RequirementGroupConfig = (typeof requirementGroupConfigs)[number];

interface RequirementGroupProps {
  config: RequirementGroupConfig;
  requirements: InterviewRequirements[RequirementGroupConfig['key']];
}

export const RequirementsSection = ({ requirements }: RequirementsSectionProps) => {
  const requirementCount = requirementGroupConfigs.reduce(
    (count, config) => count + requirements[config.key].length,
    0,
  );

  return (
    <section aria-labelledby="requirements-heading">
      <Collapsible.Root className="flex flex-col gap-2">
        <h3 id="requirements-heading">
          <Collapsible.Trigger asChild>
            <button
              className="group hover:bg-greyOpacity50 focus-visible:outline-violet500 rounded-10 flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold">요구조건</span>
                <Badge color="grey" size="sm">
                  {requirementCount}개
                </Badge>
              </span>
              <MdKeyboardArrowDown
                aria-hidden
                className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </button>
          </Collapsible.Trigger>
        </h3>

        <Collapsible.Content>
          <div className="flex flex-col gap-3">
            {requirementGroupConfigs.map((config) => (
              <RequirementGroup
                config={config}
                key={config.key}
                requirements={requirements[config.key]}
              />
            ))}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </section>
  );
};

const RequirementGroup = ({ config, requirements }: RequirementGroupProps) => (
  <div className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border px-4 py-3">
    <div className="flex items-center gap-1.5">
      <h4 className="text-13 text-neutralMuted font-medium">{config.label}</h4>
      <span className="text-neutralSubtle text-xs">{requirements.length}</span>
    </div>

    {requirements.length === 0 ? (
      <p className="text-neutralSubtle text-xs">등록된 요구조건이 없어요.</p>
    ) : (
      <div className="flex flex-wrap gap-1.5">
        {requirements.map((requirement, index) => (
          <div key={requirement.id ?? `${config.key}-${index}`}>
            <Badge color={config.color} size="sm">
              {requirement.content}
            </Badge>
          </div>
        ))}
      </div>
    )}
  </div>
);
