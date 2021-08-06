import React, { useContext, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { home, messageBubbles, search, threeLinesMenu } from '../images/svgs';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import { utils } from '../utils';

interface Props {
  onHomePress: Function;
  onSearchPress: Function;
  onForumPress: Function;
  onMenuPress: Function;
}

export const BottomNav: React.FC<Props> & {
  changeActiveBtn?: (btnName?: 'home' | 'search' | 'forum' | 'menu') => void;
  setVisibility?: (visible: boolean) => void;
} = ({ onHomePress, onSearchPress, onForumPress, onMenuPress }) => {
  const translateX = useRef(new Animated.Value(0));
  const scaleX = useRef(new Animated.Value(0));
  const layouts = useRef<{ [key: string]: { x: number; width: number } }>({});

  const [selected, setSelected] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const { theme } = useContext(ThemeContext);
  let styles = setStyle(theme);

  const homeIndexCorespondent: { [key: string]: number } = {
    home: 0,
    search: 1,
    forum: 2,
    menu: 3
  };

  const onLayout = ({ nativeEvent: ne }: LayoutChangeEvent, btn: string) => {
    layouts.current[btn] = { x: ne.layout.x, width: ne.layout.width };
    movePill(
      Object.keys(homeIndexCorespondent).find(
        key => homeIndexCorespondent[key] === selected
      )
    );
  };

  const movePill = (btn: string | undefined) => {
    let { width, x } = btn
      ? layouts.current[btn] || { width: 0, x: 0 }
      : { width: 0, x: 0 };
    Animated.parallel([
      Animated.timing(translateX.current, {
        toValue: (width - 1) / 2 + x,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleX.current, {
        toValue: width,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  BottomNav.changeActiveBtn = btnName => {
    setSelected(btnName ? homeIndexCorespondent[btnName] : -1);
    movePill(btnName);
  };

  BottomNav.setVisibility = visible => {
    setMaxHeight(visible ? 1000 : 10);
  };

  return (
    <SafeAreaView
      style={[styles.container, { maxHeight }]}
      edges={['bottom', 'left', 'right']}
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
            BottomNav.changeActiveBtn?.('home');
            onHomePress();
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
            BottomNav.changeActiveBtn?.('search');
            onSearchPress();
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
            BottomNav.changeActiveBtn?.('forum');
            onForumPress();
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
            BottomNav.changeActiveBtn?.('menu');
            onMenuPress();
          }
        })}
      </View>
    </SafeAreaView>
  );
};
const setStyle = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: current.background,
      flexDirection: 'row',
      justifyContent: 'space-evenly'
    }
  });
