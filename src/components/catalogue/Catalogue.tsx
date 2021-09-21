import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useReducer,
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
  UPDATE_CATALOGUE_LOADERS,
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
import ActionModal from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';
import { methodService } from '../../services/method.service';

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
  let styles = setStyles(theme);

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

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    provider[scene]?.getCache?.().then(cache => {
      if (isMounted.current)
        dispatch({ type: SET_CATALOGUE_FROM_CACHE, scene, cache });
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

  const onBannerRightBtnPress = useCallback(() => {
    navigate('method');
  }, []);

  const onBannerLefttBtnPress = useCallback(() => {
    // TODO: navigate to method.next_lesson
  }, []);

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

  const renderFLHeader = () => (
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
          onApply={filterQuery => {
            page.current = 1;
            abortC.current.abort();
            abortC.current = new AbortController();
            filters.current = undefined;
            dispatch({
              type: SET_ALL,
              scene,
              all: [],
              loadingMore: false,
              refreshing: true
            });
            provider[scene]
              ?.getAll({
                page: ++page.current,
                signal: abortC.current.signal,
                filters: filterQuery
              })
              .then(all => {
                filters.current = all?.meta?.filterOptions;
                if (isMounted.current) {
                  addCards(all?.data);
                  dispatch({
                    type: SET_ALL,
                    scene,
                    method,
                    all: all?.data,
                    loadingMore: false,
                    refreshing: false
                  });
                }
              });
          }}
        />
      </View>
    </>
  );

  const renderFLItem = ({ item }: { item: number }) => (
    <RowCard id={item} route={scene} />
  );

  const renderFLEmpty = () =>
    refreshing ? (
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

  const renderFLRefreshControl = () => (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={!!refreshing}
    />
  );

  const refresh = () => {
    page.current = 1;
    abortC.current.abort();
    abortC.current = new AbortController();
    dispatch({
      type: UPDATE_CATALOGUE_LOADERS,
      scene,
      loadingMore: false,
      refreshing: true
    });
    setCatalogue();
  };

  const loadMore = () => {
    dispatch({ type: UPDATE_CATALOGUE_LOADERS, scene, loadingMore: true });
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
            scene,
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
    }
  });
