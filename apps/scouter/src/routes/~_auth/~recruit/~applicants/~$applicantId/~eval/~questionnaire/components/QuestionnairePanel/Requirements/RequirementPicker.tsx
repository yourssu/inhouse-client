import { Combobox } from '@yourssu-inhouse/interior';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

import { teamJobOtherRequirementGroupConfigs } from './requirementOptions';

interface RequirementPickerProps {
  disabled: boolean;
  invalid?: boolean;
  onChange: (requirementIds: number[]) => void;
  ref?: React.Ref<HTMLInputElement>;
  requirements: InterviewRequirements;
  selectedRequirementIds: number[];
}

export const RequirementPicker = ({
  disabled,
  invalid = false,
  onChange,
  ref,
  requirements,
  selectedRequirementIds,
}: RequirementPickerProps) => {
  const comboboxItems = teamJobOtherRequirementGroupConfigs.flatMap((config) =>
    requirements[config.key].flatMap((requirement) =>
      requirement.id === undefined
        ? []
        : [
            {
              id: requirement.id,
              label: `${config.label} · ${requirement.content}`,
            },
          ],
    ),
  );
  const requirementIdByComboboxItem = new Map(comboboxItems.map(({ id, label }) => [label, id]));
  const selectedRequirementIdSet = new Set(selectedRequirementIds);
  const items = comboboxItems.map(({ label }) => label);
  const value = comboboxItems
    .filter(({ id }) => selectedRequirementIdSet.has(id))
    .map(({ label }) => label);

  return (
    <Combobox
      className={invalid ? 'border-red600!' : undefined}
      disabled={disabled || items.length === 0}
      items={items}
      label="요구조건"
      onValueChange={(items) => {
        onChange(
          items.flatMap((item) => {
            const requirementId = requirementIdByComboboxItem.get(item);
            return requirementId === undefined ? [] : [requirementId];
          }),
        );
      }}
      placeholder="요구조건을 선택하세요"
      ref={ref}
      value={value}
    />
  );
};
