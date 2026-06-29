import { IconButton } from '@yourssu-inhouse/interior';
import { TabButton } from '@yourssu-inhouse/interior';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdClose } from 'react-icons/md';

import { AnimatedStep } from '@/components/TemplateEditorDialog/components/VariablePannel/AnimatedStep';
import { useVariableContext } from '@/components/TemplateEditorDialog/context';
import { variableIconMap, type VariablePannelStep } from '@/components/TemplateEditorDialog/type';

interface VariableListStepProps {
  direction: number;
  navigate: (step: VariablePannelStep) => void;
}

export const VariableListStep = ({ direction, navigate }: VariableListStepProps) => {
  const { insertVariable, removeVariable, variables } = useVariableContext();

  return (
    <AnimatedStep direction={direction}>
      <div className="flex flex-col gap-0.5">
        <TabButton
          className="text-violet500 dark:text-violet600 h-fit py-2"
          left={<IoMdAddCircleOutline />}
          onClick={() => navigate('select')}
          size="md"
        >
          변수 만들기
        </TabButton>
        {variables.map((variable) => (
          <TabButton
            className="h-fit py-2"
            key={variable.id}
            left={variableIconMap[variable.type]}
            onClick={() => insertVariable(variable)}
            onMouseDown={(e) => e.preventDefault()} // NOTE: 에디터 포커싱이 사라지는 것을 막아요
            right={
              !variable.isDefault && (
                <IconButton
                  className="text-neutralDisabled"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVariable(variable.id);
                  }}
                  size="xxs"
                >
                  <MdClose />
                </IconButton>
              )
            }
            size="md"
          >
            <div className="flex min-w-0 flex-[1_1_0] items-center justify-between">
              <div className="flex min-w-0 flex-col items-start">
                <span className="max-w-full truncate pr-0.5">{variable.name}</span>
                {variable.isDifferentPerPerson && (
                  <span className="text-tiny text-teal500 truncate">사람마다 다르게 설정</span>
                )}
              </div>
            </div>
          </TabButton>
        ))}
      </div>
    </AnimatedStep>
  );
};
