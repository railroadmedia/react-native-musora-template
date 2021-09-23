import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';
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
import { useNavigation } from '@react-navigation/native';

import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { MethodBanner } from '../../common_components/MethodBanner';
import { UserContext } from '../../state/user/UserContext';
import { completedCircle, inProgressCircle } from '../../images/svgs';
import { getImageUri } from '../../common_components/cards/cardhelpers';
import { Gradient } from '../../common_components/Gradient';
import { methodService } from '../../services/method.service';
import { NextLesson } from '../../common_components/NextLesson';
import { CardsContext } from '../../state/cards/CardsContext';
import {
  catalogueReducer,
  SET_METHOD
} from '../../state/catalogue/CatalogueReducer';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

const window = Dimensions.get('window');
let windowW = window.width < window.height ? window.width : window.height;

export const Method: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const { user } = useContext(UserContext);

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());

  const [{ method, refreshing }, dispatch] = useReducer(catalogueReducer, {
    refreshing: true,
    loadingMore: false
  });

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    setMethod();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);
  const setMethod = () =>
    methodService.getMethod(abortC.current.signal).then(methodRes => {
      methodRes.completed = true;
      if (isMounted.current) {
        addCards([methodRes.next_lesson]);
        dispatch({
          type: SET_METHOD,
          method: methodRes,
          scene: 'home',
          refreshing: false
        });
      }
    });

  const refresh = (): void => {
    abortC.current.abort();
    abortC.current = new AbortController();
    dispatch({ refreshing: true, loadingMore: false });
    setMethod();
  };

  const onLevelPress = (mobile_app_url: string, published_on: string): void => {
    if (new Date() > new Date(published_on)) {
      navigate('level', { mobile_app_url });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
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
            <MethodBanner
              {...method}
              expandableInfo={true}
              onResetProgress={refresh}
            />
            <View style={styles.container}>
              <View style={styles.profileContainer}>
                <Image
                  style={styles.profilePicture}
                  source={{ uri: user?.avatarUrl }}
                />
                <Text style={styles.levelText}>LEVEL {method?.level_rank}</Text>
              </View>
              {method?.levels?.map((l, index: number) => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => onLevelPress(l.mobile_app_url, l.published_on)}
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
                          .map(i => i.name)
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
              text={`METHOD - ${method?.progress_percent?.toFixed(
                2
              )}% COMPLETE`}
              progress={method.progress_percent || 0}
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
