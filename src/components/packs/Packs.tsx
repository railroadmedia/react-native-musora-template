import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  StyleSheet,
  View,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  ViewStyle
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { PacksBanner } from './PacksBanner';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { packsService } from '../../services/packs.service';
import type {
  Pack as I_Pack,
  BannerPack
} from '../../interfaces/packs.interfaces';
import type { PacksSection } from '../../interfaces/service.interfaces';
import { lock } from '../../images/svgs';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';

interface Props {}

const greaterWDim = Dimensions.get('screen').width;
export const Packs: React.FC<Props> = () => {
  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props: {}) => void;
    }
  >();
  const { theme } = useContext(ThemeContext);

  const [refreshing, setRefreshing] = useState(false);
  const [topHeaderPack, setTopHeaderPack] = useState<BannerPack>();
  const [allPacks, setAllPacks] = useState<any>();
  const [myPacks, setMyPacks] = useState<I_Pack[]>();

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const multiplier = useMemo(() => {
    if (utils.isTablet) return 6;
    return 3;
  }, []);

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getPacks();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getPacks = (): Promise<void> =>
    packsService
      .allPacks(abortC.current.signal)
      .then((packRes: PacksSection) => {
        setTopHeaderPack(packRes.topHeaderPack);
        setAllPacks(packRes.morePacks);
        setMyPacks(packRes.myPacks);
        setRefreshing(false);
      });

  const refresh = useCallback(() => {
    abortC.current.abort();
    abortC.current = new AbortController();
    setRefreshing(true);
    getPacks();
  }, []);

  const renderFLRefreshControl = (): ReactElement => (
    <RefreshControl
      colors={['white']}
      tintColor={utils.color}
      progressBackgroundColor={utils.color}
      onRefresh={refresh}
      refreshing={!!refreshing}
    />
  );

  const renderFLEmpty = (): ReactElement => (
    <Text style={styles.emptyListText}>No packs to show</Text>
  );

  const renderFLItem = ({ item, index }: any): ReactElement => {
    return typeof item.id === 'string' ? (
      <Text style={[styles.subtitle, item.styles]}>{item.title}</Text>
    ) : (
      <TouchableOpacity
        key={item.id}
        style={{
          flex: 1,
          padding: 10,
          paddingTop: 0,
          paddingRight: index % multiplier < multiplier - 1 ? 0 : 10
        }}
        onPress={() => goToPack(item.mobile_app_url)}
      >
        <ImageBackground
          style={styles.image}
          imageStyle={{ borderRadius: 5 }}
          source={{
            uri: `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,c_thumb,w_${
              (greaterWDim / multiplier) >> 0
            },ar_0.7/${item.thumbnail}`
          }}
        >
          <View style={styles.logoContainer}>
            <View />
            {item.isMore &&
              item.is_locked &&
              lock({ icon: { height: 20, width: 20, fill: '#ffffff' } })}
            <View style={{ width: '100%' }}>
              {item.is_new && (
                <View style={styles.newTextContainer}>
                  <Text style={styles.newText}>NEW PACK!</Text>
                </View>
              )}
              <Image
                style={[styles.logo, { height: 2 * (greaterWDim / 50) }]}
                resizeMode={'contain'}
                source={{
                  uri:
                    item.pack_logo.indexOf('.svg') > 0
                      ? `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,f_png,w_${
                          ((0.9 * greaterWDim) / multiplier) >> 0
                        }/${item.pack_logo}`
                      : `https://cdn.musora.com/image/fetch/fl_lossy,q_auto:eco,w_${
                          ((0.9 * greaterWDim) / multiplier) >> 0
                        }/${item.pack_logo}`
                }}
              />
            </View>
          </View>
        </ImageBackground>
        {item.isMore && <Text style={styles.price}>{item.price}</Text>}
      </TouchableOpacity>
    );
  };

  const formatListsContent = useCallback(() => {
    let packsList = [];
    if (myPacks && allPacks) {
      let divMultiplierRemainderMyPacks = !(myPacks.length % multiplier)
        ? 0
        : (((myPacks.length / multiplier) >> 0) + 1) * multiplier -
          myPacks.length;
      let divMultiplierRemainderMorePacks = !(allPacks.length % multiplier)
        ? 0
        : (((allPacks.length / multiplier) >> 0) + 1) * multiplier -
          allPacks.length;
      let myTitle: { id: string; title: string | null; styles?: ViewStyle }[] =
        [{ id: '0myP', title: 'Packs', styles: styles.title }];
      let moreTitle: {
        id: string;
        title: string | null;
        styles?: ViewStyle;
      }[] = [
        {
          id: '0moreP',
          title: 'MORE PACKS',
          styles: styles.title
        }
      ];
      for (let i = 1; i < multiplier; i++) {
        myTitle.push({ id: `${i}myP`, title: null });
        moreTitle.push({ id: `${i}moreP`, title: null });
      }

      packsList = [...myTitle, ...myPacks];
      if (!myPacks.length) {
        packsList.push({
          id: '0noMyPacks',
          title: `You haven't purchased any packs yet!`,
          styles: styles.emptyPacksText
        });
        for (let i = 1; i < multiplier; i++) {
          packsList.push({
            title: null,
            id: `${i}noMyPacks`
          });
        }
      } else
        for (let i = 0; i < divMultiplierRemainderMyPacks; i++) {
          packsList.push({
            title: null,
            id: `${i}emptyMyPacks`,
            styles: { flex: 1, padding: 10 }
          });
        }

      packsList.push(...moreTitle);
      allPacks.map((p: I_Pack) => packsList.push({ ...p, isMore: true }));
      if (!allPacks.length) {
        packsList.push({
          id: '0noMorePacks',
          title: `Packs are not available.`,
          styles: styles.emptyPacksText
        });
        for (let i = 1; i < multiplier; i++) {
          packsList.push({
            title: null,
            id: `${i}noMorePacks`
          });
        }
      } else
        for (let i = 0; i < divMultiplierRemainderMorePacks; i++) {
          packsList.push({
            title: null,
            id: `${i}emptyMorePacks`,
            styles: { flex: 1, padding: 10 }
          });
        }

      return packsList;
    }
    return [];
  }, [allPacks, myPacks]);

  const onSeeMore = useCallback(() => {
    navigate('packOverview', { mobile_app_url: topHeaderPack?.mobile_app_url });
  }, [topHeaderPack?.mobile_app_url]);

  const goToPack = useCallback((mobile_app_url: string) => {
    navigate('packOverview', { mobile_app_url });
  }, []);

  const onMainBtnClick = useCallback(() => {
    if (topHeaderPack?.completed) {
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
    } else {
      // TODO: add navigation to topHeaderPack?.next_lesson_url
    }
  }, [topHeaderPack, resetModalRef]);

  const resetProgress = useCallback(() => {
    if (topHeaderPack) {
      resetModalRef.current?.toggle();
      userService.resetProgress(topHeaderPack.id);
      refresh();
    }
  }, [topHeaderPack]);

  return (
    <View style={styles.container}>
      {topHeaderPack?.id ? (
        <FlatList
          windowSize={10}
          style={styles.container}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          numColumns={utils.isTablet ? 6 : 3}
          removeClippedSubviews={true}
          keyExtractor={item => item.id.toString()}
          data={formatListsContent()}
          keyboardShouldPersistTaps='handled'
          refreshControl={renderFLRefreshControl()}
          ListEmptyComponent={renderFLEmpty()}
          ListHeaderComponent={() => (
            <PacksBanner
              {...topHeaderPack}
              isMainPacksPage={true}
              onMainBtnClick={onMainBtnClick}
              onSeeMoreBtnClick={onSeeMore}
            />
          )}
          renderItem={renderFLItem}
        />
      ) : (
        <ActivityIndicator
          size='large'
          animating={true}
          color={utils.color}
          style={{ flex: 1 }}
        />
      )}

      <ActionModal
        ref={resetModalRef}
        primaryBtnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle()}
      />
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    emptyListText: {
      padding: 20,
      textAlign: 'center',
      color: current.textColor
    },
    subtitle: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    price: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans-Bold',
      color: current.contrastTextColor,
      alignSelf: 'center'
    },
    image: {
      aspectRatio: 0.7,
      alignItems: 'center',
      justifyContent: 'center'
    },
    logo: {
      width: '90%',
      alignSelf: 'center'
    },
    logoContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    newText: {
      fontSize: utils.figmaFontSizeScaler(6),
      paddingVertical: 2,
      paddingHorizontal: 8
    },
    newTextContainer: {
      marginBottom: 5,
      borderRadius: 10,
      backgroundColor: utils.color,
      width: '50%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans'
    },
    title: {
      flex: 1,
      padding: 15
    },
    emptyPacksText: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      flex: 1,
      padding: 10,
      color: utils.color,
      textAlign: 'center'
    }
  });
