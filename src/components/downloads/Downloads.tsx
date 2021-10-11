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
import { useNavigation } from '@react-navigation/native';

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
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {}

export const Downloads: React.FC<Props> = ({}) => {
  const { goBack } = useNavigation();

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
    downloads.map(d => {
      addCards([d.lesson]);
    });
    setLoading(false);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      dldEventListener?.remove?.();
    };
  }, [downloads]);

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
      lesson: { id: number };
      sizeInBytes: number;
      dlding: IDownloading[];
    };
  }) => (
    <View pointerEvents={item.dlding ? 'none' : 'auto'}>
      <RowCard
        id={item.lesson.id} //TODO: make navigation work if item is overview
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
            keyExtractor={item => item.lesson.id.toString()}
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
