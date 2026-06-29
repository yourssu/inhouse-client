import { useTheme } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

interface AdaptiveLogoProps {
  className?: string;
}

// TODO: 로고 이미지 prefetch
export const AdaptiveLogo = ({ className }: AdaptiveLogoProps) => {
  const { theme } = useTheme();
  return (
    <img alt="유어슈 인하우스 로고" className={cn('w-fit', className)} src={`/logo-${theme}.png`} />
  );
};
