import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeStyles, DARK } from '../themeStyles';
import { ThemeContext } from '../state/ThemeContext';

import { backHeaderBtn, backHeaderSettings } from '../images/svgs';
import { utils } from '../utils';

interface Props {
  onBack: Function;
  title: string;
  transparent?: boolean;
  onSettings?: Function;
}
export const BackHeader: React.FC<Props> = ({
  onBack,
  title,
  transparent,
  onSettings
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
    <SafeAreaView
      style={[
        styles.safeAreaContainer,
        transparent ? { backgroundColor: 'transparent' } : {}
      ]}
    >
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === DARK ? 'light-content' : 'dark-content'}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{title}</Text>
        {backHeaderBtn({
          height: 20,
          paddingVertical: 7.5,
          paddingRight: 20,
          onPress: () => onBack(),
          fill: themeStyles[theme].headerNavColor
        })}
        {!!onSettings &&
          backHeaderSettings({
            height: 20,
            paddingVertical: 7.5,
            paddingLeft: 20,
            onPress: () => onSettings,
            fill: themeStyles[theme].headerNavColor
          })}
      </View>
    </SafeAreaView>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    safeAreaContainer: {
      padding: 5,
      backgroundColor: current.background,
      justifyContent: 'center'
    },
    title: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(16),
      fontWeight: '800',
      textTransform: 'capitalize',
      position: 'absolute',
      alignSelf: 'center',
      width: '100%',
      textAlign: 'center'
    }
  });
