import React, { useContext, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { BackHeader } from '../..';
import { filters } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';

interface Props {}
export const Filters: React.FC<Props> = ({}) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);

  const [isVisible, setIsVisible] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);

  const skillLevelWidth = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderMove: (_, { x0, dx }) => {
        const level =
          parseInt((((x0 + dx) / skillLevelWidth.current) * 10).toFixed(0)) - 1;
        setSkillLevel(level < 0 ? 0 : level > 10 ? 10 : level);
      }
    })
  ).current;

  const renderSetYourSkill = () => {
    return (
      <View style={{ padding: 15 }}>
        <Text style={styles.sectionTitle}>SET YOUR SKILL LEVEL</Text>
        <Text style={styles.levelText}>LEVEL {skillLevel || 'ALL'}</Text>
        <View
          onLayout={({
            nativeEvent: {
              layout: { width }
            }
          }) => (skillLevelWidth.current = width)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {[...new Array(10)].map((_, i) => (
            <View key={i} style={styles.levelPill} />
          ))}
          <View
            {...panResponder.panHandlers}
            style={{
              position: 'absolute',
              width: 20,
              aspectRatio: 1,
              borderRadius: 10,
              backgroundColor: utils.color,
              left: `${skillLevel * 10}%`,
              marginLeft: -10
            }}
          />
        </View>
        {!!skillLevel && (
          <Text style={styles.levelDescription}>
            {utils.filtersLevelDescription(skillLevel)}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setSkillLevel(0)}
          style={[
            styles.allTOpacity,
            skillLevel
              ? {
                  borderColor: themeStyles[theme].contrastTextColor
                }
              : {
                  borderColor: 'transparent',
                  backgroundColor: utils.color
                }
          ]}
        >
          <Text
            style={[
              styles.allText,
              skillLevel
                ? {
                    color: themeStyles[theme].contrastTextColor
                  }
                : {
                    color: 'white'
                  }
            ]}
          >
            ALL
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {filters({
        icon: { width: 40, fill: utils.color },
        onPress: () => setIsVisible(true)
      })}
      <Modal
        animationType={'fade'}
        onRequestClose={() => setIsVisible(false)}
        supportedOrientations={['portrait', 'landscape']}
        visible={isVisible}
      >
        <BackHeader title={'Filter'} onBack={() => setIsVisible(false)} />
        <ScrollView style={styles.scrollview} bounces={false}>
          {renderSetYourSkill()}
        </ScrollView>
      </Modal>
    </>
  );
};
const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    scrollview: {
      backgroundColor: current.background,
      flex: 1
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'RobotoCondensed-Bold',
      color: current.contrastTextColor
    },
    levelText: {
      color: current.textColor,
      fontSize: 30,
      textAlign: 'center',
      fontFamily: 'OpenSans-Semibold'
    },
    levelPill: {
      width: '9%',
      height: 5,
      backgroundColor: utils.color
    },
    allTOpacity: {
      padding: 10,
      borderWidth: 1,
      borderRadius: 50,
      justifyContent: 'center',
      alignSelf: 'center',
      paddingHorizontal: 50,
      marginVertical: 20
    },
    allText: {
      fontSize: 10,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontFamily: 'OpenSans-Semibold'
    },
    levelDescription: {
      color: current.textColor,
      marginTop: 20,
      textAlign: 'center'
    }
  });
