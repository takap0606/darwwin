import { FC, useState, createContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themeCreator } from './base';

type Props = {
  children: React.ReactNode;
};

export const ThemeContext = createContext((_themeName: string): void => {});

const ThemeProviderWrapper: FC<Props> = (props) => {
  const [themeName, _setThemeName] = useState('NebulaFighterTheme');

  useEffect(() => {
    const curThemeName =
      window.localStorage.getItem('appTheme') || 'NebulaFighterTheme';
    _setThemeName(curThemeName);
  }, []);

  const theme = themeCreator(themeName);
  const setThemeName = (themeName: string): void => {
    window.localStorage.setItem('appTheme', themeName);
    _setThemeName(themeName);
  };

  return (
    <ThemeProvider theme={theme}>
      <ThemeContext.Provider value={setThemeName}>
        {props.children}
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
