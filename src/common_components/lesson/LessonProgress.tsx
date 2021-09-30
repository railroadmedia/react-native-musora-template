import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { left, right } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';

interface Props {
  progress: number;
  previousLessonId: number;
  nextLessonId: number;
  onCompleteBtnPress: () => void;
  onGoToNextLesson: () => void;
  onGoToPreviousLesson: () => void;
}

export const LessonProgress: React.FC<Props> = ({
  progress,
  onCompleteBtnPress,
  onGoToNextLesson,
  onGoToPreviousLesson,
  previousLessonId,
  nextLessonId
}) => {
  const { theme } = useContext(ThemeContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safearea} edges={['bottom']}>
      <View style={styles.progressBar}>
        {!!progress && (
          <View
            style={[styles.progressBarCompleted, { width: progress + '%' }]}
          />
        )}
      </View>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.arrowContainer,
            {
              borderColor: previousLessonId
                ? utils.color
                : themeStyles[theme].contrastTextColor
            }
          ]}
          disabled={!previousLessonId}
          onPress={onGoToPreviousLesson}
        >
          {left({
            icon: {
              height: 25,
              width: 25,
              fill: previousLessonId
                ? utils.color
                : themeStyles[theme].contrastTextColor
            },
            container: { marginLeft: 3 }
          })}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onCompleteBtnPress}>
          <Text style={styles.buttonText}>
            {progress === 100 ? 'COMPLETED' : 'COMPLETE LESSON'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onGoToNextLesson}
          style={[
            styles.arrowContainer,
            {
              borderColor: nextLessonId
                ? utils.color
                : themeStyles[theme].contrastTextColor
            }
          ]}
          disabled={!nextLessonId}
        >
          {right({
            icon: {
              height: 25,
              width: 25,
              fill: nextLessonId
                ? utils.color
                : themeStyles[theme].contrastTextColor
            },
            container: { marginLeft: 3 }
          })}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    safearea: {
      backgroundColor: current.background
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      paddingVertical: 10
    },
    btn: {
      backgroundColor: utils.color,
      flex: 1,
      borderRadius: 25,
      minHeight: 46,
      justifyContent: 'center',
      alignItems: 'center'
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      color: '#FFFFFF'
    },
    arrowContainer: {
      height: 40,
      width: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: current.contrastTextColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      color: current.contrastTextColor
    },
    progressBar: {
      height: 3,
      width: '100%',
      backgroundColor: current.contrastTextColor
    },
    progressBarCompleted: {
      backgroundColor: utils.color,
      height: 3,
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative'
    }
  });
