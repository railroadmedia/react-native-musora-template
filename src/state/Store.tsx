import React, { useEffect, useReducer, useState } from 'react';
import { View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CardsContext } from './CardsContext';
import { ThemeContext } from './ThemeContext';
import { UserContext } from './UserContext';

import {
  cardsReducer,
  ADD_CARDS,
  UPDATE_CARD,
  ADD_CARDS_AND_CACHE
} from './cardsReducer';

import { userReducer, UPDATE_USER, UPDATE_USER_AND_CACHE } from './userReducer';

import { LIGHT, DARK, themeStyles } from '../themeStyles';
import { userService } from '../services/user.service';
import { HeaderContext } from './Headercontext';

export const State: React.FC = props => {
  const [theme, setTheme] = useState('');
  const [headerNavHeight, setHeaderNavHeight] = useState(0);
  const [cards, dispatchCards] = useReducer(cardsReducer, {});
  const [user, dispatchUser] = useReducer(userReducer, {});

  useEffect(() => {
    AsyncStorage.multiGet(['@theme', '@cards', '@user']).then(
      ([[_, theme], [__, cards], [___, user]]) => {
        if (cards) addCards(Object.values(JSON.parse(cards)));
        if (user) updateUser(JSON.parse(user));
        if (theme !== null) setTheme(theme);
        else setTheme(LIGHT);
      }
    );
  }, []);

  const addCards = (cards?: { id: number }[]) => {
    dispatchCards({ type: ADD_CARDS, cards });
  };
  const addCardsAndCache = (cards?: { id: number }[]) => {
    dispatchCards({ type: ADD_CARDS_AND_CACHE, cards });
  };
  const updateCard = (card?: { id: number }) => {
    dispatchCards({ type: UPDATE_CARD, card });
  };

  const updateUser = (user: {}) => {
    dispatchUser({ type: UPDATE_USER, user });
  };
  const updateUserAndCache = (user: {}) => {
    dispatchUser({ type: UPDATE_USER_AND_CACHE, user });
  };

  const toggleTheme = () => {
    let newTheme = theme === DARK ? LIGHT : DARK;
    AsyncStorage.setItem('@theme', newTheme);
    setTheme(newTheme);
  };

  const updateHeaderNavHeight = (height: number) => setHeaderNavHeight(height);

  return (
    <View style={{ flex: 1, backgroundColor: themeStyles[theme]?.background }}>
      <CardsContext.Provider
        value={{ cards, addCards, updateCard, addCardsAndCache }}
      >
        <UserContext.Provider value={{ user, updateUser, updateUserAndCache }}>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <HeaderContext.Provider
              value={{ headerNavHeight, updateHeaderNavHeight }}
            >
              {!!theme && props.children}
            </HeaderContext.Provider>
          </ThemeContext.Provider>
        </UserContext.Provider>
      </CardsContext.Provider>
    </View>
  );
};
