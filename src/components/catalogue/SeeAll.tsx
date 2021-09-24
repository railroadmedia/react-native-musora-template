import type { ParamListBase, RouteProp } from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useReducer } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { RowCard } from '../../common_components/cards/RowCard';
import { provider } from '../../services/catalogueSceneProvider.service';
import { CardsContext } from '../../state/cards/CardsContext';
import {
  ADD_CONTENT,
  seeAllReducer,
  SET_CONTENT
} from '../../state/catalogue/SeeAllReducer';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { Filters } from './Filters';

interface Props {
  route: RouteProp<ParamListBase, 'seeAll'> & {
    params: {
      title: string;
      fetcher: {
        scene: string;
        fetcherName:
          | 'getAll'
          | 'getInProgress'
          | 'getRecentlyViewed'
          | 'getNew';
      };
    };
  };
}

export const SeeAll: React.FC<Props> = ({
  route: {
    params: {
      fetcher: { scene, fetcherName }
    }
  }
}) => {
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  const refreshPromise = useRef<Promise<void | {}>>();
  const filters = useRef<{} | undefined>({ refreshing: true });
  const selectedFilters = useRef('');

  const [{ content, refreshing, loadingMore }, dispatch] = useReducer(
    seeAllReducer,
    { content: [], loadingMore: false, refreshing: true }
  );

  const { addCards } = useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    setContent();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setContent = () => {
    refreshPromise.current = provider[scene][fetcherName]?.({
      page: page.current,
      signal: abortC.current.signal
    }).then(({ data, meta }) => {
      if (isMounted.current) {
        filters.current = meta?.filterOptions;
        addCards(data);
        dispatch({ type: ADD_CONTENT, content: data || [], refreshing: false });
      }
    });
  };

  const flHeader = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.subtitle}>{scene}</Text>
        <Filters
          options={filters.current}
          onApply={({ apiQuery, formattedQuery }) => {
            if (isMounted.current) {
              page.current = 1;
              abortC.current.abort();
              abortC.current = new AbortController();
              filters.current = { refreshing: true };
              selectedFilters.current = formattedQuery;
              dispatch({
                type: SET_CONTENT,
                content: [],
                loadingMore: false,
                refreshing: true
              });
              provider[scene][fetcherName]?.({
                page: page.current,
                signal: abortC.current.signal,
                filters: apiQuery
              }).then(({ data, meta }) => {
                filters.current = meta?.filterOptions;
                if (isMounted.current) {
                  addCards(data);
                  dispatch({
                    type: SET_CONTENT,
                    content: data,
                    loadingMore: false,
                    refreshing: false
                  });
                }
              });
            }
          }}
        />
      </View>
      {!!selectedFilters.current && (
        <Text style={styles.appliedFilters}>
          <Text style={{ fontWeight: '800' }}>FILTERS APPLIED</Text>
          {selectedFilters.current}
        </Text>
      )}
    </>
  );

  const renderFLItem = ({ item }: { item: number }) => (
    <RowCard id={item} route={scene} />
  );

  const flEmpty = refreshing ? (
    <ActivityIndicator
      size='small'
      color={utils.color}
      animating={true}
      style={{ padding: 15 }}
    />
  ) : (
    <Text style={styles.emptyListText}>There is no content.</Text>
  );

  const flFooter = (
    <ActivityIndicator
      size='small'
      color={utils.color}
      animating={loadingMore}
      style={{ padding: 15 }}
    />
  );

  const flRefreshControl = (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={() => refresh()}
      refreshing={refreshing}
    />
  );

  const refresh = () => {
    page.current = 1;
    abortC.current.abort();
    abortC.current = new AbortController();
    filters.current = { refreshing: true, reset: true };
    selectedFilters.current = '';
    dispatch({ type: ADD_CONTENT, loadingMore: false, refreshing: true });
    setContent();
  };

  const loadMore = () => {
    dispatch({ type: ADD_CONTENT, loadingMore: true });
    refreshPromise.current?.then(() => {
      provider[scene][fetcherName]?.({
        page: ++page.current,
        signal: abortC.current.signal
      }).then(({ data }) => {
        addCards(data);
        dispatch({
          type: ADD_CONTENT,
          content: data || [],
          loadingMore: false
        });
      });
    });
  };

  return (
    <FlatList
      style={styles.flatList}
      showsVerticalScrollIndicator={false}
      data={content}
      renderItem={renderFLItem}
      keyExtractor={id => id.toString()}
      ListHeaderComponent={flHeader}
      ListEmptyComponent={flEmpty}
      ListFooterComponent={flFooter}
      refreshControl={flRefreshControl}
      onEndReached={loadMore}
    />
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    flatList: {
      backgroundColor: current.background,
      flex: 1
    },
    emptyListText: {
      padding: 20,
      textAlign: 'center',
      color: current.textColor
    },
    subtitle: {
      fontSize: utils.figmaFontSizeScaler(20),
      fontFamily: 'OpenSans',
      fontWeight: '700',
      color: current.textColor,
      marginVertical: 20,
      flex: 1,
      textTransform: 'capitalize'
    },
    appliedFilters: {
      flex: 1,
      padding: 15,
      paddingVertical: 5,
      textTransform: 'uppercase',
      fontFamily: 'RobotoCondensed-Regular',
      color: current.contrastTextColor
    }
  });
