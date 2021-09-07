import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { themeStyles, DARK } from '../../themeStyles';
import { ThemeContext } from '../../state/theme/ThemeContext';

import { back, settings } from '../../images/svgs';
import { utils } from '../../utils';
import { HeaderContext } from '../../state/header/HeaderContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  transparent?: boolean;
  settingsVisible?: boolean;
  onBack?: () => void;
}
export const BackHeader: React.FC<Props> = ({
  title,
  transparent,
  settingsVisible,
  onBack
}) => {
  const { navigate, goBack } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string) => void;
    }
  >();
  let { top, left, right } = useSafeAreaInsets();
  const { updateHeaderNavHeight } = useContext(HeaderContext);
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    () => (isMounted.current = false);
  }, []);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <View
      style={[
        styles.safeAreaContainer,
        { paddingTop: top, paddingLeft: left, paddingRight: right },
        transparent ? { backgroundColor: 'transparent' } : {}
      ]}
      onLayout={({ nativeEvent }) =>
        updateHeaderNavHeight(nativeEvent.layout.height)
      }
    >
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === DARK ? 'light-content' : 'dark-content'}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{title}</Text>
        {back({
          icon: { height: 20, fill: themeStyles[theme].headerNavColor },
          container: {
            paddingVertical: 7.5,
            paddingRight: 20
          },
          onPress: onBack || goBack
        })}
        {!!settingsVisible &&
          settings({
            icon: { height: 20, fill: themeStyles[theme].headerNavColor },
            container: { paddingVertical: 7.5, paddingLeft: 20 },
            onPress: () => navigate('settings')
          })}
      </View>
    </View>
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
      position: 'absolute',
      alignSelf: 'center',
      width: '100%',
      textAlign: 'center',
      textTransform: 'capitalize'
    }
  });
