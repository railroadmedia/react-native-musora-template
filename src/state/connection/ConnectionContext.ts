import React, { createContext } from 'react';
import type { ConnectionContext as I_ConnectionContext } from '../../interfaces/connection.interfaces';

export const ConnectionContext = createContext({} as I_ConnectionContext);
