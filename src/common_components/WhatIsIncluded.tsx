import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { utils } from '../utils';
import { drumeo, edge } from '../images/svgs';

interface Props {}
export const WhatIsIncluded: React.FC<Props> = () => {
  let { top } = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: top }}>
      <View style={{ justifyContent: 'center' }}>
        <Video
          paused={false}
          repeat={true}
          controls={false}
          resizeMode='cover'
          ignoreSilentSwitch={'ignore'}
          style={{ width: '100%', aspectRatio: 16 / 9 }}
          source={{ uri: utils.whatIsIncluded.video }}
        />
        <View style={styles.videoBackground}>
          <View style={{ flexDirection: 'row' }}>
            {drumeo({
              icon: { width: '80%', fill: 'white' },
              container: {
                flex: 1,
                alignItems: 'flex-end',
                justifyContent: 'center'
              }
            })}
            {edge({
              icon: { width: '80%', fill: utils.color },
              container: { flex: 1 }
            })}
          </View>
          <Text style={styles.videoTxt}>
            Learn the drums faster, easier, better.{` `}
            <Text style={{ fontWeight: '700' }}>Guaranteed.</Text>
          </Text>
        </View>
      </View>
      {utils.whatIsIncluded.offers.map(o => (
        <View key={o.text} style={styles.cardContainer}>
          <ImageBackground
            source={o.image}
            style={{ width: '25%', aspectRatio: 1 }}
            imageStyle={{ width: '100%' }}
            resizeMode={'contain'}
          />
          <Text style={styles.titleTxt}>
            {o.title}
            {`\n`}
            <Text style={{ fontWeight: '400' }}>{o.text}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  videoTxt: {
    color: 'white',
    fontFamily: 'OpenSans',
    fontSize: 24,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  videoBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(1, 39, 74, 0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  cardContainer: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'lightgrey'
  },
  titleTxt: {
    flex: 1,
    fontWeight: '700',
    fontFamily: 'OpenSans',
    paddingHorizontal: 10
  }
});
