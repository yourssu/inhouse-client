import { Lottie } from '@toss/lottie';
import { Result } from '@yourssu-inhouse/interior';
import { TabButton } from '@yourssu-inhouse/interior';
import { includes } from 'es-toolkit/compat';
import { useState } from 'react';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import {
  tabTypeMap,
  type VariableTab,
  variableTabs,
} from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';
import { VariableField } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/VariableField';

interface VariableListProps {
  applicantNames: string[];
  memberNames: string[];
  onTabChange?: (tab: VariableTab) => void;
  selectedTab?: VariableTab;
  variables: VariableItem[];
}

export const VariableList = ({
  variables,
  applicantNames,
  memberNames,
  selectedTab,
  onTabChange,
}: VariableListProps) => {
  const [internalTab, setInternalTab] = useState<VariableTab>('전체');
  const activeTab = selectedTab ?? internalTab;

  const nonDefaultVariables = variables.filter((variable) => !variable.isDefault);

  const availableTabs = variableTabs.filter((tab) => {
    const types = tabTypeMap[tab];
    return !types || nonDefaultVariables.some((v) => includes(types, v.type));
  });

  const filteredVariables = nonDefaultVariables.filter((variable) => {
    const types = tabTypeMap[activeTab];
    return !types || includes(types, variable.type);
  });

  const getVariableCount = (tab: VariableTab) => {
    const types = tabTypeMap[tab];
    if (tab === '전체') {
      return nonDefaultVariables.length;
    }
    return nonDefaultVariables.filter((v) => includes(types, v.type)).length;
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex w-40 shrink-0 flex-col gap-1">
        {availableTabs.map((tab) => (
          <TabButton
            active={activeTab === tab}
            key={tab}
            onClick={() => {
              if (!selectedTab) {
                setInternalTab(tab);
              }
              onTabChange?.(tab);
            }}
            size="lg"
          >
            {tab}
            <span className="text-neutralSubtle text-13 ml-1">({getVariableCount(tab)})</span>
          </TabButton>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-6">
        {filteredVariables.length === 0 ? (
          <Result
            description="템플릿을 불러와 변수를 지정해보세요."
            figure={<Lottie className="size-10" delay={0.2} src="/lotties/empty.json" />}
            title="지정할 변수가 없어요"
          />
        ) : (
          filteredVariables.map((variable) => {
            if (variable.isDifferentPerPerson) {
              return (
                <div className="flex flex-col gap-2" key={variable.id}>
                  <div className="text-15 text-neutralMuted py-1.5 font-medium">
                    {variable.name}
                  </div>
                  <div className="bg-greyOpacity50 flex flex-col gap-2 rounded-xl p-4 pt-2.5">
                    {applicantNames.map((name) => (
                      <VariableField
                        key={`${variable.id}-${name}`}
                        memberNames={memberNames}
                        variable={{ ...variable, name }}
                        variableKey={`${variable.id}_${name}`}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={variable.id}>
                <VariableField
                  memberNames={memberNames}
                  variable={variable}
                  variableKey={variable.id}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
