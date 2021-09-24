import React, { useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  View
} from 'react-native';
import { isTablet } from 'react-native-device-info';
import { utils } from '../../utils';
import { Gradient } from '../Gradient';

interface Props {
  coach: {
    id: number;
    head_shot_picture_url: string;
    name: string;
  };
  index: number;
}

export const CoachCard: React.FC<Props> = ({ coach, index }) => {
  const cols = useMemo(() => {
    return isTablet() ? 3 : 2;
  }, []);

  return (
    <View
      style={{
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
      }}
    >
      <TouchableOpacity
        key={coach.id}
        onPress={() => {
          //navigate('coachOverview', { id: coach.id })
        }}
        style={[
          styles.container,
          {
            paddingRight: index % cols === cols - 1 ? 10 : 0,
            width: `${100 / cols}%`
          }
        ]}
      >
        <ImageBackground
          resizeMode={'cover'}
          imageStyle={styles.imgStyle}
          style={styles.image}
          source={{
            uri: `https://cdn.musora.com/image/fetch/w_${
              Dimensions.get('screen').width >> 0
            },ar_1,fl_lossy,q_auto:good,c_fill,g_face/${
              coach.head_shot_picture_url
            }`
          }}
        >
          <View style={styles.gradientContainer}>
            <Gradient
              colors={[
                'transparent',
                'transparent',
                utils.getColorWithAlpha(10),
                utils.getColorWithAlpha(30)
              ]}
              height={'100%'}
              width={'100%'}
            />
          </View>
          <Text style={styles.title}>{coach.name?.split(' ').join('\n')}</Text>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 0,
    aspectRatio: 1,
    paddingLeft: 10,
    paddingBottom: 10
  },
  imgStyle: {
    borderWidth: 3,
    borderRadius: 10,
    borderColor: 'blue'
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end'
  },
  title: {
    padding: 10,
    fontSize: utils.figmaFontSizeScaler(20),
    color: 'white',
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Bold'
  },
  gradientContainer: {
    height: '100%',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)'
  }
});
