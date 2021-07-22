import React, { useContext, useEffect, useReducer } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { CardsContext } from '../context/CardsContext';

import { provider } from '../services/catalogueSceneProvider.service';
import {
  ADD_COMBINED,
  ADD_COMBINED_AND_CACHE,
  catalogueReducer
} from './reducer';

interface Props {
  scene: string;
}

export const Catalogue: React.FC<Props> = ({ scene }) => {
  let page = 1;

  const { cards, addCards, addCardsAndCache, updateCard } =
    useContext(CardsContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [catalogue, dispatch] = useReducer(catalogueReducer, {});

  useEffect(() => {
    provider[scene]
      .getCache?.()
      .then(cache => dispatch({ type: ADD_COMBINED, scene, ...cache }));
    provider[scene]
      .getCombined?.({ page })
      .then(([all, newContent, inProgress, method]) => {
        console.log(all);
        addCardsAndCache(all?.data);
        dispatch({
          type: ADD_COMBINED_AND_CACHE,
          scene,
          method,
          all: all?.data,
          inProgress: inProgress?.data,
          newContent: newContent?.data
        });
      });
  }, []);
  console.log(scene, cards, theme, catalogue);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => toggleTheme()}>
        <Text style={{ padding: 20, margin: 20, backgroundColor: 'red' }}>
          SS
        </Text>
      </TouchableOpacity>
      <Text>{scene} catalogue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
