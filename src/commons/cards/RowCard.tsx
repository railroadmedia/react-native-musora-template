import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { ThemeContext } from '../../state/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { decideSubtitle } from './cardhelpers';
import { CardIcon } from './CardIcon';
import { CardImage } from './CardImage';
import type CardProps from './CardProps';

const RowCard: React.FC<CardProps> = props => {
  const { item, route, onRemoveItemFromList } = props;
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const onCardPress = useCallback(() => {}, []);

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
            {decideSubtitle(props)}
          </Text>
        </View>
        <CardIcon cardProps={props} onResetProgress={onRemoveItemFromList} />
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
      paddingHorizontal: 15
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

export default RowCard;
