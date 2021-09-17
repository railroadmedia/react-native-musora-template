import React, { useContext, useMemo, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList
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
  onApply: ({}: { apiQuery: string; formattedQuery: string }) => void;
}
export const Filters: React.FC<Props> = ({ options, onApply }) => {
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);
  const { contrastTextColor } = themeStyles[theme];

  const [visible, setVisible] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const [maxTouchableOpacityTextHeight, setMaxTouchableOpacityTextHeight] =
    useState(0);

  const [selectedFilters, setSelectedFilters] = useState<{
    topic: string[];
    style: string[];
    instructor: string[];
    progress: string;
    level: number;
  }>({
    level: 0,
    topic: [],
    style: [],
    instructor: [],
    progress: ''
  });

  const [isTeacherSectionOpened, setTeacherSectionOpened] = useState(false);
  const [isProgressSectionOpened, setProgressSectionOpened] = useState(false);

  const prevFilters: typeof selectedFilters = useMemo(
    () => (visible ? prevFilters || selectedFilters : selectedFilters),
    [visible]
  );

  const getQuery: ({}: typeof selectedFilters) => {
    apiQuery: string;
    formattedQuery: string;
  } = selected => {
    let aq = '',
      fq = '';
    if (selected.level) {
      aq += `&required_fields[]=difficulty,${selected.level}`;
      fq += ' / LEVEL ' + selected.level;
    }
    let includedFieldsKeys: ('topic' | 'style' | 'instructor')[] = [
      'topic',
      'style',
      'instructor'
    ];
    includedFieldsKeys.map(type => {
      if (selected[type].length) {
        aq += `&included_fields[]=${type},${selected[type]
          .map(st => encodeURIComponent(st))
          .join(',')}`;
        if (type === 'instructor')
          fq += ` / ${type}: ${selected.instructor
            .map(
              si => options?.instructor?.find(i => i.id.toString() === si)?.name
            )
            .join(', ')}`;
        else fq += ` / ${type}: ${selected[type].join(', ')}`;
      }
    });
    if (selected.progress) {
      aq += `&required_user_states[]=${selected.progress}`;
      fq += ' / ' + selected.progress;
    }
    return { apiQuery: aq, formattedQuery: fq };
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
          [' ', '/', '.'].some(s => text.split(s).length > 1) ? 2 : 1
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

  const renderUnexpandableList = (filterKey: 'topic' | 'style') => {
    let isTopic = filterKey === 'topic';
    const sel = selectedFilters[filterKey];
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
              let newState = { ...selectedFilters, [filterKey]: [...sel, f] };
              if (f === 'all') newState[filterKey] = [];
              else if (sel.includes(f))
                newState[filterKey] = sel.filter(st => st !== f);
              setSelectedFilters(newState);
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
            icon: { width: 20, height: 20, fill: contrastTextColor }
          })}
        </TouchableOpacity>
        <View
          style={[styles.listContainer, { maxHeight: isOpened ? 'auto' : 0 }]}
        >
          {isTeacher
            ? options?.instructor?.map(
                ({ id, head_shot_picture_url, name }) => {
                  const { instructor } = selectedFilters;
                  const isSel = instructor.includes(`${id}`);
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
                          ...selectedFilters,
                          instructor: [...instructor, `${id}`]
                        };
                        if (instructor.includes(`${id}`))
                          newState.instructor = instructor.filter(
                            st => st !== `${id}`
                          );
                        setSelectedFilters(newState);
                        onApply(getQuery(newState));
                      }}
                    >
                      <Image
                        style={styles.instructorImg}
                        source={{
                          uri: head_shot_picture_url
                            ? `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,ar_1,c_fill,g_face/${head_shot_picture_url}`
                            : utils.fallbackAvatar
                        }}
                      />
                      <Text
                        numberOfLines={2}
                        style={{
                          ...styles.pressableText,
                          height: maxTouchableOpacityTextHeight,
                          color: isSel ? 'white' : contrastTextColor
                        }}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )
            : ['all', 'started', 'completed'].map(f => {
                f = f.toLowerCase();
                let { progress } = selectedFilters;
                const isSel = progress === f || (f === 'all' && !progress);
                return touchableFiller(f, isSel, () => {
                  let newState = { ...selectedFilters, progress: f };
                  if (f === 'all' || progress === f) newState.progress = '';
                  setSelectedFilters(newState);
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
        onPress: () => setVisible(true)
      })}
      <Modal
        animationType={'fade'}
        onRequestClose={() => setVisible(false)}
        supportedOrientations={['portrait', 'landscape']}
        visible={visible}
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
        <BackHeader
          title={'Filter'}
          onBack={() => {
            if (prevFilters !== selectedFilters) {
              setSelectedFilters(prevFilters);
              onApply(getQuery(prevFilters));
            }
            setVisible(false);
          }}
        />
        {!maxTouchableOpacityTextHeight || !options ? (
          <ActivityIndicator
            size='large'
            color={utils.color}
            animating={true}
            style={{ padding: 15 }}
          />
        ) : (
          <>
            <FlatList
              scrollEnabled={scrollable}
              style={styles.scrollview}
              initialNumToRender={0}
              showsVerticalScrollIndicator={false}
              data={['skill', 'topic', 'style', 'teacher', 'progress']}
              keyExtractor={id => id}
              renderItem={({ item }) =>
                item === 'skill' ? (
                  <SkillLevel
                    initialLevel={selectedFilters.level}
                    onChange={(scrollEnabled, level) => {
                      setScrollable(scrollEnabled);
                      if (
                        level !== undefined &&
                        level !== selectedFilters.level
                      ) {
                        let newState = { ...selectedFilters, level };
                        setSelectedFilters(newState);
                        onApply(getQuery(newState));
                      }
                    }}
                    allHeight={maxTouchableOpacityTextHeight}
                  />
                ) : item === 'topic' ? (
                  renderUnexpandableList('topic')
                ) : item === 'style' ? (
                  renderUnexpandableList('style')
                ) : item === 'teacher' ? (
                  renderExpandableList('teacher')
                ) : item === 'progress' ? (
                  renderExpandableList('progress')
                ) : (
                  <></>
                )
              }
            />
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              {['DONE & APPLY', 'RESET'].map(txt =>
                touchableFiller(txt, txt !== 'RESET', () => {
                  if (txt === 'RESET') {
                    const newState = {
                      instructor: [],
                      level: 0,
                      progress: '',
                      topic: [],
                      style: []
                    };
                    setSelectedFilters(newState);
                    onApply(getQuery(newState));
                  } else setVisible(false);
                })
              )}
            </SafeAreaView>
          </>
        )}
      </Modal>
    </>
  );
};

const SkillLevel: React.FC<{
  initialLevel: number;
  onChange: (scrollEnabled: boolean, level?: number) => void;
  allHeight: number;
}> = ({ onChange, allHeight, initialLevel }) => {
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);
  const { contrastTextColor } = themeStyles[theme];

  const [level, setLevel] = useState(initialLevel);
  const skillLevelWidth = useRef(0);

  let prevLevel = useRef(level);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => onChange(false),
      onPanResponderRelease: () => onChange(true, prevLevel.current),
      onPanResponderTerminate: () => onChange(true, prevLevel.current),
      onPanResponderMove: (_, { x0, dx }) => {
        let lvl =
          parseInt((((x0 + dx) / skillLevelWidth.current) * 10).toFixed(0)) - 1;
        lvl = lvl < 0 ? 0 : lvl > 10 ? 10 : lvl;
        if (prevLevel.current !== lvl) {
          prevLevel.current = lvl;
          setLevel(lvl);
        }
      }
    })
  ).current;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>SET YOUR SKILL LEVEL</Text>
      <Text style={styles.levelText}>LEVEL {level || 'ALL'}</Text>
      <View
        onLayout={({ nativeEvent: { layout } }) =>
          (skillLevelWidth.current = layout.width)
        }
        style={styles.pillContainer}
      >
        {[...new Array(10)].map((_, i) => (
          <View key={i} style={styles.levelPill} />
        ))}
        <View
          {...panResponder.panHandlers}
          style={[styles.levelPillCursor, { left: `${level * 10}%` }]}
        />
      </View>
      {!!level && (
        <Text style={styles.levelDescription}>
          {utils.filterLabels().level[level]}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => {
          setLevel(0);
          onChange(true, 0);
        }}
        style={{
          ...styles.pressable,
          height: allHeight,
          backgroundColor: !level ? utils.color : 'transparent',
          borderColor: !level ? 'transparent' : contrastTextColor
        }}
      >
        <Text
          style={{
            ...styles.pressableText,
            paddingHorizontal: allHeight / 4,
            color: !level ? 'white' : contrastTextColor
          }}
        >
          ALL
        </Text>
      </TouchableOpacity>
    </View>
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
