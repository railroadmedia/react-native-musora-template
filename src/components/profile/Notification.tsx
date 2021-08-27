import React, { useContext } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { messageBubble, threeDotsMenu } from '../../images/svgs';
import type { Notification as Props } from '../../interfaces/notification.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';

export const Notification: React.FC<Props> = ({
  recipient,
  type,
  created_at_diff,
  onNotification,
  onNotificationThreeDotsMenu
}) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.notifInfoContainer}
        onPress={() => onNotification()}
      >
        <View>
          <Image
            source={{
              uri: recipient.profile_image_url || utils.fallbackAvatar
            }}
            resizeMode={'cover'}
            style={styles.avatar}
          />
          {messageBubble({
            icon: { height: 10, fill: 'white' },
            container: {
              backgroundColor: '#FFAE00',
              alignSelf: 'flex-end',
              padding: 5,
              aspectRatio: 1,
              alignItems: 'center',
              borderRadius: 99,
              marginTop: -20
            }
          })}
        </View>
        <Text style={styles.typeBold}>
          NEW - <Text style={styles.type}>{type}</Text>
          {`\n`}
          <Text style={styles.age}>{created_at_diff || '1 minute ago'}</Text>
        </Text>
      </TouchableOpacity>
      {threeDotsMenu({
        icon: { width: 20, fill: themeStyles[theme].contrastTextColor },
        container: { padding: 10, paddingRight: 5 },
        onPress: () => onNotificationThreeDotsMenu()
      })}
    </View>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      backgroundColor: current.contrastBackground,
      flexDirection: 'row',
      marginVertical: 10,
      alignItems: 'center'
    },
    notifInfoContainer: {
      padding: 5,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    avatar: {
      width: 55,
      aspectRatio: 1,
      borderRadius: 27.5
    },
    typeBold: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      fontWeight: '700',
      fontSize: utils.figmaFontSizeScaler(14),
      paddingLeft: 5
    },
    type: {
      color: current.textColor,
      textTransform: 'lowercase',
      fontFamily: 'OpenSans',
      fontWeight: '300',
      fontSize: utils.figmaFontSizeScaler(14),
      paddingRight: 5
    },
    age: {
      fontSize: utils.figmaFontSizeScaler(11),
      color: current.contrastTextColor,
      fontWeight: '400'
    }
  });
