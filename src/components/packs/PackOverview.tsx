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
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Modal,
  TouchableOpacity
} from 'react-native';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { NextLesson } from '../../common_components/NextLesson';
import { packsService } from '../../services/packs.service';
import type {
  PackBundle as I_PackBundle,
  PackLessonBundle as I_PackLessonBundle
} from '../../interfaces/packs.interfaces';
import { PacksBanner } from './PacksBanner';
import { LibraryCard } from '../../common_components/cards/LibraryCard';
import { CardsContext } from '../../state/cards/CardsContext';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';
import { RowCard } from '../../common_components/cards/RowCard';
import type { Card } from '../../interfaces/card.interfaces';
import { DownloadResources } from 'RNDownload';
import type {
  Resource,
  ResourceWithExtension
} from '../../interfaces/lesson.interfaces';
import {
  decideExtension,
  getExtensionByType
} from '../../common_components/lesson/helpers';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

interface Props {
  route: RouteProp<ParamListBase, 'packOverview'> & {
    params: {
      mobile_app_url: string;
    };
  };
}

export const PackOverview: React.FC<Props> = ({
  route: {
    params: { mobile_app_url }
  }
}) => {
  const { navigate, push } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      push: (scene: string, props: {}) => void;
      navigate: (scene: string, props: {}) => void;
    }
  >();

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { addCards, updateCard } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [pack, setPack] = useState<I_PackBundle | I_PackLessonBundle>();
  const [resourcesArr, setResourcesArr] = useState<ResourceWithExtension[]>([]);

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const resetModalRef = useRef<React.ElementRef<typeof ActionModal>>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getPack();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getPack = () => {
    if (!isConnected) return showNoConnectionAlert();

    packsService
      .getPack(mobile_app_url, abortC.current.signal)
      .then((packRes: I_PackBundle | I_PackLessonBundle) => {
        if (packRes.next_lesson) addCards([packRes.next_lesson]);
        if ((packRes as I_PackLessonBundle).lessons) {
          addCards((packRes as I_PackLessonBundle).lessons);
        } else {
          addCards((packRes as I_PackBundle).bundles);
        }
        setPack(packRes);
        if (packRes.resources) createResourcesArr(packRes.resources);
        setRefreshing(false);
      });
  };

  const refresh = () => {
    if (!isConnected) return showNoConnectionAlert();

    setRefreshing(true);
    getPack();
  };

  const createResourcesArr = (lessonResources: Resource[]) => {
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
  };

  const onMainBtnClick = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    if (pack?.completed) {
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
    } else {
      navigate('lessonPart', { id: pack?.next_lesson.id, contentType: 'pack' });
    }
  }, [pack, resetModalRef, isConnected]);

  const resetProgress = useCallback(() => {
    if (!isConnected) return showNoConnectionAlert();

    if (pack) {
      resetModalRef.current?.toggle();
      userService.resetProgress(pack.id);
      updateCard({ ...pack, progress_percent: 0, completed: false });
      refresh();
    }
  }, [pack, isConnected]);

  const onBundlePress = useCallback(
    (mobile_app_url: string) => {
      if (!isConnected) return showNoConnectionAlert();

      push('packOverview', { mobile_app_url });
    },
    [isConnected]
  );

  const toggleResourcesModal = useCallback(() => {
    setShowResourcesModal(!showResourcesModal);
  }, [showResourcesModal]);

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
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      {pack?.id ? (
        <ScrollView style={styles.container} refreshControl={flRefreshControl}>
          <PacksBanner
            {...pack}
            isMainPacksPage={false}
            onMainBtnClick={onMainBtnClick}
            onToggleResourcesModal={toggleResourcesModal}
            onReset={() =>
              resetModalRef.current?.toggle(
                'Hold your horses...',
                `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
              )
            }
          />
          <View style={styles.cardContainer}>
            {(pack as I_PackBundle).bundles?.map((b: I_PackLessonBundle) => (
              <LibraryCard
                key={b.id}
                item={b}
                subtitle={`${b.lesson_count} lessons`}
                onBtnPress={url => onBundlePress(url)}
                isLocked={!pack.is_owned}
              />
            ))}
            {(pack as I_PackLessonBundle).lessons?.map((l: Card) => (
              <RowCard key={l.id} id={l.id} route='packs' />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ActivityIndicator
          size='large'
          animating={true}
          color={utils.color}
          style={{ flex: 1 }}
        />
      )}
      {pack?.is_owned && pack.next_lesson?.id && (
        <NextLesson
          item={pack.next_lesson.id}
          text={
            pack.type === 'pack-bundle'
              ? `BUNDLE ${(pack as I_PackBundle).bundle_number} - LESSON ${
                  pack.current_lesson_index + 1
                }`
              : `LESSON ${pack.current_lesson_index + 1}`
          }
          progress={pack.progress_percent}
        />
      )}

      <ActionModal
        ref={resetModalRef}
        primaryBtnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle()}
      />
      {pack && (
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
                lessonTitle={pack.title}
                onClose={toggleResourcesModal}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    cardContainer: {
      backgroundColor: current.background,
      paddingTop: 10
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
