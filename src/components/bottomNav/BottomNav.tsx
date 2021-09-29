import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  home,
  messageBubbles,
  search,
  threeLinesMenu
} from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { NavigationMenu } from '../../common_components/NavigationMenu';

interface Props {
  visibleOn: string[];
}
export const BottomNav: React.FC<Props> = ({ visibleOn }) => {
  const { addListener, navigate, getCurrentRoute } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      getCurrentRoute: () => { name: string };
      navigate: (scene: string, props?: {}) => void;
    }
  >();

  const { bottom, left, right } = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(0));
  const scaleX = useRef(new Animated.Value(0));
  const translateY = useRef(new Animated.Value(300));
  const layouts = useRef<{ [key: string]: { x: number; width: number } }>({});
  const navigationMenu = useRef<React.ElementRef<typeof NavigationMenu>>(null);

  const [selected, setSelected] = useState(0);
  const [position, setPosition] = useState<'absolute' | 'relative'>('absolute');
  const [activeScene, setActiveScene] = useState('home');

  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyle(theme), [theme]);

  const homeIndexCorespondent: { [key: string]: number } = {
    home: 0,
    search: 1,
    forum: 2
  };

  let navListener;
  useEffect(() => {
    navListener = addListener('state', () => {
      changeActiveBtn(getCurrentRoute().name);
      setActiveScene(getCurrentRoute().name);
      setVisibility(visibleOn.includes(getCurrentRoute().name));
    });
    return navListener;
  }, []);

  const onLayout = ({ nativeEvent: ne }: LayoutChangeEvent, btn: string) => {
    layouts.current[btn] = { x: ne.layout.x, width: ne.layout.width };
    movePill(
      Object.keys(homeIndexCorespondent).find(
        key => homeIndexCorespondent[key] === selected
      ) || ''
    );
  };

  const movePill = (btn: string) => {
    let { width, x } = layouts.current[btn] || { width: 0, x: 0 };
    Animated.parallel([
      Animated.timing(translateX.current, {
        toValue: (width - 1) / 2 + x,
        duration: utils.navigationAnimationSpeed,
        useNativeDriver: true
      }),
      Animated.timing(scaleX.current, {
        toValue: width,
        duration: utils.navigationAnimationSpeed,
        useNativeDriver: true
      })
    ]).start();
  };

  const changeActiveBtn = (btnName: string) => {
    setSelected(btnName ? homeIndexCorespondent[btnName] : -1);
    movePill(btnName);
  };

  const setVisibility = (visible: boolean) => {
    if (position === 'relative') setPosition(visible ? 'relative' : 'absolute');
    Animated.timing(translateY.current, {
      toValue: visible ? 0 : 300,
      duration: utils.navigationAnimationSpeed,
      useNativeDriver: true
    }).start(() => {
      if (position === 'absolute')
        setPosition(visible ? 'relative' : 'absolute');
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          position,
          paddingBottom: bottom,
          paddingLeft: left,
          paddingRight: right,
          transform: [{ translateY: translateY.current }]
        }
      ]}
    >
      <Animated.View
        style={{
          backgroundColor: utils.color,
          height: 3,
          width: 1,
          left: 0,
          transform: [
            { translateX: translateX.current },
            { scaleX: scaleX.current }
          ],
          position: 'absolute'
        }}
      />
      <View onLayout={e => onLayout(e, 'home')}>
        {home({
          icon: {
            height: 30,
            fill:
              selected === 0
                ? utils.color
                : themeStyles[theme].contrastTextColor
          },
          container: { padding: 20 },
          onPress: () => {
            changeActiveBtn?.('home');
            navigate('home');
          }
        })}
      </View>
      <View onLayout={e => onLayout(e, 'search')}>
        {search({
          icon: {
            height: 30,
            fill:
              selected === 1
                ? utils.color
                : themeStyles[theme].contrastTextColor
          },
          container: { padding: 20 },
          onPress: () => {
            changeActiveBtn?.('search');
            navigate('search');
          }
        })}
      </View>
      <View onLayout={e => onLayout(e, 'forum')}>
        {messageBubbles({
          icon: {
            height: 30,
            fill:
              selected === 2
                ? utils.color
                : themeStyles[theme].contrastTextColor
          },
          container: { padding: 20 },
          onPress: () => {
            changeActiveBtn?.('forum');
            navigate('forum');
          }
        })}
      </View>
      <View onLayout={e => onLayout(e, 'menu')}>
        {threeLinesMenu({
          icon: {
            height: 30,
            fill:
              selected === 3
                ? utils.color
                : themeStyles[theme].contrastTextColor
          },
          container: { padding: 20 },
          onPress: () => {
            changeActiveBtn?.('menu');
            navigationMenu.current?.toggle();
          }
        })}
      </View>
      <NavigationMenu ref={navigationMenu} activeButton={activeScene} />
    </Animated.View>
  );
};
const setStyle = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      backgroundColor: current.background,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      bottom: 0,
      width: '100%'
    }
  });
