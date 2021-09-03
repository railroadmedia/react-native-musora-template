import type { ParamListBase, RouteProp } from '@react-navigation/native';
import React, { useContext, useEffect, useRef } from 'react';
import { useReducer } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import RowCard from '../../common_components/cards/RowCard';
import { provider } from '../../services/catalogueSceneProvider.service';
import { CardsContext } from '../../state/cards/CardsContext';
import {
  ADD_CONTENT,
  seeAllReducer
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

  const [{ content, refreshing, loadingMore }, dispatch] = useReducer(
    seeAllReducer,
    { content: [], loadingMore: false, refreshing: true }
  );

  const { addCards } = useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

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
    }).then(({ data }) => {
      if (isMounted.current) {
        addCards(data);
        dispatch({ type: ADD_CONTENT, content: data || [], refreshing: false });
      }
    });
  };

  const renderFLHeader = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.subtitle}>{scene}</Text>
      <Filters onPress={() => {}} />
    </View>
  );

  const renderFLItem = ({ item }: { item: number }) => (
    <RowCard id={item} route={scene} />
  );

  const renderFLEmpty = () =>
    refreshing ? (
      <></>
    ) : (
      <Text style={styles.emptyListText}>There is no content.</Text>
    );

  const renderFLFooter = () => (
    <ActivityIndicator
      size='small'
      color={utils.color}
      animating={loadingMore}
      style={{ padding: 15 }}
    />
  );

  const renderFLRefreshControl = () => (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={refreshing}
    />
  );

  const refresh = () => {
    page.current = 1;
    abortC.current.abort();
    abortC.current = new AbortController();
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
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={content}
        renderItem={renderFLItem}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={renderFLHeader()}
        ListEmptyComponent={renderFLEmpty()}
        ListFooterComponent={renderFLFooter()}
        refreshControl={renderFLRefreshControl()}
        onEndReached={loadMore}
      />
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
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
    }
  });
