import { useTheme } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { images } from '@yourssu-inhouse/resources';

interface AdaptiveLogoProps {
  className?: string;
}

const logoByTheme = {
  dark: images.inhouseLogoDark,
  light: images.inhouseLogoLight,
} as const;

export const AdaptiveLogo = ({ className }: AdaptiveLogoProps) => {
  const { theme } = useTheme();
  return (
    <img alt="유어슈 인하우스 로고" className={cn('w-fit', className)} src={logoByTheme[theme]} />
  );
};
