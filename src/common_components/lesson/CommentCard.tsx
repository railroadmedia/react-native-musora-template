import React, {
  forwardRef,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { like, likeOn, replies, trash } from '../../images/svgs';
import { UserContext } from '../../state/user/UserContext';
import type { Comment } from '../../interfaces/lesson.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { parseXpValue } from './helpers';
import { commentService } from '../../services/comment.service';
import ActionModal, {
  CustomRefObject
} from '../../common_components/modals/ActionModal';

interface Props {
  comment: Comment;
  lessonId?: number;
  onDeleteComment: (id: number) => void;
  onAddOrRemoveReply?: (num: number) => void;
  onLikeOrDislike?: (id: number) => void;
}

export interface CommentCardRefObj {}

let windowWidth = Dimensions.get('window').width;
const DEFAULT_PROFILE_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2000px-No_image_available.svg.png';
export const CommentCard = forwardRef(
  (
    {
      comment,
      lessonId,
      onDeleteComment,
      onAddOrRemoveReply,
      onLikeOrDislike
    }: Props,
    ref: React.Ref<CommentCardRefObj>
  ) => {
    const { navigate } = useNavigation<
      NavigationProp<ReactNavigation.RootParamList> & {
        navigate: (scene: string, props: {}) => void;
      }
    >();

    const lastPostTime = useCallback((date: string) => {
      const formatedDate = date?.replace(/-/g, '/');
      const dif: number =
        new Date().getTime() - new Date(formatedDate).getTime();
      if (dif < 120 * 1000) return `1 Minute Ago`;
      if (dif < 60 * 1000 * 60)
        return `${(dif / 1000 / 60).toFixed()} Minutes Ago`;
      if (dif < 60 * 1000 * 60 * 2) return `1 Hour Ago`;
      if (dif < 60 * 1000 * 60 * 24)
        return `${(dif / 1000 / 60 / 60).toFixed()} Hours Ago`;
      if (dif < 60 * 1000 * 60 * 48) return `1 Day Ago`;
      if (dif < 60 * 1000 * 60 * 24 * 30)
        return `${(dif / 1000 / 60 / 60 / 24).toFixed()} Days Ago`;
      if (dif < 60 * 1000 * 60 * 24 * 60) return `1 Month Ago`;
      if (dif < 60 * 1000 * 60 * 24 * 30 * 12)
        return `${(dif / 1000 / 60 / 60 / 24 / 30).toFixed()} Months Ago`;
      if (dif < 60 * 1000 * 60 * 24 * 365 * 2) return `1 Year Ago`;
      return `${(dif / 1000 / 60 / 60 / 24 / 365).toFixed()} Years Ago`;
    }, []);

    const [isLiked, setIsLiked] = useState(comment.is_liked);
    const [likeCount, setLikeCount] = useState(comment.like_count);
    const [containerWidth, setContainerWidth] = useState(windowWidth);

    const { theme } = useContext(ThemeContext);
    const { user } = useContext(UserContext);
    const alert = useRef<CustomRefObject>(null);

    let styles = useMemo(() => setStyles(theme), [theme]);

    const goToReplies = useCallback(() => {
      if (lessonId) {
        navigate('replies', { selectedComment: comment });
      }
    }, [comment, lessonId]);

    const goToLikeList = useCallback(() => {
      navigate('likeList', {});
    }, []);

    const showDeleteAlert = useCallback(() => {
      alert.current?.toggle(
        'Hold your horses...',
        'This will delete this comment and cannot be undone. Are you sure about this?'
      );
    }, [alert]);

    const closeDeleteModal = useCallback(() => {
      alert.current?.toggle('', '');
    }, [alert]);

    const deleteComment = useCallback(() => {
      alert.current?.toggle('', '');
      if (onDeleteComment) onDeleteComment(comment.id);
    }, [onDeleteComment, comment.id]);

    const onAddOrRemoveReplyParent = useCallback(
      num => {
        if (onAddOrRemoveReply) onAddOrRemoveReply(num);
      },
      [onAddOrRemoveReply]
    );

    const likeOrDislikeComment = useCallback(
      (id: number) => {
        if (comment.user_id !== user.id) {
          if (onLikeOrDislike) {
            onLikeOrDislike(id);
          }
          if (id === comment.id) {
            if (isLiked) {
              setLikeCount(likeCount - 1);
              setIsLiked(false);
              commentService.dislikeComment(id);
            } else {
              setLikeCount(likeCount + 1);
              setIsLiked(true);
              commentService.likeComment(id);
            }
          } else {
            const reply = comment.replies.filter(f => f.id === id)[0];
            if (reply) {
              if (reply.is_liked) {
                reply.like_count--;
                reply.is_liked = false;
              } else {
                reply.like_count++;
                reply.is_liked = true;
              }
            }
          }
        }
      },
      [
        comment.id,
        comment.replies,
        comment.user_id,
        user.id,
        onLikeOrDislike,
        isLiked,
        likeCount
      ]
    );

    return (
      <View
        style={[
          styles.commentContainer,
          lessonId ? { minHeight: 120 } : { minHeight: 100 }
        ]}
      >
        <View style={styles.commentHeader}>
          <View>
            <Image
              source={{
                uri:
                  comment.user['fields.profile_picture_image_url'] ||
                  DEFAULT_PROFILE_IMAGE
              }}
              style={styles.userProfileImg}
            />
            <View style={styles.center}>
              <Text style={styles.xpStyle}>
                {comment.user
                  ? parseXpValue(parseInt(comment.user.xp, 10))
                  : ''}{' '}
                XP
              </Text>
            </View>
          </View>
          <View>
            <TouchableOpacity
              style={{ width: containerWidth - 85, marginRight: 15 }}
              onPress={goToReplies}
            >
              <Text style={styles.commentText}>
                {comment.comment.replace(/<[^>]*>?/gm, '')}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={styles.tag}>
                {comment.user?.['display_name']} |{' '}
              </Text>
              <Text style={styles.tag}>{comment.user?.xp_level} | </Text>
              <Text style={styles.tag}>{lastPostTime(comment.created_on)}</Text>
            </View>
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.row,
                  user.id === comment.user_id
                    ? { marginRight: 0 }
                    : { marginRight: 15 }
                ]}
              >
                {user.id !== comment.user_id && (
                  <TouchableOpacity
                    onPress={() => likeOrDislikeComment(comment.id)}
                    style={{ marginRight: 10 }}
                  >
                    {isLiked
                      ? likeOn({
                          icon: { height: 20, width: 20, fill: utils.color }
                        })
                      : like({
                          icon: { height: 20, width: 20, fill: utils.color }
                        })}
                  </TouchableOpacity>
                )}
                {likeCount > 0 && (
                  <TouchableOpacity
                    style={styles.bubble}
                    onPress={goToLikeList}
                  >
                    <Text style={styles.bubbleText}>
                      {likeCount === 1
                        ? likeCount + ' LIKE'
                        : likeCount + ' LIKES'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {lessonId && (
                <TouchableWithoutFeedback
                  onPress={goToReplies}
                  style={{ marginRight: 15 }}
                >
                  <View style={styles.row}>
                    <View style={{ marginRight: 10 }}>
                      {replies({
                        icon: { height: 20, width: 20, fill: utils.color }
                      })}
                    </View>
                    {comment.replies?.length > 0 ? (
                      <View style={[styles.bubble, { marginRight: 5 }]}>
                        <Text style={styles.bubbleText}>
                          {comment.replies?.length === 1
                            ? comment.replies?.length + ' REPLY'
                            : comment.replies?.length + ' REPLIES'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableWithoutFeedback>
              )}
              {user.id === comment.user_id && (
                <TouchableOpacity
                  style={{ alignItems: 'center', marginRight: 10 }}
                  onPress={showDeleteAlert}
                >
                  {trash({
                    icon: { height: 20, width: 20, fill: utils.color }
                  })}
                </TouchableOpacity>
              )}
            </View>
            {lessonId && comment.replies?.length > 0 ? (
              <Text style={styles.repliesLabel} onPress={goToReplies}>
                {`VIEW ${
                  comment.replies?.length === 1
                    ? 'REPLY'
                    : comment.replies?.length + ' REPLIES'
                }`}
              </Text>
            ) : null}
          </View>
        </View>

        <ActionModal ref={alert} onCancel={() => alert.current?.toggle('', '')}>
          <TouchableOpacity onPress={deleteComment} style={styles.btn}>
            <Text style={styles.deleteBtnText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeDeleteModal}>
            <Text style={styles.cancelBtnText}>CANCEL</Text>
          </TouchableOpacity>
        </ActionModal>
      </View>
    );
  }
);

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    commentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      backgroundColor: current.background,
      borderTopColor: current.borderColor
    },
    commentHeader: {
      flexDirection: 'row',
      marginTop: 20
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    xpStyle: {
      fontSize: 10,
      fontFamily: 'RobotoCondensed-Bold',
      color: current.contrastTextColor
    },
    bubble: {
      width: 60,
      height: 16,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center'
    },
    commentText: {
      color: current.textColor,
      fontSize: 14,
      fontFamily: 'OpenSans'
    },
    iconContainer: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10
    },
    bubbleText: {
      color: utils.color,
      padding: 2,
      fontSize: 10,
      fontFamily: 'OpenSans'
    },
    repliesLabel: {
      color: current.contrastTextColor,
      marginBottom: 15,
      fontSize: 12,
      fontFamily: 'OpenSans'
    },
    tag: {
      fontSize: 11,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    userProfileImg: {
      backgroundColor: 'transparent',
      height: 38,
      aspectRatio: 1,
      borderRadius: 18,
      marginLeft: 15,
      marginRight: 15
    },
    btn: {
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: utils.color,
      marginTop: 10
    },
    deleteBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      padding: 15,
      color: '#ffffff'
    },
    cancelBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15,
      color: utils.color,
      marginTop: 10
    }
  });
