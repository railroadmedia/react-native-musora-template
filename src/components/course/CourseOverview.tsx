import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Download_V2 } from 'RNDownload';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { CardsContext } from '../../state/cards/CardsContext';
import {
  back,
  info,
  infoFilled,
  like,
  likeOn,
  plus,
  reset,
  x,
  play
} from '../../images/svgs';
import type { ParamListBase, RouteProp } from '@react-navigation/native';

import { RowCard } from '../../common_components/cards/RowCard';
import { NextLesson } from '../../common_components/NextLesson';
import { methodService } from '../../services/method.service';
import { userService } from '../../services/user.service';
import { ActionModal } from '../../common_components/modals/ActionModal';
import type { Card } from '../../interfaces/card.interfaces';
import type { MethodCourse } from '../../interfaces/method.interfaces';
import { contentService } from '../../services/content.service';

interface Props {
  route: RouteProp<ParamListBase, 'courseOverview'> & {
    params: {
      mobile_app_url: string;
      isMethod: boolean;
    };
  };
}

export const CourseOverview: React.FC<Props> = ({
  route: {
    params: { isMethod, mobile_app_url }
  }
}) => {
  const { goBack } = useNavigation();

  const [course, setCourse] = useState<MethodCourse>();
  const [refreshing, setRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const removeModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getCourse();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getCourse = () =>
    methodService
      .getMethodCourse(mobile_app_url, abortC.current.signal, false)
      .then(courseRes => {
        if (isMounted.current) {
          if (courseRes.next_lesson) addCards([courseRes.next_lesson]);
          addCards(courseRes.lessons);
          setCourse(courseRes);
          setRefreshing(false);
        }
      });

  const renderTagsDependingOnContentType = useMemo(() => {
    const instructorTag = course?.instructors
      ? `${course?.instructors
          .map(i => i.name)
          .join(', ')
          .toUpperCase()} | `
      : '';
    const levelTag = isMethod
      ? 'LEVEL ' +
        course?.level_position +
        '.' +
        course?.course_position +
        '  |  '
      : '';
    const xpTag = `${course?.xp || 0} XP`;
    return instructorTag + levelTag + xpTag;
  }, [
    isMethod,
    course?.instructors,
    course?.level_position,
    course?.course_position,
    course?.xp
  ]);

  const handleBackPress = (): void => {};

  const likeOrDislikeContent = useCallback(() => {
    if (!course) return;
    if (course.is_liked_by_current_user) {
      userService.dislikeContent(course.id);
      setCourse({
        ...course,
        is_liked_by_current_user: true,
        like_count: course.like_count - 1
      });
    } else {
      userService.likeContent(course.id);
      setCourse({
        ...course,
        is_liked_by_current_user: false,
        like_count: course.like_count + 1
      });
    }
  }, [course]);

  const toggleMyList = useCallback(() => {
    if (!course) return;
    if (course.is_added_to_primary_playlist) {
      removeModalRef.current?.toggle(
        'Hold your horses...',
        `This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`
      );
    } else {
      userService.addToMyList(course.id);
      setCourse({ ...course, is_added_to_primary_playlist: true });
    }
  }, [course, removeModalRef]);

  const addToMyList = useCallback(() => {
    if (!course) return;

    userService.removeFromMyList(course.id);
    setCourse({ ...course, is_added_to_primary_playlist: false });
    removeModalRef.current?.toggle('', '');
  }, [course, removeModalRef]);

  const refresh = (): void => {
    abortC.current.abort();
    abortC.current = new AbortController();
    setRefreshing(true);
    getCourse();
  };

  const resetProgress = useCallback(async () => {
    if (!course) return;
    userService.resetProgress(course.id);
    setCourse({
      ...course,
      started: false,
      completed: false,
      progress_percent: 0
    });
    resetModalRef.current?.toggle('', '');
  }, [course, resetModalRef]);

  const onMainBtnPress = (): void => {};

  const flRefreshControl = (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={refreshing}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safearea}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.container}>
        {course?.id ? (
          <ScrollView style={{ flex: 1 }} refreshControl={flRefreshControl}>
            <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
              {back({
                icon: {
                  fill: themeStyles[theme].background,
                  height: 15,
                  width: 15
                }
              })}
            </TouchableOpacity>
            <Image
              resizeMode={'cover'}
              source={{ uri: course.thumbnail_url }}
              style={{ aspectRatio: 16 / 9 }}
            />

            <View>
              <Text style={styles.title}>{course.title}</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.tags}>
                  {renderTagsDependingOnContentType}
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={styles.underCompleteTOpacities}
                  onPress={toggleMyList}
                >
                  {course.is_added_to_primary_playlist
                    ? x({ icon: { fill: utils.color, height: 25, width: 25 } })
                    : plus({
                        icon: { fill: utils.color, height: 25, width: 25 }
                      })}
                  <Text style={styles.myListText}>
                    {course.is_added_to_primary_playlist ? 'Added' : 'My List'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mainBtn}
                  onPress={onMainBtnPress}
                >
                  {course.completed
                    ? reset({ icon: { fill: 'white', height: 25, width: 25 } })
                    : play({ icon: { fill: 'white', height: 25, width: 25 } })}

                  <Text style={styles.mainBtnText}>
                    {course.completed
                      ? 'RESTART'
                      : course.started
                      ? 'CONTINUE'
                      : 'START'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.underCompleteTOpacities}
                  onPress={() => setShowInfo(!showInfo)}
                >
                  {showInfo
                    ? infoFilled({
                        icon: { fill: utils.color, height: 25, width: 25 }
                      })
                    : info({
                        icon: { fill: utils.color, height: 25, width: 25 }
                      })}

                  <Text style={styles.myListText}>Info</Text>
                </TouchableOpacity>
              </View>
              {showInfo && (
                <View>
                  <Text style={styles.description}>{course.description}</Text>
                  <View style={styles.rowContainer}>
                    <View style={styles.underCompleteTOpacities}>
                      <Text style={styles.detailText}>
                        {course.lessons?.length}
                      </Text>
                      <Text style={styles.underDetailText}>LESSONS</Text>
                    </View>
                    <View style={styles.underCompleteTOpacities}>
                      <Text style={styles.detailText}>
                        {isMethod ? course.total_length_in_seconds : 'TBD'}
                      </Text>
                      <Text style={styles.underDetailText}>MINS</Text>
                    </View>
                    <View style={styles.underCompleteTOpacities}>
                      <Text style={styles.detailText}>
                        {isMethod ? course.total_xp : 'TBD'}
                      </Text>
                      <Text style={styles.underDetailText}>XP</Text>
                    </View>
                  </View>

                  <View style={[styles.rowContainer, styles.extraMargin]}>
                    <TouchableOpacity
                      style={styles.underCompleteTOpacities}
                      onPress={likeOrDislikeContent}
                    >
                      {course.is_liked_by_current_user
                        ? likeOn({
                            icon: { fill: utils.color, height: 25, width: 25 }
                          })
                        : like({
                            icon: { fill: utils.color, height: 25, width: 25 }
                          })}
                      <Text style={styles.belowIconText}>
                        {course.like_count}
                      </Text>
                    </TouchableOpacity>

                    <Download_V2
                      entity={{
                        id: course.id,
                        content: new Promise(async res =>
                          isMethod
                            ? res(
                                await methodService.getMethodCourse(
                                  course.mobile_app_url,
                                  abortC.current.signal,
                                  true
                                )
                              )
                            : res(
                                await contentService.getContentById(
                                  course.id,
                                  true,
                                  abortC.current.signal
                                )
                              )
                        )
                      }}
                      styles={{
                        touchable: { flex: 1 },
                        iconDownloadColor: utils.color,
                        activityIndicatorColor: utils.color,
                        animatedProgressBackground: utils.color,
                        textStatus: styles.iconText,
                        alert: {
                          alertTextMessageFontFamily: 'OpenSans',
                          alertTouchableTextDeleteColor: 'white',
                          alertTextTitleColor: themeStyles[theme].textColor,
                          alertTextMessageColor: themeStyles[theme].textColor,
                          alertTextTitleFontFamily: 'OpenSans-Bold',
                          alertTouchableTextCancelColor: utils.color,
                          alertTouchableDeleteBackground: utils.color,
                          alertBackground: themeStyles[theme].background,
                          alertTouchableTextDeleteFontFamily: 'OpenSans-Bold',
                          alertTouchableTextCancelFontFamily: 'OpenSans-Bold'
                        }
                      }}
                    />
                    <TouchableOpacity
                      style={styles.underCompleteTOpacities}
                      onPress={() =>
                        resetModalRef.current?.toggle(
                          'Hold your horses...',
                          `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
                        )
                      }
                    >
                      {reset({
                        icon: { fill: utils.color, height: 25, width: 25 }
                      })}
                      <Text style={styles.belowIconText}>Restart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.rowCardContainer}>
              {course.lessons?.length > 0 ? (
                course.lessons.map((item: Card, index: number) => (
                  <RowCard key={index} id={item.id} route='' />
                ))
              ) : (
                <Text style={styles.emptyListText}>
                  There are no course lessons
                </Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <>
            <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
              {back({
                icon: {
                  fill: themeStyles[theme].textColor,
                  height: 15,
                  width: 15
                }
              })}
            </TouchableOpacity>
            <ActivityIndicator
              size={'large'}
              style={{ flex: 1 }}
              color={utils.color}
            />
          </>
        )}
        {course?.next_lesson && (
          <NextLesson
            item={course.next_lesson.id}
            progress={course.progress_percent}
            text={`COURSE - ${course.progress_percent}% COMPLETE`}
          />
        )}

        <ActionModal
          ref={removeModalRef}
          primaryBtnText='REMOVE'
          onAction={addToMyList}
          onCancel={() => removeModalRef.current?.toggle('', '')}
        />

        <ActionModal
          ref={resetModalRef}
          primaryBtnText='RESET'
          onAction={resetProgress}
          onCancel={() => resetModalRef.current?.toggle('', '')}
        />
      </View>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    safearea: {
      flex: 1,
      width: '100%',
      backgroundColor: current.background
    },
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    backBtnContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 15,
      zIndex: 2
    },
    title: {
      textAlign: 'center',
      marginRight: 15,
      marginLeft: 15,
      padding: 5,
      fontSize: utils.figmaFontSizeScaler(24),
      fontFamily: 'OpenSans-Bold',
      color: current.textColor
    },
    underCompleteTOpacities: {
      flex: 1,
      alignItems: 'center'
    },
    btn: {
      backgroundColor: utils.color,
      borderColor: utils.color,
      flexDirection: 'row',
      width: '50%',
      maxWidth: 300
    },
    playBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10
    },
    extraMargin: {
      marginHorizontal: 40
    },
    tags: {
      textAlign: 'center',
      flex: 1,
      paddingVertical: 10,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans-Semibold',
      color: current.contrastTextColor
    },
    description: {
      padding: 10,
      flex: 1,
      textAlign: 'center',
      marginBottom: 10,
      color: current.textColor
    },
    detailText: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    underDetailText: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    belowIconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    emptyListText: {
      textAlign: 'center',
      marginTop: 100,
      color: utils.color,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    },
    rowCardContainer: {
      width: '100%',
      backgroundColor: current.background
    },
    myListText: {
      color: utils.color,
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    mainBtn: {
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: utils.color,
      flexDirection: 'row',
      width: '50%',
      maxWidth: 300
    },
    mainBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: 'white',
      marginLeft: 10
    },
    iconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: 10,
      fontFamily: 'OpenSans'
    }
  });
