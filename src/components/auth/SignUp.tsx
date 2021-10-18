import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  EmitterSubscription,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
import RNIap, {
  InAppPurchase,
  ProductPurchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  Subscription,
  SubscriptionPurchase
} from 'react-native-iap';

import { utils } from '../../utils';
import { BackHeader } from '../../components/header/BackHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { check, pswdVisible } from '../../images/svgs';
import {
  validateEmail,
  validatePurchase,
  saveCreds
} from '../../services/auth.service';
import { ActionModal } from '../../common_components/modals/ActionModal';

interface Props {
  renew?: boolean;
}
export const SignUp: React.FC<Props> = ({ renew }) => {
  const [activeIndex, setActiveindex] = useState(0);
  const [visiblePswd, setVisiblePswd] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollviewWidth = useRef(0);
  const leftAnim = useRef(new Animated.Value(0)).current;
  const scrollview = useRef<ScrollView>(null);
  const indPos = useRef<number[]>([0, 0, 0]).current;
  const creds = useRef({ u: '', p: '', confirmP: '' });
  const warningRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const subscriptions = useRef<Subscription[]>([]);
  const purchaseUpdateSubscription = useRef<EmitterSubscription>();
  const purchaseErrorSubscription = useRef<EmitterSubscription>();
  const selectedPlan = useRef<Subscription>();

  const { goBack, dispatch, navigate } =
    useNavigation<StackNavigationProp<ParamListBase>>();

  let { bottom } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  useEffect(() => {
    if (activeIndex < 2 || subscriptions.current.length) return;
    setLoading(true);
    const subPromise: Promise<Subscription[]> = new Promise(res =>
      RNIap.getSubscriptions(utils.subscriptionsSkus).then(res).catch(res)
    );
    subPromise.then(subs => {
      subscriptions.current = subs.sort((s1, s2) =>
        parseFloat(s1.price) < parseFloat(s2.price) ? -1 : 1
      );
      setLoading(false);
    });
  }, [activeIndex]);

  useEffect(() => {
    new Promise((res, rej) =>
      utils.isiOS
        ? res(null)
        : RNIap.flushFailedPurchasesCachedAsPendingAndroid()
            .then(res)
            .catch(rej)
    )
      .then(() => {
        purchaseUpdateSubscription.current = purchaseUpdatedListener(
          async (
            purchase: InAppPurchase | SubscriptionPurchase | ProductPurchase
          ) => {
            const { transactionReceipt, productId, purchaseToken } = purchase;
            if (transactionReceipt) {
              let formData = new FormData();
              formData.append('email', creds.current.u);
              formData.append('password', creds.current.p);
              if (utils.isiOS) formData.append('receipt', transactionReceipt);
              else {
                formData.append('package_name', `com.drumeo`);
                formData.append('product_id', productId);
                formData.append('purchase_token', purchaseToken);
              }
              formData.append('price', selectedPlan.current?.price);
              formData.append('currency', selectedPlan.current?.currency);
              let validation = await validatePurchase(formData);
              if (validation.token) {
                saveCreds(creds.current.u, creds.current.p, validation.token);
                await RNIap.finishTransaction(purchase);
                // navigate('signUpOnboarding');
                navigate('home');
              }
            }
            setLoading(false);
          }
        );

        purchaseErrorSubscription.current = purchaseErrorListener(
          (e: PurchaseError) => {
            setLoading(false);
            warningRef.current?.toggle('Something went wrong', e.message);
          }
        );
      })
      .catch((e: any) => {
        setLoading(false);
        warningRef.current?.toggle('Something went wrong', e.message);
      });

    return () => {
      purchaseUpdateSubscription.current?.remove();
      purchaseUpdateSubscription.current = undefined;
      purchaseErrorSubscription.current?.remove();
      purchaseErrorSubscription.current = undefined;
    };
  }, []);

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  const renderNext = () => (
    <TouchableOpacity style={styles.nextTOpacity} onPress={onNext}>
      <Text style={styles.nextTxt}>NEXT</Text>
    </TouchableOpacity>
  );

  const renderSecuredTextInput = (credsKey: 'p' | 'confirmP') => (
    <View style={styles.securedTInputContainer}>
      <TextInput
        spellCheck={false}
        autoCorrect={false}
        autoFocus={credsKey === 'p'}
        autoCapitalize={'none'}
        onChangeText={txt => (creds.current[credsKey] = txt)}
        style={{ padding: 15, flex: 1 }}
        placeholderTextColor={'grey'}
        secureTextEntry={!visiblePswd}
      />
      {pswdVisible({
        onPress: () => setVisiblePswd(prevVisiblePswd => !prevVisiblePswd),
        icon: { fill: 'black', width: 20 },
        container: { justifyContent: 'center', paddingHorizontal: 15 }
      })}
    </View>
  );

  const onNext = async () => {
    Keyboard.dismiss();
    if (!nextValid()) return;
    if (activeIndex === 0) {
      setLoading(true);
      let { exists, message, title } = await validateEmail(creds.current.u);
      setLoading(false);
      if (exists)
        return warningRef.current?.toggle(
          'This email is already\nconnected to an account.',
          'Do you want to log in instead?'
        );
      else if (message) return warningRef.current?.toggle(title, message);
    }
    scrollview.current?.scrollTo({
      x: (activeIndex + 1) * scrollviewWidth.current
    });
    animateIndicator(indPos[activeIndex + 1], 200);
    setActiveindex(activeIndex + 1);
  };

  const nextValid = () => {
    let valid = false;
    const { u, p, confirmP } = creds.current;
    if (activeIndex === 0)
      if (u) valid = true;
      else warningRef.current?.toggle('Field required', 'Type your email');
    else if (activeIndex === 1)
      if (p && p.length >= 8 && p === confirmP) valid = true;
      else if (!p)
        warningRef.current?.toggle('Field required', 'Type your password');
      else if (p.length < 8)
        warningRef.current?.toggle(
          'Password length',
          'Password must have at least 8 characters'
        );
      else
        warningRef.current?.toggle(
          'Password mismatch',
          'The passwords do not match'
        );
    return valid;
  };

  const onGetStarted = async (plan: Subscription) => {
    setLoading(true);
    selectedPlan.current = plan;
    try {
      await RNIap.requestSubscription(plan.productId);
    } catch (e: any) {
      warningRef.current?.toggle('Something went wrong', e.message);
    }
  };

  const renderUserInput = () => (
    <View style={{ width: `${100 / 3}%` }}>
      {activeIndex === 0 && (
        <>
          <Text style={styles.subtitle}>What's your email?</Text>
          <TextInput
            spellCheck={false}
            autoCapitalize={'none'}
            onChangeText={txt => (creds.current.u = txt)}
            autoCorrect={false}
            autoFocus={true}
            style={styles.textInput}
            keyboardType={'email-address'}
          />
          {renderNext()}
        </>
      )}
    </View>
  );

  const renderPasswordInput = () => (
    <View style={{ width: `${100 / 3}%` }}>
      {activeIndex === 1 && (
        <>
          <Text style={styles.subtitle}>Create a password</Text>
          {renderSecuredTextInput('p')}
          <Text style={styles.subtitle}>Confirm password</Text>
          {renderSecuredTextInput('confirmP')}
          <Text style={styles.subtitle}>Use at least 8 characters</Text>
          {renderNext()}
        </>
      )}
    </View>
  );

  const renderPlans = () => (
    <View
      style={{
        width: `${100 / 3}%`,
        overflow: 'hidden',
        justifyContent: 'space-between'
      }}
    >
      {activeIndex === 2 && (
        <>
          <View>
            <Text
              style={styles.plansTitle}
            >{`Start Your 7-Day\nFREE Trial Today`}</Text>
            <Text
              style={styles.plansSubtitle}
            >{`Your first 7 days are on us. Choose the plan that will start after your trial ends.`}</Text>
          </View>
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
                <Text style={styles.priceTxt}>
                  {subscriptions.current[0]?.localizedPrice}
                  <Text style={{ fontSize: 15 }}>/mo</Text>
                </Text>
                <TouchableOpacity
                  style={styles.startTOpacity}
                  onPress={() => onGetStarted(subscriptions.current[0])}
                >
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
              <Text style={styles.priceTxt}>
                {subscriptions.current[1]?.localizedPrice}
                <Text style={{ fontSize: 15 }}>/yr</Text>
              </Text>
              <TouchableOpacity
                style={styles.startTOpacity}
                onPress={() => onGetStarted(subscriptions.current[1])}
              >
                <Text style={styles.startTxt}>GET STARTED</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ alignItems: 'center', padding: 10 }}>
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
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ backgroundColor: utils.color, flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={utils.color} barStyle={'light-content'} />
      <BackHeader
        title={activeIndex < 2 ? 'Create Account' : ''}
        transparent={true}
        textColor={'white'}
        onBack={() => {
          if (activeIndex === 0) goBack();
          else if (activeIndex === 1)
            creds.current = { u: '', p: '', confirmP: '' };
          else if (activeIndex === 2)
            creds.current = { ...creds.current, p: '', confirmP: '' };
          scrollview.current?.scrollTo({
            x: (activeIndex - 1) * scrollviewWidth.current
          });
          animateIndicator(indPos[activeIndex - 1], 200);
          setActiveindex(activeIndex - 1);
        }}
      />
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
          onLayout={({
            nativeEvent: {
              layout: { width }
            }
          }) => {
            scrollviewWidth.current = width;
            scrollview.current?.scrollTo({
              x: activeIndex * width,
              animated: false
            });
          }}
          contentContainerStyle={{ width: '300%' }}
        >
          {renderUserInput()}
          {renderPasswordInput()}
          {renderPlans()}
        </ScrollView>
      </ScrollView>
      <View
        style={[styles.activeIndicatorContainer, { paddingBottom: bottom }]}
      >
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
      <ActionModal
        ref={warningRef}
        onAction={() => warningRef.current?.toggle()}
      />
      {loading && (
        <ActivityIndicator
          animating={true}
          size={'large'}
          color={'white'}
          style={styles.loading}
        />
      )}
    </KeyboardAvoidingView>
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
    alignSelf: 'center'
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
  },
  securedTInputContainer: {
    backgroundColor: 'white',
    marginVertical: 15,
    borderRadius: 99,
    flexDirection: 'row'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  priceTxt: {
    fontFamily: 'OpenSans',
    fontSize: 25,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '700'
  }
});
