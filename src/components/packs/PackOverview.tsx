import React, {
  useCallback,
  useContext,
  useEffect,
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

interface Props {
  mobile_app_url: string;
}

export const PackOverview: React.FC<Props> = ({ mobile_app_url }) => {
  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [pack, setPack] = useState<I_PackBundle | I_PackLessonBundle>();
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

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
        console.log(packRes);
        addCards([packRes.next_lesson]);
        addCards((packRes as I_PackBundle).bundles);
        setPack(packRes);
      });

  const refresh = useCallback(() => {}, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      {pack?.id ? (
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[utils.color]}
              tintColor={utils.color}
            />
          }
        >
          <PacksBanner
            {...pack}
            isMainPacksPage={false}
            onMainBtnClick={() => {}}
          />

          {(pack as I_PackBundle).bundles?.map((b: I_PackLessonBundle) => (
            <View key={b.id} style={styles.cardContainer}>
              <LibraryCard
                key={b.id}
                item={b}
                subtitle={`${b.lesson_count} lessons`}
                onBtnPress={() => {}}
                isLocked={!pack.is_owned}
              />
            </View>
          ))}
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
          text={`BUNDLE ${(pack as I_PackBundle).bundle_number} - LESSON ${
            (pack as I_PackBundle).current_lesson_index + 1
          }`}
          progress={pack.progress_percent}
        />
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
    }
  });
