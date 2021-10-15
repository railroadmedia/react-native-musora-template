import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

import { ThemeContext } from '../state/theme/ThemeContext';

import { Gradient } from './Gradient';
import { ActionModal } from '../common_components/modals/ActionModal';

import { utils } from '../utils';
import { themeStyles } from '../themeStyles';

import {
  arrowRight,
  info,
  infoFilled,
  methodTag,
  play,
  reset
} from '../images/svgs';

import { MethodContext } from '../state/method/MethodContext';
import { ConnectionContext } from '../state/connection/ConnectionContext';

interface Props {
  expandableInfo?: boolean;
}

const svgStyle = {
  icon: { height: 10, fill: 'white' },
  container: { paddingRight: 5 }
};
const infoSvgStyle = { icon: { height: 25, width: 25, fill: 'white' } };

export const MethodBanner: React.FC<Props> = ({ expandableInfo }) => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const [infoVisible, setInfoVisivle] = useState(false);
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const { method, updateMethod } = useContext(MethodContext);
  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const {
    banner_background_image,
    started,
    completed,
    description,
    next_lesson
  } = method;

  const onMainBtnPress = () => {
    if (!isConnected) return showNoConnectionAlert();

    if (!completed) navigate('lessonPart', { id: next_lesson?.id });
    else
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
  };

  const goToMethod = () => {
    if (!isConnected) return showNoConnectionAlert();
    navigate('method');
  };

  const resetProgress = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    updateMethod({
      ...method,
      completed: false,
      started: false,
      levels: method.levels?.map(l => ({ ...l, progress_percent: 0 }))
    });
  }, [method, isConnected]);

  return (
    <>
      <ImageBackground
        style={[
          styles.imageBackground,
          expandableInfo ? { aspectRatio: 16 / 9 } : {}
        ]}
        source={{
          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco/${banner_background_image}`
        }}
      >
        <View style={styles.gradientContainer}>
          <Gradient
            colors={[
              'transparent',
              utils.getColorWithAlpha(0.3),
              themeStyles[theme].background || ''
            ]}
            height={'100%'}
            width={'100%'}
          />
        </View>
        {utils.svgBrand({ icon: { width: '25%', fill: utils.color } })}
        {methodTag({
          icon: { width: '60%', fill: 'white' },
          container: { paddingTop: 15 }
        })}
        <View style={styles.btnsContainer}>
          {expandableInfo && <View style={styles.placeHolder} />}
          <TouchableOpacity onPress={onMainBtnPress} style={styles.btnTOpacity}>
            {(completed ? reset : play)(svgStyle)}
            <Text style={styles.btnText}>
              {completed ? 'RESET' : started ? 'CONTINUE' : 'START'}
            </Text>
          </TouchableOpacity>
          {!expandableInfo ? (
            <TouchableOpacity
              onPress={goToMethod}
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
      <ActionModal
        ref={resetModalRef}
        primaryBtnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle()}
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
