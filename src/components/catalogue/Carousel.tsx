import React, { useContext } from 'react';
import { FlatList, View } from 'react-native';
import { SliderCard } from '../../common_components/cards/SliderCard';
import { OrientationContext } from '../../state/orientation/OrientationContext';
import { utils } from '../../utils';

interface Props {
  items: number[];
}
export const Carousel: React.FC<Props> = ({ items }) => {
  const { isLandscape } = useContext(OrientationContext);

  const flContentStyleWidth = utils.isTablet
    ? isLandscape
      ? 22.5
      : 30
    : isLandscape
    ? 30
    : 75;

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      data={items}
      horizontal={true}
      removeClippedSubviews={true}
      contentContainerStyle={{
        width: `${flContentStyleWidth * items.length}%`
      }}
      keyExtractor={id => id.toString()}
      renderItem={({ item, index }) => (
        <View style={{ width: `${100 / items?.length}%` }}>
          <View style={{ width: `${100 * items?.length}%` }}>
            <SliderCard id={item} route={'home'} />
          </View>
        </View>
      )}
    />
  );
};
