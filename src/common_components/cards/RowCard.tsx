import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import type { Card } from '../../interfaces/card.interfaces';
import { CardsContext } from '../../state/cards/CardsContext';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { decideSubtitle, getContentType } from './cardhelpers';
import { CardIcon } from './CardIcon';
import { CardImage } from './CardImage';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { offlineContent } from 'RNDownload';

interface Props {
  id: number;
  parentId?: number;
  route: string;
  iconType?: 'next-lesson' | 'progress' | 'downloads';
  onResetProgress?: (id: number) => void;
  onRemoveFromMyList?: (id: number) => void;
  onNavigate?: () => void;
  sizeInBytes?: number;
}

export const RowCard: React.FC<Props> = props => {
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props: {}) => void;
    }
  >();

  const {
    id,
    parentId,
    route,
    onResetProgress,
    onRemoveFromMyList,
    onNavigate,
    iconType,
    sizeInBytes
  } = props;
  const { cards } = useContext(CardsContext);
  const item: Card = cards[id];

  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  const onCardPress = () => {
    if (!isConnected) {
      let ocExists = !!offlineContent[id];
      if (!ocExists) {
        Object.values(offlineContent).map(ocv => {
          if (ocv.overview?.lessons)
            for (let i = 0; i < ocv.overview.lessons.length; i++) {
              if (ocv.overview.lessons[i].id === id) {
                ocExists = true;
                break;
              }
            }
        });
      }
      if (!ocExists) return showNoConnectionAlert();
    }

    if (onNavigate) return onNavigate?.();
    let { route, contentType } = getContentType(
      item.type,
      item.bundle_count,
      item.lessons
    );

    navigate(route, {
      id,
      parentId,
      contentType,
      url: item.mobile_app_url,
      item: !isConnected ? item : null
    });
  };

  const renderImage = () => {
    if (route?.match(/^(live|schedule)$/)) {
      let st = new Date(
        `${item.live_event_start_time || item.published_on} UTC`
      );
      return (
        <View style={styles.liveTextContainer}>
          <Text style={styles.liveTextBold}>
            {st.toLocaleString([], { weekday: 'short' })} {st.getDate()}
          </Text>
          <Text style={styles.liveTextSimple}>
            {st.toLocaleString([], { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
      );
    }
    return <CardImage size={30} {...item} route={route} />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.listContainer}
      onPress={onCardPress}
    >
      {renderImage()}

      <View style={styles.cardTextContainerSmall}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.title}>
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={styles.subtitle}
          >
            {decideSubtitle({ item, route, sizeInBytes })}
          </Text>
        </View>
        <CardIcon
          item={item}
          iconType={iconType}
          onResetProgress={onResetProgress}
          onRemoveFromMyList={onRemoveFromMyList}
        />
      </View>
    </TouchableOpacity>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    listContainer: {
      height: 65,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 10
    },
    cardTextContainerSmall: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 10
    },
    title: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans-Bold'
    },
    subtitle: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans'
    },
    liveTextContainer: {
      width: '30%',
      borderRadius: 10,
      aspectRatio: 16 / 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'black'
    },
    liveTextBold: {
      fontSize: utils.figmaFontSizeScaler(18),
      color: 'white',
      textAlign: 'center',
      fontFamily: 'OpenSans-Bold'
    },
    liveTextSimple: {
      fontSize: utils.figmaFontSizeScaler(18),
      color: 'white',
      textAlign: 'center',
      fontFamily: 'OpenSans'
    }
  });
