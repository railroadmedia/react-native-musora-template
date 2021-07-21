import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reducer, AddCards, UpdateCard } from './interfaces';

export const ADD_CARDS = 'ADD_CARDS';
export const UPDATE_CARD = 'UPDATE_CARD';

const addCards: AddCards = (state, cards) => {
  const newCards: { [id: number]: {} } = {};
  cards?.map(c => (newCards[c.id] = c));
  const newState = { ...state, newCards };
  AsyncStorage.setItem('@cards', JSON.stringify(newState));
  return newState;
};

const updateCard: UpdateCard = (state, card) => {
  let newState = { ...state, [card.id]: card };
  AsyncStorage.setItem('@cards', JSON.stringify(newState));
  return newState;
};

export const cardsReducer: Reducer = (state, { type, cards, card }) => {
  switch (type) {
    case ADD_CARDS:
      return cards ? addCards(state, cards) : state;
    case UPDATE_CARD:
      return card ? updateCard(state, card) : state;
    default:
      return state;
  }
};
