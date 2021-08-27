import { createContext } from 'react';
import type { MethodContext as I_MethodContext } from '../../interfaces/method.interfaces';

export const MethodContext = createContext(<I_MethodContext>{});
