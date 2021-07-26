import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeStyles, DARK } from '../themeStyles';
import { ThemeContext } from '../state/ThemeContext';

import { backHeaderBtn } from '../images/svgs';

interface Props {
  onBack: Function;
  title: string;
}
export const BackHeader: React.FC<Props> = ({ onBack, title }) => {
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
      {backHeaderBtn({
        height: 20,
        paddingVertical: 7.5,
        paddingRight: 20,
        onPress: () => onBack(),
        fill: themeStyles[theme].headerNavColor
      })}
      <Text style={styles.title}>{title}</Text>
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
    },
    title: {
      color: current.textColor,
      textAlign: 'center',
      flex: 1,
      marginRight: backHeaderBtn.getAspectRatio() * 20 + 20,
      fontFamily: 'OpenSans',
      fontSize: 25,
      fontWeight: '800',
      textTransform: 'capitalize'
    }
  });
