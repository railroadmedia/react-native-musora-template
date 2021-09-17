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
  SET_METHOD,
  SET_ALL
} from '../../state/catalogue/CatalogueReducer';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { UserContext } from '../../state/user/UserContext';
import { utils } from '../../utils';
import { Carousel } from './Carousel';
import { Filters } from './Filters';
import { Sort } from '../../common_components/Sort';
import RowCard from '../../common_components/cards/RowCard';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ActionModal from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';
import { methodService } from '../../services/method.service';

interface Props {
  scene: string;
}

export const Catalogue: React.FC<Props> = ({ scene }) => {
  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props?: {}) => void;
    }
  >();

  const hasMethodBanner = scene.match(/^(home)$/),
    hasUserInfo = scene.match(/^(home)$/);

  const { user } = useContext(UserContext);
  const { addCardsAndCache, addCards } = useContext(CardsContext);
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  const [showResetModal, setShowResetModal] = useState(false);

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
  const filters = useRef<{} | undefined>();
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
      .then(([all, newContent, inProgress, recentlyViewed, method]) => {
        filters.current = all?.meta?.filterOptions;
        if (isMounted.current) {
          addCardsAndCache(
            all?.data
              ?.concat(newContent?.data || [])
              .concat(inProgress?.data || [])
              .concat(recentlyViewed?.data || [])
          );
          dispatch({
            type: SET_CATALOGUE_THEN_CACHE,
            scene,
            method,
            all: all?.data,
            inProgress: inProgress?.data,
            recentlyViewed: recentlyViewed?.data,
            newContent: newContent?.data,
            refreshing: false
          });
        }
      }));

  const onBannerRightBtnPress = () => navigate('method');

  const onBannerLefttBtnPress = () => {
    if (method?.completed) {
      setShowResetModal(true);
    } else {
      // TODO: navigate to method.next_lesson
    }
  };

  const resetMethodProgress = () => {
    dispatch({ loadingMore: false, refreshing: true });
    if (method) {
      userService.resetProgress(method.id);
      setShowResetModal(false);
      methodService.getMethod(abortC.current.signal).then(methodRes => {
        if (isMounted.current) {
          addCards([methodRes.next_lesson]);
          dispatch({ type: SET_METHOD, method: methodRes, refreshing: false });
        }
      });
    }
  };

  const renderFLMethodBanner = () => (
    <MethodBanner
      {...method}
      isBig={true}
      onRightBtnPress={onBannerRightBtnPress}
      onLeftBtnPress={onBannerLefttBtnPress}
    />
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
      {!!hasMethodBanner && renderFLMethodBanner()}
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
            page.current = 1;
            abortC.current.abort();
            abortC.current = new AbortController();
            filters.current = undefined;
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
              .then(all => {
                filters.current = all?.meta?.filterOptions;
                if (isMounted.current) {
                  addCards(all?.data);
                  dispatch({
                    type: SET_ALL,
                    all: all?.data,
                    loadingMore: false,
                    refreshing: false
                  });
                }
              });
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

  const renderFLFooter = () => (
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
        .then(all => {
          addCards(all?.data);
          dispatch({
            type: ADD_ALL,
            method,
            all: all?.data,
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
        ListFooterComponent={renderFLFooter}
        refreshControl={flRefreshControl}
        onEndReached={loadMore}
      />
      {showResetModal && (
        <ActionModal
          title='Hold your horses...'
          message={`This will reset your progress\nand cannot be undone.\nAre you sure about this?`}
          btnText='RESET'
          onAction={resetMethodProgress}
          onCancel={() => setShowResetModal(false)}
        />
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
