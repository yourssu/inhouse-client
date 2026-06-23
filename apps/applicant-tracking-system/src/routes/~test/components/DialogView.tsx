import { Button } from '@/components/_ui/Button';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useTabDialog } from '@/hooks/useTabDialog';

const A = () => <div>A</div>;
const B = () => <div>B</div>;
const C = () => <div>C</div>;

export const DialogView = () => {
  const openDialog = useAlertDialog();
  const openTabDialog = useTabDialog();

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => {
            openDialog({
              title: '테스트',
              content: '테스트',
            });
          }}
          size="lg"
        >
          다이얼로그 열기
        </Button>
        <Button
          onClick={() => {
            openDialog({
              title: '테스트',
              content: '테스트',
              closeableWithOutside: false,
              closeButton: false,
              primaryButtonText: '확인',
              secondaryButtonText: '취소',
            });
          }}
          size="lg"
        >
          다이얼로그 열기2
        </Button>
        <Button
          onClick={() => {
            openTabDialog({
              tabs: ['첫 번째 탭', '두 번째 탭', '세 번째 탭'],
              caseBy: () => ({
                '첫 번째 탭': <A />,
                '두 번째 탭': <B />,
                '세 번째 탭': <C />,
              }),
              renderButtonGroup: ({ Button }) => (
                <>
                  <Button variant="secondary">버튼</Button>
                  <Button variant="primary">버튼</Button>
                </>
              ),
            });
          }}
          size="lg"
        >
          탭 다이얼로그 열기
        </Button>
      </div>
    </>
  );
};
