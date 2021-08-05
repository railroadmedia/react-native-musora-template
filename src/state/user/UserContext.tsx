import { createContext } from 'react';
import type { IUserContext } from './UserInterfaces';

export const UserContext = createContext<IUserContext>({
  user: {},
  updateUser: () => {},
  updateUserAndCache: () => {}
});
