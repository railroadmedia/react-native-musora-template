import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { utils } from '../utils';
import { x, check } from '../images/svgs';

interface CustomSwitchProps {
  showIcon: boolean;
  value?: boolean;
  width: number;
  height: number;
  onSlide: (isOn: boolean) => void;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  showIcon,
  value,
  width,
  height,
  onSlide
}) => {
  const [on, setOn] = useState(value);
  let slider = useRef(new Animated.Value(value ? width - height : 0));

  const slide = () => {
    setOn(!on);
    Animated.timing(slider.current, {
      toValue: on ? 0 : width - height,
      duration: 100,
      useNativeDriver: true
    }).start();
    onSlide(!!on);
  };

  return (
    <TouchableOpacity
      onPress={slide}
      activeOpacity={1}
      style={[
        styles.track,
        {
          width,
          height,
          backgroundColor: on ? utils.color : 'grey'
        }
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: slider.current }]
          }
        ]}
      >
        {showIcon
          ? on
            ? check({ icon: { width: 15, height: 15, fill: 'grey' } })
            : x({ icon: { width: 15, height: 15, fill: 'grey' } })
          : null}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    borderRadius: 100
  },
  thumb: {
    height: '120%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
