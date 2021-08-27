import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { utils } from '../utils';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import RowCard from './cards/RowCard';

interface Props {
  progress: number;
  text: string;
  item: any;
}

export const NextLesson: React.FC<Props> = ({ progress, text, item }) => {
  const { theme } = useContext(ThemeContext);

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <View>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressBarCompleted, { width: progress + '%' }]}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>YOUR NEXT LESSON:</Text>
        <Text style={styles.subtitle}>{text}</Text>
      </View>
      <RowCard id={item} iconType='next-lesson' route={''} />
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingTop: 5
    },
    title: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'OpenSans-Bold',
      color: current.contrastTextColor
    },
    subtitle: {
      fontSize: 10,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    progressBar: {
      height: 3,
      width: '100%',
      backgroundColor: current.borderColor
    },
    progressBarCompleted: {
      backgroundColor: utils.color,
      height: 3,
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative'
    }
  });
