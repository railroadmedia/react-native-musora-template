import { useNavigation } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';
import React, { useRef } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../../common_components/Gradient';
import { utils } from '../../utils';

const screens = [
  {
    background: require('../../images/launchB1.jpg'),
    png: require('../../images/launchS1.png'),
    boldTxt: 'Drum Lessons, Songs, & Shows',
    normalTxt: 'Everywhere you go.'
  },
  {
    background: require('../../images/launchB2.jpg'),
    png: require('../../images/launchS2.png'),
    boldTxt: 'Learn From The Legends',
    normalTxt:
      'Improve your drumming with step-by-step video courses featuring the best drummers in the world.'
  },
  {
    background: require('../../images/launchB3.jpg'),
    png: require('../../images/launchS3.png'),
    boldTxt: 'Play Your Favorite Songs',
    normalTxt:
      'Apply your skills to real music with detailed song breakdowns for the tunes you know and love.'
  },
  {
    background: require('../../images/launchB4.jpg'),
    png: require('../../images/launchS4.png'),
    boldTxt: 'TV For Drummers',
    normalTxt:
      'Drumming isn’t limited to the practice room. Enjoy exclusive documentaries and shows for drummers.'
  },
  {
    boldTxt: 'Not A Member?',
    normalTxt:
      'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
  }
];

export const LaunchScreen: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();
  let { bottom } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  const leftAnim = useRef(new Animated.Value(0)).current;

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  return (
    <View style={{ backgroundColor: utils.color, flex: 1 }}>
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={({
          nativeEvent: {
            contentOffset: { x }
          }
        }) => {
          animateIndicator((x / utils.WIDTH) * 20, 200);
        }}
      >
        {screens.map(s => (
          <View key={s.boldTxt} style={{ width: utils.WIDTH }}>
            {s.background && (
              <ImageBackground
                source={s.background}
                resizeMode={'cover'}
                style={{ flex: 1, justifyContent: 'flex-end' }}
              >
                <Gradient
                  colors={['transparent', utils.color]}
                  height={'50%'}
                  width={'100%'}
                />
                <Image
                  source={s.png}
                  resizeMode={'contain'}
                  style={styles.pngImg}
                />
              </ImageBackground>
            )}
            <View
              style={{
                flex: 0.5,
                alignItems: 'center',
                justifyContent: s.background ? 'flex-start' : 'center'
              }}
            >
              <Text style={[styles.txt, { fontWeight: '700', fontSize: 30 }]}>
                {s.boldTxt}
              </Text>
              <Text style={styles.txt}>{s.normalTxt}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        <Animated.View
          style={[
            styles.indicator,
            {
              left: 0,
              backgroundColor: 'white',
              position: 'absolute',
              transform: [{ translateX: leftAnim }]
            }
          ]}
        />
        {[...new Array(5)].map((_, i) => (
          <View key={i} style={styles.indicator} />
        ))}
      </View>
      <View style={[styles.tOpacityContainer, { paddingBottom: bottom }]}>
        <TouchableOpacity
          onPress={() => navigate('login')}
          style={[styles.tOpacity, { marginHorizontal: bottom }]}
        >
          <Text style={styles.tOpacityTxt}>LOG IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          //   onPress={() => navigate('signup')}
          style={[
            styles.tOpacity,
            { backgroundColor: 'white', marginRight: bottom }
          ]}
        >
          <Text style={[styles.tOpacityTxt, { color: utils.color }]}>
            SIGN UP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pngImg: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '25%'
  },
  txt: {
    paddingHorizontal: 50,
    color: 'white',
    fontFamily: 'OpenSans',
    fontSize: 20,
    textAlign: 'center'
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  indicator: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 99,
    margin: 5
  },
  tOpacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  tOpacity: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 15,
    flex: 1,
    alignItems: 'center',
    borderRadius: 99
  },
  tOpacityTxt: {
    fontFamily: 'RobotoCondensed-Regular',
    fontWeight: '700',
    color: 'white'
  }
});
