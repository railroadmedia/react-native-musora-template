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
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { CardsContext } from '../../state/cards/CardsContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { LearningPath } from './LearningPath';
import { NextLesson } from '../../common_components/NextLesson';
import type { Foundation as I_Foundation } from '../../interfaces/method.interfaces';
import { methodService } from '../../services/method.service';

export const Foundation: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<ParamListBase>>();

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const { addCards } = useContext(CardsContext);

  const [refreshing, setRefreshing] = useState(false);
  const [foundation, setFoundation] = useState<I_Foundation>();

  const isMounted = useRef(true);
  const abortC = useRef(new AbortController());

  const styles = useMemo(() => setStyles(theme), [theme]);

  useEffect(() => {
    isMounted.current = true;
    abortC.current = new AbortController();
    getFoundations();
    return () => {
      isMounted.current = false;
      abortC.current.abort();
    };
  }, []);

  const getFoundations = () => {
    if (!isConnected) return showNoConnectionAlert();

    methodService
      .getFoundation(abortC.current.signal)
      .then((foundationRes: I_Foundation) => {
        if (isMounted.current) {
          if (foundationRes.next_lesson) addCards([foundationRes.next_lesson]);
          setRefreshing(false);
          setFoundation(foundationRes);
        }
      });
  };

  const refresh = (): void => {
    if (!isConnected) return showNoConnectionAlert();

    abortC.current.abort();
    abortC.current = new AbortController();
    setRefreshing(true);
    getFoundations();
  };

  const onUnitPress = useCallback(
    (mobile_app_url: string, published_on: string): void => {
      if (!isConnected) return showNoConnectionAlert();

      if (new Date() > new Date(published_on)) {
        navigate('courseOverview', { mobile_app_url });
      }
    },
    [isConnected]
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />

      {foundation?.id ? (
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
            <LearningPath learningPath={foundation} onCardPress={onUnitPress} />
          </ScrollView>
          {foundation?.next_lesson && (
            <NextLesson
              item={foundation.next_lesson.id}
              text={`FOUNDATION - ${foundation?.progress_percent?.toFixed(
                2
              )}% COMPLETE`}
              progress={foundation.progress_percent || 0}
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
    }
  });
