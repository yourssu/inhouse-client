import { Button, InlineButton } from '@yourssu-inhouse/interior';
import { MdEdit } from 'react-icons/md';

const variants = ['primary', 'secondary', 'subPrimary', 'transparent'] as const;
const sizes = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export const ButtonView = () => {
  return (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div className="flex flex-col gap-4" key={variant}>
          <h3 className="text-15 text-greyOpacity900 font-semibold capitalize">{variant}</h3>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button key={`active-${size}`} size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button disabled key={`disabled-${size}`} size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button key={`disabled-${size}`} loading size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">InlineButton</h3>
        <p className="text-13 text-greyOpacity500">
          텍스트 옆에 쓰는 경량 버튼. hover/focus 시 배경이 채워져요.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <InlineButton>편집</InlineButton>
          <InlineButton disabled>비활성</InlineButton>
          <InlineButton>
            <MdEdit /> 아이콘
          </InlineButton>
          <InlineButton asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              asChild (링크)
            </a>
          </InlineButton>
        </div>
      </div>
    </div>
  );
};
