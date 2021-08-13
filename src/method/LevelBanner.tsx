import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { back, info, infoFilled, method, play, plus, x } from '../images/svgs';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import { utils } from '../utils';
import { Gradient } from '../commons/Gradient';

const iconStyle = {
  height: 25,
  width: 25,
  fill: utils.color
};

interface LevelBannerProps {
  thumbnail_url?: string;
  onToggleMyList: () => void;
  onMainBtnPress: () => void;
  started?: boolean;
  completed?: boolean;
  description?: string;
  is_added_to_primary_playlist?: boolean;
  level_number: number;
}

export const LevelBanner: React.FC<LevelBannerProps> = ({
  thumbnail_url,
  onToggleMyList,
  onMainBtnPress,
  started,
  completed,
  description,
  is_added_to_primary_playlist,
  level_number
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
        style={styles.imageBackground}
        source={{
          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco/${thumbnail_url}`
        }}
      >
        <TouchableOpacity style={styles.backBtnContainer}>
          {back({
            icon: { fill: themeStyles[theme].textColor, height: 15, width: 15 }
          })}
        </TouchableOpacity>

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
        {utils.svgBrand({ icon: { width: '15%', fill: utils.color } })}
        {method({
          icon: { width: '25%', fill: 'white' },
          container: { paddingTop: 5 }
        })}
        <Text style={styles.levelTitle}>LEVEL {level_number}</Text>
        <View style={styles.btnsContainer}>
          <TouchableOpacity style={styles.placeHolder} onPress={onToggleMyList}>
            {is_added_to_primary_playlist
              ? x({ icon: iconStyle })
              : plus({ icon: iconStyle })}
            <Text style={styles.infoText}>
              {is_added_to_primary_playlist ? 'Addded' : 'My List'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onMainBtnPress} style={styles.btnTOpacity}>
            {play({
              icon: { height: 10, fill: 'white' },
              container: { paddingRight: 5 }
            })}
            <Text style={styles.btnText}>
              {completed ? 'RESET' : started ? 'CONTINUE' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.placeHolder}
            onPress={() => setShowInfo(!showInfo)}
          >
            {showInfo
              ? infoFilled({ icon: iconStyle })
              : info({ icon: iconStyle })}
            <Text style={styles.infoText}>Info</Text>
          </TouchableOpacity>
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
      aspectRatio: utils.isTablet ? 16 / 6 : 16 / 9,
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
    },
    levelTitle: {
      color: current.textColor,
      fontSize: 50,
      fontFamily: 'OpenSans-Bold',
      textAlign: 'center'
    },
    backBtnContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 15,
      zIndex: 2
    }
  });
