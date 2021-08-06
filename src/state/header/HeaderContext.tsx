import { createContext } from 'react';

export interface IHeaderContext {
  headerNavHeight: number;
  updateHeaderNavHeight: (height: number) => void;
}

export const HeaderContext = createContext<IHeaderContext>({
  headerNavHeight: 0,
  updateHeaderNavHeight: () => {}
});
