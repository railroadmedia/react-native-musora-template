import React, { useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Gradient } from '../commons/Gradient';
import { ThemeContext } from '../state/ThemeContext';

import { UserContext } from '../state/UserContext';
import { themeStyles, DARK } from '../themeStyles';
import { utils } from '../utils';

interface Props {
  whatever: string;
}

export const Profile: React.FC<Props> = ({ whatever }) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  const { user } = useContext(UserContext);
  console.log(user);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        blurRadius={35}
        source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
        resizeMode={'cover'}
        style={styles.imageBackground}
      >
        <View style={styles.avatarBackground}>
          <View style={styles.gradient}>
            <Gradient
              width='100%'
              height='100%'
              colors={['transparent', themeStyles[theme].background || '']}
            />
          </View>
          <Image
            source={{ uri: user.avatarUrl || utils.fallbackAvatar }}
            resizeMode={'cover'}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{user.display_name}</Text>
          <TouchableOpacity style={styles.editProfileTOpacity}>
            <Text style={styles.editProfileTxt}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <View style={styles.xpLabelContainer}>
        <Text style={styles.xpLabel}>XP</Text>
        <Text style={styles.xpLabel}>{utils.brand} METHOD</Text>
      </View>
      <View style={styles.xpValueContainer}>
        <Text style={styles.xpValue}>{user.totalXp}</Text>
        <Text style={styles.xpValue}>{user.xpRank}</Text>
      </View>
    </ScrollView>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: { backgroundColor: current.background, flex: 1 },
    gradient: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '50%'
    },
    imageBackground: {
      width: '100%'
    },
    avatar: {
      width: '50%',
      aspectRatio: 1,
      borderRadius: 999,
      marginTop: 90
    },
    avatarBackground: {
      backgroundColor:
        theme === DARK ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
      alignItems: 'center'
    },
    displayName: {
      color: current.textColor,
      fontSize: 25,
      fontFamily: 'OpenSans',
      fontWeight: '700'
    },
    editProfileTOpacity: {
      backgroundColor: '#002039',
      padding: 5,
      paddingHorizontal: 20,
      borderRadius: 99,
      marginTop: 10,
      marginBottom: 40
    },
    editProfileTxt: {
      color: 'white',
      fontFamily: 'OpenSans',
      fontWeight: '700'
    },
    xpLabelContainer: {
      flexDirection: 'row',
      borderTopColor: '#002039',
      borderTopWidth: 1,
      paddingVertical: 20
    },
    xpLabel: {
      textTransform: 'uppercase',
      color: utils.color,
      flex: 1,
      textAlign: 'center',
      fontFamily: 'OpenSans',
      fontWeight: '600',
      fontSize: 16
    },
    xpValueContainer: {
      flexDirection: 'row',
      borderBottomColor: '#002039',
      borderBottomWidth: 1,
      paddingBottom: 20
    },
    xpValue: {
      textTransform: 'uppercase',
      color: current.textColor,
      flex: 1,
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: '700',
      fontSize: 28
    }
  });
