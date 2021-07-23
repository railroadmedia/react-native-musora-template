import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { ThemeContext } from '../state/ThemeContext';
import { CardsContext } from '../state/CardsContext';

import { provider } from '../services/catalogueSceneProvider.service';
import {
  ADD_COMBINED,
  ADD_COMBINED_AND_CACHE,
  catalogueReducer
} from '../state/catalogue/reducer';

interface Props {
  scene: string;
}

export const Catalogue: React.FC<Props> = ({ scene }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cards, addCards, addCardsAndCache, updateCard } =
    useContext(CardsContext);

  const [catalogue, dispatch] = useReducer(catalogueReducer, {});

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);

  useEffect(() => {
    provider[scene].getCache?.().then(cache => {
      if (isMounted.current) dispatch({ type: ADD_COMBINED, scene, ...cache });
    });
    provider[scene]
      .getCombined?.({ page: page.current, signal: abortC.current.signal })
      .then(([all, newContent, inProgress, method]) => {
        console.log(all);
        if (isMounted.current) {
          addCardsAndCache(all?.data);
          dispatch({
            type: ADD_COMBINED_AND_CACHE,
            scene,
            method,
            all: all?.data,
            inProgress: inProgress?.data,
            newContent: newContent?.data
          });
        }
      });
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);
  console.log(scene, cards, theme, catalogue);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => toggleTheme()}>
        <Text style={{ padding: 20, backgroundColor: 'red' }}>
          change theme
        </Text>
      </TouchableOpacity>
      <Text style={{ fontWeight: '900', fontSize: 20 }}>{scene} catalogue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
