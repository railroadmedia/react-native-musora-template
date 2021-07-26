import { createContext } from 'react';
import type { UserContext as UserCtx } from './interfaces';

export const UserContext = createContext(<UserCtx>{});
