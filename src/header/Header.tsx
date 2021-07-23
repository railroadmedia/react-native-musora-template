import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { utils } from '../utils';

import { themeStyles, DARK } from '../themeStyles';
import { ThemeContext } from '../state/ThemeContext';

import { downloadsHeader, myListHeader } from '../images/svgs';

interface Props {
  onLogoPress: Function;
  onDownloadsPress: Function;
  onMyListPress: Function;
}
export const Header: React.FC<Props> = ({
  onLogoPress,
  onDownloadsPress,
  onMyListPress
}) => {
  const { theme } = useContext(ThemeContext);
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
          height: 25,
          fill: utils.color,
          onPress: onLogoPress
        })}
      </View>
      {downloadsHeader({
        height: 20,
        fill: themeStyles[theme].iconColor,
        marginHorizontal: 10,
        onPress: onDownloadsPress
      })}
      {myListHeader({
        height: 20,
        fill: themeStyles[theme].iconColor,
        marginHorizontal: 10,
        onPress: onMyListPress
      })}
    </SafeAreaView>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    safeAreaContainer: {
      padding: 10,
      backgroundColor: current.background,
      flexDirection: 'row',
      alignItems: 'center'
    }
  });
