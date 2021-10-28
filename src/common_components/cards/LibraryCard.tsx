import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { CardImage } from './CardImage';
import { CardIcon } from './CardIcon';
import type { Course } from '../../interfaces/method.interfaces';
import type { PackLessonBundle } from 'src/interfaces/packs.interfaces';

const window = Dimensions.get('window');
let windowW = window.width < window.height ? window.width : window.height;

interface Props {
  item: Course | PackLessonBundle;
  subtitle: string;
  onBtnPress: (url: string) => void;
  isLocked?: boolean;
}

export const LibraryCard: React.FC<Props> = ({
  item,
  subtitle,
  onBtnPress,
  isLocked
}) => {
  const {
    id,
    type,
    title,
    is_added_to_primary_playlist,
    published_on,
    mobile_app_url
  } = item;
  const { theme } = useContext(ThemeContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => onBtnPress(mobile_app_url)}
      >
        <View
          style={[
            styles.behindCoursesEffect,
            {
              marginTop:
                (((windowW / 3) * 9) / 16) * 0.8 - ((windowW / 3) * 9) / 16
            }
          ]}
        />
        <View
          style={[
            styles.behindCoursesEffect,
            {
              marginTop:
                (((windowW / 3) * 9) / 16) * 0.9 - ((windowW / 3) * 9) / 16,
              opacity: 1,
              transform: [{ scale: 0.9 }]
            }
          ]}
        />

        <CardImage
          size={windowW / 10}
          item={item}
          route={''}
          isLocked={isLocked}
        />
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
      <CardIcon
        item={{
          id,
          published_on,
          is_added_to_primary_playlist,
          type,
          title,
          mobile_app_url
        }}
      />
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: 85,
      marginVertical: 10,
      marginHorizontal: 10
    },
    btn: {
      flex: 1,
      flexDirection: 'row'
    },
    behindCoursesEffect: {
      opacity: 0.5,
      borderRadius: 5,
      height: '100%',
      aspectRatio: 16 / 9,
      position: 'absolute',
      backgroundColor: utils.color,
      transform: [
        {
          scale: 0.8
        }
      ]
    },
    progressOverlay: {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 5,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center'
    },
    image: {
      width: windowW / 3,
      aspectRatio: 16 / 9
    },
    lockContainer: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,.3)',
      height: '100%',
      width: '100%',
      alignItems: 'flex-end'
    },
    titleContainer: {
      justifyContent: 'center',
      flex: 1,
      padding: 10,
      paddingRight: 0
    },
    myListBtn: {
      padding: 10,
      paddingRight: 15,
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: 14,
      fontFamily: 'OpenSans-Bold',
      color: current.textColor
    },
    subtitle: {
      fontSize: 12,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    }
  });
