import { createContext } from 'react';
import type { CardsContext as I_CardsContext } from '../../interfaces/card.interfaces';

export const CardsContext = createContext(<I_CardsContext>{});
