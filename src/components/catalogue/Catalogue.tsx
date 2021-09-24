import React, {
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';

import { MethodBanner } from '../../common_components/MethodBanner';

import { CardsContext } from '../../state/cards/CardsContext';

import { provider } from '../../services/catalogueSceneProvider.service';
import {
  ADD_ALL,
  SET_CATALOGUE_FROM_CACHE,
  SET_CATALOGUE_THEN_CACHE,
  catalogueReducer,
  SET_ALL
} from '../../state/catalogue/CatalogueReducer';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { UserContext } from '../../state/user/UserContext';
import { utils } from '../../utils';
import { Carousel } from './Carousel';
import { Filters } from './Filters';
import { Sort } from '../../common_components/Sort';
import { RowCard } from '../../common_components/cards/RowCard';

import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
interface Props {
  route: RouteProp<ParamListBase>;
  navigation: StackNavigationProp<ParamListBase>;
}

export const Catalogue: React.FC<Props> = ({
  route: { name: scene },
  navigation: { navigate }
}) => {
  const hasMethodBanner = scene.match(/^(home)$/),
    hasUserInfo = scene.match(/^(home)$/);

  const { user } = useContext(UserContext);
  const { addCardsAndCache, addCards } = useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  const [
    {
      method,
      recentlyViewed,
      inProgress,
      newContent,
      all,
      loadingMore,
      refreshing
    },
    dispatch
  ] = useReducer(catalogueReducer, {
    loadingMore: false,
    refreshing: true
  });

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  const refreshPromise = useRef<Promise<void | {}>>();
  const filters = useRef<{} | undefined>({ refreshing: true });
  const selectedFilters = useRef('');

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    provider[scene]?.getCache?.().then(cache => {
      if (isMounted.current)
        dispatch({ type: SET_CATALOGUE_FROM_CACHE, cache });
    });
    setCatalogue();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setCatalogue = () =>
    (refreshPromise.current = provider[scene]
      ?.getCatalogue?.({ page: page.current, signal: abortC.current.signal })
      .then(([aRes, ncRes, ipRes, rvRes, mRes]) => {
        if (isMounted.current) {
          filters.current = aRes?.meta?.filterOptions;
          addCardsAndCache(
            aRes?.data
              ?.concat(ncRes?.data || [])
              .concat(ipRes?.data || [])
              .concat(rvRes?.data || [])
          );
          dispatch({
            type: SET_CATALOGUE_THEN_CACHE,
            scene,
            method: mRes,
            all: aRes?.data,
            inProgress: ipRes?.data,
            recentlyViewed: rvRes?.data,
            newContent: ncRes?.data,
            refreshing: false
          });
        }
      }));

  const renderCarousel = (items: number[] | undefined, title: string) => {
    let seeAllFetcher = 'getInProgress';
    switch (title) {
      case 'Recently Viewed':
        seeAllFetcher = 'getRecentlyViewed';
        break;
      case 'Continue':
        seeAllFetcher = 'getInProgress';
        break;
      case 'New Lessons':
        seeAllFetcher = 'getNew';
    }
    return items?.length ? (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity
            onPress={() =>
              navigate('seeAll', {
                title,
                fetcher: { scene, fetcherName: seeAllFetcher }
              })
            }
          >
            <Text style={{ color: utils.color, padding: 10 }}>See All</Text>
          </TouchableOpacity>
        </View>
        <Carousel items={items} />
      </>
    ) : null;
  };

  const flHeader = (
    <>
      {!!hasMethodBanner && method && !method.completed && (
        <MethodBanner {...method} />
      )}
      {!!hasUserInfo ? (
        <View style={styles.userInfoContainer}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
          {utils.isTablet && (
            <>
              <Text style={styles.userStatsTitle}>
                DAYS AS A MEMBER{`\n`}
                <Text style={styles.userStatsValue}>
                  {user.daysAsMember || 0}
                </Text>
              </Text>
              <Text style={styles.userStatsTitle}>
                LESSONS COMPLETED{`\n`}
                <Text style={styles.userStatsValue}>
                  {user.lessonsCompleted || 0}
                </Text>
              </Text>
            </>
          )}
          <Text style={styles.userStatsTitle}>
            XP{`\n`}
            <Text style={styles.userStatsValue}>{user.totalXp || 0}</Text>
          </Text>
          <Text style={styles.userStatsTitle}>
            {utils.brand} METHOD{`\n`}
            <Text style={styles.userStatsValue}>{user.xpRank || '-'}</Text>
          </Text>
        </View>
      ) : (
        <Text style={styles.sceneTitle}>{scene}</Text>
      )}
      {!!recentlyViewed?.length ? (
        renderCarousel(recentlyViewed, 'Recently Viewed')
      ) : (
        <>
          {renderCarousel(inProgress, 'Continue')}
          {renderCarousel(newContent, 'New Lessons')}
        </>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 5
        }}
      >
        <Text style={styles.sectionTitle}>All Lessons</Text>
        <Sort onPress={() => {}} />
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
                type: SET_ALL,
                all: [],
                loadingMore: false,
                refreshing: true
              });
              provider[scene]
                ?.getAll({
                  page: page.current,
                  signal: abortC.current.signal,
                  filters: apiQuery
                })
                .then(aRes => {
                  filters.current = aRes?.meta?.filterOptions;
                  if (isMounted.current) {
                    addCards(aRes?.data);
                    dispatch({
                      type: SET_ALL,
                      all: aRes?.data,
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
      refreshing={!!refreshing}
    />
  );

  const refresh = () => {
    page.current = 1;
    abortC.current.abort();
    abortC.current = new AbortController();
    filters.current = { refreshing: true, reset: true };
    selectedFilters.current = '';
    dispatch({ loadingMore: false, refreshing: true });
    setCatalogue();
  };

  const loadMore = () => {
    dispatch({ loadingMore: true });
    refreshPromise.current?.then(() => {
      provider[scene]
        ?.getAll({
          page: ++page.current,
          signal: abortC.current.signal
        })
        .then(aRes => {
          addCards(aRes?.data);
          dispatch({
            type: ADD_ALL,
            all: aRes?.data,
            loadingMore: false
          });
        });
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={all}
        renderItem={renderFLItem}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={flHeader}
        ListEmptyComponent={flEmpty}
        ListFooterComponent={flFooter}
        refreshControl={flRefreshControl}
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
    sceneTitle: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(30),
      fontWeight: '800',
      textTransform: 'capitalize',
      paddingLeft: 5
    },
    userInfoContainer: {
      flexDirection: 'row',
      padding: 20,
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: current.contrastBackground
    },
    avatarImg: {
      width: 60,
      aspectRatio: 1,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: utils.color
    },
    userStatsTitle: {
      color: current.contrastTextColor,
      fontSize: utils.figmaFontSizeScaler(11),
      fontFamily: 'OpenSans',
      textTransform: 'uppercase',
      textAlign: 'center'
    },
    userStatsValue: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(26),
      fontWeight: '800'
    },
    sectionTitle: {
      fontSize: utils.figmaFontSizeScaler(20),
      fontFamily: 'OpenSans',
      fontWeight: '700',
      color: current.textColor,
      marginVertical: 20,
      flex: 1
    },
    emptyListText: {
      padding: 20,
      textAlign: 'center',
      color: current.textColor
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
