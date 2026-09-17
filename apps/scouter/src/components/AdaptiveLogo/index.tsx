import { useTheme } from '@interior/react';
import { cn } from '@interior/tailwind/utils';
import { images } from '@yourssu-inhouse/resources';

interface AdaptiveLogoProps {
  className?: string;
}

const logoByTheme = {
  dark: images.scouterLogoDark,
  light: images.scouterLogoLight,
} as const;

export const AdaptiveLogo = ({ className }: AdaptiveLogoProps) => {
  const { theme } = useTheme();
  return (
    <img alt="유어슈 스카우터 로고" className={cn('w-fit', className)} src={logoByTheme[theme]} />
  );
};
