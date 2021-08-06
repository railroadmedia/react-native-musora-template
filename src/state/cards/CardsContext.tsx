import { createContext } from 'react';

import type { ICardsContext } from './CardsInterfaces';

export const CardsContext = createContext<ICardsContext>({
  cards: {},
  addCards: () => {},
  addCardsAndCache: () => {},
  updateCard: () => {}
});
