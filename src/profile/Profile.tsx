import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Gradient } from '../commons/Gradient';

import { userService } from '../services/user.service';

import { ThemeContext } from '../state/ThemeContext';
import { UserContext } from '../state/UserContext';

import { UPDATE_USER_AND_CACHE, userReducer } from '../state/userReducer';

import { themeStyles, DARK } from '../themeStyles';

import { utils } from '../utils';

import { Notification, NotificationProps } from './Notification';

interface Props {}

export const Profile: React.FC<Props> = () => {
  const isMounted = useRef(true);
  const page = useRef(1);
  const abortC = useRef(new AbortController());

  const { theme } = useContext(ThemeContext);

  const [user, dispatchUser] = useReducer(
    userReducer,
    useContext(UserContext).user
  );

  let [state, setState] = useState<{
    refreshing: boolean;
    loadingMore: boolean;
    notifications: NotificationProps[];
  }>({
    refreshing: true,
    loadingMore: true,
    notifications: []
  });

  let styles = setStyles(theme);

  useEffect(() => {
    getProfile();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const getProfile = () => {
    Promise.all([
      userService.getUserDetails(),
      userService.getNotifications({
        signal: abortC.current.signal,
        page: page.current++
      })
    ]).then(([userDetails, { data }]) => {
      if (isMounted.current) {
        dispatchUser({ type: UPDATE_USER_AND_CACHE, user: userDetails });
        setState({
          ...state,
          notifications: data || [],
          loadingMore: false,
          refreshing: false
        });
      }
    });
  };

  const getNotifications = () =>
    userService
      .getNotifications({ signal: abortC.current.signal, page: page.current++ })
      .then(({ data } = {}) => {
        if (isMounted.current)
          setState({
            ...state,
            notifications: data || [],
            loadingMore: false,
            refreshing: false
          });
      });

  const renderFLHeader = () => (
    <>
      <ImageBackground
        blurRadius={35}
        source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
        resizeMode={'cover'}
        style={styles.imageBackground}
      >
        <View style={styles.avatarBackground}>
          <View style={styles.gradient}>
            <Gradient
              width='100%'
              height='100%'
              colors={['transparent', themeStyles[theme].background || '']}
            />
          </View>
          <Image
            source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
            resizeMode={'cover'}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{user.display_name}</Text>
          <TouchableOpacity style={styles.editProfileTOpacity}>
            <Text style={styles.editProfileTxt}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <View style={styles.xpLabelContainer}>
        <Text style={styles.xpLabel}>XP</Text>
        <Text style={styles.xpLabel}>{utils.brand} METHOD</Text>
      </View>
      <View style={styles.xpValueContainer}>
        <Text style={styles.xpValue}>{user.totalXp}</Text>
        <Text style={styles.xpValue}>{user.xpRank}</Text>
      </View>
      <Text style={styles.notificationsHeader}>Notifications</Text>
    </>
  );

  const renderFLRefreshControl = () => (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={state.refreshing}
    />
  );

  const renderFLItem = ({ item }: { item: NotificationProps }) => (
    <Notification {...item} />
  );

  const renderFLFooter = () => (
    <ActivityIndicator
      size='small'
      color={utils.color}
      animating={state.loadingMore}
      style={{ padding: 15 }}
    />
  );

  const renderFLEmptyComponent = () => (
    <Text style={styles.emptyText}>You don't have any notifications</Text>
  );

  const refresh = () => {
    setState({ ...state, refreshing: true });
    getProfile();
  };

  const loadMore = () => {
    setState({ ...state, loadingMore: true });
    getNotifications();
  };

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      windowSize={10}
      data={state.notifications}
      style={styles.container}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      removeClippedSubviews={true}
      keyboardShouldPersistTaps='handled'
      renderItem={renderFLItem}
      keyExtractor={({ id }) => id.toString()}
      refreshControl={renderFLRefreshControl()}
      ListEmptyComponent={renderFLEmptyComponent()}
      ListHeaderComponent={renderFLHeader()}
      ListFooterComponent={renderFLFooter()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.01}
    />
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: { backgroundColor: current.background, flex: 1 },
    gradient: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '50%'
    },
    imageBackground: {
      width: '100%'
    },
    avatar: {
      width: '50%',
      aspectRatio: 1,
      borderRadius: 999,
      marginTop: 90
    },
    avatarBackground: {
      backgroundColor:
        theme === DARK ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
      alignItems: 'center'
    },
    displayName: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans',
      fontWeight: '700'
    },
    editProfileTOpacity: {
      backgroundColor: '#002039',
      padding: 5,
      paddingHorizontal: 20,
      borderRadius: 99,
      marginTop: 10,
      marginBottom: 40
    },
    editProfileTxt: {
      color: 'white',
      fontFamily: 'OpenSans',
      fontWeight: '700'
    },
    xpLabelContainer: {
      flexDirection: 'row',
      borderTopColor: current.borderColor,
      borderTopWidth: 1,
      paddingVertical: 20
    },
    xpLabel: {
      textTransform: 'uppercase',
      color: utils.color,
      flex: 1,
      textAlign: 'center',
      fontFamily: 'OpenSans',
      fontWeight: '600',
      fontSize: utils.figmaFontSizeScaler(12)
    },
    xpValueContainer: {
      flexDirection: 'row',
      borderBottomColor: current.borderColor,
      borderBottomWidth: 1,
      paddingBottom: 20
    },
    xpValue: {
      textTransform: 'uppercase',
      color: current.textColor,
      flex: 1,
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: '700',
      fontSize: utils.figmaFontSizeScaler(24)
    },
    notificationsHeader: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      fontWeight: '700',
      fontSize: utils.figmaFontSizeScaler(20),
      marginTop: 40,
      padding: 5
    },
    emptyText: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      padding: 5
    }
  });
