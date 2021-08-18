import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  RefObject
} from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  backgroundColor?: string;
  activityColor?: string;
}

export const Loading = forwardRef<RefObject<any>, LoadingProps>(
  ({ backgroundColor, activityColor }, ref: React.Ref<any>) => {
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
