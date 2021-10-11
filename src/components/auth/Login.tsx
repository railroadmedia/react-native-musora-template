import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticate } from '../../services/auth.service';
import { pswdVisible } from '../../images/svgs';

import { utils } from '../../utils';
import { useNavigation } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';
import { ActionModal } from '../../common_components/modals/ActionModal';
import type { AuthenticateResponse } from '../../interfaces/service.interfaces';
import { BackHeader } from '../../components/header/BackHeader';

export const Login: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const [visiblePswd, setVisiblePswd] = useState(false);
  const [loading, setLoading] = useState(false);

  const creds = useRef({ u: '', p: '' });
  const warningRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const onLogin = () => {
    setLoading(true);
    login();
  };

  const login = () =>
    authenticate(creds.current.u, creds.current.p)
      .then(auth => {
        if (auth?.token) {
          if (canNavigateHome(auth)) navigate('home');
          else if (canNavigatePacks(auth)) navigate('packs');
          else if (auth?.isEdgeExpired) {
          }
        } else warningRef.current?.toggle(auth.title, auth.message);
        setLoading(false);
      })
      .catch(e => setLoading(false));

  const renderTInput = (secured: boolean) => (
    <View style={styles.textInputContainer}>
      <TextInput
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
          onPress: () => {
            setVisiblePswd(prevVisiblePswd => !prevVisiblePswd);
          },
          icon: { fill: 'black', width: 20 },
          container: { justifyContent: 'center', paddingHorizontal: 15 }
        })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: utils.color }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        <SafeAreaView edges={['bottom', 'left', 'right']}>
          <TouchableOpacity style={styles.bottomLinkTOpacity}>
            <Text style={styles.bottomLinkTxt}>Forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomLinkTOpacity}>
            <Text style={styles.bottomLinkTxt}>Restore purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomLinkTOpacity}>
            <Text style={styles.bottomLinkTxt}>
              Can't log in? Contact support
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
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
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginBrandMsgTxt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'OpenSans',
    textAlign: 'center'
  },
  textInputContainer: {
    backgroundColor: 'white',
    width: '80%',
    marginTop: 15,
    borderRadius: 99,
    flexDirection: 'row'
  },
  textInput: {
    padding: 15,
    flex: 1
  },
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
  }
});
const canNavigateHome = ({ isEdge, isEdgeExpired }: AuthenticateResponse) =>
  isEdge && !isEdgeExpired;
const canNavigatePacks = ({ isPackOlyOwner }: AuthenticateResponse) =>
  isPackOlyOwner;
