import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useReducer,
  ReactElement,
  useMemo
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  RefreshControl,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import RowCard from '../../common_components/cards/RowCard';
import { search } from '../../images/svgs';
import {
  ADD_SEARCH,
  searchReducer,
  SET_SEARCH,
  UPDATE_SEARCH_LOADERS
} from '../../state/search/SearchReducer';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { CardsContext } from '../../state/cards/CardsContext';
import { searchService } from '../../services/search.service';

interface Props {}

export const Search: React.FC<Props> = ({}) => {
  const recetnSearchDefaultValue: string[] = [];
  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showResultsFound, setShowResultsFound] = useState(false);
  const [searchedText, setSearchedText] = useState('');
  const [nrOfResults, setNrOfResults] = useState(0);
  const [recentSearches, setRecentSearches] = useState(
    recetnSearchDefaultValue
  );
  const [{ searchResult, loadingMore, refreshing }, dispatch] = useReducer(
    searchReducer,
    {
      loadingMore: false,
      refreshing: true
    }
  );
  const abortC = useRef(new AbortController());
  const page = useRef(1);
  let styles = useMemo(() => setStyles(theme), [theme]);

  const backButtonHandler = useCallback(() => {
    if (showSearchResults) {
      setShowSearchResults(false);
      dispatch({
        type: SET_SEARCH,
        searchResult: [],
        refreshing: false
      });
    }
    return true;
  }, []);

  const getRecentSearches = useCallback(async () => {
    let value;
    try {
      value = await AsyncStorage.getItem('recentlySearched');
      if (value) {
        const recentlySearched = JSON.parse(value);
        setRecentSearches(recentlySearched);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    getRecentSearches();
    BackHandler.addEventListener('hardwareBackPress', backButtonHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
    };
  }, [backButtonHandler, getRecentSearches]);

  const onSearch = useCallback(() => {
    if (searchedText !== '') {
      setShowSearchResults(true);
      setShowResultsFound(false);
      searchService
        .search(searchedText, {
          page: page.current,
          signal: abortC.current.signal
        })
        .then(async searchRes => {
          addCards(searchRes?.data);
          dispatch({
            type: SET_SEARCH,
            searchResult: searchRes?.data,
            refreshing: false
          });
          if (searchRes.meta) setNrOfResults(searchRes.meta.totalResults);
          let recentSearchesTemp = recentSearches;
          if (recentSearches.indexOf(searchedText) === -1) {
            recentSearchesTemp = [searchedText].concat(recentSearches);
          }
          if (recentSearchesTemp.length > 5) {
            recentSearchesTemp.pop();
          }

          setRecentSearches(recentSearchesTemp);
          setShowResultsFound(true);
          try {
            await AsyncStorage.setItem(
              'recentlySearched',
              JSON.stringify(recentSearchesTemp)
            );
          } catch (e) {}
        });
    }
  }, [searchedText, recentSearches, addCards]);

  const clearRecentlySearched = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('recentlySearched');
      setRecentSearches([]);
    } catch (e) {}
  }, []);

  const onRecentSearchClicked = useCallback(
    (text: string) => {
      setShowSearchResults(true);
      setSearchedText(text);
      onSearch();
    },
    [setSearchedText, setShowSearchResults, onSearch]
  );

  const renderFLItem = ({ item }: { item: number }): ReactElement => (
    <RowCard id={item} route='search' />
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

  const renderFLEmpty = (): ReactElement => (
    <Text style={styles.emptyListText}>There is no result.</Text>
  );

  const renderFLHeader = (): ReactElement | null => {
    if (showResultsFound) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.headerText} numberOfLines={2}>
            {nrOfResults} Search Results
          </Text>
        </View>
      );
    }
    return null;
  };

  const refresh = () => {
    abortC.current.abort();
    abortC.current = new AbortController();
    page.current = 1;
    dispatch({
      type: UPDATE_SEARCH_LOADERS,
      loadingMore: false,
      refreshing: true
    });
  };

  const loadMore = () => {
    dispatch({ type: UPDATE_SEARCH_LOADERS, loadingMore: true });
    searchService
      ?.search(searchedText, {
        page: ++page.current,
        signal: abortC.current.signal
      })
      .then(searchRes => {
        addCards(searchRes?.data);
        dispatch({
          type: ADD_SEARCH,
          searchResult: searchRes?.data,
          loadingMore: false
        });
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={utils.isiOS ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.inputContainer,
              showSearchResults ? { marginBottom: 0, marginTop: 15 } : {}
            ]}
          >
            <View style={styles.searchIcon}>
              {search({
                icon: {
                  height: 20,
                  width: 20,
                  fill: themeStyles[theme].contrastTextColor
                }
              })}
            </View>

            <TextInput
              style={styles.textInput}
              autoCapitalize={'none'}
              autoCorrect={false}
              spellCheck={false}
              onChangeText={text => setSearchedText(text)}
              value={searchedText}
              placeholder={'Type your search...'}
              placeholderTextColor={themeStyles[theme].contrastTextColor}
              returnKeyType='go'
              onSubmitEditing={onSearch}
            />
          </View>
          {!showSearchResults ? (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.recentText}>RECENT</Text>
                <Text style={styles.clearText} onPress={clearRecentlySearched}>
                  Clear
                </Text>
              </View>
              {recentSearches.length > 0 ? (
                recentSearches.map(
                  (recentlySearched: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.recentlySearched,
                        index !== recentSearches.length - 1
                          ? { borderBottomWidth: 0 }
                          : null
                      ]}
                      onPress={() => onRecentSearchClicked(recentlySearched)}
                    >
                      <Text style={styles.recentlySearchedText}>
                        {recentlySearched}
                      </Text>
                    </TouchableOpacity>
                  )
                )
              ) : (
                <Text style={styles.noResultText}>No recent searches</Text>
              )}
            </>
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={searchResult}
              keyboardShouldPersistTaps='handled'
              keyExtractor={content => content.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              removeClippedSubviews={true}
              ListEmptyComponent={renderFLEmpty()}
              ListHeaderComponent={renderFLHeader()}
              ListFooterComponent={renderFLFooter()}
              refreshControl={renderFLRefreshControl()}
              renderItem={renderFLItem}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: current.background
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
      marginRight: 15,
      marginTop: 30,
      marginBottom: 30
    },
    textInput: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      paddingLeft: 40,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor,
      backgroundColor: current.textBoxColor
    },
    titleContainer: {
      padding: 15,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: current.borderColor,
      borderBottomWidth: 1
    },
    headerText: {
      color: current.contrastTextColor,
      flex: 1,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    recentlySearched: {
      height: 50,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: current.borderColor
    },
    searchIcon: {
      position: 'absolute',
      left: 15,
      top: 15,
      zIndex: 2
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 100,
      color: utils.color
    },
    recentText: {
      color: current.contrastTextColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    clearText: {
      color: utils.color,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    },
    recentlySearchedText: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans-Bold',
      marginLeft: 15,
      color: current.textColor
    },
    noResultText: {
      alignSelf: 'center',
      color: utils.color,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans'
    },
    emptyListText: {
      padding: 20,
      textAlign: 'center',
      color: current.textColor
    }
  });
