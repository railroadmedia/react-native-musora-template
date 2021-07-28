import React, { useContext, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { utils } from '../utils';

import { themeStyles, DARK } from '../themeStyles';
import { ThemeContext } from '../state/ThemeContext';

import { downloadsHeader, myListHeader } from '../images/svgs';
import { UserContext } from '../state/UserContext';

interface Props {
  onLogoPress: Function;
  onDownloadsPress: Function;
  onMyListPress: Function;
  onProfilePress: Function;
}
export const Header: React.FC<Props> = ({
  onLogoPress,
  onDownloadsPress,
  onMyListPress,
  onProfilePress
}) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  let styles = setStyles(theme);

  const isMounted = useRef(true);

  useEffect(() => {
    () => (isMounted.current = false);
  }, []);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === DARK ? 'light-content' : 'dark-content'}
      />
      <View style={{ flex: 1 }}>
        {utils.headerSvgBrand({
          icon: { height: 30, fill: utils.color },
          onPress: onLogoPress
        })}
      </View>
      {downloadsHeader({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: onDownloadsPress
      })}
      {myListHeader({
        icon: { height: 20, fill: themeStyles[theme].contrastTextColor },
        container: { paddingHorizontal: 10 },
        onPress: onMyListPress
      })}
      <TouchableOpacity
        style={{ paddingLeft: 10 }}
        onPress={() => onProfilePress()}
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
