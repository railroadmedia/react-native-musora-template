import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { RowCard } from '../../common_components/cards/RowCard';
import {
  Download_V2,
  offlineContent,
  IOfflineContent,
  IDownloading
} from 'RNDownload';
import { ConnectionContext } from '../../state/connection/ConnectionContext';
import { CardsContext } from '../../state/cards/CardsContext';

interface Props {}

export const Downloads: React.FC<Props> = ({}) => {
  const { goBack, navigate } =
    useNavigation<StackNavigationProp<ParamListBase>>();

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);
  const { addCards } = useContext(CardsContext);
  const styles = useMemo(() => setStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<IOfflineContent[]>(
    Object.values(offlineContent)
  );

  useEffect(() => {
    const dldEventListener = Download_V2.addEventListener?.(percentageListener);
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    handleLastAccessDate();
    downloads?.map(d => {
      addCards([d.lesson]);
      if (d.overview) {
        addCards([d.overview]);
      }
    });
    setLoading(false);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      dldEventListener?.remove?.();
    };
  }, [downloads]);

  const handleLastAccessDate = async () => {
    let lastAccessDate, edgeExpirationDate;

    try {
      lastAccessDate = JSON.parse(
        await RNFetchBlob.fs.readFile(`${utils.offPath}/lastAccessDate`, 'utf8')
      );
    } catch (e) {}
    try {
      if (
        (lastAccessDate && new Date(lastAccessDate) < new Date()) ||
        !lastAccessDate
      ) {
        await RNFetchBlob.fs.writeFile(
          `${utils.offPath}/lastAccessDate`,
          JSON.stringify(new Date().toString()),
          'utf8'
        );
      }
      edgeExpirationDate = JSON.parse(
        await RNFetchBlob.fs.readFile(
          `${utils.offPath}/edgeExpirationDate`,
          'utf8'
        )
      );
      if (edgeExpirationDate) {
        let currentDateInSavedTimezone = calcTime(
          lastAccessDate,
          edgeExpirationDate.timezone_type
        );
        if (
          new Date(currentDateInSavedTimezone) >
          new Date(edgeExpirationDate.date)
        ) {
          navigate('login');
        }
      }
    } catch (e) {}
  };

  const calcTime = (date: string, offset: number) => {
    var d = new Date(date);
    // get UTC time in msec
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var nd = new Date(utc + 3600000 * offset);
    return nd;
  };

  const handleBackPress = useCallback(() => {
    if (!isConnected) {
      showNoConnectionAlert();
      return false;
    }

    goBack();
    return true;
  }, []);

  const percentageListener = useCallback(() => {
    setLoading(false);
    setDownloads(Object.values(offlineContent));
  }, []);

  const renderFLEmpty = (
    <Text style={styles.emptyText}>
      Any lessons you download will be available here.
    </Text>
  );

  const renderFListItem = ({
    item
  }: {
    item: {
      id: number;
      lesson: { id: number };
      overview?: { id: number };
      sizeInBytes: number;
      dlding: IDownloading[];
    };
  }) => (
    <View pointerEvents={item.dlding.length > 0 ? 'none' : 'auto'}>
      <RowCard
        id={item.overview?.id || item.lesson.id}
        iconType='downloads'
        route='downloads'
        sizeInBytes={item.sizeInBytes}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.container}>
        {!loading ? (
          <FlatList
            style={styles.container}
            data={downloads}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={renderFLEmpty}
            renderItem={renderFListItem}
          />
        ) : (
          <ActivityIndicator
            size='large'
            color={utils.color}
            animating={loading}
            hidesWhenStopped={true}
            style={styles.loading}
          />
        )}
      </View>
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
      marginTop: 100,
      color: utils.color,
      textAlign: 'center',
      fontSize: 14,
      fontFamily: 'OpenSans'
    },
    loading: {
      flex: 1
    }
  });
