import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { OrientationContext } from '../../state/orientation/OrientationContext';
import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import {
  arrowRight,
  back,
  info,
  infoFilled,
  play,
  plus,
  reset,
  resources as resourcesIcon
} from '../../images/svgs';
import { Gradient } from '../../common_components/Gradient';
import type { Resource } from '../../interfaces/lesson.interfaces';

const iconStyle = {
  fill: '#FFFFFF',
  height: 20,
  width: 20
};

interface Props {
  isMainPacksPage: boolean;
  pack_logo?: string;
  started?: boolean;
  is_owned?: boolean;
  thumbnail?: string;
  resources?: Resource[];
  completed?: boolean;
  description?: string;
  price?: string;
  onMainBtnClick: () => void;
  onSeeMoreBtnClick?: () => void;
  onToggleResourcesModal?: () => void;
  onReset?: () => void;
}

export const PacksBanner: React.FC<Props> = ({
  isMainPacksPage,
  price,
  pack_logo,
  is_owned,
  thumbnail,
  completed,
  resources,
  description,
  onMainBtnClick,
  onSeeMoreBtnClick,
  onToggleResourcesModal,
  onReset
}) => {
  const { goBack } = useNavigation();

  const { isLandscape } = useContext(OrientationContext);
  const { theme } = useContext(ThemeContext);

  const [showInfo, setShowInfo] = useState(false);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const getAspectRatio = useMemo(() => {
    if (utils.isTablet) {
      if (isLandscape) {
        return 3;
      }
      return 2;
    }
    return 1.2;
  }, []);

  const greaterWDim = useMemo(() => {
    const window = Dimensions.get('window');
    return window.width < window.height ? window.width : window.height;
  }, [isLandscape]);

  const showPackInfo = useCallback(() => {
    setShowInfo(!showInfo);
  }, [showInfo]);

  const renderColoredBtn = () => {
    return (
      <TouchableOpacity
        style={[styles.coloredBtn, isMainPacksPage ? { flex: 2 } : {}]}
        onPress={onMainBtnClick}
      >
        {!is_owned
          ? plus({ icon: iconStyle })
          : !completed
          ? play({ icon: iconStyle })
          : reset({ icon: iconStyle })}
        <Text style={styles.buttonText} numberOfLines={1}>
          {!is_owned
            ? isMainPacksPage
              ? 'SEE DETAILS'
              : 'PURCHASE TRAINING PACK'
            : !completed
            ? 'NEXT LESSON'
            : 'RESTART'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {!isMainPacksPage && (
        <TouchableOpacity onPress={goBack} style={styles.backBtnContainer}>
          {back({
            icon: { fill: themeStyles[theme].textColor, height: 15, width: 15 }
          })}
        </TouchableOpacity>
      )}
      <ImageBackground
        resizeMode={'cover'}
        source={{
          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,w_${
            greaterWDim >> 0
          },ar_${getAspectRatio},c_fill,g_face/${thumbnail}`
        }}
        style={[styles.image, { aspectRatio: thumbnail ? getAspectRatio : 2 }]}
      >
        {thumbnail && (
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
        )}
        <View style={styles.imageTextContainer}>
          <Image
            style={styles.logo}
            resizeMode={'contain'}
            source={{
              uri: `https://cdn.musora.com/image/fetch/f_png,q_auto:eco,w_${
                greaterWDim >> 0
              }/${pack_logo}`
            }}
          />
          {!is_owned && (
            <View style={styles.priceContainer}>
              <Text style={styles.whiteText}>{price}</Text>
            </View>
          )}
          {isMainPacksPage ? (
            <View style={styles.btnContainer1}>
              {renderColoredBtn()}
              <TouchableOpacity style={styles.btn} onPress={onSeeMoreBtnClick}>
                {arrowRight({ icon: iconStyle })}
                <Text style={styles.buttonText}>More Info</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.btnContainer2}>
              <View style={styles.iconBtn} />
              {renderColoredBtn()}
              <TouchableOpacity style={styles.iconBtn} onPress={showPackInfo}>
                {showInfo
                  ? infoFilled({
                      icon: { width: 25, height: 25, fill: '#ffffff' }
                    })
                  : info({
                      icon: { width: 25, height: 25, fill: '#ffffff' }
                    })}
                <Text style={styles.infoText}>Info</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
      {showInfo && (
        <View>
          <Text style={styles.description}>{description}</Text>
          <View style={[styles.rowContainer, styles.extraMargin]}>
            {!!resources && resources.length > 0 && (
              <TouchableOpacity
                style={styles.underCompleteTOpacities}
                onPress={onToggleResourcesModal}
              >
                {resourcesIcon({
                  icon: { width: 25, height: 25, fill: utils.color }
                })}

                <Text style={styles.iconText}>Resources</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.underCompleteTOpacities}
              onPress={onReset}
            >
              {reset({
                icon: { fill: utils.color, height: 25, width: 25 }
              })}
              <Text style={styles.belowIconText}>Restart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    backBtnContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 15,
      zIndex: 2
    },
    lgradient: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      zIndex: 0
    },
    image: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(3, 29, 54, 1)'
    },
    imageTextContainer: {
      padding: 20,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    coloredBtn: {
      borderRadius: 25,
      minHeight: 50,
      backgroundColor: utils.color,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 3,
      paddingHorizontal: 20
    },
    btn: {
      borderRadius: 25,
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: '#FFFFFF',
      borderWidth: 2,
      paddingHorizontal: 20,
      marginHorizontal: 3,
      flex: 2
    },
    overlay: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, .6)'
    },
    infoText: {
      color: '#FFFFFF',
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(12)
    },
    logo: {
      height: 50,
      width: '100%',
      marginBottom: 10
    },
    description: {
      padding: 20,
      paddingTop: 0,
      color: current.textColor,
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    },
    whiteText: {
      color: '#ffffff',
      marginHorizontal: 10,
      fontSize: utils.figmaFontSizeScaler(24),
      fontFamily: 'OpenSans-Bold'
    },
    iconBtn: {
      flex: 1,
      alignItems: 'center'
    },
    buttonText: {
      color: '#ffffff',
      marginHorizontal: 5,
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15)
    },
    gradientContainer: {
      height: '100%',
      position: 'absolute',
      width: '100%',
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    btnContainer1: {
      alignSelf: 'center',
      flexDirection: 'row'
    },
    btnContainer2: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10
    },
    extraMargin: {
      marginHorizontal: 40
    },
    belowIconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    underCompleteTOpacities: {
      flex: 1,
      alignItems: 'center'
    },
    iconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    }
  });
