import React, { useContext, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { BackHeader } from '../..';
import { filters } from '../../images/svgs';
import type { Filters as I_Filters } from '../../interfaces/service.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';

interface Props {
  options: I_Filters | undefined;
}
export const Filters: React.FC<Props> = ({ options }) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  const { contrastTextColor } = themeStyles[theme];

  const [isVisible, setIsVisible] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);
  const [maxTouchableOpacityTextHeight, setMaxTouchableOpacityTextHeight] =
    useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

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

  const renderSkillLevel = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>SET YOUR SKILL LEVEL</Text>
        <Text style={styles.levelText}>LEVEL {skillLevel || 'ALL'}</Text>
        <View
          onLayout={({
            nativeEvent: {
              layout: { width }
            }
          }) => (skillLevelWidth.current = width)}
          style={styles.pillContainer}
        >
          {[...new Array(10)].map((_, i) => (
            <View key={i} style={styles.levelPill} />
          ))}
          <View
            {...panResponder.panHandlers}
            style={[styles.levelPillCursor, { left: `${skillLevel * 10}%` }]}
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
              ? { borderColor: contrastTextColor }
              : { borderColor: 'transparent', backgroundColor: utils.color }
          ]}
        >
          <Text
            style={[
              styles.allText,
              skillLevel ? { color: contrastTextColor } : { color: 'white' }
            ]}
          >
            ALL
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUnexpandableList = (filterKey: 'topic' | 'style') => {
    const sel = filterKey === 'topic' ? selectedTopics : selectedStyles;
    const setSel =
      filterKey === 'topic' ? setSelectedTopics : setSelectedStyles;
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {filterKey === 'topic'
            ? 'WHAT DO YOU WANT TO WORK ON?'
            : 'WHAT STYLE DO YOU WANT TO PLAY?'}
        </Text>
        <View style={styles.unexpandableListContainer}>
          {options?.[filterKey]?.map(f => {
            f = f.toLowerCase();
            const isSel = sel.includes(f) || (f === 'all' && !sel.length);
            return (
              <View style={{ width: `${100 / 3}%`, padding: 2.5 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (f === 'all') setSel([]);
                    else if (sel.includes(f))
                      setSel(sel.filter(st => st !== f));
                    else setSel([...sel, f]);
                  }}
                  style={{
                    ...styles.pressable,
                    backgroundColor: isSel ? utils.color : 'transparent',
                    borderColor: isSel ? 'transparent' : contrastTextColor,
                    height: maxTouchableOpacityTextHeight
                  }}
                >
                  <Text
                    numberOfLines={
                      f.split(' ').length > 1 ||
                      f.split('/').length > 1 ||
                      f.split('.').length > 1
                        ? 2
                        : 1
                    }
                    style={{
                      ...styles.pressableText,
                      paddingHorizontal: maxTouchableOpacityTextHeight / 4,
                      color: isSel ? 'white' : contrastTextColor
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderExpandableList = (filterKey: 'teacher' | 'progress') => {
    return <></>;
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
        {!maxTouchableOpacityTextHeight && (
          <Text
            style={{ paddingVertical: 5, position: 'absolute', opacity: 0 }}
            onLayout={({ nativeEvent }) =>
              setMaxTouchableOpacityTextHeight(nativeEvent.layout.height)
            }
          >
            {'\n'}
          </Text>
        )}
        <BackHeader title={'Filter'} onBack={() => setIsVisible(false)} />
        {!Object.keys(options || {}).length ? (
          <ActivityIndicator
            size='large'
            color={utils.color}
            animating={true}
            style={{ padding: 15 }}
          />
        ) : (
          <ScrollView style={styles.scrollview} bounces={false}>
            {renderSkillLevel()}
            {renderUnexpandableList('topic')}
            {renderUnexpandableList('style')}
            {renderExpandableList('teacher')}
          </ScrollView>
        )}
      </Modal>
    </>
  );
};
const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    scrollview: { backgroundColor: current.background, flex: 1 },
    sectionContainer: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: current.borderColor
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
    pillContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    levelPill: { width: '9%', height: 5, backgroundColor: utils.color },
    levelPillCursor: {
      position: 'absolute',
      width: 20,
      aspectRatio: 1,
      borderRadius: 10,
      backgroundColor: utils.color,
      marginLeft: -10
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
    },
    unexpandableListContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    pressable: { borderWidth: 1, borderRadius: 99, justifyContent: 'center' },
    pressableText: { textAlign: 'center', textTransform: 'uppercase' }
  });
