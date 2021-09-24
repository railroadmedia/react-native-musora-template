import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

import { utils } from '../../utils';
import { addToCalendar, x, plus, reset, play } from '../../images/svgs';
import { ActionModal, CustomRefObject } from '../modals/ActionModal';
import { userService } from '../../services/user.service';
import type { Card } from '../../interfaces/card.interfaces';

interface Props {
  item: Card;
  iconType?: 'next-lesson' | 'progress' | null;
  onResetProgress?: (id: number) => void;
  onRemoveFromMyList?: (id: number) => void;
}

const iconStyle = {
  height: 25,
  width: 25,
  fill: utils.color
};

export const CardIcon: React.FC<Props> = ({
  item: {
    id,
    published_on,
    is_added_to_primary_playlist,
    live_event_start_time,
    live_event_end_time,
    title
  },
  iconType,
  onResetProgress,
  onRemoveFromMyList
}) => {
  const [isAddedToPrimaryList, setIsAddedToPrimaryList] = useState(
    is_added_to_primary_playlist
  );
  const removeModalRef = useRef<CustomRefObject>(null);
  const resetModalRef = useRef<CustomRefObject>(null);
  const calendarModalRef = useRef<CustomRefObject>(null);

  const addLessonToCalendar = useCallback(() => {
    const startDate = new Date(
      live_event_start_time || published_on
    ).toISOString();
    const endDate = new Date(live_event_end_time || published_on).toISOString();

    const eventConfig = {
      title: title,
      startDate,
      endDate
    };
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
      .then(() => calendarModalRef.current?.toggle('', ''))
      .catch(() => calendarModalRef.current?.toggle('', ''));
  }, [
    live_event_start_time,
    live_event_end_time,
    title,
    published_on,
    calendarModalRef
  ]);

  const addToMyList = useCallback(() => {
    setIsAddedToPrimaryList(true);
    userService.addToMyList(id);
  }, [setIsAddedToPrimaryList, id]);

  const removeFromMyList = useCallback(() => {
    removeModalRef.current?.toggle('', '');
    setIsAddedToPrimaryList(false);
    userService.removeFromMyList(id);
    onRemoveFromMyList?.(id);
  }, [setIsAddedToPrimaryList, id, removeModalRef]);

  const resetProgress = useCallback(() => {
    resetModalRef.current?.toggle('', '');
    userService.resetProgress(id);
    onResetProgress?.(id);
  }, [id, resetModalRef]);

  return (
    <View>
      {new Date(published_on) > new Date()
        ? addToCalendar({
            icon: iconStyle,
            container: styles.icon,
            onPress: () =>
              calendarModalRef.current?.toggle(
                '',
                `Add this lesson to your calendar so you're notified when it's available`
              )
          })
        : iconType === 'next-lesson'
        ? play({
            icon: iconStyle,
            container: { padding: 15 }
          })
        : iconType === 'progress'
        ? reset({
            icon: iconStyle,
            container: styles.icon,
            onPress: () =>
              resetModalRef.current?.toggle(
                'Hold your horses...',
                `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
              )
          })
        : isAddedToPrimaryList
        ? x({
            icon: iconStyle,
            container: styles.icon,
            onPress: () =>
              removeModalRef.current?.toggle(
                'Hold your horses...',
                `This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`
              )
          })
        : plus({
            icon: iconStyle,
            container: styles.icon,
            onPress: addToMyList
          })}
      <ActionModal
        ref={removeModalRef}
        btnText='REMOVE'
        onAction={removeFromMyList}
        onCancel={() => removeModalRef.current?.toggle('', '')}
      />
      <ActionModal
        ref={resetModalRef}
        btnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle('', '')}
      />

      <ActionModal
        icon={addToCalendar({
          icon: { height: 128, width: 300, fill: utils.color }
        })}
        btnText='ADD TO CALENDAR'
        onAction={addLessonToCalendar}
        onCancel={() => calendarModalRef.current?.toggle('', '')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    padding: 15,
    paddingRight: 0
  }
});
