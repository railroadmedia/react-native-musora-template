import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';

import { Banner } from '../commons/Banner';

import { CardsContext } from '../state/CardsContext';

import { provider } from '../services/catalogueSceneProvider.service';
import {
  ADD_COMBINED,
  ADD_COMBINED_AND_CACHE,
  catalogueReducer
} from '../state/catalogue/reducer';
import { ThemeContext } from '../state/ThemeContext';
import { themeStyles } from '../themeStyles';

interface Props {
  scene: string;
}

export const Catalogue: React.FC<Props> = ({ scene }) => {
  const { cards, addCards, addCardsAndCache, updateCard } =
    useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  const [catalogue, dispatch] = useReducer(catalogueReducer, {});

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  useEffect(() => {
    provider[scene]?.getCache?.().then(cache => {
      if (isMounted.current) dispatch({ type: ADD_COMBINED, scene, ...cache });
    });
    provider[scene]
      ?.getCombined?.({ page: page.current, signal: abortC.current.signal })
      .then(([all, newContent, inProgress, method]) => {
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

  const renderFLMethodBanner = () => (
    <Banner
      {...catalogue.method}
      onMainPress={() => {}}
      onMoreInfoPress={() => {}}
    />
  );

  const renderFLHeader = () => <>{renderFLMethodBanner()}</>;

  const renderFLItem = ({ item: {} }) => <View></View>;

  console.log(catalogue.method);

  return (
    <View style={styles.container}>
      <FlatList
        data={catalogue.all}
        renderItem={renderFLItem}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={renderFLHeader()}
      />
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      backgroundColor: current.background,
      flex: 1
    }
  });
