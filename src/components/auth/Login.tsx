import React, { useContext, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
  Modal,
  Image,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authenticate, restorePurchase } from '../../services/auth.service';
import { pswdVisible } from '../../images/svgs';

import { utils } from '../../utils';
import { StackActions, useNavigation } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';
import { ActionModal } from '../../common_components/modals/ActionModal';
import type { AuthenticateResponse } from '../../interfaces/service.interfaces';
import { BackHeader } from '../../components/header/BackHeader';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

export const Login: React.FC = () => {
  let { bottom } = useSafeAreaInsets();
  if (!bottom) bottom = 20;

  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { navigate, dispatch } =
    useNavigation<StackNavigationProp<ParamListBase>>();

  const [visiblePswd, setVisiblePswd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);
  const [getStartedVisible, setGetStartedVisible] = useState(false);

  const creds = useRef({ u: '', p: '' });
  const authData = useRef<AuthenticateResponse>();
  const userInputRef = useRef<TextInput>(null);
  const warningRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const scrollview = useRef<ScrollView>(null);
  const scrollviewWidth = useRef(0);
  const leftAnim = useRef(new Animated.Value(0)).current;
  const activeIndex = useRef(0);

  const onLogin = () => {
    setLoading(true);
    login();
  };

  const onRestore = () => {
    if (!isConnected) return showNoConnectionAlert();
    setLoading(true);
    restorePurchase().then(({ shouldCreateAccount, shouldLogin, email }) => {
      setLoading(false);
      if (shouldCreateAccount) dispatch(StackActions.replace('subscriptions'));
      else if (shouldLogin) {
        userInputRef.current?.setNativeProps({ text: email });
        creds.current.u = email || '';
      }
    });
  };

  const login = () =>
    authenticate(creds.current.u, creds.current.p)
      .then(auth => {
        authData.current = auth;
        if (auth?.token) {
          setWelcomeModalVisible(true);
          if (canNavigateHome(auth)) navigate('home');
          else if (canNavigatePacks(auth)) navigate('packs');
          else if (auth?.isEdgeExpired)
            navigate('subscriptions', { renew: true });
        } else warningRef.current?.toggle(auth.title, auth.message);
        setLoading(false);
      })
      .catch(e => setLoading(false));

  const renderTInput = (secured: boolean) => (
    <View style={styles.textInputContainer}>
      <TextInput
        ref={secured ? null : userInputRef}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={'none'}
        autoFocus={!secured}
        placeholder={secured ? 'Password' : 'Email Address'}
        keyboardType={secured ? 'default' : 'email-address'}
        onChangeText={txt => (creds.current[secured ? 'p' : 'u'] = txt)}
        style={styles.textInput}
        placeholderTextColor={'grey'}
        secureTextEntry={secured && !visiblePswd}
      />
      {secured &&
        pswdVisible({
          onPress: () => setVisiblePswd(prevVisiblePswd => !prevVisiblePswd),
          icon: { fill: 'black', width: 20 },
          container: { justifyContent: 'center', paddingHorizontal: 15 }
        })}
    </View>
  );

  const welcomeModalContent = (screens: { image: any; text: string }[]) => (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView
          ref={scrollview}
          bounces={false}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: `${screens.length}00%` }}
          onLayout={({ nativeEvent: { layout } }) =>
            scrollview.current?.scrollTo({
              x: activeIndex.current * (scrollviewWidth.current = layout.width)
            })
          }
          onMomentumScrollEnd={({ nativeEvent: { contentOffset } }) => {
            activeIndex.current = contentOffset.x / scrollviewWidth.current;
            if (activeIndex.current === screens.length - 1)
              setGetStartedVisible(true);
            else if (getStartedVisible) setGetStartedVisible(false);
            animateIndicator(activeIndex.current * 15, 200);
          }}
        >
          {screens.map(s => (
            <View
              key={s.text}
              style={{ flex: 1, justifyContent: 'space-evenly' }}
            >
              <Image
                resizeMode={'contain'}
                source={s.image}
                style={{ width: '100%', height: '50%' }}
              />
              <Text style={styles.welcomeModalTxt}>{s.text}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
      <View style={[styles.indicatorContainer, { marginTop: bottom }]}>
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
        {screens.map(s => (
          <View key={s.text} style={styles.indicator} />
        ))}
      </View>
      <View style={{ opacity: getStartedVisible ? 1 : 0 }}>
        <TouchableOpacity
          disabled={!getStartedVisible}
          onPress={() => setWelcomeModalVisible(false)}
          style={[styles.getStartedTOpacity, { marginVertical: bottom }]}
        >
          <Text style={styles.getStartedTxt}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const animateIndicator = (toValue: number, duration = 0) =>
    Animated.timing(leftAnim, {
      toValue,
      duration,
      useNativeDriver: true
    }).start();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: utils.color }}
      behavior={utils.isiOS ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={utils.color} barStyle={'light-content'} />
      <BackHeader title={''} transparent={true} textColor={'white'} />
      <View style={{ maxWidth: 700, alignSelf: 'center', flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps={'handled'}
        >
          {utils.svgBrand({ icon: { width: '80%', fill: 'white' } })}
          <View>
            {/* View needed for a fluid animation when the keyboard shows (at least on iOS) */}
            <Text style={styles.loginBrandMsgTxt}>{utils.loginBrandMsg}</Text>
          </View>
          {!loading && (
            <>
              {renderTInput(false)}
              {renderTInput(true)}
              <TouchableOpacity style={styles.loginTOpacity} onPress={onLogin}>
                <Text style={styles.loginTxt}>LOG IN</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
      {!loading && (
        <View style={{ paddingBottom: bottom }}>
          <TouchableOpacity style={styles.bottomLinkTOpacity}>
            <Text style={styles.bottomLinkTxt}>Forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomLinkTOpacity}
            onPress={onRestore}
          >
            <Text style={styles.bottomLinkTxt}>Restore purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomLinkTOpacity}>
            <Text style={styles.bottomLinkTxt}>
              Can't log in? Contact support
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <ActivityIndicator
          animating={true}
          size={'large'}
          color={'white'}
          style={styles.loading}
        />
      )}
      <ActionModal
        ref={warningRef}
        onAction={() => warningRef.current?.toggle()}
      />
      <Modal
        animationType={'fade'}
        supportedOrientations={['portrait', 'landscape']}
        visible={welcomeModalVisible}
      >
        {authData.current?.isEdge
          ? welcomeModalContent(utils.firstTimeLoginModal.edge)
          : welcomeModalContent(utils.firstTimeLoginModal.packOnly)}
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  loginBrandMsgTxt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'OpenSans',
    textAlign: 'center'
  },
  textInputContainer: {
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 99,
    flexDirection: 'row'
  },
  textInput: { padding: 15, flex: 1 },
  loginTOpacity: {
    padding: 15,
    paddingHorizontal: 50,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 99,
    marginTop: 15
  },
  loginTxt: {
    color: 'white',
    fontFamily: 'RobotoCondensed-Regular',
    fontWeight: '700'
  },
  bottomLinkTOpacity: { padding: 5 },
  bottomLinkTxt: {
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  welcomeModalTxt: {
    fontSize: 20,
    fontFamily: 'OpenSans',
    textAlign: 'center',
    margin: 10
  },
  getStartedTOpacity: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: utils.color,
    borderRadius: 999,
    alignSelf: 'center',
    paddingHorizontal: 30
  },
  getStartedTxt: {
    color: 'white',
    fontFamily: 'RobotoCondensed-Regular',
    fontWeight: '700'
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
    borderColor: utils.color,
    borderRadius: 99,
    margin: 2.5
  }
});
const canNavigateHome = ({ isEdge, isEdgeExpired }: AuthenticateResponse) =>
  isEdge && !isEdgeExpired;
const canNavigatePacks = ({ isPackOlyOwner }: AuthenticateResponse) =>
  isPackOlyOwner;
