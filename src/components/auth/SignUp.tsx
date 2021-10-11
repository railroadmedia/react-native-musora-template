import React, { useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { StackActions, useNavigation } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

import { utils } from '../../utils';
import { BackHeader } from '../../components/header/BackHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { check } from '../../images/svgs';

export const SignUp: React.FC = () => {
  const [activeIndex, setActiveindex] = useState(0);

  const leftAnim = useRef(new Animated.Value(0)).current;
  const scrollview = useRef<ScrollView>(null);
  const indPos = useRef<number[]>([0, 0, 0]).current;

  const { goBack, dispatch, navigate } =
    useNavigation<StackNavigationProp<ParamListBase>>();

  let { bottom } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  const renderNext = () => (
    <TouchableOpacity
      style={styles.nextTOpacity}
      onPress={() => {
        scrollview.current?.scrollTo({ x: (activeIndex + 1) * utils.WIDTH });
        animateIndicator(indPos[activeIndex + 1], 200);
        setActiveindex(activeIndex + 1);
      }}
    >
      <Text style={styles.nextTxt}>NEXT</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: utils.color, flex: 1 }}>
      <StatusBar backgroundColor={utils.color} barStyle={'light-content'} />
      <BackHeader
        title={activeIndex < 2 ? 'Create Account' : ''}
        transparent={true}
        textColor={'white'}
        onBack={() => {
          if (!activeIndex) goBack();
          scrollview.current?.scrollTo({ x: (activeIndex - 1) * utils.WIDTH });
          animateIndicator(indPos[activeIndex - 1], 200);
          setActiveindex(activeIndex - 1);
        }}
      />
      <ScrollView
        ref={scrollview}
        scrollEnabled={false}
        bounces={false}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: utils.WIDTH }}>
          <Text style={styles.subtitle}>What's your email?</Text>
          <TextInput style={styles.textInput} />
          {renderNext()}
        </View>
        <View style={{ width: utils.WIDTH }}>
          <Text style={styles.subtitle}>Create a password</Text>
          <TextInput style={styles.textInput} />
          <Text style={styles.subtitle}>Confirm password</Text>
          <TextInput style={styles.textInput} />
          <Text style={styles.subtitle}>Use at least 8 characters</Text>
          {renderNext()}
        </View>
        <View style={{ width: utils.WIDTH, overflow: 'hidden' }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              marginBottom: -10,
              zIndex: 2
            }}
          >
            <Text
              style={styles.plansTitle}
            >{`Start Your 7-Day\nFREE Trial Today`}</Text>
            <Text
              style={styles.plansSubtitle}
            >{`Your first 7 days are on us. Choose the plan that will start after your trial ends.`}</Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
            >
              <View style={{ justifyContent: 'flex-end' }}>
                <View style={styles.planContainer}>
                  <Text style={styles.planTitle}>MONTHLY PLAN</Text>
                  <Text style={styles.planSubtitle}>
                    If you prefer total flexibility.
                  </Text>
                  <View style={styles.separator} />
                  <Text style={styles.planFreeTxt}>7 DAYS FREE, THEN</Text>
                  <Text>PRICE</Text>
                  <TouchableOpacity style={styles.startTOpacity}>
                    <Text style={styles.startTxt}>GET STARTED</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.planContainer}>
                <View style={styles.saveTxtContainer}>
                  <Text style={styles.saveTxt}>SAVE 45% VS MONTHLY</Text>
                </View>
                <Text style={styles.planTitle}>ANNUAL PLAN</Text>
                <Text style={styles.planSubtitle}>
                  If you're commited to improving.
                </Text>
                <View style={styles.separator} />
                <Text style={styles.planFreeTxt}>7 DAYS FREE, THEN</Text>
                <Text>PRICE</Text>
                <TouchableOpacity style={styles.startTOpacity}>
                  <Text style={styles.startTxt}>GET STARTED</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.darkHalfArea}>
            {utils.signUpPlanBenefits.map(benefit => (
              <Text style={styles.benefitTxt} key={benefit}>
                {check({ icon: { width: 12, fill: 'white' } })}
                {benefit}
              </Text>
            ))}
            <Text
              onPress={() => dispatch(StackActions.replace('login'))}
              style={[
                styles.benefitTxt,
                { paddingVertical: 10, textDecorationLine: 'underline' }
              ]}
            >
              Already a member? Log in
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text
                onPress={() => navigate('terms')}
                style={[
                  styles.benefitTxt,
                  { padding: 5, textDecorationLine: 'underline' }
                ]}
              >
                Termns
              </Text>
              <Text
                onPress={() => navigate('privacyPolicy')}
                style={[
                  styles.benefitTxt,
                  { padding: 5, textDecorationLine: 'underline' }
                ]}
              >
                Privacy
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.activeIndicatorContainer, { marginBottom: bottom }]}>
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
        {[`EMAIL\nADDRESS`, `SET A\nPASSWORD`, `CHOOSE\nA PLAN`].map((d, i) => (
          <View
            key={d}
            style={{ alignItems: 'center' }}
            onLayout={({ nativeEvent: { layout } }) => (indPos[i] += layout.x)}
          >
            <View
              style={styles.indicator}
              onLayout={({ nativeEvent: { layout } }) => {
                if (!i) animateIndicator(layout.x);
                indPos[i] += layout.x;
              }}
            />
            <Text style={styles.indicatorTxt}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: { color: 'white', fontFamily: 'OpenSans', fontWeight: '500' },
  textInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 99,
    marginVertical: 15
  },
  nextTOpacity: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    marginVertical: 15
  },
  nextTxt: { color: 'white', paddingVertical: 15, paddingHorizontal: 50 },
  activeIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0
  },
  indicator: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 99
  },
  indicatorTxt: {
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'RobotoCondensed-Regular',
    fontWeight: '700',
    color: 'white',
    margin: 5
  },
  plansTitle: {
    color: 'white',
    fontSize: 25,
    fontFamily: 'OpenSans',
    textAlign: 'center',
    fontWeight: '700'
  },
  plansSubtitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'OpenSans',
    textAlign: 'center'
  },
  darkHalfArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#191b1c',
    alignSelf: 'center',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  planContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5
  },
  planTitle: {
    fontFamily: 'RobotoCondensed-Regular',
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
    padding: 10,
    paddingBottom: 0
  },
  planSubtitle: {
    fontFamily: 'OpenSans-Italic',
    color: 'black',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#e5e8e8',
    marginVertical: 10
  },
  planFreeTxt: {
    fontFamily: 'OpenSans',
    color: 'black',
    fontSize: 10
  },
  startTOpacity: {
    margin: 10,
    backgroundColor: utils.color,
    borderRadius: 99,
    padding: 10
  },
  startTxt: {
    color: 'white',
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
    fontWeight: '700'
  },
  saveTxtContainer: {
    backgroundColor: '#10d060',
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
    width: '100%'
  },
  saveTxt: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 2.5
  },
  benefitTxt: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'OpenSans',
    fontSize: 12
  }
});
