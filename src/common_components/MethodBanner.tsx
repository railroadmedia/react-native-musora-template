import React, { useContext, useMemo, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/core';

import { ThemeContext } from '../state/theme/ThemeContext';

import { Gradient } from './Gradient';

import { utils } from '../utils';
import { themeStyles } from '../themeStyles';

import {
  arrowRight,
  info,
  infoFilled,
  method,
  play,
  reset
} from '../images/svgs';

import type { ParamListBase } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { Method } from '../interfaces/method.interfaces';
import { ResetModal } from './modals/ResetModal';

interface Props extends Method {
  expandableInfo?: boolean;
}

const svgStyle = {
  icon: { height: 10, fill: 'white' },
  container: { paddingRight: 5 }
};
const infoSvgStyle = { icon: { height: 25, width: 25, fill: 'white' } };

export const MethodBanner: React.FC<Props> = ({
  thumbnail_url,
  started,
  completed,
  description,
  expandableInfo,
  next_lesson: { id }
}) => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const [infoVisible, setInfoVisivle] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);

  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  return (
    <>
      <ImageBackground
        style={[
          styles.imageBackground,
          expandableInfo ? { aspectRatio: 16 / 9 } : {}
        ]}
        source={{
          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco/${thumbnail_url}`
        }}
      >
        <View style={styles.gradientContainer}>
          <Gradient
            colors={[
              'transparent',
              utils.getColorWithAlpha(30),
              themeStyles[theme].background || ''
            ]}
            height={'100%'}
            width={'100%'}
          />
        </View>
        {utils.svgBrand({ icon: { width: '25%', fill: utils.color } })}
        {method({
          icon: { width: '60%', fill: 'white' },
          container: { paddingTop: 15 }
        })}
        <View style={styles.btnsContainer}>
          {expandableInfo && <View style={styles.placeHolder} />}
          <TouchableOpacity
            onPress={() => {
              if (!completed) navigate('lessonPart', { id });
              else setResetVisible(true);
            }}
            style={styles.btnTOpacity}
          >
            {(completed ? reset : play)(svgStyle)}
            <Text style={styles.btnText}>
              {completed ? 'RESET' : started ? 'CONTINUE' : 'START'}
            </Text>
          </TouchableOpacity>
          {!expandableInfo ? (
            <TouchableOpacity
              onPress={() => navigate('method')}
              style={[styles.btnTOpacity, styles.btnTOpacityMoreInfo]}
            >
              {arrowRight(svgStyle)}
              <Text style={styles.btnText}>MORE INFO</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.placeHolder}
              onPress={() => setInfoVisivle(!infoVisible)}
            >
              {infoVisible ? infoFilled(infoSvgStyle) : info(infoSvgStyle)}
              <Text style={styles.infoText}>Info</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      {infoVisible && <Text style={styles.description}>{description}</Text>}
      <ResetModal
        visible={resetVisible}
        onDismiss={() => setResetVisible(false)}
      />
    </>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    imageBackground: {
      width: '100%',
      aspectRatio: utils.isTablet ? 16 / 6 : 1,
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    gradientContainer: {
      height: '100%',
      position: 'absolute',
      width: '100%',
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    btnsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '100%',
      paddingVertical: 15,
      paddingBottom: 25
    },
    btnTOpacity: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: utils.color,
      flex: 0.4,
      padding: 15,
      borderRadius: 99
    },
    btnTOpacityMoreInfo: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'white'
    },
    btnText: {
      fontSize: utils.figmaFontSizeScaler(14),
      color: 'white',
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: '700',
      textAlign: 'center'
    },
    infoText: {
      color: '#ffffff',
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    placeHolder: {
      flex: 0.2,
      alignItems: 'center',
      justifyContent: 'center'
    },
    description: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      textAlign: 'center',
      marginBottom: 10
    }
  });
