import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  BackHandler,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  ParamListBase
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { back } from '../../images/svgs';
import type {
  Show as I_Show,
  ShowLessons
} from '../../interfaces/show.interfaces';
import { RowCard } from '../../common_components/cards/RowCard';
import { showService } from '../../services/show.service';
import { CardsContext } from '../../state/cards/CardsContext';
import type { Card } from '../../interfaces/card.interfaces';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { Filters } from '../catalogue/Filters';

interface Props {
  route: RouteProp<ParamListBase, 'showOverview'> & {
    params: {
      show: I_Show;
    };
  };
}

export const ShowOverview: React.FC<Props> = ({
  route: {
    params: { show }
  }
}) => {
  const { navigate, goBack } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props?: {}) => void;
    }
  >();
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [animateLessons, setAnimateLessons] = useState(true);
  const [showLessons, setShowLessons] = useState<Card[]>([]);
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  const filters = useRef<{} | undefined>({ refreshing: true });
  const selectedFilters = useRef<{ formattedQuery: string; apiQuery: string }>({
    formattedQuery: '',
    apiQuery: ''
  });

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getShow();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getShow = () => {
    if (!isConnected) return showNoConnectionAlert();

    showService
      .getLessons(
        show.type,
        page.current,
        abortC.current.signal,
        selectedFilters.current.apiQuery,
        '-published_on'
      )
      .then((showRes: ShowLessons) => {
        if (showRes) {
          filters.current = showRes.meta?.filterOptions;

          addCards(showRes.data);
          setShowLessons(showRes.data);
          setRefreshing(false);
          setAnimateLessons(false);
        }
      });
  };

  const loadMore = () => {
    if (!isConnected) return showNoConnectionAlert();
    console.log(filters.current);
    setAnimateLessons(true);
    showService
      .getLessons(
        show.type,
        ++page.current,
        abortC.current.signal,
        selectedFilters.current?.apiQuery,
        '-published_on'
      )
      .then((showRes: ShowLessons) => {
        if (showRes) {
          addCards(showRes.data);
          const lessons = [...showLessons, ...showRes.data];
          setShowLessons([...showLessons, ...showRes.data]);
          setAnimateLessons(false);
        }
      });
  };

  const refresh = () => {
    if (!isConnected) return showNoConnectionAlert();

    abortC.current.abort();
    abortC.current = new AbortController();
    page.current = 1;
    filters.current = { refreshing: true, reset: true };
    selectedFilters.current = { apiQuery: '', formattedQuery: '' };
    setRefreshing(true);
    getShow();
  };

  const onApplyFilters = useCallback(({ apiQuery, formattedQuery }) => {
    if (isMounted.current) {
      page.current = 1;
      abortC.current.abort();
      abortC.current = new AbortController();
      filters.current = { refreshing: true };
      selectedFilters.current = { apiQuery, formattedQuery };
      getShow();
    }
  }, []);

  const renderFListHeader = (): ReactElement => (
    <>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={goBack} style={styles.backBtnContainer}>
          {back({
            icon: {
              fill: themeStyles[theme].textColor,
              height: 15,
              width: 15
            }
          })}
        </TouchableOpacity>
        <Image
          style={styles.image}
          source={{
            uri: `https://cdn.musora.com/image/fetch/q_auto:eco,w_300,ar_1/${show.thumbnailUrl}`
          }}
        />
        {show.type === 'question-and-answer' && (
          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigate('askQuestion')}
          >
            <Text style={styles.buttonText}>ASK A QUESTION</Text>
          </TouchableOpacity>
        )}
        {show.type === 'student-collaborations' && (
          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigate('submitCollabVideo')}
          >
            <Text style={styles.buttonText}>SUBMIT YOUR VIDEO</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.description}>
          {show.description?.replace(/\s+/g, ' ')}
        </Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>ALL EPISODES</Text>
        <View style={styles.center}>
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

  const renderFListEmpty = (): ReactElement | null => {
    if (!animateLessons)
      return <Text style={styles.noContentText}>There are no lessons</Text>;
    return null;
  };

  const renderFListFooter = (): ReactElement => (
    <ActivityIndicator
      style={{ marginTop: 10, marginBottom: 10 }}
      size='large'
      color={utils.color}
      animating={animateLessons}
      hidesWhenStopped={true}
    />
  );

  const renderFListItem = ({
    item
  }: {
    item: { id: number };
  }): ReactElement => <RowCard id={item.id} route='showOverview' />;

  const flRefreshControl = (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={refreshing}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      {showLessons && (
        <FlatList
          style={styles.container}
          data={showLessons}
          key='flatlist'
          keyboardShouldPersistTaps='handled'
          keyExtractor={lesson => lesson.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          removeClippedSubviews={true}
          refreshControl={flRefreshControl}
          ListHeaderComponent={renderFListHeader()}
          ListEmptyComponent={renderFListEmpty()}
          ListFooterComponent={renderFListFooter()}
          renderItem={renderFListItem}
        />
      )}
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    backBtnContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 15,
      zIndex: 2
    },
    image: {
      width: '60%',
      aspectRatio: 1,
      borderRadius: 5,
      margin: 20
    },
    showTitle: {
      textAlign: 'center'
    },
    subtitleContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
      marginTop: 10,
      backgroundColor: current.background
    },
    subtitle: {
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold',
      color: current.textColor
    },
    buttonText: {
      padding: 15,
      textAlign: 'center',
      alignSelf: 'center',
      color: '#ffffff',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15)
    },
    center: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    description: {
      padding: 15,
      textAlign: 'center',
      alignSelf: 'center',
      color: current.textColor
    },
    noContentText: {
      textAlign: 'center',
      marginTop: 100,
      color: utils.color,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    },
    extraBtn: {
      backgroundColor: utils.color,
      width: '80%',
      borderRadius: 50,
      marginBottom: 20
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
