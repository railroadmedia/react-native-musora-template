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
  Alert,
  Platform,
  StatusBar,
  ScrollView,
  BackHandler,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  StyleSheet,
  ViewStyle
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Rate, { AndroidMarket } from 'react-native-rate';
// import Video from 'RNVideoEnhanced';

import { OrientationContext } from '../../state/orientation/OrientationContext';
import {
  back,
  play,
  like,
  likeOn,
  x,
  plus,
  resources,
  info,
  infoFilled,
  watch,
  listen,
  right,
  completedCircle,
  trophy,
  LessonComplete,
  CourseComplete
} from '../../images/svgs';
import type {
  Assignment,
  Lesson,
  LessonResponse
} from '../../interfaces/lesson.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { Assignment as AssignmentComponent } from './Assignment';
import { contentService } from '../../services/content.service';
import { CommentSection } from './CommentSection';
import { CardsContext } from '../../state/cards/CardsContext';
import { RowCard } from '../../common_components/cards/RowCard';
import { Soundslice, SoundsliceRefObj } from './Soundslice';
import { LessonProgress } from './LessonProgress';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { capitalizeFirstLetter, getProgress } from './helpers';
import { userService } from '../../services/user.service';
import type {
  CompletedResponse,
  ResetProgressResponse
} from 'src/interfaces/user.interfaces';
import type { ErrorResponse } from '../../interfaces/service.interfaces';

interface SelectedAssignment extends Assignment {
  index?: number;
  progress: number;
}

interface Props {
  route: RouteProp<ParamListBase, 'lessonPart'> & {
    params: {
      id: number;
      parentId: number;
      contentType: string;
      item?: LessonResponse;
    };
  };
}

const windowWidth = Dimensions.get('screen').width;

export const LessonPart: React.FC<Props> = ({
  route: {
    params: { id, contentType, item }
  }
}) => {
  const { navigate, goBack } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props?: {}) => void;
    }
  >();

  const [lesson, setLesson] = useState<Lesson>();
  const [refreshing, setRefreshing] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [videoType, setVideoType] = useState('audio');
  const [assignmentFSStyle, setAssignmentFSStyle] = useState<ViewStyle | null>(
    null
  );
  const [selectedAssignment, setSelectedAssignment] =
    useState<SelectedAssignment | null>(null);
  const [incompleteLessonId, setIncompleteLessonId] = useState<
    number | undefined
  >(-1);
  const [progress, setProgress] = useState(0);

  const { theme } = useContext(ThemeContext);
  const { isLandscape } = useContext(OrientationContext);
  const { addCards } = useContext(CardsContext);

  const abortC = useRef(new AbortController());
  const isMounted = useRef(true);
  const video = useRef();
  const soundsliceRef = useRef<SoundsliceRefObj>(null);
  const alert = useRef<React.ElementRef<typeof ActionModal>>(null);
  const removeModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const completeLessonPage = useRef<React.ElementRef<typeof ActionModal>>(null);
  const completeOverviewPage =
    useRef<React.ElementRef<typeof ActionModal>>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const overviewCompleteText = useMemo(() => {
    let type = '';
    if (contentType === 'coach-stream') type = 'Lesson';
    else if (lesson?.parent?.next_bundle) type = 'Pack bundle';
    else type = capitalizeFirstLetter(contentType);
    return type + ' complete';
  }, [contentType, lesson?.parent]);

  const coloredIcon = useMemo(
    () => ({ width: 25, height: 25, fill: utils.color }),
    []
  );

  const greyIcon = useMemo(
    () => ({
      width: 25,
      height: 25,
      fill: themeStyles[theme].contrastTextColor
    }),
    [theme]
  );

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getLesson(id);
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, [id]);

  const getLesson = async (lessonId: number) => {
    console.log(lessonId, contentType);
    let content: LessonResponse;
    if (item) {
      content = item;
    } else {
      content = await contentService.getContentById(
        lessonId,
        false,
        abortC.current.signal
      );
      if (content.title && content.message) {
        return alert.current?.toggle(content.title, content.message);
      }

      setLesson(content);
      setProgress(getProgress(content.user_progress));
      setIncompleteLessonId(
        content.type === 'course-part'
          ? content.next_lesson.id
          : content.parent?.next_lesson?.id
      );
      addCards(content.related_lessons);
      setRefreshing(false);

      if (
        contentType !== 'song' &&
        !content.video_playback_endpoints &&
        !lesson?.youtube_video_id
      ) {
        alert.current?.toggle(
          `We're sorry, there was an issue loading this video, try reloading the lesson.`,
          `If the problem persists please contact support.`
        );
      }
    }
  };

  const onAndroidBack = useCallback(() => {
    if (assignmentFSStyle) setAssignmentFSStyle(null);
    else if (selectedAssignment) setSelectedAssignment(null);
    // else if (fullscreen) this.video?.handleBack?.();
    else goBack();
    return true;
  }, [assignmentFSStyle, selectedAssignment]);

  const createResourcesArr = useCallback(() => {}, []);

  const refresh = useCallback(() => {
    if (!lesson) return;

    setRefreshing(true);
    getLesson(lesson.id);
  }, [lesson?.id]);

  const renderTagsDependingOnContentType = useCallback(() => {
    const {
      xp,
      type,
      style,
      artist,
      difficulty,
      instructor,
      parent,
      published_on
    } = lesson || {};
    const parentTitleTag = parent?.title
      ? `${parent.title.toUpperCase()} | `
      : '';
    const styleTag = style ? `${style.toUpperCase()} | ` : '';
    const difficultyTag = difficulty ? `${difficulty} | ` : '';
    const releaseDateTag = published_on ? `${published_on} | ` : '';
    const instructorTag = instructor
      ? `${instructor
          .map(i => i.name)
          .join(', ')
          .toUpperCase()} | `
      : '';
    const artistTag = artist ? `${artist.toUpperCase()} | ` : '';
    const typeTag = type ? `${type.toUpperCase()} | ` : '';
    const xpTag = `${xp || 0} XP`;
    switch (contentType) {
      case 'song':
        return artistTag + xpTag;
      case 'show':
        return instructorTag + typeTag + xpTag;
      case 'course':
        return parentTitleTag + xpTag;
      case 'Play Along':
        return (
          instructorTag + styleTag + difficultyTag + releaseDateTag + xpTag
        );
      case 'Student Focus':
        return instructorTag + artistTag + xpTag;
      case 'pack':
        return releaseDateTag + xpTag;
    }
    return '';
  }, [lesson, contentType]);

  const toggleLike = useCallback(async () => {
    if (!lesson) return;
    const { is_liked_by_current_user, id, like_count } = lesson;

    if (is_liked_by_current_user) {
      userService.dislikeContent(id);
    } else {
      userService.likeContent(id);
    }
    setLesson({
      ...lesson,
      like_count: is_liked_by_current_user ? like_count - 1 : like_count + 1,
      is_liked_by_current_user: !is_liked_by_current_user
    });
  }, [lesson?.id, lesson?.is_liked_by_current_user, lesson?.like_count]);

  const toggleMyList = useCallback(() => {
    if (!lesson) return;

    if (lesson.is_added_to_primary_playlist) {
      userService.removeFromMyList(lesson.id);
      removeModalRef.current?.toggle('', '');
    } else {
      userService.addToMyList(lesson.id);
    }
    setLesson({
      ...lesson,
      is_added_to_primary_playlist: !lesson.is_added_to_primary_playlist
    });
  }, [lesson?.is_added_to_primary_playlist, lesson?.id, removeModalRef]);

  const toggleVideoAudio = useCallback(() => {
    setVideoType(videoType === 'audio' ? 'video' : 'audio');
    // dldService.gCasting && this.video.gCastMedia()
  }, [videoType]);

  const selectAssignment = useCallback(
    (assignment: Assignment, index: number) => {
      setSelectedAssignment({
        ...assignment,
        index,
        progress: getProgress(assignment.user_progress)
      });
    },
    []
  );

  const goToSoundSlice = useCallback(() => {
    soundsliceRef.current?.toggleSoundslice();
  }, [soundsliceRef]);

  const onAddToMyList = useCallback(() => {
    if (lesson?.is_added_to_primary_playlist) {
      removeModalRef.current?.toggle(
        'Hold your horses...',
        `This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`
      );
    } else {
      toggleMyList();
    }
  }, [removeModalRef, lesson?.is_added_to_primary_playlist]);

  const toggleShowInfo = useCallback(() => {
    setShowInfo(!showInfo);
  }, [showInfo]);

  const switchLesson = useCallback((lessonId: number) => {
    setSelectedAssignment(null);
    setRefreshing(true);
    getLesson(lessonId);
  }, []);

  const goToLessons = useCallback(() => {
    if (!lesson) return;

    completeLessonPage.current?.toggle('', '');
    completeOverviewPage.current?.toggle('', '');

    setRefreshing(true);
    if (contentType === 'pack') {
      if (lesson.parent?.next_bundle?.id) {
        navigate('packOverview', { id: lesson.parent?.next_bundle?.id });
      } else {
        navigate('packs');
      }
    } else {
      let route: string = contentType.replace(' ', '');
      route =
        route.charAt(0).toLowerCase() + route.slice(1, contentType.length);
      if (route !== 'studentFocus') route += 's';

      navigate(route);
    }
  }, [completeLessonPage, completeOverviewPage, lesson, contentType]);

  const goToNextLesson = useCallback(() => {
    if (!lesson) return;

    completeLessonPage.current?.toggle('', '');
    completeOverviewPage.current?.toggle('', '');
    if (incompleteLessonId) {
      getLesson(incompleteLessonId);
    }
  }, [completeLessonPage, completeOverviewPage, lesson, incompleteLessonId]);

  const goToMarket = useCallback(() => {
    Rate.rate(
      {
        preferInApp: true,
        AppleAppID: '1460388277',
        GooglePackageName: 'com.drumeo',
        openAppStoreIfInAppFails: false,
        preferredAndroidMarket: AndroidMarket.Google
      },
      () => {}
    );
  }, []);

  const showRatingModal = () =>
    Alert.alert(
      'Rate this app',
      `Enjoying the Drumeo App? Please leave us a rating on the ${
        utils.isiOS ? 'App Store' : 'Play Store'
      }!`,
      [
        {
          text: 'Leave A Rating',
          onPress: goToMarket
        },
        { text: 'Later' }
      ],
      { cancelable: false }
    );

  const onLessonProgressBtnPress = useCallback(() => {
    if (progress === 100) {
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
    } else {
      onComplete();
    }
  }, [progress, resetModalRef]);

  const onCompleteAssignment = useCallback(() => {
    if (selectedAssignment) {
      if (selectedAssignment.progress !== 100) {
        onComplete(selectedAssignment.id);
      } else {
        resetModalRef.current?.toggle(
          'Hold your horses...',
          `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
        );
      }
    }
  }, [selectedAssignment, resetModalRef]);

  const onComplete = useCallback(
    async (assignmentId?: number) => {
      if (!lesson) return;
      const res: CompletedResponse = await userService.markAsComplete(
        assignmentId || lesson.id
      );
      let incompleteAssignments: number;
      if (assignmentId) {
        incompleteAssignments = lesson.assignments.filter(
          (a: Assignment) =>
            a.user_progress[0].progress_percent !== 100 && a.id !== assignmentId
        ).length;
        if (!incompleteAssignments) {
          if (incompleteLessonId)
            completeLessonPage.current?.toggle(
              'Lesson complete',
              `You earned ${lesson.xp} XP!`
            );
          else if (!incompleteLessonId)
            completeOverviewPage.current?.toggle(
              overviewCompleteText,
              `You earned ${lesson.xp} XP!`
            );
        }
        setProgress(incompleteAssignments ? progress : 100);
        setLesson({
          ...lesson,
          assignments: lesson.assignments.map(a =>
            a.id === assignmentId
              ? { ...a, user_progress: [{ progress_percent: 100 }] }
              : a
          )
        });
        if (selectedAssignment) {
          setSelectedAssignment({ ...selectedAssignment, progress: 100 });
        }
      } else {
        if (incompleteLessonId) {
          completeLessonPage.current?.toggle(
            'Lesson complete',
            `You earned ${lesson.xp} XP!`
          );
        } else {
          completeOverviewPage.current?.toggle(
            overviewCompleteText,
            `You earned ${lesson.xp} XP!`
          );
        }
        setProgress(100);
        setLesson({
          ...lesson,
          assignments: lesson.assignments.map(a => ({
            ...a,
            progress: 100
          }))
        });
      }
      if (
        (utils.isiOS && res.displayIosReviewModal) ||
        (!utils.isiOS && res.displayGoogleReviewModal)
      )
        showRatingModal();
      if (res.parent?.user_progress) {
        setProgress(getProgress(res.parent.user_progress));
      }
    },
    [
      incompleteLessonId,
      lesson,
      overviewCompleteText,
      progress,
      selectedAssignment
    ]
  );

  const resetProgress = useCallback(async () => {
    if (!lesson) return;

    const resetId = selectedAssignment ? selectedAssignment.id : lesson.id;
    resetModalRef.current?.toggle('', '');
    const res: ResetProgressResponse = await userService.resetProgress(resetId);
    if (selectedAssignment) {
      setSelectedAssignment({ ...selectedAssignment, progress: 0 });
      if (res.type === 'course') setProgress(getProgress(lesson.user_progress));
      else if (res.progress_percent) setProgress(res.progress_percent);
    } else {
      setProgress(0);
    }
    setLesson({
      ...lesson,
      assignments: !selectedAssignment
        ? lesson.assignments.map((a: Assignment) => ({
            ...a,
            user_progress: [{ progress_percent: 0 }]
          }))
        : lesson.assignments.map((a: Assignment) =>
            a.id === resetId
              ? {
                  ...a,
                  user_progress: [{ progress_percent: 0 }]
                }
              : a
          )
    });
  }, [lesson, selectedAssignment]);

  const onSeek = useCallback(() => {}, []);

  const toSupport = useCallback(() => {
    alert.current?.toggle();
    togglePausedVideo();
    navigate('support');
  }, []);

  const togglePausedVideo = useCallback(() => {
    if (video) {
      // video.current?.togglePaused(true, true);
    }
  }, [video]);

  const onEndLive = useCallback(() => {
    if (lesson) {
      setTimeout(() => {
        setLesson({ ...lesson, isLive: false });
      }, 15 * 60000);
    }
  }, []);

  const onStartLive = useCallback(() => {
    if (lesson) {
      setTimeout(() => {
        setLesson({ ...lesson, isLive: true });
      }, 15 * 60000);
    }
  }, []);

  const onUpdateVideoProgress = useCallback(
    async (
      videoId: number,
      id: number,
      lengthInSec: number,
      currentTime: number,
      mediaCategory: string
    ) => {
      // if (!this.context.isConnected) return;
      userService.updateUsersVideoProgress(
        (
          await userService.getMediaSessionId(
            videoId,
            id,
            lengthInSec,
            mediaCategory
          )
        )?.session_id?.id,
        currentTime,
        lengthInSec,
        id
      );
    },
    []
  );

  const onFullscreen = useCallback((isFullscreen: boolean) => {
    setFullscreen(isFullscreen);
    setTimeout(
      () =>
        StatusBar.setBarStyle(
          utils.isiOS
            ? 'light-content'
            : theme === 'dark'
            ? 'light-content'
            : 'dark-content'
        ),
      500
    );
  }, []);

  const onReloadBtnPressed = useCallback(() => {
    refresh();
    alert.current?.toggle();
  }, [alert]);

  let SafeView = assignmentFSStyle ? SafeAreaView : View;

  const flRefreshControl = (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={refreshing}
    />
  );

  const renderInfo = (
    <View
      style={{
        marginHorizontal: 15,
        maxWidth: windowWidth - 40
      }}
    >
      {!!lesson?.description && (
        <View style={{ paddingBottom: 10 }}>
          <Text style={styles.infoTitle}>ABOUT THE LESSON</Text>
          <Text style={styles.infoText}>{lesson.description}</Text>
        </View>
      )}
      {!!lesson?.instructor &&
        lesson.instructor.map(ins => (
          <View key={ins.id} style={{ marginBottom: 25 }}>
            <Text style={styles.infoTitle}>
              ABOUT {ins?.name?.toUpperCase?.()}
            </Text>
            <Text style={styles.infoText}>{ins.biography}</Text>
          </View>
        ))}
      {!!lesson?.chapters && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.infoTitle}>CHAPTER MARKERS</Text>
          {lesson.chapters.map(c => (
            <TouchableOpacity
              key={c.chapter_timecode}
              style={styles.chapterMarkersCont}
              onPress={
                () => {}
                // this.video?.onSeek(
                //   c.chapter_timecode
                // )
              }
            >
              <Text style={styles.infoText}>{c.chapter_description}</Text>
              <Text style={styles.chapterTime}>
                {parseInt(c.chapter_timecode) < 36000
                  ? new Date(parseInt(c.chapter_timecode) * 1000)
                      .toISOString()
                      .substr(14, 5)
                  : new Date(parseInt(c.chapter_timecode) * 1000)
                      .toISOString()
                      .substr(11, 8)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderAssignments = (
    <View style={styles.container}>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>ASSIGNMENTS</Text>
      </View>
      {lesson?.assignments?.map((a, index) => (
        <TouchableOpacity
          key={index}
          style={styles.assignmentCont}
          onPress={() => selectAssignment(a, index)}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={[styles.assignmentTitle, { maxWidth: windowWidth - 40 }]}
          >
            {a.title}
          </Text>
          {getProgress(a.user_progress) !== 100
            ? right({ icon: greyIcon })
            : completedCircle({ icon: coloredIcon })}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.lessonContainer}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      {contentType === 'song' ? (
        <>
          <View
            style={[
              styles.videoReplacer,
              isLandscape ? { aspectRatio: 3 } : null
            ]}
          >
            <TouchableOpacity onPress={goBack} style={styles.backBtnContainer}>
              {back({
                icon: {
                  fill: themeStyles[theme].textColor,
                  height: 15,
                  width: 15
                }
              })}
            </TouchableOpacity>
            <ImageBackground
              resizeMode='contain'
              imageStyle={styles.album}
              style={styles.albumContainer}
              source={{
                uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,h_${Math.round(
                  (windowWidth * 16) / 9
                )},ar_1,c_fill,g_face/${lesson?.thumbnail_url}`
              }}
            >
              <TouchableOpacity style={styles.playBtn} onPress={goToSoundSlice}>
                {play({ icon: { height: 30, width: 30, fill: '#ffffff' } })}
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </>
      ) : refreshing ||
        (!lesson?.video_playback_endpoints?.length &&
          !lesson?.youtube_video_id) ? (
        <SafeAreaView>
          <View style={styles.videoReplacer}>
            <TouchableOpacity
              onPress={() => {
                if (!utils.isTablet) Orientation.lockToPortrait();
                StatusBar.setHidden(false);
                goBack();
              }}
              style={styles.backBtnContainer}
            >
              {back({
                icon: {
                  fill: themeStyles[theme].textColor,
                  height: 15,
                  width: 15
                }
              })}
            </TouchableOpacity>
            <ActivityIndicator size='large' color='#ffffff' />
          </View>
        </SafeAreaView>
      ) : (
        (!!lesson.vimeo_video_id || !!lesson.youtube_video_id) && (
          <View />
          // <Video
          //   testID='video'
          //   repeat={false}
          //   paused={true}
          //   type={videoType}
          //   showControls={true}
          //   youtubeId={lesson.youtube_video_id}
          //   onRefresh={refresh}
          //   live={!!item?.apiKey}
          //   toSupport={toSupport}
          //   ref={video}
          //   onBack={onAndroidBack}
          //   content={lesson}
          //   // connection={this.context.isConnected}
          //   maxWidth={undefined}
          //   onEndLive={onEndLive}
          //   onStartLive={onStartLive}
          //   onFullscreen={(isFullscreen: boolean) => onFullscreen(isFullscreen)}
          //   goToNextLesson={() => switchLesson(lesson.next_lesson.id)}
          //   goToPreviousLesson={() => switchLesson(lesson.previous_lesson.id)}
          //   onUpdateVideoProgress={(
          //     videoId: number,
          //     id: number,
          //     lengthInSec: number,
          //     currentTime: number,
          //     mediaCategory: string
          //   ) =>
          //     onUpdateVideoProgress(
          //       videoId,
          //       id,
          //       lengthInSec,
          //       currentTime,
          //       mediaCategory
          //     )
          //   }
          //   styles={{
          //     timerCursorBackground: utils.color,
          //     beforeTimerCursorBackground: utils.color,
          //     settings: {
          //       cancel: { color: utils.color },
          //       selectedOptionTextColor: utils.color,
          //       separatorColor: styles.videoSettings.borderColor,
          //       background: styles.videoSettings.backgroundColor,
          //       optionsBorderColor: styles.videoSettings.borderColor,
          //       unselectedOptionTextColor: styles.videoSettings.color,
          //       save: { background: utils.color, color: 'white' },
          //       downloadIcon: {
          //         width: 20,
          //         height: 20,
          //         fill: utils.color
          //       }
          //     },
          //     alert: {
          //       titleTextColor: styles.videoSettings.color,
          //       subtitleTextColor: styles.videoSettings.color,
          //       background: styles.videoSettings.backgroundColor,
          //       contactSupport: { color: styles.videoSettings.color },
          //       reloadLesson: {
          //         color: 'white',
          //         background: utils.color
          //       }
          //     }
          //   }}
          // />
        )
      )}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={utils.isiOS ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          {!refreshing ? (
            <>
              <ScrollView
                style={{ flex: 1 }}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps='handled'
                onScroll={({ nativeEvent }) => {
                  // if (!isiOS && this.isCloseToBottom(nativeEvent))
                  //   if (this.commentSection)
                  //     this.commentSection.loadMoreComments();
                }}
                onMomentumScrollEnd={({ nativeEvent }) => {
                  // if (isiOS && this.isCloseToBottom(nativeEvent))
                  //   if (this.commentSection)
                  //     this.commentSection.loadMoreComments();
                }}
                refreshControl={flRefreshControl}
              >
                <View style={styles.container}>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{lesson?.title}</Text>
                    <View style={styles.rowContainer}>
                      <Text style={styles.tag}>
                        {renderTagsDependingOnContentType()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      onPress={toggleLike}
                      style={styles.underCompleteTOpacities}
                    >
                      {lesson?.is_liked_by_current_user
                        ? likeOn({ icon: coloredIcon })
                        : like({ icon: coloredIcon })}
                      <Text style={styles.iconText}>{lesson?.like_count}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.underCompleteTOpacities}
                      onPress={onAddToMyList}
                    >
                      {lesson?.is_added_to_primary_playlist
                        ? x({ icon: coloredIcon })
                        : plus({ icon: coloredIcon })}
                      <Text style={styles.iconText}>
                        {lesson?.is_added_to_primary_playlist
                          ? 'Added'
                          : 'My List'}
                      </Text>
                    </TouchableOpacity>

                    {/* {contentType !== 'song' && !refreshing && (
                      <Download_V2
                      
                      />
                    )} */}
                    {!!lesson?.resources?.length && (
                      <TouchableOpacity
                        style={styles.underCompleteTOpacities}
                        onPress={
                          () => {}
                          // this.actionModal.toggleModal()
                        }
                      >
                        {resources({ icon: coloredIcon })}

                        <Text style={styles.iconText}>Resources</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.underCompleteTOpacities}
                      onPress={toggleShowInfo}
                    >
                      {!!showInfo
                        ? infoFilled({ icon: coloredIcon })
                        : info({ icon: coloredIcon })}

                      <Text style={styles.iconText}>Info</Text>
                    </TouchableOpacity>
                    {contentType === 'play-along' && (
                      <TouchableOpacity
                        onPress={toggleVideoAudio}
                        style={styles.underCompleteTOpacities}
                      >
                        {videoType === 'audio'
                          ? watch({ icon: coloredIcon })
                          : listen({ icon: coloredIcon })}

                        <Text style={styles.iconText}>
                          {videoType === 'audio' ? 'Watch' : 'Listen'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {!!showInfo && renderInfo}
                </View>
                {contentType !== 'song' &&
                  !!lesson?.assignments &&
                  renderAssignments}

                <View style={styles.container}>
                  {!!lesson?.related_lessons && (
                    <>
                      <View
                        style={[
                          styles.subtitleContainer,
                          { borderBottomWidth: 0 }
                        ]}
                      >
                        <Text style={styles.subtitle}>RELATED LESSONS</Text>
                      </View>

                      {lesson.related_lessons.map((rl, index) => (
                        <RowCard
                          key={index}
                          id={rl.id}
                          route='lessonPart'
                          onNavigate={() => switchLesson(rl.id)}
                        />
                      ))}
                    </>
                  )}
                </View>
                {!!lesson?.xp_bonus && (
                  <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitle}>COMPLETION BONUS</Text>
                    <View style={[styles.rowContainer, { marginRight: 0 }]}>
                      <Text style={styles.xpText}>{lesson.xp_bonus} XP </Text>
                      {trophy({ icon: greyIcon })}
                    </View>
                  </View>
                )}
                {lesson && (
                  <CommentSection
                    commentsArray={lesson.comments}
                    nrOfComments={lesson.total_comments}
                    lessonId={lesson.id}
                  />
                )}
              </ScrollView>
              {!!selectedAssignment && (
                <SafeView
                  edges={['top', 'bottom']}
                  style={[
                    styles.asssignmentContainer,
                    assignmentFSStyle ? { ...assignmentFSStyle } : {}
                  ]}
                >
                  <AssignmentComponent
                    index={0}
                    title={selectedAssignment.title}
                    sheets={selectedAssignment.sheet_music_image_url}
                    timecode={selectedAssignment.timecode}
                    description={selectedAssignment.description}
                    onSeek={onSeek}
                    onCloseView={onAndroidBack}
                  />

                  {!assignmentFSStyle && (
                    <View style={styles.assignmentBtnContainer}>
                      {!!selectedAssignment.soundslice_slug && (
                        <TouchableOpacity
                          onPress={goToSoundSlice}
                          style={styles.assignmentBtn}
                        >
                          <Text style={styles.buttonText}>PRACTICE</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[
                          styles.assignmentBtn,
                          selectedAssignment.progress === 100
                            ? { backgroundColor: utils.color }
                            : {}
                        ]}
                        onPress={onCompleteAssignment}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            selectedAssignment.progress !== 100
                              ? { color: utils.color }
                              : { color: 'white' }
                          ]}
                        >
                          {selectedAssignment.progress !== 100
                            ? 'COMPLETE ASSIGNMENT'
                            : 'COMPLETED'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </SafeView>
              )}
            </>
          ) : (
            <ActivityIndicator
              size='large'
              style={{ flex: 1 }}
              color={utils.color}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      {selectedAssignment && (
        <Soundslice
          ref={soundsliceRef}
          slug={selectedAssignment.soundslice_slug}
          assignmentId={selectedAssignment?.id}
        />
      )}
      {!refreshing &&
        !item?.apiKey &&
        lesson &&
        !selectedAssignment &&
        !fullscreen && (
          <LessonProgress
            progress={progress}
            previousLessonId={lesson.previous_lesson?.id}
            nextLessonId={lesson.next_lesson?.id}
            onGoToNextLesson={() => switchLesson(lesson.next_lesson.id)}
            onGoToPreviousLesson={() => switchLesson(lesson.previous_lesson.id)}
            onCompleteBtnPress={onLessonProgressBtnPress}
          />
        )}
      <ActionModal
        ref={removeModalRef}
        btnText='REMOVE'
        onAction={toggleMyList}
        onCancel={() => removeModalRef.current?.toggle('', '')}
      />
      <ActionModal
        ref={resetModalRef}
        btnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle('', '')}
      />
      {lesson && (
        <>
          <ActionModal
            ref={completeLessonPage}
            icon={LessonComplete({ icon: { height: 140, width: 200 } })}
            btnText={'START NEXT LESSON'}
            onAction={goToNextLesson}
            onCancel={() => completeLessonPage.current?.toggle('', '')}
          />

          <ActionModal
            ref={completeOverviewPage}
            icon={CourseComplete({ icon: { height: 140, width: 200 } })}
            onAction={goToLessons}
            btnText={`VIEW MORE ${
              contentType === 'coach-stream'
                ? 'LESSON'
                : capitalizeFirstLetter(contentType).toUpperCase()
            }${contentType === 'Student Focus' ? '' : 'S'}`}
            onCancel={() => completeOverviewPage.current?.toggle('', '')}
          />
        </>
      )}
      <ActionModal ref={alert} onCancel={() => alert.current?.toggle()}>
        <TouchableOpacity style={styles.reloadBtn} onPress={onReloadBtnPressed}>
          <Text style={styles.reloadBtnText}>RELOAD LESSON</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 15 }} onPress={toSupport}>
          <Text style={styles.contactSupportText}>CONTACT SUPPORT</Text>
        </TouchableOpacity>
      </ActionModal>
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    lessonContainer: {
      backgroundColor: current.background,
      width: '100%',
      height: '100%'
    },
    videoReplacer: {
      width: '100%',
      aspectRatio: 16 / 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      backgroundColor: current.background
    },
    backBtnContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 15,
      zIndex: 2
    },
    videoPlaceholder: {
      backgroundColor: 'black',
      aspectRatio: 16 / 9,
      justifyContent: 'center'
    },
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,.5)'
    },
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    textContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20
    },
    title: {
      textAlign: 'center',
      marginRight: 15,
      marginLeft: 15,
      padding: 5,
      color: current.textColor,
      fontSize: 18,
      fontFamily: 'OpenSans-Bold'
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
      marginRight: 12
    },
    tag: {
      textAlign: 'center',
      color: current.contrastTextColor,
      fontSize: 12,
      fontFamily: 'OpenSans-Semibold'
    },
    underCompleteTOpacities: {
      flex: 1,
      alignItems: 'center'
    },
    iconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: 10,
      fontFamily: 'OpenSans'
    },
    infoTitle: {
      marginVertical: 10,
      color: current.contrastTextColor,
      fontSize: 12,
      fontFamily: 'OpenSans-Semibold'
    },
    infoText: {
      color: current.textColor,
      fontSize: 12,
      fontFamily: 'OpenSans',
      flex: 1
    },
    xpText: {
      fontSize: 12,
      fontFamily: 'OpenSans-Semibold',
      color: current.contrastTextColor
    },
    subtitleContainer: {
      paddingHorizontal: 15,
      paddingVertical: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: current.borderColor,
      backgroundColor: current.background
    },
    subtitle: {
      color: current.contrastTextColor,
      fontSize: 18,
      fontFamily: 'OpenSans-Bold'
    },
    assignmentCont: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: current.borderColor,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    assignmentBtn: {
      borderColor: utils.color,
      width: '100%',
      marginBottom: 10,
      backgroundColor: current.background,
      borderWidth: 2,
      borderRadius: 25,
      minHeight: 46,
      justifyContent: 'center',
      alignItems: 'center'
    },
    asssignmentContainer: {
      marginTop: -11,
      width: '100%',
      position: 'absolute',
      bottom: 0,
      top: 0,
      backgroundColor: current.background
    },
    additionalTextBtn: {
      fontSize: 12,
      color: utils.color,
      textAlign: 'center',
      fontFamily: 'OpenSans',
      textDecorationLine: 'underline'
    },
    additionalBtn: {
      marginTop: 10,
      borderRadius: 50,
      backgroundColor: utils.color
    },
    additionalBtnText: {
      padding: 15,
      fontSize: 15,
      color: '#ffffff',
      textAlign: 'center',
      fontFamily: 'OpenSans-Bold'
    },
    assignmentBtnContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: current.borderColor
    },
    chapterMarkersCont: {
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: current.borderColor
    },
    playBtn: {
      padding: 8,
      paddingLeft: 9.5,
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 50,
      height: 50,
      width: 50,
      zIndex: 1
    },
    album: {
      borderRadius: 10,
      flex: 1,
      height: '100%'
    },
    assignmentTitle: {
      fontSize: 14,
      fontFamily: 'OpenSans-Bold',
      flex: 1,
      color: current.contrastTextColor
    },
    albumContainer: {
      aspectRatio: 1,
      height: '90%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    videoSettings: {
      color: current.textColor,
      borderColor: current.borderColor,
      backgroundColor: current.background
    },
    divider: {
      borderColor: current.borderColor
    },
    chapterTime: {
      fontSize: 12,
      fontFamily: 'OpenSans-Semibold',
      color: current.contrastTextColor
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      color: utils.color
    },
    reloadBtn: {
      marginTop: 10,
      borderRadius: 50,
      backgroundColor: utils.color
    },
    reloadBtnText: {
      padding: 15,
      fontSize: 15,
      color: '#ffffff',
      textAlign: 'center',
      fontFamily: 'OpenSans-Bold'
    },
    contactSupportText: {
      fontSize: 12,
      color: utils.color,
      textAlign: 'center',
      fontFamily: 'OpenSans',
      textDecorationLine: 'underline'
    }
  });
