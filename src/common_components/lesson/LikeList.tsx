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
  StyleSheet,
  FlatList,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ParamListBase, RouteProp } from '@react-navigation/native';

import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { commentService } from '../../services/comment.service';
import type { Likes } from '../../interfaces/lesson.interfaces';
import { parseXpValue } from './helpers';

interface Props {
  route: RouteProp<ParamListBase, 'likeList'> & {
    params: {
      commentId: number;
    };
  };
}

export const LikeList: React.FC<Props> = ({
  route: {
    params: { commentId }
  }
}) => {
  const { goBack } = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [likes, setLikes] = useState<Likes[]>([]);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const getLikeList = useCallback(async () => {
    const likeList: { data: Likes[] } = await commentService.getCommentLikes(
      commentId
    );
    setLikes(likeList.data);
  }, [commentId]);

  useEffect(() => {
    getLikeList();
  }, [getLikeList]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />

      <FlatList
        style={styles.container}
        data={likes}
        keyboardShouldPersistTaps='handled'
        keyExtractor={like => like.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.titleContainer}>
            <Text style={styles.smallTitle}>
              {likes?.length === 1 ? '1 Like' : likes?.length + ' Likes'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <View style={styles.rowContainer}>
              <Image
                source={{
                  uri:
                    item.avatar_url ||
                    'https://www.drumeo.com/laravel/public/assets/images/default-avatars/default-male-profile-thumbnail.png'
                }}
                style={styles.userProfileImg}
              />
              <View>
                <Text style={styles.name}>{item.display_name || ''}</Text>
                <Text style={styles.xp}>
                  {item.xp ? parseXpValue(item.xp) : ''}
                  XP
                </Text>
              </View>
            </View>
          </View>
        )}
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
    titleContainer: {
      height: 80,
      alignItems: 'flex-start',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: current.borderColor,
      flex: 1
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 60
    },
    cardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: current.borderColor
    },
    userProfileImg: {
      backgroundColor: 'transparent',
      height: 38,
      aspectRatio: 1,
      borderRadius: 18,
      marginLeft: 15,
      marginRight: 15
    },
    smallTitle: {
      fontSize: 24,
      fontFamily: 'OpenSans-Bold',
      marginLeft: 15,
      color: current.textColor
    },
    name: {
      fontSize: 14,
      fontFamily: 'OpenSans-Bold',
      marginBottom: 5,
      color: current.textColor
    },
    xp: {
      fontSize: 12,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    }
  });
