import React, { useCallback, useRef } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  children: any;
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

  const onTap = useCallback(() => {
    clickCount.current++;
    if (clickCount.current == 2) {
      if (timeout.current) clearTimeout(timeout.current);
      onDoubleTap();
    } else {
      timeout.current = setTimeout(() => {
        clickCount.current = 0;
      }, 300);
    }
  }, [clickCount]);

  return (
    <TouchableOpacity onPress={onTap} style={styles}>
      {children}
    </TouchableOpacity>
  );
};
