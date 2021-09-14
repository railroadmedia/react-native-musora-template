import React, { useContext, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '../..';
import { filters, arrowDown, arrowUp } from '../../images/svgs';
import type { Filters as I_Filters } from '../../interfaces/service.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';

interface Props {
  options: I_Filters | undefined;
  onApply: (filterQuery: string) => void;
}
export const Filters: React.FC<Props> = ({ options, onApply }) => {
  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  const { contrastTextColor } = themeStyles[theme];

  const [isVisible, setIsVisible] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const [maxTouchableOpacityTextHeight, setMaxTouchableOpacityTextHeight] =
    useState(0);

  const [selected, setSelected] = useState<{
    topics: string[];
    styles: string[];
    instructors: string[];
    progress: string;
    level: number;
  }>({
    level: 0,
    topics: [],
    styles: [],
    instructors: [],
    progress: ''
  });

  const [isTeacherSectionOpened, setTeacherSectionOpened] = useState(false);
  const [isProgressSectionOpened, setProgressSectionOpened] = useState(false);

  const skillLevelWidth = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => setScrollable(false),
      onPanResponderRelease: () => setScrollable(true),
      onPanResponderTerminate: () => setScrollable(true),
      onPanResponderMove: (_, { x0, dx }) => {
        const level =
          parseInt((((x0 + dx) / skillLevelWidth.current) * 10).toFixed(0)) - 1;
        setSelected(prevState => ({
          ...prevState,
          level: level < 0 ? 0 : level > 10 ? 10 : level
        }));
      }
    })
  ).current;

  const getQuery: ({}: typeof selected) => string = ({
    level,
    topics,
    styles,
    instructors,
    progress
  }) => {
    let fq = '';
    if (level) fq += `&required_fields[]=difficulty,${level}`;
    if (topics?.length)
      fq += `&included_fields[]=topic,${topics
        .map(st => encodeURIComponent(st))
        .join(',')}`;
    if (styles?.length)
      fq += `&included_fields[]=style,${styles
        .map(ss => encodeURIComponent(ss))
        .join(',')}`;
    if (instructors?.length)
      fq += `&included_fields[]=instructor,${instructors
        .map(si => encodeURIComponent(si))
        .join(',')}`;
    if (progress) fq += `&required_user_states[]=${progress}`;
    return fq;
  };

  const touchableFiller = (
    text: string,
    selected: boolean,
    onPress: Function
  ) => (
    <TouchableOpacity
      key={text}
      onPress={() => onPress()}
      style={{
        ...styles.pressable,
        height: maxTouchableOpacityTextHeight,
        backgroundColor: selected ? utils.color : 'transparent',
        borderColor: selected ? 'transparent' : contrastTextColor
      }}
    >
      <Text
        numberOfLines={
          text.split(' ').length > 1 ||
          text.split('/').length > 1 ||
          text.split('.').length > 1
            ? 2
            : 1
        }
        style={{
          ...styles.pressableText,
          paddingHorizontal: maxTouchableOpacityTextHeight / 4,
          color: selected ? 'white' : contrastTextColor
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

  const renderSkillLevel = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>SET YOUR SKILL LEVEL</Text>
        <Text style={styles.levelText}>LEVEL {selected.level || 'ALL'}</Text>
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
            style={[
              styles.levelPillCursor,
              { left: `${selected.level * 10}%` }
            ]}
          />
        </View>
        {!!selected.level && (
          <Text style={styles.levelDescription}>
            {utils.filterLabels().level[selected.level]}
          </Text>
        )}
        {touchableFiller('ALL', !selected.level, () =>
          setSelected(prevState => ({ ...prevState, level: 0 }))
        )}
      </View>
    );
  };

  const renderUnexpandableList = (filterKey: 'topic' | 'style') => {
    let isTopic = filterKey === 'topic';
    const selectedKey = isTopic ? 'topics' : 'styles';
    const sel = selected[selectedKey];
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {isTopic
            ? 'WHAT DO YOU WANT TO WORK ON?'
            : 'WHAT STYLE DO YOU WANT TO PLAY?'}
        </Text>
        <View style={styles.listContainer}>
          {options?.[filterKey]?.map(f => {
            f = f.toLowerCase();
            const isSel = sel.includes(f) || (f === 'all' && !sel.length);
            return touchableFiller(f, isSel, () => {
              let newState = { ...selected, [selectedKey]: [...sel, f] };
              if (f === 'all') newState[selectedKey] = [];
              else if (sel.includes(f))
                newState[selectedKey] = sel.filter(st => st !== f);
              setSelected(newState);
              onApply(getQuery(newState));
            });
          })}
        </View>
      </View>
    );
  };

  const renderExpandableList = (filterKey: 'teacher' | 'progress') => {
    const isTeacher = filterKey === 'teacher';
    const isOpened = isTeacher
      ? isTeacherSectionOpened
      : isProgressSectionOpened;
    const setIsOpened = isTeacher
      ? setTeacherSectionOpened
      : setProgressSectionOpened;
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          onPress={() => setIsOpened(isOpened ? false : true)}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={styles.sectionTitle}>
            {isTeacher
              ? utils.filterLabels().teacherSectionTitle
              : 'CHOOSE YOUR PROGRESS'}
          </Text>
          {(isOpened ? arrowUp : arrowDown)({
            icon: {
              width: 20,
              height: 20,
              fill: themeStyles[theme].contrastTextColor
            }
          })}
        </TouchableOpacity>
        <View
          style={[styles.listContainer, { maxHeight: isOpened ? 10000 : 0 }]}
        >
          {isTeacher
            ? options?.instructor?.map(
                ({ id, head_shot_picture_url, name }) => {
                  const { instructors } = selected;
                  const isSel = instructors.includes(`${id}`);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={{
                        width: '24%',
                        alignItems: 'center',
                        margin: '.5%',
                        backgroundColor: isSel ? utils.color : 'transparent'
                      }}
                      onPress={() => {
                        let newState = {
                          ...selected,
                          instructors: [...instructors, `${id}`]
                        };
                        if (instructors.includes(`${id}`))
                          newState.instructors = newState.instructors.filter(
                            st => st !== `${id}`
                          );
                        setSelected(newState);
                        onApply(getQuery(newState));
                      }}
                    >
                      <Image
                        style={styles.instructorImg}
                        source={{
                          uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,ar_1,c_fill,g_face/${head_shot_picture_url}`
                        }}
                      />
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.pressableText,
                          {
                            height: maxTouchableOpacityTextHeight,
                            color: isSel ? 'white' : contrastTextColor
                          }
                        ]}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )
            : ['all', 'started', 'completed'].map(f => {
                f = f.toLowerCase();
                let { progress } = selected;
                const isSel = progress === f || (f === 'all' && !progress);
                return touchableFiller(f, isSel, () => {
                  let newState = { ...selected, progress: f };
                  if (f === 'all') newState.progress = '';
                  else if (progress === f) newState.progress = '';
                  setSelected(newState);
                  onApply(getQuery(newState));
                });
              })}
        </View>
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
        {!Object.keys(options || {}).length ||
        !maxTouchableOpacityTextHeight ? (
          <ActivityIndicator
            size='large'
            color={utils.color}
            animating={true}
            style={{ padding: 15 }}
          />
        ) : (
          <>
            <ScrollView style={styles.scrollview} scrollEnabled={scrollable}>
              {renderSkillLevel()}
              {renderUnexpandableList('topic')}
              {renderUnexpandableList('style')}
              {renderExpandableList('teacher')}
              {renderExpandableList('progress')}
            </ScrollView>
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              {['DONE & APPLY', 'RESET'].map(txt =>
                touchableFiller(txt, txt !== 'RESET', () => {
                  if (txt === 'RESET') {
                  } else {
                  }
                  onApply(getQuery(selected));
                  setIsVisible(false);
                })
              )}
            </SafeAreaView>
          </>
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
      color: current.contrastTextColor,
      flex: 1
    },
    levelText: {
      color: current.textColor,
      fontSize: 30,
      textAlign: 'center',
      fontFamily: 'OpenSans-Semibold'
    },
    pillContainer: {
      marginVertical: 20,
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
    levelDescription: {
      color: current.textColor,
      marginBottom: 20,
      textAlign: 'center'
    },
    listContainer: {
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    pressable: {
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: 99,
      justifyContent: 'center',
      width: `${100 / 3 - 1}%`,
      margin: '.5%'
    },
    pressableText: {
      textAlign: 'center',
      textTransform: 'uppercase',
      fontFamily: 'OpenSans-Semibold',
      color: current.contrastTextColor
    },
    instructorImg: { width: '50%', aspectRatio: 1, borderRadius: 99 },
    footer: {
      flexDirection: 'row',
      padding: 15,
      justifyContent: 'space-evenly'
    }
  });
