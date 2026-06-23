import { assert } from 'es-toolkit';
import { createContext, useContext, useState } from 'react';

import { documentThemeAttributeKey, setDocumentTheme } from '@/bootstrap/color-theme';

export type ThemeType = 'dark' | 'light';

type ThemeContextType = {
  theme: ThemeType;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const getDocumentTheme = () => {
    const currentTheme = document.documentElement.getAttribute(documentThemeAttributeKey);
    if (!currentTheme) {
      return undefined;
    }
    if (currentTheme !== 'light' && currentTheme !== 'dark') {
      throw new Error('theme이 잘못 지정되어 있어요.');
    }
    return currentTheme;
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(getDocumentTheme() ?? 'light');

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setDocumentTheme(newTheme);
    setTheme(newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  assert(!!context, 'useTheme은 ThemeProvider 하위에서 사용해야해요.');
  return context;
};
