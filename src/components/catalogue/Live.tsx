import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal
} from 'react-native';

import { liveService } from '../../services/live.service';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

import type { Live as Live_I } from '../../interfaces/live.interfaces';
import { themeStyles } from '../../themeStyles';
import { plus, pswdVisible, x, addToCalendar } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../..';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { CountDown } from '../../common_components/CountDown';
import { Gradient } from '../../common_components/Gradient';

const { watchersListener } = require('MusoraChat');

export const Live: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyle(theme), [theme]);

  const [watchModalVisible, setWatchModalVisible] = useState(false);
  const [viewersNo, setViewersNo] = useState(0);
  const [
    {
      id,
      isLive,
      thumbnail_url: thumb,
      title,
      instructors,
      live_event_start_time: startTime,
      live_event_end_time: endTime,
      is_added_to_primary_playlist: isAdded
    },
    setLive
  ] = useState<Live_I>({});

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const removeWatchersListener = useRef<Function>();
  const calendarModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const calendarErrorRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    liveService.getLive(abortC.current.signal).then(liveRes => {
      console.log('lres', liveRes);
      liveRes.isLive = false;
      liveRes.live_event_start_time = '2021/10/01 14:20:55';
      setLive(liveRes);
      if (liveRes?.id) {
        watchersListener(
          liveRes.apiKey,
          liveRes.chatChannelName,
          liveRes.userId,
          liveRes.token,
          (viewers: number) => setViewersNo(viewers)
        ).then((rwl: Function) => (removeWatchersListener.current = rwl));
      }
    });
    return () => {
      isMounted.current = false;
      abortC.current.abort();
      removeWatchersListener.current?.();
    };
  }, []);

  const toggleMyList = () =>
    setLive(l => ({
      ...l,
      is_added_to_primary_playlist: !l.is_added_to_primary_playlist
    }));

  const launchCalendarPicker = () =>
    AddCalendarEvent.presentEventCreatingDialog({
      title,
      endDate: new Date(endTime || '').toISOString(),
      startDate: new Date(startTime || '').toISOString()
    })
      .then(() => calendarModalRef.current?.toggle())
      .catch(e => {
        calendarModalRef.current?.toggle();
        calendarErrorRef.current?.toggle(
          'Calendar',
          `${utils.brand} needs access to calendar.`
        );
      });

  return id ? (
    <>
      <Text style={styles.liveTitleTxt}>LIVE</Text>
      <TouchableOpacity onPress={() => {}} disabled={!isLive}>
        <Image
          source={{
            uri: `https://cdn.musora.com/image/fetch/ar_16:9,fl_lossy,q_auto:good,c_fill,g_face/${
              thumb || utils.fallbackThumb
            }`
          }}
          style={styles.thumbnail}
        />

        {!isLive && (
          <View style={styles.countDownContainer}>
            <View style={styles.upcommingTxtContainer}>
              <View style={styles.gradientContainer}>
                <Gradient
                  width={'100%'}
                  height={'100%'}
                  colors={[utils.color, 'transparent']}
                  verticalStripes={true}
                />
              </View>
              <Text style={styles.upcommingTxt}>UPCOMMING EVENT</Text>
            </View>
            <CountDown
              startTime={startTime}
              onStart={() => {
                setLive(l => ({ ...l, isLive: true }));
                setWatchModalVisible(true);
              }}
            />
          </View>
        )}
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.titleContainer}>
          {isLive && (
            <>
              <View style={{ backgroundColor: '#F71B26', borderRadius: 3 }}>
                <Text style={styles.liveTxt}>LIVE</Text>
              </View>
              <View style={styles.viewersNoContainer}>
                {pswdVisible({
                  icon: { fill: 'white', width: utils.figmaFontSizeScaler(11) }
                })}
                <Text style={styles.viewersNoTxt}>{viewersNo}</Text>
              </View>
            </>
          )}
          <Text style={styles.titleTxt}>{title}</Text>
          <Text style={styles.instructorsTxt}>{instructors?.join(', ')}</Text>
        </View>
        {isLive &&
          (isAdded ? x : plus)({
            icon: { width: 30, fill: utils.color },
            container: { padding: 5, paddingRight: 0 },
            onPress: toggleMyList
          })}
        {addToCalendar({
          icon: { width: 30, fill: utils.color },
          container: { padding: 5, paddingRight: 0 },
          onPress: () =>
            calendarModalRef.current?.toggle(
              'Calendar',
              `Add this lesson to your calendar so you're notified when it's available`
            )
        })}
      </View>
      <Modal
        transparent={true}
        visible={true}
        onRequestClose={() => setWatchModalVisible(false)}
        animationType={'fade'}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          activeOpacity={0.95}
          onPress={() => setWatchModalVisible(false)}
        >
          <View style={styles.watchModalContainer}>
            <Text style={{ textAlign: 'center' }}>
              {instructors?.join()} just went like.{`\n`}Would you like to join?
              {`\n`}Join {instructors?.join()} and {viewersNo} members
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
      <ActionModal
        ref={calendarModalRef}
        icon={addToCalendar({
          icon: { height: 128, width: 300, fill: utils.color }
        })}
        onAction={launchCalendarPicker}
        onCancel={() => calendarModalRef.current?.toggle()}
      />
      <ActionModal
        ref={calendarErrorRef}
        onAction={() => calendarErrorRef.current?.toggle()}
      />
    </>
  ) : null;
};

const setStyle = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    liveTitleTxt: {
      fontSize: 20,
      paddingVertical: 5,
      color: themeStyles[theme].contrastTextColor,
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: '700'
    },
    thumbnail: { width: '100%', aspectRatio: 16 / 9, borderRadius: 5 },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      flex: 1,
      padding: 5,
      paddingLeft: 0
    },
    liveTxt: {
      color: 'white',
      fontSize: utils.figmaFontSizeScaler(9),
      fontFamily: 'OpenSans',
      fontWeight: '700',
      padding: 2
    },
    viewersNoContainer: {
      backgroundColor: current.contrastBackground,
      borderRadius: 3,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 2,
      marginLeft: 2
    },
    viewersNoTxt: {
      color: 'white',
      fontSize: utils.figmaFontSizeScaler(9),
      fontFamily: 'OpenSans',
      fontWeight: '700',
      marginLeft: 2
    },
    titleTxt: {
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(14),
      fontWeight: '700',
      width: '100%',
      color: current.textColor
    },
    instructorsTxt: {
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(11),
      fontWeight: '400',
      color: current.contrastTextColor
    },
    countDownContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    gradientContainer: { position: 'absolute', width: '200%', height: '100%' },
    upcommingTxtContainer: { position: 'absolute', top: 15, left: 15 },
    upcommingTxt: {
      padding: 5,
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: '700',
      color: 'white'
    },
    watchModalContainer: {
      backgroundColor: 'white'
    }
  });
