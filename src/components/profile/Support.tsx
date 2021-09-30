import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';

export const Support: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  const onChatSupport = useCallback(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.padding}>
        <TouchableOpacity style={styles.supportBtn} onPress={onChatSupport}>
          <Text style={styles.buttonText}>Live Chat Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => Linking.openURL('mailto:support@drumeo.com')}
        >
          <Text style={styles.buttonText}>Email Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => Linking.openURL(`tel:${'18004398921'}`)}
        >
          <Text style={styles.buttonText}>Phone Support</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.tag}>EMAIL</Text>
          <Text style={styles.detail}>{`support@${utils.brand}.com`}</Text>
          <Text style={styles.tag}>PHONE</Text>
          <Text style={styles.detail}>1-800-439-8921</Text>
          <Text style={styles.detail}>1-604-855-7605</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    padding: {
      padding: 15,
      paddingTop: 40
    },
    supportTitle: {
      marginTop: 20,
      marginBottom: 20,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(30),
      fontFamily: 'OpenSans-Bold'
    },
    supportBtn: {
      width: '100%',
      marginBottom: 10,
      backgroundColor: utils.color,
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: '#ffffff'
    },
    tag: {
      color: current.contrastTextColor,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      marginVertical: 10
    },
    detail: {
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.textColor
    }
  });
