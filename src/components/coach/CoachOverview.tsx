import React, {
  useMemo,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef
} from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  StyleSheet,
  BackHandler,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  NativeScrollEvent,
  NativeScrollSize,
  NativeScrollPoint,
  Dimensions
} from 'react-native';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { Gradient } from '../../common_components/Gradient';
import { back, info, infoFilled } from '../../images/svgs';
import { OrientationContext } from '../../state/orientation/OrientationContext';
import { coachesService } from '../../services/coaches.service';
import type { Coach } from '../../interfaces/coach.interface';
import { CardsContext } from '../../state/cards/CardsContext';
import { CommentSection } from '../../common_components/lesson/CommentSection';
import { Carousel } from '../catalogue/Carousel';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

const iconStyle = { width: 30, height: 30, fill: 'white' };

interface Props {
  route: RouteProp<ParamListBase, 'coachOverview'> & {
    params: {
      id: number;
    };
  };
}

export const CoachOverview: React.FC<Props> = ({
  route: {
    params: { id }
  }
}) => {
  const { navigate, goBack } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props?: {}) => void;
    }
  >();
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { theme } = useContext(ThemeContext);
  const { isLandscape } = useContext(OrientationContext);
  const { addCards } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [coach, setCoach] = useState<Coach>();
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const commentSectionRef =
    useRef<React.ElementRef<typeof CommentSection>>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const getAspectRatio = useMemo(() => {
    if (utils.isTablet) {
      if (isLandscape) return 2.5;
      return 2;
    }
    return 1.2;
  }, [isLandscape]);

  const greaterWDim = useMemo(() => {
    const window = Dimensions.get('window');
    return window.width < window.height ? window.width : window.height;
  }, [isLandscape]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getCoach();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getCoach = () => {
    if (!isConnected) return showNoConnectionAlert();
    coachesService
      .getContent(id, abortC.current.signal)
      .then((coachRes: Coach) => {
        console.log(coachRes);
        if (isMounted.current) {
          addCards(coachRes.lessons);
          setCoach(coachRes);
          setRefreshing(false);
          setLoading(false);
        }
      });
  };

  const refresh = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    setRefreshing(true);
    getCoach();
  }, [getCoach, isConnected]);

  const toggleShowInfo = useCallback(() => {
    setShowInfo(!showInfo);
  }, [showInfo]);

  const renderHeader = (
    <>
      <View style={[styles.bannerContainer, { aspectRatio: getAspectRatio }]}>
        <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
          {back({
            icon: {
              fill: themeStyles[theme].textColor,
              height: 15,
              width: 15
            }
          })}
        </TouchableOpacity>
        <Image
          resizeMode={'cover'}
          source={{
            uri: `https://cdn.musora.com/image/fetch/w_${
              greaterWDim >> 0
            },ar_${getAspectRatio},fl_lossy,q_auto:good,c_fill,g_face/${
              coach?.head_shot_picture_url
            }`
          }}
          style={styles.picture}
        />
        <View style={styles.gradientContainer}>
          <Gradient
            colors={['transparent', 'transparent', utils.color]}
            height={'100%'}
            width={'100%'}
          />
        </View>

        <View style={styles.bannertextContainer}>
          <View style={styles.sideBtn} />
          <Text numberOfLines={2} style={styles.coachName}>
            {coach?.name}
          </Text>
          <TouchableOpacity style={styles.sideBtn} onPress={toggleShowInfo}>
            {showInfo
              ? infoFilled({ icon: iconStyle })
              : info({ icon: iconStyle })}
            <Text style={styles.infoText}>Info</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showInfo && (
        <Text style={styles.coachDescription}>{coach?.biography}</Text>
      )}
    </>
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

  const loadMoreComments = useCallback(
    ({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
      if (isConnected && isCloseToBottom(nativeEvent))
        commentSectionRef?.current?.loadMoreComments();
    },
    [isCloseToBottom, commentSectionRef]
  );

  const goToSeeAll = useCallback(
    (title: string, seeAllFetcher: string) => {
      if (!isConnected) return showNoConnectionAlert();

      navigate('seeAll', {
        title,
        fetcher: { scene: 'coaches', fetcherName: seeAllFetcher }
      });
    },
    [isConnected]
  );

  const renderCarousel = (items: number[] | undefined, title: string) => {
    let seeAllFetcher = '';
    switch (title) {
      case 'Upcoming Live Events':
        seeAllFetcher = 'getContent';
        break;
      case 'Recorded Events':
        seeAllFetcher = 'getContent';
        break;
    }
    return items?.length ? (
      <>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => goToSeeAll(title, seeAllFetcher)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <Carousel items={items} />
      </>
    ) : null;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size='large'
          color={utils.color}
          animating={loading}
          style={styles.container}
        />
      ) : (
        <>
          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps='handled'
            onScroll={loadMoreComments}
            refreshControl={flRefreshControl}
          >
            {renderHeader}
            {renderCarousel(
              coach?.lessons.map(lesson => lesson.id),
              'Upcoming Live Events'
            )}
            {renderCarousel(
              coach?.lessons.map(lesson => lesson.id),
              'Recorded Events'
            )}

            {coach && (
              <CommentSection
                lessonId={coach.id}
                commentsArray={coach.comments}
                nrOfComments={coach.total_comments}
                ref={commentSectionRef}
              />
            )}
          </ScrollView>

          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>
              {`SUBSCRIBE TO ${coach?.name.toUpperCase()}'S CALENDAR`}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
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
    gradientContainer: {
      height: '100%',
      position: 'absolute',
      width: '100%',
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    linearGradient: {
      bottom: 0,
      width: '100%',
      height: '100%',
      position: 'absolute'
    },
    bannerContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    bannertextContainer: {
      paddingHorizontal: 15,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    coachName: {
      fontSize: 30,
      color: 'white',
      fontWeight: '400',
      textAlign: 'center',
      textTransform: 'uppercase',
      fontFamily: 'RobotoCondensed-Regular',
      maxWidth: '80%',
      includeFontPadding: false,
      textAlignVertical: 'center'
    },
    coachDescription: {
      color: 'white',
      textAlign: 'center',
      padding: 20,
      backgroundColor: utils.color
    },
    lessonsCommentsText: {
      flex: 1,
      fontSize: 20,
      paddingLeft: 10,
      color: current.contrastTextColor,
      fontFamily: 'RobotoCondensed-Bold'
    },
    picture: {
      width: '100%',
      height: '100%'
    },
    sideBtn: {
      flex: 1,
      alignItems: 'center'
    },
    infoText: {
      textAlign: 'center',
      color: 'white'
    },
    sectionTitle: {
      fontSize: utils.figmaFontSizeScaler(20),
      fontFamily: 'OpenSans',
      fontWeight: '700',
      color: current.textColor,
      marginVertical: 20,
      marginHorizontal: 10,
      flex: 1
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    seeAll: {
      color: utils.color,
      padding: 10
    },
    subscribeBtn: {
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: utils.color,
      position: 'absolute',
      alignSelf: 'center',
      bottom: 10
    },
    subscribeBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      color: 'white',
      paddingHorizontal: 15
    }
  });
