import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from '../../state/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { decideSubtitle } from './cardhelpers';
import { CardIcon } from './CardIcon';
import { CardImage } from './CardImage';

export interface CardProps {
  iconType?: 'next-lesson' | 'progress';
  route: string;
  item: {
    id: number;
    type: string;
    published_on: string;
    sizeInBytes?: number;
    length_in_seconds: number;
    status: string;
    thumbnail_url: string;
    title: string;
    artist: string;
    style: string;
    level_number?: number | undefined;
    instructors: string[];
    completed: boolean;
    progress_percent: number;
    isLocked?: boolean;
    is_added_to_primary_playlist: boolean;
  };
}

const RowCard: React.FC<CardProps> = props => {
  const { item, iconType } = props;
  const [isAddedToPrimaryList, setIsAddedToPrimaryList] = useState(
    item.is_added_to_primary_playlist
  );
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const onIconPress = useCallback(() => {}, []);

  const onCardPress = useCallback(() => {}, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.listContainer}
      onPress={onCardPress}
    >
      <CardImage size={30} {...item} />

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
        <CardIcon
          {...item}
          isAddedToPrimaryList={isAddedToPrimaryList}
          iconType={iconType}
          onIconPress={onIconPress}
        />
      </View>
    </TouchableOpacity>
  );
};

const SliderCard: React.FC<CardProps> = () => {
  return <View></View>;
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
    }
  });

export { RowCard, SliderCard };
