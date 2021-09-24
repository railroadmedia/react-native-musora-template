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
  StatusBar
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
import {
  ActionModal,
  CustomRefObject
} from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';
import { RowCard } from '../../common_components/cards/RowCard';
import type { Card } from '../../interfaces/card.interfaces';

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
  const { push } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      push: (scene: string, props: {}) => void;
    }
  >();

  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [pack, setPack] = useState<I_PackBundle | I_PackLessonBundle>();
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());
  const resetModalRef = useRef<CustomRefObject>(null);

  let styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getPack();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getPack = (): Promise<void> =>
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
        setRefreshing(false);
      });

  const refresh = useCallback(() => {
    setRefreshing(true);
    getPack();
  }, []);

  const onMainBtnClick = useCallback(() => {
    if (pack?.completed) {
      resetModalRef.current?.toggle(
        'Hold your horses...',
        `This will reset your progress\nand cannot be undone.\nAre you sure about this?`
      );
    } else {
      // TODO: add navigation to pack?.next_lesson
    }
  }, [pack, resetModalRef]);

  const resetProgress = useCallback(() => {
    if (pack) {
      resetModalRef.current?.toggle('', '');
      userService.resetProgress(pack.id);
      refresh();
    }
  }, [pack]);

  const onBundlePress = useCallback((mobile_app_url: string) => {
    push('packOverview', { mobile_app_url });
  }, []);

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
        btnText='RESET'
        onAction={resetProgress}
        onCancel={() => resetModalRef.current?.toggle('', '')}
      />
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
    }
  });
