import { useState } from 'react';
import { MdHelpOutline } from 'react-icons/md';

import type { VariableTypeName } from '@/apis/mails/schema';
import type { VariablePannelStep } from '@/components/TemplateEditorDialog/type';

import { Button } from '@/components/_ui/Button';
import { Fieldset } from '@/components/_ui/Fieldset';
import { HoverTooltip } from '@/components/_ui/HoverTooltip';
import { Switch } from '@/components/_ui/Switch';
import { TextField } from '@/components/_ui/TextField';
import { AnimatedStep } from '@/components/TemplateEditorDialog/components/VariablePannel/AnimatedStep';
import { useVariableContext } from '@/components/TemplateEditorDialog/context';
import { useToast } from '@/hooks/useToast';
import { variableTypeNameKo } from '@/types/mails';

interface VariableCreateStepProps {
  direction: number;
  navigate: (step: VariablePannelStep) => void;
  selectedType: VariableTypeName;
}

export const VariableCreateStep = ({
  direction,
  navigate,
  selectedType,
}: VariableCreateStepProps) => {
  const [isDifferentPerPerson, setIsDifferentPerPerson] = useState(false);
  const [name, setName] = useState('');
  const { addVariable, variables } = useVariableContext();
  const toast = useToast();

  const handleAdd = () => {
    if (variables.some((v) => v.name === name)) {
      toast.error('이미 같은 이름의 변수가 있어요');
      return;
    }
    addVariable({ name, isDifferentPerPerson, type: selectedType });
    navigate('list');
  };

  return (
    <AnimatedStep direction={direction} onBack={() => navigate('select')}>
      <div className="flex flex-col gap-6 px-2 pt-1">
        <Fieldset
          label={<span className="text-13">{variableTypeNameKo[selectedType]} 변수명</span>}
        >
          <TextField
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="변수명을 입력해주세요"
            size="md"
            value={name}
            variant="outline"
          />
        </Fieldset>
        <div className="flex items-center justify-between">
          <div className="text-13 flex items-center gap-1">
            <span className="text-neutralMuted font-medium">사람마다 다르게 설정</span>
            <HoverTooltip
              content="메일을 보낼 때 수신지마다 다른 값으로 설정할 수 있어요."
              contentProps={{ side: 'bottom' }}
            >
              <MdHelpOutline />
            </HoverTooltip>
          </div>
          <Switch
            checked={isDifferentPerPerson}
            onCheckedChange={setIsDifferentPerPerson}
            size="md"
          />
        </div>
        <Button disabled={!name.trim()} onClick={handleAdd} size="md" variant="secondary">
          추가하기
        </Button>
      </div>
    </AnimatedStep>
  );
};
