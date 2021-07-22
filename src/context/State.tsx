import React, { useEffect, useReducer, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CardsContext } from './CardsContext';
import { ThemeContext } from './ThemeContext';

import {
  cardsReducer,
  ADD_CARDS,
  UPDATE_CARD,
  ADD_CARDS_AND_CACHE
} from './cardsReducer';

export const State: React.FC = props => {
  const [theme, setTheme] = useState('');
  const [cards, dispatch] = useReducer(cardsReducer, {});

  useEffect(() => {
    AsyncStorage.multiGet(['@theme', '@cards']).then(
      ([[_, theme], [__, cards]]) => {
        if (cards) addCards(Object.values(JSON.parse(cards)));
        if (theme !== null) setTheme(theme);
        else setTheme('light');
      }
    );
  }, []);

  const addCards = (cards?: { id: number }[]) => {
    dispatch({ type: ADD_CARDS, cards });
  };
  const addCardsAndCache = (cards?: { id: number }[]) => {
    dispatch({ type: ADD_CARDS_AND_CACHE, cards });
  };
  const updateCard = (card?: { id: number }) => {
    dispatch({ type: UPDATE_CARD, card });
  };

  const toggleTheme = () => {
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    AsyncStorage.setItem('@theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <CardsContext.Provider
      value={{ cards, addCards, updateCard, addCardsAndCache }}
    >
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {!!theme && props.children}
      </ThemeContext.Provider>
    </CardsContext.Provider>
  );
};
