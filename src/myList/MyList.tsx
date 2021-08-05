import React, {
  useCallback,
  useContext,
  useEffect,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { utils } from '../utils';
import { ThemeContext } from '../state/ThemeContext';
import { themeStyles } from '../themeStyles';
import { right } from '../images/svgs';
import { CardsContext } from '../state/CardsContext';
import {
  ADD_COMPLETED,
  ADD_IN_PROGRESS,
  ADD_MY_LIST,
  myListReducer,
  SET_COMPLETED,
  SET_IN_PROGRESS,
  SET_MY_LIST_AND_CACHE,
  SET_MY_LIST_FROM_CACHE,
  UPDATE_MY_LIST_LOADERS
} from '../state/myList/reducer';
import { myListService } from '../services/myList.service';
import RowCard from '../commons/cards/RowCard';

interface MyListProps {}

type TitleTypes = 'In Progress' | 'Completed';

export const MyList: React.FC<MyListProps> = ({}) => {
  const [title, setTitle] = useState('My List');
  const { theme } = useContext(ThemeContext);
  const { addCardsAndCache, addCards } = useContext(CardsContext);
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  const [{ myList, completed, inProgress, loadingMore, refreshing }, dispatch] =
    useReducer(myListReducer, {
      loadingMore: false,
      refreshing: true
    });

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const backButtonHandler = useCallback(() => {
    setTitle('My List');
    return true;
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backButtonHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
    };
  }, [backButtonHandler]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    myListService.getCache?.().then(cache => {
      if (isMounted.current) dispatch({ type: SET_MY_LIST_FROM_CACHE, cache });
    });
    setMyList();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setMyList = () =>
    myListService
      .myList({ page: page.current, signal: abortC.current.signal })
      .then(myList => {
        if (isMounted.current) {
          addCardsAndCache(myList?.data);
          dispatch({
            type: SET_MY_LIST_AND_CACHE,
            myList: myList?.data,
            refreshing: false
          });
        }
      });

  const setInProgress = () =>
    myListService
      .inProgress({ page: page.current, signal: abortC.current.signal })
      .then(inProgress => {
        dispatch({
          type: SET_IN_PROGRESS,
          inProgress: inProgress?.data,
          refreshing: false
        });
      });

  const setCompleted = () =>
    myListService
      .completed({ page: page.current, signal: abortC.current.signal })
      .then(completed => {
        dispatch({
          type: SET_COMPLETED,
          completed: completed?.data,
          refreshing: false
        });
      });

  const renderFLEmpty = () => (
    <Text style={styles.emptyListText}>
      {title === 'My List'
        ? 'When you add a lesson to your list it will show up here!'
        : title === 'In Progress'
        ? 'When you start a lesson it will show up here!'
        : 'When you complete a lesson it will show up here!'}
    </Text>
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
      type: UPDATE_MY_LIST_LOADERS,
      loadingMore: false,
      refreshing: true
    });
    decideCall(title as TitleTypes);
  };

  const loadMore = () => {};

  const onNavigate = useCallback((title: TitleTypes) => {
    setTitle(title);
    dispatch({
      type: UPDATE_MY_LIST_LOADERS,
      loadingMore: false,
      refreshing: true
    });
    decideCall(title);
  }, []);

  const decideCall = useCallback((title: TitleTypes) => {
    if (title === 'In Progress') {
      setInProgress();
    } else if (title === 'Completed') {
      setCompleted();
    } else {
      setMyList();
    }
  }, []);

  const renderFLHeader = () => {
    if (title === 'My List')
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
          <Text style={styles.title}>Added To My List</Text>
        </View>
      );
    return <Text style={styles.title}>{title}</Text>;
  };

  const renderFLItem = ({ item }: any) => <RowCard id={item} route='myList' />;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={
          title === 'In Progress'
            ? inProgress
            : title === 'Completed'
            ? completed
            : myList
        }
        onEndReached={loadMore}
        keyExtractor={id => id.toString()}
        ListHeaderComponent={renderFLHeader()}
        ListEmptyComponent={renderFLEmpty()}
        ListFooterComponent={renderFLFooter()}
        refreshControl={renderFLRefreshControl()}
        renderItem={renderFLItem}
      />
    </SafeAreaView>
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
    }
  });
