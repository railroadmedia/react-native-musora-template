import React, { useContext } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { CardsContext } from '../../state/cards/CardsContext';
import type { Card } from '../../interfaces/card.interfaces';

interface Props {
  id: number;
}
export const ShowCard: React.FC<Props> = ({ id }) => {
  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props: {}) => void;
    }
  >();
  const { cards } = useContext(CardsContext);
  const item: Card = cards[id];
  return (
    <TouchableOpacity
      onPress={() =>
        navigate('showOverview', {
          show: item
        })
      }
      style={styles.cardBtn}
    >
      <Image
        style={styles.touchableImageShow}
        source={{
          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,ar_1,c_fill,g_face/${item.thumbnailUrl}`
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBtn: {
    flex: 1,
    padding: 5,
    aspectRatio: 1
  },
  touchableImageShow: {
    flex: 1,
    borderRadius: 10
  }
});
