import React, {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useState
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet
} from 'react-native';
import { arrowDown, arrowUp } from '../images/svgs';

interface Props {
  expandableContStyle?: StyleProp<ViewStyle>;
  dropStyle: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
  title: string;
  iconColor: string;
  processType?: string;
  children: React.ReactNode;
}

export interface ExpandableViewRefObject {
  toggleView: () => void;
}

export const ExpandableView = forwardRef(
  (
    {
      expandableContStyle,
      dropStyle,
      titleStyle,
      title,
      iconColor,
      processType,
      children
    }: Props,
    ref: React.Ref<ExpandableViewRefObject>
  ) => {
    const [maxHeight, setMaxHeight] = useState(-1);
    const [contentVisible, setContentVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleView() {
        toggle();
      }
    }));

    const toggle = useCallback(() => {
      switch (processType) {
        case 'RAM': {
          setMaxHeight(maxHeight ? 0 : 100000);
          break;
        }
        default: {
          setContentVisible(!contentVisible);
          break;
        }
      }
    }, [contentVisible, maxHeight]);

    return (
      <View style={expandableContStyle}>
        <TouchableOpacity
          onPress={toggle}
          style={[styles.toggleBtn, dropStyle]}
        >
          <Text style={[titleStyle, { flex: 1 }]}>{title}</Text>
          {(contentVisible || maxHeight > 0) &&
            arrowUp({
              icon: {
                height: 20,
                width: 20,
                fill: iconColor || '#ffffff'
              }
            })}
          {!contentVisible &&
            maxHeight < 0 &&
            arrowDown({
              icon: {
                height: 20,
                width: 20,
                fill: iconColor || '#ffffff'
              }
            })}
        </TouchableOpacity>
        {contentVisible === undefined ? (
          <View style={{ overflow: 'hidden', maxHeight }}>{children}</View>
        ) : (
          contentVisible && children
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: 50
  }
});
