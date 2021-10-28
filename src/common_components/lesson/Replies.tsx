import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { send } from '../../images/svgs';
import type { Comment } from '../../interfaces/lesson.interfaces';
import { UserContext } from '../../state/user/UserContext';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import {
  CommentInputModal,
  CommentInputModalRefObj
} from '../modals/CommentInputModal';
import { CommentCard } from './CommentCard';
import { commentService } from '../../services/comment.service';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

interface Props {
  route: RouteProp<ParamListBase, 'replies'> & {
    params: {
      parentComment: Comment;
      onDeleteComment: () => void;
      likeOrDislikeComment: () => void;
      onAddOrRemoveReply: (num: number) => void;
    };
  };
}

export const Replies: React.FC<Props> = ({
  route: {
    params: {
      parentComment,
      onDeleteComment,
      likeOrDislikeComment,
      onAddOrRemoveReply
    }
  }
}) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const [replyText, setReplyText] = useState('');
  const [comment, setComment] = useState<Comment>(parentComment);
  const actionModalCommentInput = useRef<CommentInputModalRefObj>(null);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const addReply = async () => {
    if (!isConnected) return showNoConnectionAlert();

    actionModalCommentInput.current?.toggle();
    if (replyText && replyText.length > 0) {
      const encodedReply = encodeURIComponent(replyText);
      const res = await commentService.addReplyToComment(
        encodedReply,
        comment?.id
      );
      const c = { ...comment };
      c.replies?.push(res.data[0]);

      if (onAddOrRemoveReply) {
        onAddOrRemoveReply(1);
      }
      setComment(c);
      setReplyText('');
    }
  };

  const onDeleteReply = useCallback(
    async (id: number) => {
      if (!isConnected) return showNoConnectionAlert();

      setComment({
        ...comment,
        replies: comment.replies.filter(r => r.id !== id)
      });
      await commentService.deleteComment(id);
      if (onAddOrRemoveReply) {
        onAddOrRemoveReply(-1);
      }
    },
    [comment, onAddOrRemoveReply, isConnected]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />

      <View style={{ flex: 1 }}>
        {comment && (
          <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
              <CommentCard
                onDeleteComment={onDeleteComment}
                comment={comment}
                onLikeOrDislike={likeOrDislikeComment}
              />

              <View style={styles.inputContainer}>
                <Image
                  style={styles.userProfileImg}
                  source={{ uri: user?.avatarUrl || utils.fallbackAvatar }}
                />
                <TouchableOpacity
                  style={styles.placeholderBtn}
                  onPress={() => actionModalCommentInput.current?.toggle()}
                >
                  <Text style={styles.placeholder}>Add a reply...</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.subtitle}>
                  {comment.replies
                    ? comment.replies.length === 1
                      ? '1 Reply'
                      : `${comment.replies.length} Replies`
                    : ''}
                </Text>
              </View>
              {comment?.replies.map(reply => (
                <CommentCard
                  onDeleteComment={id => onDeleteReply(id)}
                  key={reply.id}
                  comment={reply}
                  onLikeOrDislike={likeOrDislikeComment}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      <CommentInputModal
        modalStyle={styles.customModalStyle}
        ref={actionModalCommentInput}
        translucentStyle={styles.translucentStyle}
      >
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
          <Image
            style={[styles.userProfileImg, { marginVertical: 15 }]}
            source={{ uri: user?.avatarUrl || utils.fallbackAvatar }}
          />
          <TextInput
            multiline={true}
            autoFocus={true}
            autoCapitalize={'sentences'}
            autoCorrect={true}
            spellCheck={true}
            style={styles.textInput}
            placeholder='Add a reply...'
            placeholderTextColor={themeStyles[theme].textColor}
            value={replyText}
            onChangeText={text => setReplyText(text)}
          />

          {send({
            icon: { height: 30, width: 30, fill: utils.color },
            onPress: addReply,
            container: styles.sendIcon
          })}
        </SafeAreaView>
      </CommentInputModal>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderTopWidth: 1,
      height: 80,
      borderBottomColor: current.borderColor,
      borderTopColor: current.borderColor
    },
    titleContainer: {
      height: 70,
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    textInput: {
      flex: 1,
      maxHeight: 300,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    leftAreaContainer: {
      height: 55,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 15
    },
    userProfileImg: {
      backgroundColor: 'transparent',
      height: 38,
      aspectRatio: 1,
      borderRadius: 18,
      marginLeft: 15,
      marginRight: 15
    },
    placeholderBtn: {
      flex: 1,
      padding: 10
    },
    placeholder: {
      color: current.textColor
    },
    subtitle: {
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold',
      marginLeft: 15,
      color: current.textColor
    },
    customModalStyle: {
      width: '100%',
      alignSelf: 'flex-end'
    },
    translucentStyle: {
      justifyContent: 'flex-end'
    },
    sendIcon: {
      padding: 15,
      alignSelf: 'flex-end'
    },
    bottomSafeArea: {
      flexDirection: 'row',
      backgroundColor: current.background,
      alignItems: 'center'
    }
  });
