export const documentThemeAttributeKey = 'data-theme';
export const localStorageThemeKey = 'color-preference';

export const setDocumentTheme = (theme: 'dark' | 'light') => {
  document.documentElement.style.colorScheme = theme + ' only';
  document.documentElement.setAttribute(documentThemeAttributeKey, theme);
  localStorage.setItem(localStorageThemeKey, theme);
};

export const initializeTheme = () => {
  const savedTheme = localStorage.getItem(localStorageThemeKey);
  const isOSDarkMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkMode = savedTheme == null ? isOSDarkMode : savedTheme === 'dark';
  const colorTheme = isDarkMode ? 'dark' : 'light';

  setDocumentTheme(colorTheme);
};
