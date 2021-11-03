import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import ImagePicker from 'react-native-image-crop-picker';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  useNavigation,
  ParamListBase,
  StackActions
} from '@react-navigation/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '../header/BackHeader';

import { ActionModal } from '../../common_components/modals/ActionModal';
import { WhatIsIncluded } from '../../common_components/WhatIsIncluded';

import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { OrientationContext } from '../../state/orientation/OrientationContext';

import { getAutoList } from '../../services/auth.service';
import { methodService } from '../../services/method.service';
import { userService } from '../../services/user.service';

import type { AutoList } from '../../interfaces/service.interfaces';
import type { Method } from '../../interfaces/method.interfaces';

import { utils } from '../../utils';

import { camera, library, plus, x } from '../../images/svgs';
import { UserContext } from '../../state/user/UserContext';

export const Onboarding: React.FC = () => {
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { isLandscape } = useContext(OrientationContext);
  const { updateUser } = useContext(UserContext);

  let { bottom, top } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  const { dispatch } = useNavigation<StackNavigationProp<ParamListBase>>();

  const [activeIndex, setActiveIndex] = useState(0);
  const [picPickerVisible, setPicPickerVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [pageSwitcherState, setPageSwitcherState] = useState('NEXT');
  const [loading, setLoading] = useState(true);

  const leftAnim = useRef(new Animated.Value(0)).current;
  const scrollview = useRef<ScrollView>(null);
  const userData = useRef({ displayName: '', phone: '' });
  const profilePic = useRef({ fileName: '', type: '', uri: '' });
  const scrollviewWidth = useRef(0);
  const warningRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const method = useRef<Method>();
  const autolist = useRef<AutoList>();

  useEffect(() => {
    methodService.getMethod().then(m => {
      method.current = m;
      setLoading(false);
    });
    return () => {
      if (profilePic.current.uri)
        userService
          .updateAvatar(profilePic.current)
          .then(res => updateUser({ avatarUrl: res?.data?.[0]?.url }));
      if (userData.current.displayName || userData.current.phone) {
        updateUser({ display_name: userData.current.displayName });
        userService.updateUserDetails({
          name: userData.current.displayName,
          phone: userData.current.phone
        });
      }
    };
  }, []);

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  const handleProfilePic = (originFunction: 'openCamera' | 'openPicker') => {
    if (!isConnected) return showNoConnectionAlert();
    ImagePicker[originFunction]({ mediaType: 'photo' })
      .then(res => {
        if (res.path)
          ImagePicker.openCropper({
            path: res.path,
            width: 300,
            height: 300,
            mediaType: 'photo'
          })
            .then(image => {
              if (image) {
                setPageSwitcherState('NEXT');
                profilePic.current = {
                  fileName: image.path,
                  uri: image.path,
                  type: image.mime
                };
              }
              setPicPickerVisible(false);
            })
            .catch(() => setPicPickerVisible(false));
        else
          warningRef.current?.toggle(
            'Something went wrong',
            'Please try again.'
          );
      })
      .catch(() => setPicPickerVisible(false));
  };

  const switchPage = (page: number) => {
    switch (page) {
      case 0:
      case 4:
        setPageSwitcherState('NEXT');
        break;
      default:
        setPageSwitcherState('SKIP');
    }
    Keyboard.dismiss();
    scrollview.current?.scrollTo({
      x: page * scrollviewWidth.current
    });
    animateIndicator(page * 15);
    setActiveIndex(page);
    if (page === 7) {
      setLoading(true);
      getAutoList(selectedLevel, selectedTopics).then(({ data }) => {
        autolist.current = data;
        setLoading(false);
      });
    }
  };

  const onNext = () => {
    switchPage(activeIndex + 1);
  };

  const onSkip = () => {
    switchPage(activeIndex + 1);
  };

  const onBack = () => {
    switchPage(activeIndex - 1);
  };

  const welcomeView = (
    <View style={{ flex: 1 }}>
      {activeIndex === 0 && (
        <>
          <ImageBackground
            style={{
              width: isLandscape ? '25%' : '100%',
              aspectRatio: 1,
              alignSelf: 'center'
            }}
            source={require('../../images/welcome.png')}
            resizeMode={'contain'}
            imageStyle={{ width: '100%' }}
          />
          <Text style={styles.welcomeTxt}>{utils.onboardingWelcomeMsg}</Text>
        </>
      )}
    </View>
  );

  const displayNameView = (
    <View style={{ flex: 1 }}>
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
            onChangeText={txt => {
              if (txt && pageSwitcherState === 'SKIP')
                setPageSwitcherState('NEXT');
              else if (!txt && pageSwitcherState === 'NEXT')
                setPageSwitcherState('SKIP');
              userData.current.displayName = txt;
            }}
            autoCorrect={false}
            style={styles.textInput}
          />
          <Text style={{ fontFamily: 'OpenSans', textAlign: 'center' }}>
            This appears on your {utils.brand} profile and comments.
          </Text>
        </>
      )}
    </View>
  );

  const profilePicView = (
    <View style={{ flex: 1 }}>
      {activeIndex === 2 && (
        <>
          <BackHeader
            title={'Create Account'}
            transparent={true}
            onBack={onBack}
          />
          <Text style={styles.labelTxt}>Add a profile picture</Text>
          <ImageBackground
            key={profilePic.current.uri}
            resizeMode={'contain'}
            source={
              profilePic.current.uri ? { uri: profilePic.current.uri } : {}
            }
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
                opacity: profilePic.current.uri ? 0 : 1
              },
              onPress: () => setPicPickerVisible(true)
            })}
          </ImageBackground>
          <Text style={{ fontFamily: 'OpenSans', textAlign: 'center' }}>
            This appears on your {utils.brand} profile and comments.
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

  const phoneView = (
    <View style={{ flex: 1 }}>
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
            onChangeText={txt => {
              if (txt && pageSwitcherState === 'SKIP')
                setPageSwitcherState('NEXT');
              else if (!txt && pageSwitcherState === 'NEXT')
                setPageSwitcherState('SKIP');
              userData.current.phone = txt;
            }}
            autoCorrect={false}
            style={styles.textInput}
            keyboardType={'phone-pad'}
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

  const whatsIncludedView = (
    <View style={{ flex: 1 }}>{activeIndex === 4 && <WhatIsIncluded />}</View>
  );

  const skillLevelView = (
    <View
      style={{
        flex: 1,
        paddingTop: top,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
      }}
    >
      {activeIndex === 5 && (
        <>
          <Text style={styles.selectableTitleTxt}>
            What skill level would you consider yourself?
          </Text>
          {utils.onboardingLevels.map((l, i) => (
            <View
              key={l.title}
              style={{
                width: '30%',
                alignItems: 'center',
                opacity: l.text === selectedLevel ? 1 : 0.5
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPageSwitcherState('NEXT');
                  setSelectedLevel(l.text);
                }}
                style={[
                  styles.selectableContainer,
                  { width: isLandscape ? '50%' : '100%' }
                ]}
              >
                {[...new Array(i + 1)].map((_, j) => (
                  <View
                    key={j}
                    style={[styles.skillIcon, { height: `${(j + 1) * 20}%` }]}
                  />
                ))}
              </TouchableOpacity>
              <Text style={styles.selectableTxt}>{l.title}</Text>
            </View>
          ))}
          <Text style={styles.selectableInfoTxt}>{selectedLevel}</Text>
        </>
      )}
    </View>
  );

  const interestsView = (
    <View
      style={{
        flex: 1,
        paddingTop: top,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
      }}
    >
      {activeIndex === 6 && (
        <>
          <Text style={styles.selectableTitleTxt}>
            What are you interested in learning or improving?
          </Text>
          {utils.onboardingTopics.map(t => (
            <View
              key={t.title}
              style={{
                width: '30%',
                alignItems: 'center',
                opacity: selectedTopics.includes(t.title) ? 1 : 0.5
              }}
            >
              {t.image({
                icon: { width: '60%', fill: utils.color },
                container: {
                  ...styles.selectableContainer,
                  width: isLandscape ? '50%' : '100%'
                },
                onPress: () =>
                  setSelectedTopics(prevTopics => {
                    let newTopics = prevTopics.includes(t.title)
                      ? prevTopics.filter(pt => pt !== t.title)
                      : [...prevTopics, t.title];
                    if (newTopics.length && pageSwitcherState === 'SKIP')
                      setPageSwitcherState('NEXT');
                    else if (!newTopics.length && pageSwitcherState === 'NEXT')
                      setPageSwitcherState('SKIP');
                    return newTopics;
                  })
              })}
              <Text numberOfLines={1} style={styles.selectableTxt}>
                {t.title}
              </Text>
            </View>
          ))}
          <Text style={styles.selectableInfoTxt}>
            Select all topics that apply.
          </Text>
        </>
      )}
    </View>
  );

  const methodView = (
    <View style={{ flex: 1, paddingTop: top }}>
      {activeIndex === 6 && (
        <>
          <Text style={styles.selectableTitleTxt}>
            Get started with the {utils.brand} Method!
          </Text>
          <ImageBackground
            key={isLandscape.toString()}
            resizeMode={'contain'}
            source={{
              uri: `https://cdn.musora.com/image/fetch/w_${scrollviewWidth.current},ar_1,fl_lossy,q_auto:good,c_fill,g_face/${method.current?.levels?.[0].instructor[0].head_shot_picture_url}`
            }}
            style={{
              width: isLandscape ? '25%' : '70%',
              aspectRatio: 1,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
            imageStyle={{ width: '100%', borderRadius: 10 }}
          >
            <Text style={styles.level1Txt}>LEVEL 1</Text>
          </ImageBackground>
          <Text style={styles.instructorNameTxt}>
            {method.current?.levels?.[0].instructor[0].name}
          </Text>
          <Text style={styles.levelTitleTxt}>
            {method.current?.levels?.[0].title}
          </Text>
          <Text style={styles.levelDescriptionTxt}>
            {method.current?.levels?.[0].description}
          </Text>
        </>
      )}
    </View>
  );

  const autoListView = (
    <View style={{ flex: 1, paddingTop: top }}>
      {activeIndex === 7 && (
        <>
          <Text style={styles.selectableTitleTxt}>
            We've added some lessons to your list!
          </Text>
          {autolist.current?.map(al => (
            <View style={styles.autoListCardContainer} key={al.title}>
              <ImageBackground
                key={isLandscape.toString()}
                resizeMode={'contain'}
                source={{
                  uri: `https://cdn.musora.com/image/fetch/w_${scrollviewWidth.current},fl_lossy,q_auto:good,c_fill,g_face/${al.thumbnail_url}`
                }}
                style={{ width: '20%', aspectRatio: 16 / 9 }}
                imageStyle={{ width: '100%', borderRadius: 10 }}
              />
              <Text style={styles.autoListTitleTxt}>
                {al.title}
                {`\n`}
                <Text style={{ fontWeight: '400' }}>{al.type}</Text>
              </Text>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const showMethod =
    selectedLevel !== utils.onboardingLevels[2].text &&
    new Date() > new Date(method.current?.published_on || '');

  const showAutoList =
    selectedLevel === utils.onboardingLevels[2].text ||
    !method.current?.published_on ||
    new Date() < new Date(method.current?.published_on || '');

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
          scrollEnabled={false}
          bounces={false}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{ width: '800%' }}
          onLayout={({ nativeEvent: { layout } }) =>
            scrollview.current?.scrollTo({
              x: activeIndex * (scrollviewWidth.current = layout.width),
              animated: false
            })
          }
        >
          {welcomeView}
          {displayNameView}
          {profilePicView}
          {phoneView}
          {whatsIncludedView}
          {skillLevelView}
          {showMethod ? methodView : interestsView}
          {showAutoList && autoListView}
        </ScrollView>
      </ScrollView>
      {!((activeIndex === 6 && showMethod) || activeIndex === 7) && (
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
      )}
      {activeIndex === 6 && showMethod ? (
        <>
          <TouchableOpacity
            onPress={() => dispatch(StackActions.replace('home'))}
            style={[styles.nextTOpacity, { padding: 20 }]}
          >
            <Text style={styles.nextTxt}>I'LL FIND MY OWN LESSONS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(StackActions.replace('method'))}
            style={{
              margin: bottom,
              marginTop: 0,
              backgroundColor: utils.color,
              padding: 20,
              alignItems: 'center',
              borderRadius: 99
            }}
          >
            <Text style={[styles.nextTxt, { color: 'white' }]}>
              START THE DRUMEO METHOD
            </Text>
          </TouchableOpacity>
        </>
      ) : activeIndex === 7 ? (
        <>
          <TouchableOpacity
            onPress={() => dispatch(StackActions.replace('home'))}
            style={[styles.nextTOpacity, { padding: 20 }]}
          >
            <Text style={styles.nextTxt}>I'LL FIND MY OWN LESSONS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(StackActions.replace('myList'))}
            style={{
              margin: bottom,
              marginTop: 0,
              backgroundColor: utils.color,
              padding: 20,
              alignItems: 'center',
              borderRadius: 99
            }}
          >
            <Text style={[styles.nextTxt, { color: 'white' }]}>
              GO TO MY LIST
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={pageSwitcherState === 'NEXT' ? onNext : onSkip}
          style={[styles.nextTOpacity, { marginVertical: bottom }]}
        >
          <Text style={styles.nextTxt}>{pageSwitcherState}</Text>
        </TouchableOpacity>
      )}
      <ActionModal
        ref={warningRef}
        onAction={() => warningRef.current?.toggle()}
      />
      {loading && (
        <ActivityIndicator
          color={'white'}
          size={'large'}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,.5)'
          }}
        />
      )}
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
  selectableTitleTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    fontSize: 30,
    textAlign: 'center',
    width: '100%',
    padding: 10
  },
  selectableContainer: {
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
  selectableTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    padding: 10,
    color: utils.color,
    fontSize: 12,
    textAlign: 'center'
  },
  selectableInfoTxt: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'OpenSans',
    fontSize: 20,
    padding: 10
  },
  level1Txt: {
    color: 'white',
    fontFamily: 'OpenSans',
    fontWeight: '700',
    fontSize: 25
  },
  instructorNameTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    color: utils.color,
    padding: 10,
    textAlign: 'center'
  },
  levelTitleTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    padding: 10,
    textAlign: 'center'
  },
  levelDescriptionTxt: {
    fontFamily: 'OpenSans',
    padding: 10,
    textAlign: 'center'
  },
  autoListCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    padding: 10
  },
  autoListTitleTxt: {
    fontFamily: 'OpenSans',
    fontWeight: '700',
    flex: 1,
    paddingLeft: 10
  }
});
