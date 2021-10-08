import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';

import { utils } from '../../utils';

import { themeStyles, DARK } from '../../themeStyles';
import { ThemeContext } from '../../state/theme/ThemeContext';

import { downloads, myList } from '../../images/svgs';
import { UserContext } from '../../state/user/UserContext';
import { userService } from '../../services/user.service';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

export const MainHeader: React.FC = () => {
  const { top, left, right } = useSafeAreaInsets();
  const { navigate } = useNavigation<{ navigate: (scene: string) => void }>();

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { user, updateUserAndCache } = useContext(UserContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  const abortC = useRef(new AbortController());

  useEffect(() => {
    abortC.current = new AbortController();
    if (!isConnected) return showNoConnectionAlert();
    userService.getUserDetails({ signal: abortC.current.signal }).then(ud => {
      updateUserAndCache(ud);
    });
    return () => {
      abortC.current.abort();
    };
  }, []);

  const onNavigate = useCallback(
    (route: string) => {
      if (route !== 'downloads' && !isConnected) return showNoConnectionAlert();
      navigate(route);
    },
    [isConnected]
  );

  return (
    <View
      style={[
        styles.safeAreaContainer,
        { paddingTop: top, paddingLeft: left, paddingRight: right }
      ]}
    >
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === DARK ? 'light-content' : 'dark-content'}
      />
      <View style={{ flex: 1 }}>
        {utils.svgBrand({
          icon: { height: 30, fill: utils.color },
          onPress: () => onNavigate('home')
        })}
      </View>
      {downloads({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: () => onNavigate('downloads')
      })}
      {myList({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: () => onNavigate('myList')
      })}
      <TouchableOpacity
        style={{ paddingLeft: 10 }}
        onPress={() => onNavigate('profile')}
      >
        <Image
          source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
          resizeMode={'cover'}
          style={{ height: 35, aspectRatio: 1, borderRadius: 20 }}
        />
      </TouchableOpacity>
    </View>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    safeAreaContainer: {
      padding: 5,
      backgroundColor: current.background,
      flexDirection: 'row',
      alignItems: 'center'
    }
  });
