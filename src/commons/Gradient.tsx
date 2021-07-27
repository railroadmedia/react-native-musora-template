import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface Props {
  width: number | string;
  height: number | string;
  colors: string[];
  verticalStripes?: boolean;
}

export const Gradient: React.FC<Props> = ({
  width,
  height,
  colors,
  verticalStripes,
  children
}) => {
  return (
    <View style={{ width, height }}>
      <Svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <Defs>
          <LinearGradient
            id='gradient'
            x1='0'
            x2={verticalStripes ? 1 : 0}
            y1='0'
            y2={verticalStripes ? 0 : 1}
          >
            {colors.map((c, i) => (
              <Stop
                key={c + i}
                offset={`${(100 / (colors.length - 1)) * i}%`}
                stopColor={c}
                stopOpacity={c === 'transparent' ? 0 : 1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill='url(#gradient)' />
      </Svg>
      {children}
    </View>
  );
};
