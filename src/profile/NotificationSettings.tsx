import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../state/theme/ThemeContext';
import { utils } from '../utils';
import { themeStyles } from '../themeStyles';
import { UserContext } from '../state/user/UserContext';
import { userService } from '../services/user.service';
import { CustomSwitch } from '../commons/CustomSwitch';

interface NotificationSettingsProps {}

export const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(UserContext);
  const {
    notify_weekly_update,
    notify_on_lesson_comment_reply,
    notify_on_lesson_comment_like,
    notify_on_forum_post_like,
    notify_on_forum_post_reply,
    notifications_summary_frequency_minutes
  } = user || {};

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const changeNotificationStatus = useCallback(data => {
    // if (!this.context.isConnected) return this.context.showNoConnectionAlert();
    const {
      notify_weekly_update,
      notify_on_lesson_comment_reply,
      notify_on_lesson_comment_like,
      notify_on_forum_post_like,
      notify_on_forum_post_reply,
      notifications_summary_frequency_minutes
    } = data;
    updateUser({
      ...user,
      notify_weekly_update,
      notify_on_lesson_comment_reply,
      notify_on_lesson_comment_like,
      notify_on_forum_post_like,
      notify_on_forum_post_reply,
      notifications_summary_frequency_minutes
    });

    const body = {
      data: {
        type: 'user',
        attributes: data
      }
    };
    userService.changeNotificationSettings(body);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      <ScrollView style={styles.mainContainer}>
        <Text style={styles.noteTypeText}>Notification Types</Text>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Weekly community updates</Text>
          <CustomSwitch
            value={notify_weekly_update}
            width={40}
            height={20}
            showIcon={false}
            onSlide={() =>
              changeNotificationStatus({
                notify_on_lesson_comment_reply,
                notify_on_lesson_comment_like,
                notify_on_forum_post_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes,
                notify_weekly_update: !notify_weekly_update
              })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Comment replies</Text>
          <CustomSwitch
            value={notify_on_lesson_comment_reply}
            width={40}
            height={20}
            showIcon={false}
            onSlide={() =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_like,
                notify_on_forum_post_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes,
                notify_on_lesson_comment_reply: !notify_on_lesson_comment_reply
              })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Comment likes</Text>
          <CustomSwitch
            value={notify_on_lesson_comment_like}
            width={40}
            height={20}
            showIcon={false}
            onSlide={() =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_reply,
                notify_on_forum_post_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes,
                notify_on_lesson_comment_like: !notify_on_lesson_comment_like
              })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Forum post likes</Text>
          <CustomSwitch
            value={notify_on_forum_post_like}
            width={40}
            height={20}
            showIcon={false}
            onSlide={() =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_reply,
                notify_on_lesson_comment_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes,
                notify_on_forum_post_like: !notify_on_forum_post_like
              })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Forum post replies</Text>
          <CustomSwitch
            value={notify_on_forum_post_reply}
            width={40}
            height={20}
            showIcon={false}
            onSlide={() =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_reply,
                notify_on_lesson_comment_like,
                notify_on_forum_post_like,
                notifications_summary_frequency_minutes,
                notify_on_forum_post_reply: !notify_on_forum_post_reply
              })
            }
          />
        </View>
        <Text style={styles.noteTypeText}>Email Notification Frequency</Text>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Immediate</Text>
          <CustomSwitch
            value={notifications_summary_frequency_minutes === null}
            width={40}
            height={20}
            showIcon={true}
            onSlide={(isOn?: boolean) =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_reply,
                notify_on_lesson_comment_like,
                notify_on_forum_post_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes: isOn ? null : 1440
              })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Once per day</Text>
          <CustomSwitch
            value={notifications_summary_frequency_minutes === 1440}
            width={40}
            height={20}
            showIcon={true}
            onSlide={(isOn?: boolean) =>
              changeNotificationStatus({
                notify_weekly_update,
                notify_on_lesson_comment_reply,
                notify_on_lesson_comment_like,
                notify_on_forum_post_like,
                notify_on_forum_post_reply,
                notifications_summary_frequency_minutes: isOn ? 1440 : null
              })
            }
          />
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
    noteTypeText: {
      marginTop: 10,
      marginLeft: 10,
      fontFamily: 'OpenSans-Bold',
      fontSize: utils.figmaFontSizeScaler(20),
      color: current.textColor,
      paddingVertical: 5
    },
    textContainer: {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    text: {
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(14),
      color: current.textColor
    },
    mainContainer: {
      flex: 1
    }
  });
