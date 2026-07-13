import { Button, HoverTooltip, InlineButton } from '@yourssu-inhouse/interior';
import { RxQuestionMarkCircled } from 'react-icons/rx';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export const HoverTooltipView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">기본 (화살표 포함, side=top)</h3>
        <div className="flex flex-wrap gap-4">
          <HoverTooltip content="툴팁 콘텐츠">
            <Button size="md" variant="primary">
              hover me
            </Button>
          </HoverTooltip>
          <HoverTooltip content="도움말 텍스트">
            <InlineButton>
              <RxQuestionMarkCircled size={20} />
            </InlineButton>
          </HoverTooltip>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">side 배리에이션</h3>
        <div className="flex flex-wrap gap-6">
          {sides.map((side) => (
            <HoverTooltip content={`side=${side}`} contentProps={{ side }} key={side}>
              <Button size="md" variant="secondary">
                {side}
              </Button>
            </HoverTooltip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">noArrow (화살표 제거)</h3>
        <div className="flex flex-wrap gap-4">
          <HoverTooltip content="화살표 없는 툴팁" noArrow>
            <Button size="md" variant="subPrimary">
              no arrow
            </Button>
          </HoverTooltip>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">disableHoverableContent</h3>
        <p className="text-13 text-greyOpacity500">
          툴팁 콘텐츠 위로 마우스를 옮겨도 툴팁이 유지되지 않아요.
        </p>
        <div className="flex flex-wrap gap-4">
          <HoverTooltip content="콘텐츠 호버 시 닫혀요" disableHoverableContent>
            <Button size="md" variant="transparent">
              disableHoverableContent
            </Button>
          </HoverTooltip>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          유즈케이스: 라벨 옆 도움말 아이콘
        </h3>
        <div className="text-15 text-greyOpacity700 flex items-center gap-1">
          <span>권한 설정</span>
          <HoverTooltip
            content="사용자가 접근할 수 있는 메뉴를 제어해요"
            contentProps={{ side: 'bottom' }}
          >
            <InlineButton>
              <RxQuestionMarkCircled size={16} />
            </InlineButton>
          </HoverTooltip>
        </div>
      </div>
    </div>
  );
};
