import React, { useContext } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { ThemeContext } from '../state/ThemeContext';
import { themeStyles } from '../themeStyles';
import { utils } from '../utils';

export interface NotificationProps {
  id: number;
  recipient: {
    display_name: string;
    email: string;
    id: number;
    profile_image_url: string;
  };
}

export const Notification: React.FC<NotificationProps> = ({ recipient }) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: recipient.profile_image_url || utils.fallbackAvatar }}
        resizeMode={'cover'}
        style={styles.avatar}
      />
    </View>
  );
};

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: { backgroundColor: current.contrastBackground, padding: 5 },
    avatar: { width: 55, aspectRatio: 1, borderRadius: 27.5 }
  });
