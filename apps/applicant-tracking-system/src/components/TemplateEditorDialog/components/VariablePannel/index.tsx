import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { SwitchCase } from 'react-simplikit';

import type {
  SelectableVariableType,
  VariablePannelStep,
} from '@/components/TemplateEditorDialog/type';

import { VariableCreateStep } from '@/components/TemplateEditorDialog/components/VariablePannel/VariableCreateStep';
import { VariableListStep } from '@/components/TemplateEditorDialog/components/VariablePannel/VariableListStep';

import { VariableTypeSelectStep } from './VariableTypeSelectStep';

export const VariablePannel = () => {
  const [step, setStep] = useState<VariablePannelStep>('list');
  const [direction, setDirection] = useState(1);
  const [selectedType, setSelectedType] = useState<SelectableVariableType>('PERSON');

  const navigate = (nextStep: VariablePannelStep) => {
    const stepOrder: Record<VariablePannelStep, number> = { list: 0, select: 1, create: 2 };
    setDirection(stepOrder[nextStep] > stepOrder[step] ? 1 : -1);
    setStep(nextStep);
  };

  const handleSelectType = (type: SelectableVariableType) => {
    setSelectedType(type);
    navigate('create');
  };

  return (
    <div className="border-greyOpacity100 flex w-60 flex-[1_1_0] flex-col overflow-hidden border-r px-3 py-4">
      <div className="flex-[1_1_0]">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <SwitchCase
            caseBy={{
              create: () => (
                <VariableCreateStep
                  direction={direction}
                  navigate={navigate}
                  selectedType={selectedType}
                />
              ),
              list: () => <VariableListStep direction={direction} navigate={navigate} />,
              select: () => (
                <VariableTypeSelectStep
                  direction={direction}
                  handleSelectType={handleSelectType}
                  navigate={navigate}
                />
              ),
            }}
            key={step}
            value={step}
          />
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-2.5 pt-3 pb-0.5">
        <kbd className="bg-greyOpacity100 text-neutralSubtle rounded px-1.5 py-0.5 font-mono text-xs font-medium">
          /
        </kbd>
        <span className="text-neutralSubtle text-13">에디터에 변수 추가</span>
      </div>
    </div>
  );
};
