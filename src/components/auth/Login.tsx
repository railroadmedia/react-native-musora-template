import React, { useContext, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { utils } from '../../utils';

export const Login: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: utils.color }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {utils.svgBrand({ icon: { width: '80%', fill: 'white' } })}
        <Text style={styles.loginBrandMsgTxt}>{utils.loginBrandMsg}</Text>
        <TextInput
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={'none'}
          autoFocus={true}
          placeholder={'Email Address'}
          keyboardType={'email-address'}
          onChangeText={() => {}}
          style={styles.textInput}
          placeholderTextColor={'grey'}
        />
        <TextInput
          spellCheck={false}
          autoCorrect={false}
          secureTextEntry={true}
          autoCapitalize={'none'}
          keyboardType={'default'}
          onChangeText={() => {}}
          placeholder={'Password'}
          style={styles.textInput}
          placeholderTextColor={'grey'}
        />
        <TouchableOpacity style={styles.loginTOpacity} onPress={() => {}}>
          <Text style={styles.loginTxt}>LOG IN</Text>
        </TouchableOpacity>
      </ScrollView>
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
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginBrandMsgTxt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'OpenSans',
    textAlign: 'center'
  },
  textInput: {
    backgroundColor: 'white',
    width: '80%',
    padding: 15,
    marginTop: 15,
    borderRadius: 99
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
  }
});
