import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  RefObject
} from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  backgroundColor?: string;
  activityColor?: string;
}

export interface LoadingRefObject {
  toggleLoading: (isLoading: boolean) => void;
}

export const Loading = forwardRef(
  (props: Props, ref: React.Ref<LoadingRefObject>) => {
    const { backgroundColor, activityColor } = props;
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleLoading(isLoading: boolean) {
        setLoading(isLoading);
      }
    }));

    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: backgroundColor
              ? backgroundColor
              : 'rgba(0,0,0,.5)'
          },
          loading ? { width: '100%' } : { width: 0 }
        ]}
      >
        <ActivityIndicator
          size={'large'}
          color={activityColor || 'white'}
          animating={loading}
          style={{ marginTop: 10, marginBottom: 10 }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  loadingContainer: {
    overflow: 'hidden',
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    zIndex: 2
  }
});
