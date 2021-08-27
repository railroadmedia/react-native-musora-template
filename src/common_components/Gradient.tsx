import React, { useState } from 'react';
import { View } from 'react-native';
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
  const [parentWidth, setParentwidth] = useState(0);
  return (
    <View
      style={{ width, height }}
      onLayout={({ nativeEvent: { layout } }) => setParentwidth(layout.width)}
    >
      <Svg style={{ width: '100%', height: '100%' }} key={parentWidth}>
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
                stopOpacity={
                  c === 'transparent'
                    ? 0
                    : c.includes('rgba')
                    ? parseInt(c.split(',').pop()?.replace(')', '') || '100') /
                      100
                    : 1
                }
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width={'100%'} height={'100%'} fill='url(#gradient)' />
      </Svg>
      {children}
    </View>
  );
};
