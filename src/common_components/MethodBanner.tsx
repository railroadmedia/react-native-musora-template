import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { arrowRight, info, infoFilled, method, play } from '../images/svgs';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import { utils } from '../utils';
import { Gradient } from './Gradient';

interface Props {
  isBig: boolean;
  thumbnail_url?: string;
  onLeftBtnPress: Function;
  onRightBtnPress: Function;
  started?: boolean;
  completed?: boolean;
  description?: string;
}

export const MethodBanner: React.FC<Props> = ({
  thumbnail_url,
  onLeftBtnPress,
  onRightBtnPress,
  started,
  completed,
  description,
  isBig
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <>
      <ImageBackground
        style={[styles.imageBackground, !isBig ? { aspectRatio: 16 / 9 } : {}]}
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
          {!isBig && <View style={styles.placeHolder} />}
          <TouchableOpacity
            onPress={() => onLeftBtnPress()}
            style={styles.btnTOpacity}
          >
            {play({
              icon: { height: 10, fill: 'white' },
              container: { paddingRight: 5 }
            })}
            <Text style={styles.btnText}>
              {completed ? 'RESET' : started ? 'CONTINUE' : 'START'}
            </Text>
          </TouchableOpacity>
          {isBig ? (
            <TouchableOpacity
              onPress={() => onRightBtnPress()}
              style={[styles.btnTOpacity, styles.btnTOpacityMoreInfo]}
            >
              {arrowRight({
                icon: { height: 10, fill: 'white' },
                container: { paddingRight: 5 }
              })}
              <Text style={styles.btnText}>MORE INFO</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.placeHolder}
              onPress={() => setShowInfo(!showInfo)}
            >
              {showInfo
                ? infoFilled({
                    icon: { height: 25, width: 25, fill: 'white' }
                  })
                : info({
                    icon: { height: 25, width: 25, fill: 'white' }
                  })}
              <Text style={styles.infoText}>Info</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      {showInfo && <Text style={styles.description}>{description}</Text>}
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
