import React, { useEffect, useContext, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl
} from 'react-native';
import { Gradient } from '../commons/Gradient';
import { userService } from '../services/user.service';
import { ThemeContext } from '../state/ThemeContext';

import { UserContext } from '../state/UserContext';
import { themeStyles, DARK } from '../themeStyles';
import { utils } from '../utils';
import { Notification, NotificationProps } from './Notification';

interface Props {}

export const Profile: React.FC<Props> = () => {
  const flatListRef = useRef(null);
  const page = useRef(1);
  const abortC = useRef(new AbortController());
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  const { user } = useContext(UserContext);
  let [state, setState] = useState<{
    refreshing: boolean;
    notifications: NotificationProps[];
  }>({
    refreshing: false,
    notifications: []
  });

  useEffect(() => {
    userService
      .getNotifications({ signal: abortC.current.signal, page: page.current })
      .then(({ data }) => setState({ ...state, notifications: data || [] }));
  }, []);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

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

  const renderFLItem = ({ item }: { item: NotificationProps }) => {
    return <Notification {...item} />;
  };

  const refresh = () => {};

  return (
    <FlatList
      windowSize={10}
      data={state.notifications}
      style={styles.container}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      removeClippedSubviews={true}
      keyboardShouldPersistTaps='handled'
      renderItem={renderFLItem}
      keyExtractor={({ id }) => id.toString()}
      ref={flatListRef}
      refreshControl={renderFLRefreshControl()}
      ListEmptyComponent={<Text style={{}}>You don't follow any threads</Text>}
      ListHeaderComponent={renderFLHeader()}
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
      borderTopColor: '#002039',
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
      borderBottomColor: '#002039',
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
    }
  });
