import React, { useEffect, useReducer, useState } from 'react';

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

import { LIGHT, DARK } from '../themeStyles';
import { userService } from '../services/user.service';

export const State: React.FC = props => {
  const [theme, setTheme] = useState('');
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
    userService.getUserDetails().then(ud => updateUserAndCache(ud));
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

  return (
    <CardsContext.Provider
      value={{ cards, addCards, updateCard, addCardsAndCache }}
    >
      <UserContext.Provider value={{ user, updateUser, updateUserAndCache }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {!!theme && props.children}
        </ThemeContext.Provider>
      </UserContext.Provider>
    </CardsContext.Provider>
  );
};
