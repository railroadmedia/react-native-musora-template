import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput
} from 'react-native';

import { liveService } from '../../services/live.service';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

import type { Live as Live_I } from '../../interfaces/live.interfaces';
import { themeStyles } from '../../themeStyles';
import { plus, pswdVisible, x, addToCalendar } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../..';
import { ActionModal } from '../../common_components/modals/ActionModal';

const { watchersListener } = require('MusoraChat');

export const Live: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyle(theme), [theme]);

  const [
    {
      id,
      isLive,
      thumbnail_url: thumb,
      viewersNo,
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
  const tremRef = useRef<TextInput>(null);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    liveService.getLive(abortC.current.signal).then(liveRes => {
      liveRes.isLive = false;
      console.log('lres', liveRes);
      if (liveRes?.id) {
        watchersListener(
          liveRes.apiKey,
          liveRes.chatChannelName,
          liveRes.userId,
          liveRes.token,
          (viewers: number) => setLive({ ...liveRes, viewersNo: viewers })
        ).then((rwl: Function) => {
          removeWatchersListener.current = rwl;
          if (!liveRes.isLive) handleCountdown(liveRes.live_event_start_time);
        });
      }
    });
    return () => {
      isMounted.current = false;
      abortC.current.abort();
      removeWatchersListener.current?.();
    };
  }, []);

  const handleCountdown = (time?: string) => {
    let trem = Math.floor(
      (new Date(`${time} UTC`).getTime() - new Date().getTime()) / 1000
    );
    setInterval(
      () => tremRef.current?.setNativeProps({ text: formatTrem(--trem) }),
      1000
    );
  };

  const formatTrem = (seconds: number) => {
    let hours: number | string = Math.floor(seconds / 3600);
    let minutes: number | string = Math.floor((seconds -= hours * 3600) / 60);
    seconds -= minutes * 60;
    return `${hours < 10 ? 0 : ''}${hours} : ${
      minutes < 10 ? 0 : ''
    }${minutes} : ${seconds < 10 ? 0 : ''}${seconds}`;
  };

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
      <Text>LIVE</Text>
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
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <View>
              <TextInput
                editable={false}
                ref={tremRef}
                style={{
                  color: 'white',
                  fontFamily: 'RobotoCondensed-Regular',
                  fontSize: 40,
                  fontWeight: '700'
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                {['HOURS', 'MINUTES', 'SECONDS'].map((t, i) => (
                  <Text
                    key={t}
                    style={{
                      color: 'white',
                      fontFamily: 'RobotoCondensed-Regular',
                      fontSize: 10,
                      fontWeight: '700',
                      flex: 1,
                      textAlign: i > 1 ? 'right' : i ? 'center' : 'left'
                    }}
                  >
                    {t}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.titleContainer}>
          <View style={{ backgroundColor: '#F71B26', borderRadius: 3 }}>
            <Text style={styles.liveTxt}>LIVE</Text>
          </View>
          <View style={styles.viewersNoContainer}>
            {pswdVisible({
              icon: { fill: 'white', width: utils.figmaFontSizeScaler(11) }
            })}
            <Text style={styles.viewersNoTxt}>{viewersNo}</Text>
          </View>
          <Text style={styles.titleTxt}>{title}</Text>
          <Text style={styles.instructorsTxt}>{instructors?.join(', ')}</Text>
        </View>
        {(isAdded ? x : plus)({
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
      <ActionModal
        ref={calendarModalRef}
        icon={addToCalendar({
          icon: { height: 128, width: 300, fill: utils.color }
        })}
        btnText='ADD TO CALENDAR'
        onAction={launchCalendarPicker}
        onCancel={() => calendarModalRef.current?.toggle()}
      />
      <ActionModal
        ref={calendarErrorRef}
        btnText='OK'
        onAction={() => calendarErrorRef.current?.toggle()}
      />
    </>
  ) : null;
};

const setStyle = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
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
    }
  });
