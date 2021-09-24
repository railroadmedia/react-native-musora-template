import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { NextLesson } from '../../common_components/NextLesson';
import { methodService } from '../../services/method.service';
import { CardsContext } from '../../state/cards/CardsContext';
import { LibraryCard } from '../../common_components/cards/LibraryCard';
import { LevelBanner } from './LevelBanner';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { userService } from '../../services/user.service';
import type { Level as I_Level } from '../../interfaces/method.interfaces';
import { method } from '../../images/svgs';
import type { StackNavigationProp } from '@react-navigation/stack';

interface Props {
  route: RouteProp<ParamListBase, 'level'> & {
    params: {
      mobile_app_url: string;
    };
  };
}

export const Level: React.FC<Props> = ({
  route: {
    params: { mobile_app_url }
  }
}) => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const { theme } = useContext(ThemeContext);
  const { addCards } = useContext(CardsContext);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [level, setLevel] = useState<I_Level>();
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());

  let styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getLevel();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getLevel = (): Promise<void> =>
    methodService
      .getLevel(mobile_app_url, abortC.current.signal)
      .then(levelRes => {
        if (isMounted.current) {
          addCards([levelRes.next_lesson]);
          addCards(levelRes.courses);
          setLevel(levelRes);
          setRefreshing(false);
        }
      });

  const refresh = () => {
    abortC.current.abort();
    abortC.current = new AbortController();
    setRefreshing(true);
    getLevel();
  };

  const toggleMyList = useCallback(() => {
    if (!level) return;
    if (level.is_added_to_primary_playlist) {
      if (showRemoveModal) {
        userService.removeFromMyList(level.id);
        setShowRemoveModal(false);
        setLevel({ ...level, is_added_to_primary_playlist: false });
      } else {
        setShowRemoveModal(true);
      }
    } else {
      userService.addToMyList(level.id);
      setLevel({ ...level, is_added_to_primary_playlist: true });
    }
  }, [level?.is_added_to_primary_playlist, showRemoveModal]);

  const onMainBtnPress = useCallback(() => {
    // TODO navigate to next lesson
  }, []);

  const goToMethodCourse = useCallback((mobile_app_url: string) => {
    navigate('courseOverview', { mobile_app_url, isMethod: true });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      {!!level?.id ? (
        <React.Fragment>
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[utils.color]}
                tintColor={utils.color}
              />
            }
          >
            <LevelBanner
              {...level}
              is_added_to_primary_playlist={level.is_added_to_primary_playlist}
              onToggleMyList={toggleMyList}
              onMainBtnPress={onMainBtnPress}
              customTitle={`LEVEL ${level.level_number}`}
              renderCustomLogo={() => (
                <>
                  {utils.svgBrand({
                    icon: { width: '15%', fill: utils.color }
                  })}
                  {method({
                    icon: { width: '25%', fill: 'white' },
                    container: { paddingTop: 5 }
                  })}
                </>
              )}
            />
            <View style={styles.container}>
              {!level.courses?.length && (
                <Text style={styles.emptyText}>There are no courses</Text>
              )}
              {level.courses.map(c => (
                <LibraryCard
                  key={c.id}
                  item={c}
                  subtitle={`Level ${c.level_rank}`}
                  onBtnPress={() => goToMethodCourse(c.mobile_app_url)}
                />
              ))}
            </View>
          </ScrollView>
          {level.next_lesson && (
            <NextLesson
              item={level.next_lesson.id}
              text={`METHOD - ${level.progress_percent.toFixed(2)}% COMPLETE `}
              progress={level.progress_percent}
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
      {showRemoveModal && (
        <ActionModal
          title='Hold your horses...'
          message={`This will remove this lesson from\nyour list and cannot be undone.\nAre you sure about this?`}
          btnText='REMOVE'
          onAction={toggleMyList}
          onCancel={() => setShowRemoveModal(false)}
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
    emptyText: {
      textAlign: 'center',
      marginTop: 100,
      color: utils.color,
      height: '100%',
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    }
  });
