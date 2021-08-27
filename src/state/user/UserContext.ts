import { createContext } from 'react';
import type { UserContext as I_UserContext } from '../../interfaces/user.interfaces';

export const UserContext = createContext(<I_UserContext>{});
