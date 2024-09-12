import { createContext } from 'react';

export type InvestContextType = {
  shouldReload: boolean;
  setShouldReload: (value: boolean) => void;
};

const InvestContext = createContext<InvestContextType>({
  shouldReload: false,
  setShouldReload: () => {},
});

export default InvestContext;
