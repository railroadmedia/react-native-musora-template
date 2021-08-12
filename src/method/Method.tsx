import React, { useContext, useEffect, useReducer, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { utils } from '../utils';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';
import { Banner } from '../commons/Banner';
import { profileReducer } from '../state/profile/ProfileReducer';
import { UserContext } from '../state/user/UserContext';
import { completedCircle, inProgressCircle } from '../images/svgs';
import { getImageUri } from '../commons/cards/cardhelpers';
import { Gradient } from '../commons/Gradient';
import type {
  IInstructor,
  ILevel,
  IMethod
} from '../state/method/MethodInterfaces';
import { methodService } from '../services/method.service';
import {
  methodReducer,
  UPDATE_METHOD_LOADERS
} from '../state/method/MethodReducer';
import { SET_METHOD } from '../state/method/MethodReducer';
import { NextLesson } from '../commons/NextLesson';
import { CardsContext } from '../state/cards/CardsContext';

const window = Dimensions.get('window');
let windowW = window.width < window.height ? window.width : window.height;

export const Method: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const { user: cachedUser } = useContext(UserContext);

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());

  const [{ method, refreshing }, dispatch] = useReducer(methodReducer, {
    refreshing: true
  });

  const [{ user }] = useReducer(profileReducer, {
    user: cachedUser
  });

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    setMethod();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const setMethod = (): Promise<void> =>
    methodService.getMethod(abortC.current.signal).then(methodRes => {
      if (isMounted.current) {
        const castMethod: IMethod = methodRes as IMethod;
        addCards([castMethod.next_lesson]);
        dispatch({
          type: SET_METHOD,
          method: castMethod,
          refreshing: false
        });
      }
    });

  const refresh = (): void => {
    abortC.current.abort();
    abortC.current = new AbortController();
    dispatch({
      type: UPDATE_METHOD_LOADERS,
      refreshing: true
    });
    setMethod();
  };

  const onLevelPress = (
    mobile_app_url: string,
    published_on: string,
    level_rank: string
  ): void => {};

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {method?.id ? (
        <React.Fragment>
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => refresh()}
                colors={[utils.color]}
                tintColor={utils.color}
              />
            }
          >
            <Banner
              {...method}
              isBig={false}
              onRightBtnPress={() => {}}
              onLeftBtnPress={() => {}}
            />

            <View style={styles.container}>
              <View style={styles.profileContainer}>
                <Image
                  style={styles.profilePicture}
                  source={{ uri: user?.avatarUrl }}
                />
                <Text style={styles.levelText}>LEVEL {method?.level_rank}</Text>
              </View>
              {method?.levels.map((l: ILevel, index: number) => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() =>
                    onLevelPress(
                      l.mobile_app_url,
                      l.published_on,
                      method?.level_rank
                    )
                  }
                  style={styles.levelBtn}
                >
                  <ImageBackground
                    resizeMethod='resize'
                    imageStyle={{ borderRadius: 5 }}
                    source={{
                      uri: getImageUri(
                        l.thumbnail_url,
                        l.published_on,
                        'method'
                      )
                    }}
                    style={{
                      aspectRatio: 1,
                      width: windowW / 4
                    }}
                  >
                    {new Date(l.published_on) < new Date() && (
                      <View style={styles.gradientContainer}>
                        <Gradient
                          colors={[
                            'transparent',
                            'transparent',
                            utils.getColorWithAlpha(60),
                            utils.getColorWithAlpha(100)
                          ]}
                          height={'100%'}
                          width={'100%'}
                        />
                      </View>
                    )}
                    <View style={styles.greyBackground}>
                      <Text style={styles.levelOverImg}>LEVEL {index + 1}</Text>
                      <View
                        style={[
                          styles.progressOverlay,
                          {
                            backgroundColor:
                              l.progress_percent === 100
                                ? 'rgba(11, 118, 219, .5)'
                                : l.progress_percent > 0
                                ? 'rgba(0, 0, 0, .5)'
                                : 'transparent'
                          }
                        ]}
                      >
                        {l.progress_percent === 100
                          ? completedCircle({
                              icon: {
                                fill: '#ffffff',
                                width: windowW / 10,
                                height: windowW / 10
                              }
                            })
                          : l.progress_percent > 0
                          ? inProgressCircle({
                              icon: {
                                fill: '#ffffff',
                                width: windowW / 10,
                                height: windowW / 10
                              }
                            })
                          : null}
                      </View>
                    </View>
                  </ImageBackground>

                  <View style={styles.instructorContainer}>
                    {!!l.instructor && (
                      <Text
                        numberOfLines={1}
                        style={styles.artist}
                        ellipsizeMode={'tail'}
                      >
                        {l.instructor
                          .map((i: IInstructor) => i.name)
                          .join(', ')
                          .toUpperCase()}
                      </Text>
                    )}
                    {!!l.title && (
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.levelTitle,
                          {
                            color:
                              new Date(l.published_on) < new Date()
                                ? themeStyles[theme].textColor
                                : themeStyles[theme].contrastTextColor
                          }
                        ]}
                      >
                        {l.title}
                      </Text>
                    )}
                    {!!l.description && (
                      <Text style={styles.levelDescription} numberOfLines={3}>
                        {l.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {method?.next_lesson && (
            <NextLesson
              item={method.next_lesson.id}
              text={`METHOD - ${method.progress_percent.toFixed(2)}% COMPLETE`}
              progress={method.progress_percent}
            />
          )}
        </React.Fragment>
      ) : (
        <ActivityIndicator
          size={'large'}
          style={{ flex: 1 }}
          color={utils.color}
        />
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
    greyBackground: {
      width: '100%',
      height: '100%',
      borderRadius: 5,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,.5)'
    },
    levelOverImg: {
      color: 'white',
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    progressOverlay: {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 5,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center'
    },
    artist: {
      fontSize: utils.figmaFontSizeScaler(8),
      color: utils.color,
      fontFamily: 'OpenSans-Bold'
    },
    placeHolder: {
      position: 'absolute',
      height: '50%',
      bottom: 0,
      width: '100%'
    },
    levelBtn: {
      padding: 15,
      alignItems: 'center',
      flexDirection: 'row'
    },
    profilePicture: {
      height: 50,
      aspectRatio: 1,
      borderRadius: 25
    },
    profileContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      paddingVertical: 15
    },
    levelText: {
      fontSize: utils.figmaFontSizeScaler(30),
      fontFamily: 'OpenSans-Bold',
      marginLeft: 10,
      color: current.textColor
    },
    levelTitle: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans-Bold'
    },
    levelDescription: {
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    gradientContainer: {
      height: '100%',
      position: 'absolute',
      width: '100%',
      bottom: 0
    },
    instructorContainer: {
      flex: 1,
      paddingHorizontal: 10,
      justifyContent: 'center'
    }
  });