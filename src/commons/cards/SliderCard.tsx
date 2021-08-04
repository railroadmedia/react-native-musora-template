import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { ThemeContext } from '../../state/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { decideSubtitle } from './cardhelpers';
import { CardIcon } from './CardIcon';
import { CardImage } from './CardImage';
import type CardProps from './CardProps';

const windowWidth = Dimensions.get('screen').width;

const SliderCard: React.FC<CardProps> = props => {
  const { item, route, onRemoveItemFromList } = props;
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const onCardPress = useCallback(() => {}, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.cardContainer,
        { width: route === 'songs' ? windowWidth / 2.2 : (windowWidth * 3) / 4 }
      ]}
      onPress={onCardPress}
    >
      <View style={{ aspectRatio: route === 'songs' ? 1 : 16 / 9 }}>
        <CardImage size={50} {...item} route={route} />
      </View>
      <View style={styles.cardTextContainerBig}>
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
    cardContainer: {
      marginBottom: 20,
      paddingHorizontal: 10
    },
    cardTextContainerBig: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
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
    }
  });

export default SliderCard;
