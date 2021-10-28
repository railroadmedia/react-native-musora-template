import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { right } from '../../images/svgs';
import { CardsContext } from '../../state/cards/CardsContext';
import {
  ADD_COMPLETED,
  ADD_IN_PROGRESS,
  ADD_MY_LIST,
  myListReducer,
  REMOVE_COMPLETED,
  REMOVE_IN_PROGRESS,
  REMOVE_MY_LIST,
  SET_COMPLETED,
  SET_IN_PROGRESS,
  SET_MY_LIST_AND_CACHE,
  SET_MY_LIST_FROM_CACHE,
  UPDATE_MY_LIST_LOADERS
} from '../../state/myList/MyListReducer';
import { myListService } from '../../services/myList.service';
import { RowCard } from '../../common_components/cards/RowCard';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { Filters } from '../catalogue/Filters';
import { Sort } from '../../common_components/Sort';

interface Props {}

type TitleTypes = 'My List' | 'In Progress' | 'Completed';

export const MyList: React.FC<Props> = ({}) => {
  const { goBack } = useNavigation();

  const [pageTitle, setPageTitle] = useState<TitleTypes>('My List');
  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { addCardsAndCache, addCards } = useContext(CardsContext);
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const myListPage = useRef(1);
  const inProgressPage = useRef(1);
  const completedPage = useRef(1);
  const filters = useRef<{} | undefined>({ refreshing: true });
  const selectedFilters = useRef<{ formattedQuery: string; apiQuery: string }>({
    formattedQuery: '',
    apiQuery: ''
  });
  const selectedSort = useRef('');

  const [{ myList, completed, inProgress, loadingMore, refreshing }, dispatch] =
    useReducer(myListReducer, {
      loadingMore: false,
      refreshing: true
    });

  const styles = useMemo(() => setStyles(theme), [theme]);

  const backButtonHandler = () => {
    if (pageTitle !== 'My List') {
      setPageTitle('My List');
    } else {
      goBack();
    }
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backButtonHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
    };
  }, [backButtonHandler]);

  const setMyList = () => {
    if (!isConnected) return showNoConnectionAlert();

    myListService
      .myList({
        page: myListPage.current,
        signal: abortC.current.signal,
        filters: selectedFilters.current.apiQuery,
        sort: selectedSort.current
      })
      .then(myListRes => {
        if (isMounted.current) {
          filters.current = myListRes.meta?.filterOptions;
          addCardsAndCache(myListRes?.data);
          dispatch({
            type: SET_MY_LIST_AND_CACHE,
            myList: myListRes?.data,
            refreshing: false
          });
        }
      });
  };

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    myListService.getCache?.().then(cache => {
      if (isMounted.current) {
        dispatch({ type: SET_MY_LIST_FROM_CACHE, cache });
      }
    });
    setMyList();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setInProgress = () => {
    if (!isConnected) return showNoConnectionAlert();

    myListService
      .inProgress({
        page: inProgressPage.current,
        signal: abortC.current.signal,
        filters: selectedFilters.current.apiQuery,
        sort: selectedSort.current
      })
      .then(inProgressRes => {
        filters.current = inProgressRes.meta?.filterOptions;
        addCards(inProgressRes?.data);
        dispatch({
          type: SET_IN_PROGRESS,
          inProgress: inProgressRes?.data,
          refreshing: false
        });
      });
  };

  const setCompleted = () => {
    if (!isConnected) return showNoConnectionAlert();

    myListService
      .completed({
        page: completedPage.current,
        signal: abortC.current.signal,
        filters: selectedFilters.current.apiQuery,
        sort: selectedSort.current
      })
      .then(completedRes => {
        filters.current = completedRes.meta?.filterOptions;
        addCards(completedRes?.data);
        dispatch({
          type: SET_COMPLETED,
          completed: completedRes?.data,
          refreshing: false
        });
      });
  };

  const renderFLEmpty = (): ReactElement => (
    <Text style={styles.emptyListText}>
      {pageTitle === 'My List'
        ? 'When you add a lesson to your list it will show up here!'
        : pageTitle === 'In Progress'
        ? 'When you start a lesson it will show up here!'
        : 'When you complete a lesson it will show up here!'}
    </Text>
  );

  const renderFLFooter = (): ReactElement => (
    <ActivityIndicator
      size='small'
      color={utils.color}
      animating={loadingMore}
      style={{ padding: 15 }}
    />
  );

  const renderFLRefreshControl = (): ReactElement => (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={!!refreshing}
    />
  );

  const refresh = (): void => {
    if (!isConnected) return showNoConnectionAlert();

    abortC.current.abort();
    abortC.current = new AbortController();
    myListPage.current = 1;
    inProgressPage.current = 1;
    completedPage.current = 1;
    filters.current = { refreshing: true, reset: true };
    selectedFilters.current = { apiQuery: '', formattedQuery: '' };
    selectedSort.current = '';
    dispatch({
      type: UPDATE_MY_LIST_LOADERS,
      loadingMore: false,
      refreshing: true
    });
    decideCall(pageTitle);
  };

  const loadMore = (): void => {
    if (!isConnected) return showNoConnectionAlert();

    dispatch({ type: UPDATE_MY_LIST_LOADERS, loadingMore: true });
    if (pageTitle === 'In Progress') {
      myListService
        .inProgress({
          page: ++inProgressPage.current,
          signal: abortC.current.signal
        })
        .then(inProgressRes => {
          addCards(inProgressRes?.data);
          dispatch({
            type: ADD_IN_PROGRESS,
            inProgress: inProgressRes?.data,
            loadingMore: false
          });
        });
    } else if (pageTitle === 'Completed') {
      myListService
        .completed({
          page: ++completedPage.current,
          signal: abortC.current.signal
        })
        .then(completedRes => {
          addCards(completedRes?.data);
          dispatch({
            type: ADD_COMPLETED,
            completed: completedRes?.data,
            loadingMore: false
          });
        });
    } else {
      myListService
        .myList({
          page: ++myListPage.current,
          signal: abortC.current.signal
        })
        .then(myListRes => {
          addCards(myListRes?.data);
          dispatch({
            type: ADD_MY_LIST,
            myList: myListRes?.data,
            loadingMore: false
          });
        });
    }
  };

  const removeItemFromList = useCallback(
    (id: number) => {
      if (!isConnected) return showNoConnectionAlert();

      dispatch({
        type: REMOVE_MY_LIST,
        id
      });
    },
    [isConnected]
  );

  const removeItemFromProgess = useCallback(
    (id: number, title: string) => {
      if (!isConnected) return showNoConnectionAlert();

      if (title === 'In Progress') {
        dispatch({
          type: REMOVE_IN_PROGRESS,
          id
        });
      } else {
        dispatch({
          type: REMOVE_COMPLETED,
          id
        });
      }
    },
    [isConnected]
  );

  const onNavigate = (title: TitleTypes) => {
    if (!isConnected) return showNoConnectionAlert();
    selectedFilters.current = { apiQuery: '', formattedQuery: '' };
    selectedSort.current = '';
    setPageTitle(title);
    dispatch({
      type: UPDATE_MY_LIST_LOADERS,
      loadingMore: false,
      refreshing: true
    });
    decideCall(title);
  };

  const decideCall = (title: TitleTypes) => {
    if (title === 'In Progress') {
      setInProgress();
    } else if (title === 'Completed') {
      setCompleted();
    } else {
      setMyList();
    }
  };

  const onApplyFilters = useCallback(({ apiQuery, formattedQuery }) => {
    if (isMounted.current) {
      myListPage.current = 1;
      completedPage.current = 1;
      inProgressPage.current = 1;

      abortC.current.abort();
      abortC.current = new AbortController();
      filters.current = { refreshing: true };
      selectedFilters.current = { apiQuery, formattedQuery };
      decideCall(pageTitle);
    }
  }, []);

  const onSort = useCallback((sortBy: string) => {
    if (isMounted.current) {
      myListPage.current = 1;
      completedPage.current = 1;
      inProgressPage.current = 1;
      abortC.current.abort();
      abortC.current = new AbortController();
      selectedSort.current = sortBy;
      decideCall(pageTitle);
    }
  }, []);

  const renderFLHeader = (): ReactElement => {
    if (pageTitle === 'My List')
      return (
        <View>
          {['In Progress', 'Completed'].map((title, index) => (
            <TouchableOpacity
              testID={title}
              key={index}
              style={[styles.navigationButton]}
              onPress={() => onNavigate(title as TitleTypes)}
            >
              <Text style={styles.navigationBtnText}>{title}</Text>
              {right({
                icon: {
                  height: 20,
                  width: 20,
                  fill: themeStyles[theme].contrastTextColor
                }
              })}
            </TouchableOpacity>
          ))}
          {renderTitle('Added To My List')}
        </View>
      );
    return renderTitle(pageTitle);
  };

  const renderTitle = (title: string) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Sort onSort={onSort} />
          <Filters options={filters.current} onApply={onApplyFilters} />
        </View>
      </View>
      {selectedFilters.current.formattedQuery !== '' && (
        <Text style={styles.appliedFilters}>
          <Text style={{ fontWeight: '800' }}>FILTERS APPLIED</Text>
          {selectedFilters.current.formattedQuery}
        </Text>
      )}
    </>
  );

  const renderFLItem = ({ item }: { item: number }): ReactElement => (
    <RowCard
      id={item}
      route='myList'
      iconType={
        pageTitle === 'In Progress' || pageTitle === 'Completed'
          ? 'progress'
          : undefined
      }
      onRemoveFromMyList={removeItemFromList}
      onResetProgress={(id: number) => removeItemFromProgess(id, pageTitle)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={
          pageTitle === 'In Progress'
            ? inProgress
            : pageTitle === 'Completed'
            ? completed
            : myList
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.01}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={renderFLHeader()}
        ListEmptyComponent={renderFLEmpty()}
        ListFooterComponent={renderFLFooter()}
        refreshControl={renderFLRefreshControl()}
        renderItem={renderFLItem}
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
    navigationButton: {
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: current.borderColor
    },
    navigationBtnText: {
      color: current.contrastTextColor,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans-Bold'
    },
    title: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(20),
      fontFamily: 'OpenSans-Bold',
      paddingLeft: 15,
      paddingTop: 5,
      marginBottom: 10
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
