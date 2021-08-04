import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { utils } from '../utils';
import { ThemeContext } from '../state/ThemeContext';
import { themeStyles } from '../themeStyles';
import { right } from '../images/svgs';

interface MyListProps {}

export const MyList: React.FC<MyListProps> = ({}) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState('My List');
  const { theme } = useContext(ThemeContext);

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

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

  const refresh = () => {};

  const loadMore = () => {};

  const onNavigate = useCallback((title: string) => {
    setTitle(title);
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
              onPress={() => onNavigate(title)}
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

  const renderFLItem = () => <View />;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={[{ id: 1 }]}
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
      paddingTop: 5
    }
  });
