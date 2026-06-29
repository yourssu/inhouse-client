import { TabButton } from '@yourssu-inhouse/interior';

import {
  type SelectableVariableType,
  variableIconMap,
  type VariablePannelStep,
} from '@/components/TemplateEditorDialog/type';
import { variableTypeNameKo } from '@/types/mails';

import { AnimatedStep } from './AnimatedStep';

interface VariableTypeSelectStepProps {
  direction: number;
  handleSelectType: (type: SelectableVariableType) => void;
  navigate: (step: VariablePannelStep) => void;
}

export const VariableTypeSelectStep = ({
  direction,
  handleSelectType,
  navigate,
}: VariableTypeSelectStepProps) => {
  return (
    <AnimatedStep direction={direction} onBack={() => navigate('list')}>
      <div className="flex flex-col gap-0.5">
        {options.map((option) => (
          <TabButton
            className="h-fit py-2"
            key={option}
            left={variableIconMap[option]}
            onClick={() => handleSelectType(option)}
            size="md"
          >
            {variableTypeNameKo[option]}
          </TabButton>
        ))}
      </div>
    </AnimatedStep>
  );
};

const options: SelectableVariableType[] = ['PERSON', 'DATE', 'LINK', 'TEXT'];
