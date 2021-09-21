import React, { useContext, useEffect, useMemo, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

export const MainHeader: React.FC = () => {
  const { navigate } = useNavigation<{ navigate: (scene: string) => void }>();

  const { theme } = useContext(ThemeContext);
  const { user, updateUserAndCache } = useContext(UserContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  const abortC = useRef(new AbortController());

  useEffect(() => {
    abortC.current = new AbortController();
    userService.getUserDetails({ signal: abortC.current.signal }).then(ud => {
      updateUserAndCache(ud);
    });
    return () => {
      abortC.current.abort();
    };
  }, []);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeAreaContainer}
    >
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === DARK ? 'light-content' : 'dark-content'}
      />
      <View style={{ flex: 1 }}>
        {utils.svgBrand({
          icon: { height: 30, fill: utils.color },
          onPress: () => navigate('home')
        })}
      </View>
      {downloads({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: () => navigate('downloads')
      })}
      {myList({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: () => navigate('myList')
      })}
      <TouchableOpacity
        style={{ paddingLeft: 10 }}
        onPress={() => navigate('profile')}
      >
        <Image
          source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
          resizeMode={'cover'}
          style={{ height: 35, aspectRatio: 1, borderRadius: 20 }}
        />
      </TouchableOpacity>
    </SafeAreaView>
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
