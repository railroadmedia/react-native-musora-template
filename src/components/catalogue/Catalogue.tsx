import React, {
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useRef,
  useCallback
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

import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase, RouteProp } from '@react-navigation/native';

import { Carousel } from './Carousel';
import { Filters } from './Filters';

import { MethodBanner } from '../../common_components/MethodBanner';
import { Sort } from '../../common_components/Sort';
import { RowCard } from '../../common_components/cards/RowCard';

import { CardsContext } from '../../state/cards/CardsContext';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { UserContext } from '../../state/user/UserContext';
import { MethodContext } from '../../state/method/MethodContext';
import {
  ADD_ALL,
  SET_CATALOGUE_FROM_CACHE,
  SET_CATALOGUE_THEN_CACHE,
  catalogueReducer,
  SET_ALL
} from '../../state/catalogue/CatalogueReducer';

import { provider } from '../../services/catalogueSceneProvider.service';

import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { Live } from './Live';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { ShowCard } from '../../common_components/cards/ShowCard';
import type { Show } from '../../interfaces/show.interfaces';
import type { Card } from '../../interfaces/card.interfaces';

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

  const { updateMethod } = useContext(MethodContext);
  const { user } = useContext(UserContext);
  const { addCardsAndCache, addCards } = useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  const [
    { recentlyViewed, inProgress, newContent, all, loadingMore, refreshing },
    dispatch
  ] = useReducer(catalogueReducer, { loadingMore: false, refreshing: true });

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  const refreshPromise = useRef<Promise<void | {}>>();
  const filters = useRef<{} | undefined>({ refreshing: true });
  const selectedFilters = useRef<{ formattedQuery: string; apiQuery: string }>({
    formattedQuery: '',
    apiQuery: ''
  });
  const selectedSort = useRef('');

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    provider[scene]?.getCache?.().then(cache => {
      if (isMounted.current) {
        updateMethod(cache.method);
        dispatch({ type: SET_CATALOGUE_FROM_CACHE, cache });
      }
    });
    setCatalogue();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setCatalogue = () => {
    if (!isConnected) return showNoConnectionAlert();

    refreshPromise.current = provider[scene]
      ?.getCatalogue?.({ page: page.current, signal: abortC.current.signal })
      .then(([aRes, ncRes, ipRes, rvRes, mRes]) => {
        if (isMounted.current) {
          filters.current = aRes?.meta?.filterOptions;
          if (aRes) {
            if (scene === 'shows') {
              aRes = transformShowsData(aRes as Record<string, Show>);
            } else if (scene === 'live' || scene === 'scheduled') {
              aRes.data = groupByMonth(aRes as Card[]);
            }
          }
          updateMethod(mRes);
          addCardsAndCache(
            aRes?.data
              ?.concat(ncRes?.data || [])
              .concat(ipRes?.data || [])
              .concat(rvRes?.data || [])
          );
          dispatch({
            type: SET_CATALOGUE_THEN_CACHE,
            scene,
            all: aRes?.data,
            inProgress: ipRes?.data,
            recentlyViewed: rvRes?.data,
            newContent: ncRes?.data,
            refreshing: false
          });
        }
      });
  };

  const transformTitle = (title: string) => {
    if (title === 'studentFocus') return 'Student Focus';
    if (title === 'playAlongs') return 'Play Alongs';
    return title;
  };

  const groupByMonth = (content: Card[]) => {
    return content.map((x: Card, i: number) => {
      let month = new Date(
        `${x.live_event_start_time || x.published_on} UTC`
      ).toLocaleString([], { month: 'long' });
      let prevMonth = new Date(
        `${
          content[i - 1]?.live_event_start_time || content[i - 1]?.published_on
        } UTC`
      ).toLocaleString([], { month: 'long' });
      return month === prevMonth ? x : { ...x, month };
    });
  };

  const transformShowsData = (showData: Record<string, Show>) => {
    let allShows: { data: any[] } = { data: [] };

    allShows.data = Object.keys(showData).map(key => ({
      ...showData[key],
      type: key
    }));

    for (let i = 0; i < allShows.data.length; i++) {
      allShows.data[i].id = i;
    }
    return allShows;
  };

  const getAll = () => {
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
        filters: selectedFilters.current.apiQuery,
        sort: selectedSort.current
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
  };

  const onSort = useCallback((sortBy: string) => {
    if (isMounted.current) {
      page.current = 1;
      abortC.current.abort();
      abortC.current = new AbortController();
      selectedSort.current = sortBy;
      getAll();
    }
  }, []);

  const onFilter = useCallback(
    ({
      apiQuery,
      formattedQuery
    }: {
      apiQuery: string;
      formattedQuery: string;
    }) => {
      if (isMounted.current) {
        page.current = 1;
        abortC.current.abort();
        abortC.current = new AbortController();
        filters.current = { refreshing: true };
        selectedFilters.current = { formattedQuery, apiQuery };
        getAll();
      }
    },
    []
  );

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
      {!!hasMethodBanner && <MethodBanner />}
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
        <Text style={styles.sceneTitle}>{transformTitle(scene)}</Text>
      )}
      {scene.match(/^(home)$/) && <Live />}
      {!!recentlyViewed?.length ? (
        renderCarousel(recentlyViewed, 'Recently Viewed')
      ) : (
        <>
          {renderCarousel(inProgress, 'Continue')}
          {scene.match(/^(courses)$/) &&
            renderCarousel(newContent, 'New Lessons')}
        </>
      )}
      {scene !== 'shows' && scene !== 'live' && scene !== 'scheduled' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 5
          }}
        >
          <Text style={styles.sectionTitle}>All Lessons</Text>
          <Sort onSort={onSort} />
          <Filters options={filters.current} onApply={onFilter} />
        </View>
      )}
      {selectedFilters.current?.formattedQuery !== '' && (
        <Text style={styles.appliedFilters}>
          <Text style={{ fontWeight: '800' }}>FILTERS APPLIED</Text>
          {selectedFilters.current.formattedQuery}
        </Text>
      )}
    </>
  );

  const renderFLItem = ({ item }: { item: number }) => {
    return scene === 'shows' ? (
      <ShowCard id={item} />
    ) : (
      <RowCard id={item} route={scene} />
    );
  };

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
    if (!isConnected) return showNoConnectionAlert();

    page.current = 1;
    abortC.current.abort();
    abortC.current = new AbortController();
    filters.current = { refreshing: true, reset: true };
    selectedFilters.current = { apiQuery: '', formattedQuery: '' };
    selectedSort.current = '-published_on';
    dispatch({ loadingMore: false, refreshing: true });
    setCatalogue();
  };

  const loadMore = () => {
    if (!isConnected) return showNoConnectionAlert();

    dispatch({ loadingMore: true });
    refreshPromise.current?.then(() => {
      provider[scene]
        ?.getAll({
          page: ++page.current,
          signal: abortC.current.signal,
          filters: selectedFilters.current.apiQuery,
          sort: selectedSort.current
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

  const goToStudentReview = () => {
    navigate('studentReview');
  };

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={all}
        renderItem={renderFLItem}
        numColumns={scene === 'shows' ? 2 : 1}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={flHeader}
        ListEmptyComponent={flEmpty}
        ListFooterComponent={flFooter}
        refreshControl={flRefreshControl}
        onEndReached={loadMore}
      />
      {scene.match(/^(studentFocus)$/) && (
        <TouchableOpacity
          style={styles.studentFocusBtn}
          onPress={goToStudentReview}
        >
          <Text style={styles.studentFocusBtnText}>
            APPLY FOR A STUDENT PLAN
          </Text>
        </TouchableOpacity>
      )}
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
      fontFamily: 'OpenSans-Bold',
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
    },
    studentFocusBtn: {
      alignSelf: 'center',
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: utils.color,
      position: 'absolute',
      bottom: 10
    },
    studentFocusBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      color: '#FFFFFF',
      paddingHorizontal: 35
    },
    showBtn: {
      flex: 1,
      padding: 5,
      aspectRatio: 1
    },
    touchableImageShow: {
      flex: 1,
      borderRadius: 10
    }
  });
