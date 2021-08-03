import React from 'react';
import { View } from 'react-native';
import { utils } from '../../utils';
import { addToCalendar, x, plus, reset, play } from '../../images/svgs';
import { StyleSheet } from 'react-native';

interface CardIconProps {
  published_on: string;
  iconType?: 'next-lesson' | 'progress';
  isAddedToPrimaryList: boolean;
  onIconPress: () => void;
}

const iconStyle = {
  height: 25,
  width: 25,
  fill: utils.color
};

export const CardIcon: React.FC<CardIconProps> = ({
  published_on,
  iconType,
  isAddedToPrimaryList,
  onIconPress
}) => {
  return (
    <View>
      {new Date(published_on) > new Date()
        ? addToCalendar({
            icon: iconStyle,
            container: styles.icon,
            onPress: onIconPress
          })
        : iconType === 'next-lesson'
        ? play({
            icon: iconStyle,
            container: { padding: 15 }
          })
        : iconType === 'progress'
        ? reset({
            icon: iconStyle,
            container: styles.icon,
            onPress: onIconPress
          })
        : isAddedToPrimaryList
        ? x({
            icon: iconStyle,
            container: styles.icon,
            onPress: onIconPress
          })
        : plus({
            icon: iconStyle,
            container: styles.icon,
            onPress: onIconPress
          })}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    padding: 15,
    paddingRight: 0
  }
});
