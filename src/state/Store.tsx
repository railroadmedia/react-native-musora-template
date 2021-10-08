import React, { useEffect, useReducer, useState } from 'react';
import { Alert, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

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

import { LIGHT, DARK, themeStyles } from '../themeStyles';
import { OrientationContext } from './orientation/OrientationContext';
import {
  ADD_CARDS,
  ADD_CARDS_AND_CACHE,
  cardsReducer,
  UPDATE_CARD
} from './cards/CardsReducer';
import { methodReducer, UPDATE_METHOD } from './method/MethodReducer';
import type { Card } from '../interfaces/card.interfaces';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Method } from '../interfaces/method.interfaces';
import { MethodContext } from './method/MethodContext';
import { ConnectionContext } from '../state/connection/ConnectionContext';

export const Store: React.FC = props => {
  const [theme, setTheme] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [orientation, setOrientation] = useState(
    Orientation.getInitialOrientation()
  );
  const [cards, dispatchCards] = useReducer(cardsReducer, {});
  const [user, dispatchUser] = useReducer(userReducer, {});
  const [method, dispatchMethod] = useReducer(methodReducer, {});

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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('netinfo', state);
      setIsConnected(
        ['none', 'unknown'].includes(state.type) || !state.isConnected
          ? false
          : true
      );
    });

    return () => unsubscribe();
  }, [setIsConnected]);

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

  const updateMethod = (method?: Method) => {
    dispatchMethod({ type: UPDATE_METHOD, method });
  };

  const toggleTheme = () => {
    let newTheme = theme === DARK ? LIGHT : DARK;
    AsyncStorage.setItem('@theme', newTheme);
    setTheme(newTheme);
  };

  const updateOrientation = (o: OrientationType) => setOrientation(o);

  const showNoConnectionAlert = () => {
    return Alert.alert(
      'No internet or data connection.',
      `You can still access the lessons you have downloaded in your 'Downloads' area`,
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeStyles[theme]?.background }}
      edges={['right', 'left']}
    >
      <MethodContext.Provider value={{ method, updateMethod }}>
        <CardsContext.Provider
          value={{ cards, addCards, updateCard, addCardsAndCache }}
        >
          <UserContext.Provider
            value={{ user, updateUser, updateUserAndCache }}
          >
            <ConnectionContext.Provider
              value={{ isConnected, setIsConnected, showNoConnectionAlert }}
            >
              <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <OrientationContext.Provider
                  value={{
                    isLandscape: orientation.toLowerCase().includes('land'),
                    orientation,
                    updateOrientation
                  }}
                >
                  {!!theme && props.children}
                </OrientationContext.Provider>
              </ThemeContext.Provider>
            </ConnectionContext.Provider>
          </UserContext.Provider>
        </CardsContext.Provider>
      </MethodContext.Provider>
    </SafeAreaView>
  );
};
