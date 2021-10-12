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
  ViewStyle,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
  NativeScrollSize,
  NativeScrollPoint
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Rate, { AndroidMarket } from 'react-native-rate';
import Video from 'RNVideoEnhanced';
import { Download_V2, DownloadResources, offlineContent } from 'RNDownload';

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
  LessonResponse,
  Resource,
  ResourceWithExtension,
  SelectedAssignment
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
import {
  capitalizeFirstLetter,
  decideExtension,
  formatTime,
  getExtensionByType,
  getProgress,
  getSheetWHRatio
} from './helpers';
import { userService } from '../../services/user.service';
import type {
  CompletedResponse,
  ResetProgressResponse
} from '../../interfaces/user.interfaces';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

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
    params: { id, parentId, contentType, item }
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
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [videoType, setVideoType] = useState<'audio' | 'video'>('video');
  const [assignmentFSStyle, setAssignmentFSStyle] = useState<ViewStyle | null>(
    null
  );
  const [selectedAssignment, setSelectedAssignment] =
    useState<SelectedAssignment | null>(null);
  const [incompleteLessonId, setIncompleteLessonId] = useState<
    number | undefined
  >(-1);
  const [progress, setProgress] = useState(0);
  const [resourcesArr, setResourcesArr] = useState<ResourceWithExtension[]>([]);

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { isLandscape } = useContext(OrientationContext);
  const { addCards } = useContext(CardsContext);

  const abortC = useRef(new AbortController());
  const isMounted = useRef(true);
  const video = useRef<any>(null);
  const soundsliceRef = useRef<SoundsliceRefObj>(null);
  const alert = useRef<React.ElementRef<typeof ActionModal>>(null);
  const removeModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);
  const completeLessonPage = useRef<React.ElementRef<typeof ActionModal>>(null);
  const completeOverviewPage =
    useRef<React.ElementRef<typeof ActionModal>>(null);
  const commentSectionRef =
    useRef<React.ElementRef<typeof CommentSection>>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const overviewCompleteText = useMemo(() => {
    let type = '';
    if (contentType === 'coach-stream') {
      type = 'Lesson';
    } else if (
      contentType === 'method' &&
      lesson?.is_last_incomplete_course_from_level
    ) {
      type = 'Level';
    } else if (
      contentType === 'method' &&
      !lesson?.is_last_incomplete_course_from_level
    ) {
      type = 'Course';
    } else if (lesson?.parent?.next_bundle) {
      type = 'Pack bundle';
    } else {
      type = capitalizeFirstLetter(contentType);
    }
    return type + ' complete';
  }, [
    contentType,
    lesson?.parent,
    lesson?.is_last_incomplete_course_from_level
  ]);

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

  const downloadContent = useMemo(() => {
    return new Promise<{}>(async res =>
      lesson
        ? res(
            contentService.getContentById(
              lesson?.id,
              true,
              abortC.current.signal
            )
          )
        : res({})
    );
  }, [lesson?.id]);

  const isCloseToBottom = useCallback(
    ({
      layoutMeasurement,
      contentOffset,
      contentSize
    }: {
      layoutMeasurement: NativeScrollSize;
      contentOffset: NativeScrollPoint;
      contentSize: NativeScrollSize;
    }) => layoutMeasurement.height + contentOffset.y >= contentSize.height - 40,
    []
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

  const createResourcesArr = useCallback((lessonResources: Resource[]) => {
    const extensions = ['mp3', 'pdf', 'zip'];

    lessonResources.forEach((resource: Resource) => {
      let extension = decideExtension(resource.resource_url);
      resource.extension = extension;
      if (!extensions.includes(extension)) {
        fetch(resource.resource_url)
          .then((res: any) => {
            extension = getExtensionByType(res?.headers?.map['content-type']);
            setResourcesArr(
              lessonResources.map((r: Resource) =>
                r.resource_id === resource.resource_id
                  ? { ...r, extension, wasWithoutExtension: true }
                  : r
              )
            );
          })
          .catch(() => {});
      } else {
        setResourcesArr(
          lessonResources.map((r: Resource) =>
            r.resource_id === resource.resource_id ? { ...r, extension } : r
          )
        );
      }
    });
  }, []);

  const getLesson = useCallback(
    async (lessonId: number) => {
      let content: LessonResponse;
      if (!isConnected) {
        content = offlineContent[lessonId]?.lesson;
        if (!content) {
          content = offlineContent[parentId].overview?.lessons.find(
            (l: { id: number }) => l.id === lessonId
          );
        }

        handleNeighbourLesson(
          { ...content, parent_id: parentId },
          'next_lesson'
        );
        handleNeighbourLesson(
          { ...content, parent_id: parentId },
          'previous_lesson'
        );
      } else {
        content = await contentService.getContentById(
          lessonId,
          false,
          abortC.current.signal
        );
        if (content.title && content.message) {
          return alert.current?.toggle(content.title, content.message);
        }
      }
      setLesson(content);
      setProgress(getProgress(content.user_progress));
      setIncompleteLessonId(
        content.type === 'course-part'
          ? content.next_lesson?.id
          : content.parent?.next_lesson?.id
      );
      addCards(content.related_lessons);
      setRefreshing(false);
      if (contentType === 'Play Along') {
        setVideoType('audio');
      }
      if (content.resources) createResourcesArr(content.resources);
      if (
        contentType !== 'song' &&
        !content.video_playback_endpoints &&
        !content?.youtube_video_id
      ) {
        alert.current?.toggle(
          `We're sorry, there was an issue loading this video, try reloading the lesson.`,
          `If the problem persists please contact support.`
        );
      }
    },
    [alert, contentType, createResourcesArr, addCards, isConnected]
  );

  const handleNeighbourLesson = (
    content: {
      id: number;
      next_lesson?: { id: number };
      previous_lesson?: { id: number };
      parent_id?: number;
    },
    side: 'next_lesson' | 'previous_lesson'
  ) => {
    let id = content[side]?.id;
    delete content[side];

    if (id) {
      if (offlineContent[id]) {
        content[side] = { id };
      }
    } else if (content.parent_id && offlineContent[content.parent_id]) {
      let contentIndex = 0;
      offlineContent[content.parent_id]?.overview?.lessons.find(
        (l: any, i: number) => {
          if (l.id === lesson?.id) contentIndex = i;
        }
      );
      if (offlineContent[content.parent_id].overview?.lessons[contentIndex - 1])
        content.previous_lesson = {
          id: offlineContent[content.parent_id].overview?.lessons[
            contentIndex - 1
          ].id
        };
      if (offlineContent[content.parent_id].overview?.lessons[contentIndex + 1])
        content.next_lesson = {
          id: offlineContent[content.parent_id].overview?.lessons[
            contentIndex + 1
          ].id
        };
    }
  };

  const onAndroidBack = useCallback(() => {
    if (assignmentFSStyle) setAssignmentFSStyle(null);
    else if (selectedAssignment) setSelectedAssignment(null);
    else if (fullscreen) video.current?.handleBack();
    else goBack();
    return true;
  }, [assignmentFSStyle, selectedAssignment, fullscreen, goBack]);

  const onNoVideoBack = useCallback(() => {
    if (!utils.isTablet) Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    goBack();
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onAndroidBack);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBack);
    };
  }, [onAndroidBack]);

  const toggleResourcesModal = useCallback(() => {
    setShowResourcesModal(!showResourcesModal);
  }, [showResourcesModal]);

  const createMp3sArray = () => {
    if (!lesson || contentType !== 'Play Along') return;

    let mp3s = [];
    if (lesson.mp3_no_drums_no_click_url)
      mp3s.push({
        id: 'mp3_no_drums_no_click_url',
        key: 'mp3_no_drums_no_click_url',
        value: lesson.mp3_no_drums_no_click_url
      });
    if (lesson.mp3_no_drums_yes_click_url)
      mp3s.push({
        id: 'mp3_no_drums_yes_click_url',
        key: 'mp3_no_drums_yes_click_url',
        value: lesson.mp3_no_drums_yes_click_url
      });

    if (lesson.mp3_yes_drums_no_click_url)
      mp3s.push({
        id: 'mp3_yes_drums_no_click_url',
        key: 'mp3_yes_drums_no_click_url',
        value: lesson.mp3_yes_drums_no_click_url
      });

    if (lesson.mp3_yes_drums_yes_click_url)
      mp3s.push({
        id: 'mp3_yes_drums_yes_click_url',
        key: 'mp3_yes_drums_yes_click_url',
        value: lesson.mp3_yes_drums_yes_click_url
      });

    return mp3s;
  };

  const refresh = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    if (!lesson) return;

    setRefreshing(true);
    getLesson(lesson.id);
  }, [lesson?.id, getLesson, isConnected]);

  const renderTagsDependingOnContentType = useCallback(() => {
    const {
      xp,
      type,
      style,
      artist,
      difficulty,
      instructor,
      parent,
      published_on,
      level_position,
      course_position
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
    const levelTag = 'LEVEL ' + level_position + '.' + course_position + ' | ';
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
      case 'method':
        return instructorTag + levelTag + xpTag;
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
  }, [lesson]);

  const toggleMyList = useCallback(() => {
    if (!lesson) return;

    if (lesson.is_added_to_primary_playlist) {
      userService.removeFromMyList(lesson.id);
      removeModalRef.current?.toggle();
    } else {
      userService.addToMyList(lesson.id);
    }
    setLesson({
      ...lesson,
      is_added_to_primary_playlist: !lesson.is_added_to_primary_playlist
    });
  }, [lesson, removeModalRef]);

  const toggleVideoAudio = useCallback(() => {
    setVideoType(videoType === 'audio' ? 'video' : 'audio');
  }, [videoType]);

  const selectAssignment = useCallback(
    async (assignment: Assignment, index: number) => {
      setSelectedAssignment({
        ...assignment,
        index,
        progress: getProgress(assignment.user_progress),
        sheet_music_image_url: assignment.sheet_music_image_url
          ? await getSheetWHRatio(assignment.sheet_music_image_url)
          : undefined
      });
    },
    []
  );

  const goToSoundSlice = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    soundsliceRef.current?.toggleSoundslice();
  }, [soundsliceRef, isConnected]);

  const onAddToMyList = useCallback(() => {
    if (lesson?.is_added_to_primary_playlist) {
      removeModalRef.current?.toggle(
        'Hold your horses...',
        `This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`
      );
    } else {
      toggleMyList();
    }
  }, [removeModalRef, lesson?.is_added_to_primary_playlist, toggleMyList]);

  const toggleShowInfo = useCallback(() => {
    setShowInfo(!showInfo);
  }, [showInfo]);

  const switchLesson = useCallback(
    (lessonId: number) => {
      setSelectedAssignment(null);
      setShowInfo(false);
      setRefreshing(true);
      getLesson(lessonId);
    },
    [getLesson]
  );

  const goToLessons = useCallback(() => {
    if (!lesson) return;

    completeOverviewPage.current?.toggle();
    setRefreshing(true);

    if (contentType === 'pack') {
      if (lesson.parent?.next_bundle?.id) {
        navigate('packOverview', { id: lesson.parent?.next_bundle?.id });
      } else {
        navigate('packs');
      }
    } else if (contentType === 'method') {
      if (!lesson.is_last_incomplete_course_from_level) {
        navigate('courseOverview', {
          mobile_app_url: lesson.next_course.mobile_app_url,
          isMethod: true
        });
      } else if (lesson.is_last_incomplete_course_from_level) {
        navigate('level', { mobile_app_url: lesson.next_level.mobile_app_url });
      }
    } else {
      let route: string = contentType.replace(' ', '');
      route =
        route.charAt(0).toLowerCase() + route.slice(1, contentType.length);
      if (route !== 'studentFocus') route += 's';

      navigate(route);
    }
  }, [completeOverviewPage, lesson, contentType]);

  const goToNextLesson = useCallback(() => {
    if (!lesson) return;

    completeLessonPage.current?.toggle();
    if (incompleteLessonId) {
      getLesson(incompleteLessonId);
    }
  }, [completeLessonPage, lesson, incompleteLessonId, getLesson]);

  const goToMarket = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

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
  }, [isConnected]);

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

  const onComplete = useCallback(
    async (assignmentId?: number) => {
      if (!isConnected) return showNoConnectionAlert();

      if (!lesson) return;
      const res: CompletedResponse = await userService.markAsComplete(
        assignmentId || lesson.id
      );
      let incompleteAssignments: number;
      if (assignmentId) {
        incompleteAssignments = lesson.assignments.filter(
          (a: Assignment) =>
            a.user_progress[0]?.progress_percent !== 100 &&
            a.id !== assignmentId
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
        if (contentType === 'method') {
          if (!lesson.is_last_incomplete_lesson_from_course) {
            completeLessonPage.current?.toggle(
              'Lesson complete',
              `You earned ${lesson.xp} XP!`
            );
          } else if (!lesson.is_last_incomplete_course_from_level) {
            completeOverviewPage.current?.toggle(
              overviewCompleteText,
              `You earned ${lesson.current_course.xp} XP!`
            );
          } else if (lesson.is_last_incomplete_course_from_level) {
            completeOverviewPage.current?.toggle(
              overviewCompleteText,
              `You earned ${lesson.current_level.xp} XP!`
            );
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
      contentType,
      incompleteLessonId,
      lesson,
      overviewCompleteText,
      progress,
      selectedAssignment,
      showRatingModal,
      isConnected
    ]
  );

  const onCompleteAssignment = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

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
  }, [selectedAssignment, resetModalRef, onComplete, isConnected]);

  const onLessonProgressBtnPress = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    if (progress === 100) {
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
    } else {
      onComplete();
    }
  }, [progress, resetModalRef, onComplete, isConnected]);

  const resetProgress = useCallback(async () => {
    if (!isConnected) return showNoConnectionAlert();

    if (!lesson) return;

    const resetId = selectedAssignment ? selectedAssignment.id : lesson.id;
    resetModalRef.current?.toggle();
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
  }, [lesson, selectedAssignment, isConnected]);

  const onSeek = useCallback(
    (timeCode: number | string) => {
      video.current?.onSeek(timeCode);
    },
    [video]
  );

  const togglePausedVideo = useCallback(() => {
    if (video) {
      video.current?.togglePaused(true, true);
    }
  }, [video]);

  const toSupport = useCallback(() => {
    alert.current?.toggle();
    togglePausedVideo();
    navigate('support');
  }, [alert, togglePausedVideo, navigate]);

  const onEndLive = useCallback(() => {
    if (lesson) {
      setTimeout(() => {
        setLesson({ ...lesson, isLive: false });
      }, 15 * 60000);
    }
  }, [lesson]);

  const onStartLive = useCallback(() => {
    if (lesson) {
      setTimeout(() => {
        setLesson({ ...lesson, isLive: true });
      }, 15 * 60000);
    }
  }, [lesson]);

  const onUpdateVideoProgress = useCallback(
    async (
      videoId: number,
      contentId: number,
      lengthInSec: number,
      currentTime: number,
      mediaCategory: string
    ) => {
      if (!isConnected) return;
      userService.updateUsersVideoProgress(
        (
          await userService.getMediaSessionId(
            videoId,
            contentId,
            lengthInSec,
            mediaCategory
          )
        )?.session_id?.id,
        currentTime,
        lengthInSec,
        contentId,
        mediaCategory,
        'video'
      );
    },
    [isConnected]
  );

  const onFullscreen = useCallback(
    (isFullscreen: boolean) => {
      setFullscreen(isFullscreen);
      setTimeout(
        () =>
          StatusBar.setBarStyle(
            utils.isiOS
              ? 'light-content'
              : theme === 'DARK'
              ? 'light-content'
              : 'dark-content'
          ),
        500
      );
    },
    [theme]
  );

  const onReloadBtnPressed = useCallback(() => {
    refresh();
    alert.current?.toggle();
  }, [alert, refresh]);

  const onSheetDoubleTapped = useCallback((hide: boolean) => {
    setAssignmentFSStyle(
      hide
        ? {
            zIndex: 10,
            width: '100%',
            position: 'absolute',
            top: 0,
            bottom: 0
          }
        : null
    );
  }, []);

  const loadMoreComments = useCallback(
    ({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
      if (isCloseToBottom(nativeEvent))
        commentSectionRef?.current?.loadMoreComments();
    },
    [isCloseToBottom, commentSectionRef]
  );

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
              onPress={() => onSeek(c.chapter_timecode)}
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
              onPress={onNoVideoBack}
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
          <Video
            repeat={false}
            paused={true}
            type={videoType}
            showControls={true}
            youtubeId={lesson.youtube_video_id}
            onRefresh={refresh}
            live={!!item?.apiKey}
            toSupport={toSupport}
            ref={video}
            onBack={onAndroidBack}
            content={{
              ...lesson,
              lastWatchedPosInSec: lesson.last_watch_position_in_seconds,
              lengthInSec: lesson.length_in_seconds,
              thumbnailUrl: lesson.thumbnail_url,
              videoId: lesson.vimeo_video_id,
              signal: abortC.current.signal,
              endTime: `${lesson.live_event_end_time} UTC`,
              startTime: `${lesson.live_event_start_time} UTC`,
              formatTime: formatTime,
              nextLessonId: lesson.next_lesson?.id,
              previousLessonId: lesson.previous_lesson?.id,
              mp3s: createMp3sArray()
            }}
            connection={isConnected}
            maxWidth={undefined}
            onEndLive={onEndLive}
            onStartLive={onStartLive}
            onFullscreen={(isFullscreen: boolean) => onFullscreen(isFullscreen)}
            goToNextLesson={() => switchLesson(lesson.next_lesson.id)}
            goToPreviousLesson={() => switchLesson(lesson.previous_lesson.id)}
            onUpdateVideoProgress={(
              videoId: number,
              id: number,
              lengthInSec: number,
              currentTime: number,
              mediaCategory: string
            ) =>
              onUpdateVideoProgress(
                videoId,
                id,
                lengthInSec,
                currentTime,
                mediaCategory
              )
            }
            styles={{
              timerCursorBackground: utils.color,
              beforeTimerCursorBackground: utils.color,
              settings: {
                cancel: { color: utils.color },
                selectedOptionTextColor: utils.color,
                separatorColor: styles.videoSettings.borderColor,
                background: styles.videoSettings.backgroundColor,
                optionsBorderColor: styles.videoSettings.borderColor,
                unselectedOptionTextColor: styles.videoSettings.color,
                save: { backgroundColor: utils.color, color: 'white' },
                downloadIcon: {
                  width: 20,
                  height: 20,
                  fill: utils.color
                }
              },
              alert: {
                titleTextColor: styles.videoSettings.color,
                subtitleTextColor: styles.videoSettings.color,
                background: styles.videoSettings.backgroundColor,
                contactSupport: { color: styles.videoSettings.color },
                reloadLesson: {
                  color: 'white',
                  background: utils.color
                }
              }
            }}
          />
        )
      )}
      <KeyboardAvoidingView
        style={[styles.container, { ...assignmentFSStyle }]}
        behavior={utils.isiOS ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {!refreshing ? (
            <>
              <ScrollView
                style={styles.container}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps='handled'
                onMomentumScrollEnd={loadMoreComments}
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
                    {isConnected && (
                      <>
                        <TouchableOpacity
                          onPress={toggleLike}
                          style={styles.underCompleteTOpacities}
                        >
                          {lesson?.is_liked_by_current_user
                            ? likeOn({ icon: coloredIcon })
                            : like({ icon: coloredIcon })}
                          <Text style={styles.iconText}>
                            {lesson?.like_count}
                          </Text>
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
                      </>
                    )}
                    {contentType !== 'song' && !refreshing && lesson && (
                      <Download_V2
                        entity={{
                          id: lesson.id,
                          comments: lesson.comments,
                          content: downloadContent
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
                            alertTextTitleColor: styles.title.color,
                            alertTextMessageColor: styles.title.color,
                            alertTextTitleFontFamily: 'OpenSans-Bold',
                            alertTouchableTextCancelColor: utils.color,
                            alertTouchableDeleteBackground: utils.color,
                            alertBackground: styles.container.backgroundColor,
                            alertTouchableTextDeleteFontFamily: 'OpenSans-Bold',
                            alertTouchableTextCancelFontFamily: 'OpenSans-Bold'
                          }
                        }}
                      />
                    )}
                    {!!lesson?.resources?.length && (
                      <TouchableOpacity
                        style={styles.underCompleteTOpacities}
                        onPress={toggleResourcesModal}
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
                    {contentType === 'Play Along' && (
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
                    ref={commentSectionRef}
                  />
                )}
              </ScrollView>
              {!!selectedAssignment && (
                <SafeAreaView
                  edges={['top', 'bottom']}
                  style={[
                    styles.asssignmentContainer,
                    assignmentFSStyle ? { ...assignmentFSStyle } : {}
                  ]}
                >
                  <AssignmentComponent
                    assignment={selectedAssignment}
                    onSeek={onSeek}
                    onCloseView={onAndroidBack}
                    onSheetDoubleTapped={onSheetDoubleTapped}
                  />

                  {isConnected && !assignmentFSStyle && (
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
                </SafeAreaView>
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
      {isConnected &&
        !refreshing &&
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
        primaryBtnText='REMOVE'
        onAction={toggleMyList}
        onCancel={() => removeModalRef.current?.toggle()}
      />
      <ActionModal
        ref={resetModalRef}
        primaryBtnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle()}
      />
      {lesson && (
        <>
          <ActionModal
            ref={completeLessonPage}
            icon={LessonComplete({ icon: { height: 140, width: 200 } })}
            primaryBtnText={'START NEXT LESSON'}
            onAction={goToNextLesson}
          />

          <ActionModal
            ref={completeOverviewPage}
            icon={CourseComplete({ icon: { height: 140, width: 200 } })}
            onAction={goToLessons}
            primaryBtnText={`VIEW MORE ${
              contentType === 'coach-stream'
                ? 'LESSON'
                : capitalizeFirstLetter(contentType).toUpperCase()
            }${contentType === 'Student Focus' ? '' : 'S'}`}
          />
        </>
      )}
      <ActionModal ref={alert}>
        <TouchableOpacity style={styles.reloadBtn} onPress={onReloadBtnPressed}>
          <Text style={styles.reloadBtnText}>RELOAD LESSON</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 15 }} onPress={toSupport}>
          <Text style={styles.contactSupportText}>CONTACT SUPPORT</Text>
        </TouchableOpacity>
      </ActionModal>
      {lesson && (
        <Modal
          transparent={true}
          visible={showResourcesModal}
          onRequestClose={toggleResourcesModal}
          supportedOrientations={['portrait', 'landscape']}
          animationType='slide'
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleResourcesModal}
            style={styles.resourcesModal}
          >
            <View style={styles.resourcesModalContent}>
              <DownloadResources
                styles={{
                  container: {
                    backgroundColor: themeStyles[theme].background
                  },
                  touchableTextResourceNameFontFamily: 'OpenSans',
                  touchableTextResourceExtensionFontFamily: 'OpenSans',
                  touchableTextResourceCancelFontFamily: 'OpenSans',
                  borderColor: themeStyles[theme].borderColor,
                  color: themeStyles[theme].textColor
                }}
                resources={resourcesArr}
                lessonTitle={lesson.title}
                onClose={toggleResourcesModal}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
      fontSize: utils.figmaFontSizeScaler(18),
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
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans-Semibold'
    },
    underCompleteTOpacities: {
      flex: 1,
      alignItems: 'center'
    },
    iconText: {
      marginTop: 5,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    infoTitle: {
      marginVertical: 10,
      color: current.contrastTextColor,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans-Semibold'
    },
    infoText: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      flex: 1
    },
    xpText: {
      fontSize: utils.figmaFontSizeScaler(12),
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
      fontSize: utils.figmaFontSizeScaler(18),
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
      fontSize: utils.figmaFontSizeScaler(12),
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
      fontSize: utils.figmaFontSizeScaler(15),
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
      fontSize: utils.figmaFontSizeScaler(14),
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
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans-Semibold',
      color: current.contrastTextColor
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: utils.color
    },
    reloadBtn: {
      marginTop: 10,
      borderRadius: 50,
      backgroundColor: utils.color
    },
    reloadBtnText: {
      padding: 15,
      fontSize: utils.figmaFontSizeScaler(15),
      color: '#ffffff',
      textAlign: 'center',
      fontFamily: 'OpenSans-Bold'
    },
    contactSupportText: {
      fontSize: utils.figmaFontSizeScaler(12),
      color: utils.color,
      textAlign: 'center',
      fontFamily: 'OpenSans',
      textDecorationLine: 'underline'
    },
    resourcesModal: {
      backgroundColor: 'rgba(0, 0, 0, .8)',
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    resourcesModalContent: {
      width: '100%',
      maxHeight: 300,
      alignSelf: 'flex-end'
    }
  });
