import { IconButton } from '@yourssu-inhouse/interior';
import { MdBuild } from 'react-icons/md';

import { useTabDialog } from '@/hooks/useTabDialog';

import { EvaluationDevTools } from './EvaluationDevTools';
import { RubricDevTools } from './RubricDevTools';

const devToolTabs = ['평가 데이터', '배점 설정'] as const;

export const DevTools = () => {
  const openTabDialog = useTabDialog();

  const handleOpen = async () => {
    await openTabDialog({
      askBeforeClose: false,
      caseBy: () => ({
        '평가 데이터': <EvaluationDevTools />,
        '배점 설정': <RubricDevTools />,
      }),
      closeableWithOutside: false,
      tabs: [...devToolTabs],
    });
  };

  return (
    <IconButton
      aria-label="QA 도구 열기"
      className="bg-violet600 hover:bg-violet700 focus-visible:outline-violet500 shadow-popover z-sticky fixed right-6 bottom-6 text-white focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={() => void handleOpen()}
      size="xl"
      tooltipContent="QA 도구"
      tooltipProps={{ side: 'left' }}
      type="button"
    >
      <MdBuild aria-hidden className="size-6" />
    </IconButton>
  );
};
