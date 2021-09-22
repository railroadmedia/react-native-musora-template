import React, { useCallback, useContext, useMemo } from 'react';
import {
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { x } from '../images/svgs';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import { utils } from '../utils';

const titles = [
  { title: 'Home', route: 'home' },
  { title: 'Method', route: 'method' },
  { title: 'Packs', route: 'packs' },
  { title: 'Courses', route: 'courses' },
  { title: 'Show Overview Test', route: 'showOverview' },
  { title: 'Shows', route: 'shows' },
  { title: 'Songs', route: 'songs' },
  { title: 'Play-Alongs', route: 'playAlongs' },
  { title: 'Student Focus', route: 'studentFocus' }
];

interface Props {
  route: RouteProp<ParamListBase, 'navigationMenu'> & {
    params: {
      activeButton: string;
    };
  };
}

export const NavigationMenu: React.FC<Props> = ({
  route: {
    params: { activeButton }
  }
}) => {
  const { navigate, goBack } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props?: {}) => void;
    }
  >();
  const { theme } = useContext(ThemeContext);

  let styles = useMemo(() => setStyles(theme), [theme]);

  const onNavigate = useCallback((route: string) => {
    goBack();
    if (route === 'showOverview') {
      navigate(route, {
        show: {
          thumbnailUrl:
            'https://dpwjbsxqtam5n.cloudfront.net/shows/show-quick-tips.jpg',
          name: 'Quick Tips',
          type: 'quick-tips',
          icon: 'icon-shows',
          description:
            'These videos are great for quick inspiration or if you don’t have time to sit \n                    down and watch a full lesson. They are short and to the point, giving you tips, concepts, \n                    and exercises you can take to your kit.',
          allowableFilters: ['difficulty', 'instructor', 'topic', 'progress']
        }
      });
    } else {
      navigate(route);
    }
  }, []);

  const decideColor = useCallback((page: string) => {
    if (activeButton === page) return utils.color;
    return themeStyles[theme].textColor;
  }, []);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.modalContentContainer}
      >
        {titles.map(({ title, route }: { title: string; route: string }) => (
          <TouchableOpacity
            key={title}
            onPress={() => onNavigate(route)}
            style={{ padding: 10 }}
          >
            <Text style={[styles.smallTitle, { color: decideColor(route) }]}>
              {title}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={goBack} style={styles.xBtn}>
          {x({ icon: { height: 30, width: 30, fill: 'white' } })}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      backgroundColor: current.background,
      flex: 1
    },
    modalContentContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    xBtn: {
      margin: 10,
      padding: 20,
      borderRadius: 35,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: utils.color
    },
    smallTitle: {
      fontSize: utils.figmaFontSizeScaler(24),
      fontFamily: 'OpenSans-Bold'
    }
  });
