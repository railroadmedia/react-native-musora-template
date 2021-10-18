import React, { useCallback, useRef } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  onDoubleTap: () => void;
  styles: ViewStyle[];
}

export const DoubleTapArea: React.FC<Props> = ({
  children,
  onDoubleTap,
  styles
}) => {
  const clickCount = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout>();

  const onTap = () => {
    clickCount.current++;
    if (clickCount.current === 2) {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      onDoubleTap();
      clickCount.current = 0;
    } else {
      timeout.current = setTimeout(() => {
        clickCount.current = 0;
      }, 300);
    }
  };

  return (
    <TouchableOpacity onPress={onTap} style={styles}>
      {children}
    </TouchableOpacity>
  );
};
