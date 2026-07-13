import { Button, Popover } from '@yourssu-inhouse/interior';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export const PopoverView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">기본 (click)</h3>
        <div>
          <Popover>
            <Popover.Trigger asChild>
              <Button size="md" variant="primary">
                클릭해서 열기
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" side="bottom">
              <div className="w-[240px]">
                <p className="text-15 text-greyOpacity900 font-semibold">팝오버 제목</p>
                <p className="text-13 text-greyOpacity500 mt-1">
                  Popover.Content 안에는 임의의 콘텐츠를 넣을 수 있어요.
                </p>
              </div>
            </Popover.Content>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">side 배리에이션</h3>
        <div className="flex flex-wrap gap-6">
          {sides.map((side) => (
            <Popover key={side}>
              <Popover.Trigger asChild>
                <Button size="md" variant="secondary">
                  {side}
                </Button>
              </Popover.Trigger>
              <Popover.Content align="center" side={side}>
                <div className="w-[160px]">
                  <p className="text-13 text-greyOpacity700">side={side}</p>
                </div>
              </Popover.Content>
            </Popover>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">behavior=&quot;hover&quot;</h3>
        <p className="text-13 text-greyOpacity500">
          트리거에 마우스를 올리면 열리고 벗어나면 닫혀요.
        </p>
        <div>
          <Popover behavior="hover">
            <Popover.Trigger asChild>
              <Button size="md" variant="subPrimary">
                hover me
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" side="bottom">
              <div className="w-[220px]">
                <p className="text-13 text-greyOpacity700">
                  hover 팝오버는 정보 카드처럼 쓸 수 있어요.
                </p>
              </div>
            </Popover.Content>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          Popover.Closeable로 명시적 닫기 액션
        </h3>
        <div>
          <Popover>
            <Popover.Trigger asChild>
              <Button size="md" variant="secondary">
                삭제 확인
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" side="bottom">
              <div className="flex w-[240px] flex-col gap-3">
                <p className="text-15 text-greyOpacity900">정말 삭제할까요?</p>
                <div className="flex justify-end gap-2">
                  <Popover.Closeable asChild>
                    <Button size="sm" variant="secondary">
                      취소
                    </Button>
                  </Popover.Closeable>
                  <Popover.Closeable asChild>
                    <Button size="sm" variant="primary">
                      삭제
                    </Button>
                  </Popover.Closeable>
                </div>
              </div>
            </Popover.Content>
          </Popover>
        </div>
      </div>
    </div>
  );
};
