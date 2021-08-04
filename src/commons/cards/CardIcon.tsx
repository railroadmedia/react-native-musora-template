import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { utils } from '../../utils';
import { addToCalendar, x, plus, reset, play } from '../../images/svgs';
import ActionModal from '../modals/ActionModal';

interface CardIconProps {
  published_on: string;
  iconType?: 'next-lesson' | 'progress';
  isAddedToPrimaryList: boolean;
  onIconPress: () => void;
}

const iconStyle = {
  height: 25,
  width: 25,
  fill: utils.color
};

export const CardIcon: React.FC<CardIconProps> = ({
  published_on,
  iconType,
  isAddedToPrimaryList,
  onIconPress
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddToCalendarModal, setShowAddToCalendarModal] = useState(false);

  return (
    <View>
      {new Date(published_on) > new Date()
        ? addToCalendar({
            icon: iconStyle,
            container: styles.icon,
            onPress: () => setShowAddToCalendarModal(true)
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
            onPress: () => setShowResetModal(true)
          })
        : isAddedToPrimaryList
        ? x({
            icon: iconStyle,
            container: styles.icon,
            onPress: () => setShowRemoveModal(true)
          })
        : plus({
            icon: iconStyle,
            container: styles.icon,
            onPress: onIconPress
          })}
      {showRemoveModal && (
        <ActionModal
          title='Hold your horses...'
          message={`This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`}
          btnText='REMOVE'
          onAction={onIconPress}
          onCancel={() => setShowRemoveModal(false)}
        />
      )}
      {showResetModal && (
        <ActionModal
          title='Hold your horses...'
          message={`This will reset your progress\nand cannot be undone.\nAre you sure about this?`}
          btnText='RESET'
          onAction={onIconPress}
          onCancel={() => setShowResetModal(false)}
        />
      )}
      {showAddToCalendarModal && (
        <ActionModal
          icon={addToCalendar({
            icon: { height: 128, width: 300, fill: utils.color }
          })}
          message={`Add this lesson to your calendar so you're notified when it's available`}
          btnText='ADD TO CALENDAR'
          onAction={onIconPress}
          onCancel={() => setShowAddToCalendarModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    padding: 15,
    paddingRight: 0
  }
});
