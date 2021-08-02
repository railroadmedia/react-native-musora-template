import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { completedCircle, inProgressCircle, lock } from '../../images/svgs';

const fallbackThumb =
  'https://dmmior4id2ysr.cloudfront.net/assets/images/drumeo_fallback_thumb.jpg';

interface CardImageProps {
  type: string;
  thumbnail_url: string;
  published_on: string;
  completed: boolean;
  progress_percent: number;
  size: number;
  isLocked?: boolean;
}

export const CardImage: React.FC<CardImageProps> = ({
  type,
  thumbnail_url,
  published_on,
  completed,
  progress_percent,
  size,
  isLocked
}) => {
  const getImageUri = function (
    thumbUri = fallbackThumb,
    published_on: string,
    type: string
  ) {
    if (!thumbUri.includes('https')) return thumbUri;
    // if (this.props.dldActions) return thumbUri;
    const width = Dimensions.get('screen').width;
    const baseUri = 'https://cdn.musora.com/image/fetch';
    if (new Date(published_on) > new Date()) {
      return `${baseUri}/w_${width >> 0},ar_${
        type === 'song' ? '1' : '16:9'
      },fl_lossy,q_auto:eco,e_grayscale/${thumbUri}`;
    }
    return `${baseUri}/w_${width >> 0},ar_${
      type === 'song' ? '1' : '16:9'
    },fl_lossy,q_auto:good,c_fill,g_face/${thumbUri}`;
  };

  return (
    <View style={styles.imageContainer}>
      <ImageBackground
        resizeMethod='resize'
        imageStyle={{ borderRadius: 8 }}
        style={[
          styles.smallImage,
          type === 'song' ? { width: 55, aspectRatio: 1 } : {}
        ]}
        source={{ uri: getImageUri(thumbnail_url, published_on, type) }}
      >
        {isLocked && (
          <View style={styles.lockOverlay}>
            {lock({
              icon: { height: 12, width: 12, fill: '#ffffff' }
            })}
          </View>
        )}
        {completed && <View style={styles.completedOverlay} />}

        {completed
          ? completedCircle({
              icon: {
                height: size,
                width: size,
                fill: '#FFFFFF'
              }
            })
          : progress_percent && progress_percent !== 0
          ? inProgressCircle({
              icon: {
                height: size,
                width: size,
                fill: '#FFFFFF'
              }
            })
          : null}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 8
  },
  smallImage: {
    height: '100%',
    borderRadius: 8,
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,.3)',
    height: '100%',
    width: '100%',
    alignItems: 'flex-end'
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(11, 118, 219, 0.2)',
    width: '100%',
    height: '100%'
  }
});
