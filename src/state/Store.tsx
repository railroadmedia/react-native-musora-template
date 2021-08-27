import React, { useEffect, useReducer, useState } from 'react';
import { View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation, { OrientationType } from 'react-native-orientation-locker';

import { CardsContext } from './cards/CardsContext';
import { ThemeContext } from './theme/ThemeContext';
import { UserContext } from './user/UserContext';

import {
  userReducer,
  UPDATE_USER,
  UPDATE_USER_AND_CACHE
} from './user/UserReducer';

import { LIGHT, DARK } from '../themeStyles';
import { HeaderContext } from './header/HeaderContext';
import { OrientationContext } from './orientation/OrientationContext';
import {
  ADD_CARDS,
  ADD_CARDS_AND_CACHE,
  cardsReducer,
  UPDATE_CARD
} from './cards/CardsReducer';
import { methodReducer } from './method/MethodReducer';
import type { Card } from '../interfaces/card.interfaces';

export const State: React.FC = props => {
  const [theme, setTheme] = useState('');
  const [headerNavHeight, setHeaderNavHeight] = useState(0);
  const [orientation, setOrientation] = useState(
    Orientation.getInitialOrientation()
  );
  const [cards, dispatchCards] = useReducer(cardsReducer, {});
  const [user, dispatchUser] = useReducer(userReducer, {});
  // const [method, dispatchMethod] = useReducer(methodReducer, {});

  useEffect(() => {
    Orientation.addOrientationListener(updateOrientation);
    AsyncStorage.multiGet(['@theme', '@cards', '@user']).then(
      ([[_, theme], [__, cards], [___, user]]) => {
        if (cards) addCards(Object.values(JSON.parse(cards)));
        if (user) updateUser(JSON.parse(user));
        if (theme !== null) setTheme(theme);
        else setTheme(LIGHT);
      }
    );
    return () => {
      Orientation.removeOrientationListener(updateOrientation);
    };
  }, []);

  const addCards = (cards?: Card[]) => {
    dispatchCards({ type: ADD_CARDS, cards });
  };
  const addCardsAndCache = (cards?: Card[]) => {
    dispatchCards({ type: ADD_CARDS_AND_CACHE, cards });
  };
  const updateCard = (card?: Card) => {
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

  const updateOrientation = (o: OrientationType) => setOrientation(o);

  return (
    <View style={{ flex: 1 }}>
      <CardsContext.Provider
        value={{ cards, addCards, updateCard, addCardsAndCache }}
      >
        <UserContext.Provider value={{ user, updateUser, updateUserAndCache }}>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <HeaderContext.Provider
              value={{ headerNavHeight, updateHeaderNavHeight }}
            >
              <OrientationContext.Provider
                value={{
                  isLandscape: orientation.toLowerCase().includes('land'),
                  orientation,
                  updateOrientation
                }}
              >
                {!!theme && props.children}
              </OrientationContext.Provider>
            </HeaderContext.Provider>
          </ThemeContext.Provider>
        </UserContext.Provider>
      </CardsContext.Provider>
    </View>
  );
};
