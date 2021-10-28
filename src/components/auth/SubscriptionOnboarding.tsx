import React, { useContext, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';

import { BackHeader } from '../header/BackHeader';
import { utils } from '../../utils';
import { camera, library, plus, x } from '../../images/svgs';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { OrientationContext } from '../../state/orientation/OrientationContext';
import { WhatIsIncluded } from '../../common_components/WhatIsIncluded';

export const SubscriptionOnboarding: React.FC = () => {
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { isLandscape } = useContext(OrientationContext);

  let { bottom, top } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  const [activeIndex, setActiveIndex] = useState(0);
  const [picPickerVisible, setPicPickerVisible] = useState(false);
  const [profilePicPath, setProfilePicPath] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const leftAnim = useRef(new Animated.Value(0)).current;
  const scrollview = useRef<ScrollView>(null);
  const userData = useRef({ displayName: '' });
  const scrollviewWidth = useRef(0);
  const warningRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  const handleProfilePic = (originFunction: 'openCamera' | 'openPicker') => {
    setPicPickerVisible(false);
    if (!isConnected) return showNoConnectionAlert();
    setTimeout(() => {
      ImagePicker[originFunction]({ mediaType: 'photo' }).then(res => {
        if (res.path)
          ImagePicker.openCropper({
            path: res.path,
            width: 300,
            height: 300,
            mediaType: 'photo'
          }).then(image => {
            if (image) setProfilePicPath(image.path);
          });
        else
          warningRef.current?.toggle(
            'Something went wrong',
            'Please try again.'
          );
      });
    }, 2000);
  };

  const switchPage = (page: number) => {
    Keyboard.dismiss();
    scrollview.current?.scrollTo({
      x: page * scrollviewWidth.current
    });
    animateIndicator(page * 15);
    setActiveIndex(page);
  };

  const onNext = () => {
    switchPage(activeIndex + 1);
  };

  const onBack = () => {
    switchPage(activeIndex - 1);
  };

  const welcome = (
    <View style={{ width: `${100 / 7}%` }}>
      {activeIndex === 0 && (
        <>
          <ImageBackground
            style={{ flex: 1, width: '100%' }}
            source={require('../../images/welcome.png')}
            resizeMode={'contain'}
          />
          <Text
            style={styles.welcomeTxt}
          >{`Welcome to Drumeo!  You'll now be able to access step-by-step courses from the best drummers in the world, song breakdowns, drumless play-alongs, and every exclusive Drumeo show!\n\nLet’s get your account set up.`}</Text>
        </>
      )}
    </View>
  );

  const displayName = (
    <View style={{ width: `${100 / 7}%` }}>
      {activeIndex === 1 && (
        <>
          <BackHeader
            title={'Create Account'}
            transparent={true}
            onBack={onBack}
          />
          <Text style={styles.labelTxt}>Add a display name</Text>
          <TextInput
            spellCheck={false}
            autoCapitalize={'none'}
            onChangeText={txt => (userData.current.displayName = txt)}
            autoCorrect={false}
            style={styles.textInput}
            keyboardType={'email-address'}
          />
          <Text style={{ fontFamily: 'OpenSans', textAlign: 'center' }}>
            This appears on your Drumeo profile and comments.
          </Text>
        </>
      )}
    </View>
  );

  const profilePic = (
    <View style={{ width: `${100 / 7}%` }}>
      {activeIndex === 2 && (
        <>
          <BackHeader
            title={'Create Account'}
            transparent={true}
            onBack={onBack}
          />
          <Text style={styles.labelTxt}>Add a profile picture</Text>
          <ImageBackground
            key={profilePicPath}
            resizeMode={'stretch'}
            source={profilePicPath ? { uri: profilePicPath } : {}}
            style={{
              width: isLandscape ? '25%' : '50%',
              aspectRatio: 1,
              alignSelf: 'center'
            }}
            imageStyle={{ width: '100%', borderRadius: 999 }}
          >
            {plus({
              icon: { width: '50%', fill: 'white' },
              container: {
                ...styles.addProfilePicIconContainer,
                opacity: profilePicPath ? 0 : 1
              },
              onPress: () => setPicPickerVisible(true)
            })}
          </ImageBackground>
          <Text style={{ fontFamily: 'OpenSans', textAlign: 'center' }}>
            This appears on your Drumeo profile and comments.
          </Text>
          <Modal
            transparent={true}
            animationType={'fade'}
            onRequestClose={() => setPicPickerVisible(false)}
            supportedOrientations={['portrait', 'landscape']}
            visible={picPickerVisible}
          >
            <TouchableOpacity
              onPress={() => setPicPickerVisible(false)}
              style={styles.profileModalBackground}
            >
              <View style={styles.profileModalActionsContainer}>
                {camera({
                  icon: { height: 20, width: 20, fill: 'black' },
                  container: styles.profileModalIconContainer,
                  text: 'TAKE A PHOTO',
                  textStyle: { textAlign: 'center', paddingLeft: 10 },
                  onPress: () => handleProfilePic('openCamera')
                })}
                {library({
                  icon: { height: 20, width: 20, fill: 'black' },
                  container: styles.profileModalIconContainer,
                  text: 'CHOOSE FROM LIBRARY',
                  textStyle: { textAlign: 'center', paddingLeft: 10 },
                  onPress: () => handleProfilePic('openPicker')
                })}
                {x({
                  icon: { height: 20, width: 20, fill: 'black' },
                  container: styles.profileModalIconContainer,
                  text: 'CANCEL',
                  textStyle: { textAlign: 'center', paddingLeft: 10 },
                  onPress: () => setPicPickerVisible(false)
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );

  const phone = (
    <View style={{ width: `${100 / 7}%` }}>
      {activeIndex === 3 && (
        <>
          <BackHeader
            title={'Create Account'}
            transparent={true}
            onBack={onBack}
          />
          <Text style={styles.labelTxt}>Add a phone number</Text>
          <TextInput
            spellCheck={false}
            autoCapitalize={'none'}
            onChangeText={txt => (userData.current.displayName = txt)}
            autoCorrect={false}
            style={styles.textInput}
            keyboardType={'email-address'}
          />
          <Text style={{ fontFamily: 'OpenSans', textAlign: 'center' }}>
            If there’s ever an issue with your account we’ll always try emailing
            you first. Sometimes though emails get lost, so we’d love to send
            you a quick text message to resolve any issues that arise to prevent
            you from losing access if we can’t get in touch over email.
          </Text>
        </>
      )}
    </View>
  );

  const whatsIncluded = (
    <View style={{ width: `${100 / 7}%` }}>
      {activeIndex === 4 && <WhatIsIncluded />}
    </View>
  );

  const skillLevel = (
    <View
      style={{
        width: `${100 / 7}%`,
        paddingTop: top,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
      }}
    >
      {activeIndex === 5 && (
        <>
          <Text style={styles.skillTitleTxt}>
            What skill level would you consider yourself?
          </Text>
          {utils.skillLevels.map((s, i) => (
            <View
              key={s.title}
              style={{
                width: isLandscape ? '20%' : '30%',
                opacity: s.text === selectedLevel ? 1 : 0.5
              }}
            >
              <TouchableOpacity onPress={() => setSelectedLevel(s.text)}>
                <View style={styles.skillIconContainer}>
                  {[...new Array(i + 1)].map((_, j) => (
                    <View
                      key={j}
                      style={[styles.skillIcon, { height: `${(j + 1) * 20}%` }]}
                    />
                  ))}
                </View>
                <Text style={styles.skillTxt}>{s.title}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.selectedLevelTxt}>{selectedLevel}</Text>
        </>
      )}
    </View>
  );

  const interests = (
    <View style={{ width: `${100 / 7}%` }}>{activeIndex === 6 && <></>}</View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={utils.isiOS ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView
          ref={scrollview}
          bounces={false}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{ width: '700%' }}
          onLayout={({ nativeEvent: { layout } }) =>
            scrollview.current?.scrollTo({
              x: activeIndex * (scrollviewWidth.current = layout.width)
            })
          }
        >
          {welcome}
          {displayName}
          {profilePic}
          {phone}
          {whatsIncluded}
          {skillLevel}
          {/* {interests} */}
        </ScrollView>
      </ScrollView>
      <View style={styles.activeIndicatorContainer}>
        <Animated.View
          style={[
            styles.indicator,
            {
              left: 0,
              backgroundColor: utils.color,
              position: 'absolute',
              transform: [{ translateX: leftAnim }]
            }
          ]}
        />
        {[...new Array(7)].map((_, i) => (
          <View key={i} style={styles.indicator} />
        ))}
      </View>
      <TouchableOpacity
        onPress={onNext}
        style={[styles.nextTOpacity, { marginVertical: bottom }]}
      >
        <Text style={styles.nextTxt}>NEXT</Text>
      </TouchableOpacity>
      <ActionModal
        ref={warningRef}
        onAction={() => warningRef.current?.toggle()}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  welcomeTxt: {
    fontSize: 20,
    fontFamily: 'OpenSans',
    padding: 30,
    textAlign: 'center'
  },
  activeIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: utils.color,
    margin: 2.5
  },
  nextTOpacity: { padding: 10, alignItems: 'center' },
  nextTxt: {
    color: utils.color,
    fontFamily: 'RobotoCondensed-Regular',
    fontWeight: '700'
  },
  labelTxt: {
    fontFamily: 'OpenSans',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 99,
    fontFamily: 'OpenSans',
    padding: 20,
    marginVertical: 10,
    borderColor: 'lightgrey'
  },
  profileModalIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  addProfilePicIconContainer: {
    backgroundColor: utils.color,
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileModalActionsContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5
  },
  skillTitleTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    fontSize: 30,
    textAlign: 'center',
    width: '100%',
    padding: 10
  },
  skillIconContainer: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: utils.color,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  skillIcon: {
    width: '10%',
    margin: 2,
    backgroundColor: utils.color,
    borderRadius: 2,
    alignSelf: 'flex-end',
    marginBottom: '20%'
  },
  skillTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    textAlign: 'center',
    padding: 10,
    color: utils.color
  },
  selectedLevelTxt: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'OpenSans',
    fontSize: 20,
    padding: 10
  }
});
