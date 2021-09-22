import React, {
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
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../../state/user/UserContext';
import { filters, x, check, send } from '../../images/svgs';
import { CustomContentModal } from '../modals/CustomContentModal';
import type { Comment } from '../../interfaces/lesson.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { CommentCard } from './CommentCard';
import { commentService } from '../../services/comment.service';

const filterOptions = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest first', value: 'latest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'My comments', value: 'my_comments' }
];

interface Props {
  commentsArray: Comment[];
  nrOfComments: number;
  lessonId: number;
}

export const CommentSection: React.FC<Props> = ({
  commentsArray,
  nrOfComments,
  lessonId
}) => {
  const [comments, setComments] = useState(commentsArray);
  const [commentText, setCommentText] = useState('');
  const [sortByComments, setSortByComments] = useState('');
  const [animate, setAnimate] = useState(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(1);
  const allCommentsNum = useRef<number>(nrOfComments);
  const limit = useRef<number>(10);
  const input = useRef<any>();
  const commentCardRef = useRef<any>();
  const actionModalFilters = useRef<any>();
  const actionModalCommentInput = useRef<any>();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  let styles = useMemo(() => setStyles(theme), [theme]);

  const addComment = useCallback(async () => {
    actionModalCommentInput.current.toggleModal();
    if (commentText.length > 0) {
      const encodedCommentText = encodeURIComponent(commentText);
      await commentService.addComment(encodedCommentText, lessonId);

      const c = await commentService.getComments(
        lessonId,
        sortByComments,
        allCommentsNum.current + 1
      );
      allCommentsNum.current = c?.meta?.totalCommentsAndReplies;

      setCommentText('');
      setComments(c?.data);
    }
  }, [commentText, lessonId, sortByComments]);

  const showAddComment = useCallback(() => {
    actionModalCommentInput.current.toggleModal();
  }, [actionModalCommentInput]);

  const toggleFilterModal = useCallback(() => {
    actionModalFilters.current.toggle();
  }, [actionModalFilters]);

  const selectFilter = useCallback(
    async (index: number, sort: string) => {
      actionModalFilters.current.toggleModal();
      const c = await commentService.getComments(
        lessonId,
        sortByComments,
        limit.current
      );
      allCommentsNum.current = c.meta.totalCommentsAndReplies;
      setComments(c.data);
      setSelectedFilterIndex(index);
      setSortByComments(sort);
    },
    [lessonId, sortByComments]
  );

  const onDeleteComment = useCallback(
    (id: number) => {
      allCommentsNum.current -= 1;
      setComments(comments.filter(c => c.id !== id));
      commentService.deleteComment(id);
    },
    [comments]
  );

  const loadMoreComments = useCallback(async () => {
    if (limit.current < nrOfComments) {
      setAnimate(true);

      limit.current += 10;
      const c = await commentService.getComments(
        lessonId,
        sortByComments,
        limit.current
      );
      allCommentsNum.current = c.meta.totalCommentsAndReplies;
      setComments(c.data);
      setAnimate(false);
    }
  }, [lessonId, nrOfComments, sortByComments]);

  const onAddOrRemoveReply = useCallback(async () => {
    const c = await commentService.getComments(
      lessonId,
      sortByComments,
      limit.current
    );
    allCommentsNum.current = c.meta.totalCommentsAndReplies;
    setComments(c.data);
  }, [lessonId, sortByComments]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.subtitle}>
          {comments
            ? allCommentsNum.current === 1
              ? (allCommentsNum.current || comments.length) + ' COMMENT'
              : (allCommentsNum.current || comments.length) + ' COMMENTS'
            : ''}
        </Text>

        <TouchableOpacity onPress={toggleFilterModal} style={styles.filterIcon}>
          {filters({ icon: { height: 23, width: 23, fill: utils.color } })}
        </TouchableOpacity>

        <CustomContentModal
          translucentStyle={styles.translucentStyle}
          modalStyle={styles.customModalStyle}
          ref={actionModalFilters}
        >
          <View style={styles.background}>
            {filterOptions.map((option, index) => (
              <TouchableOpacity
                style={styles.filterContainer}
                key={index}
                onPress={() => selectFilter(index, option.value)}
              >
                {selectedFilterIndex === index &&
                  check({
                    icon: {
                      width: 18,
                      height: 18,
                      fill: themeStyles[theme].textColor
                    }
                  })}
                <Text
                  style={[
                    styles.filterText,
                    selectedFilterIndex === index
                      ? styles.selectedFilter
                      : styles.unselectedFilter
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.filterBox}
              onPress={toggleFilterModal}
            >
              {x({
                icon: {
                  width: 18,
                  height: 18,
                  fill: themeStyles[theme].textColor
                }
              })}
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CustomContentModal>
      </View>

      <View style={styles.inputContainer}>
        <Image
          style={styles.userProfileImg}
          source={{
            uri:
              user?.avatarUrl ||
              'https://www.drumeo.com/laravel/public/assets/images/default-avatars/default-male-profile-thumbnail.png'
          }}
        />
        <TouchableOpacity
          style={styles.placeholderBtn}
          onPress={showAddComment}
        >
          <Text style={styles.placeholder}>Add a comment...</Text>
        </TouchableOpacity>
      </View>
      {comments?.map(c => (
        <CommentCard
          ref={commentCardRef}
          key={c.id}
          onDeleteComment={(id: number) => onDeleteComment(id)}
          comment={c}
          onAddOrRemoveReply={onAddOrRemoveReply}
          lessonId={lessonId}
        />
      ))}
      {animate && (
        <ActivityIndicator
          size='large'
          color={utils.color}
          animating={animate}
        />
      )}
      <CustomContentModal
        modalStyle={styles.customModalStyle}
        ref={actionModalCommentInput}
        translucentStyle={styles.translucentStyle}
      >
        <SafeAreaView style={styles.commentInputContainer} edges={['bottom']}>
          <Image
            style={[styles.userProfileImg, { marginVertical: 15 }]}
            source={{
              uri:
                user?.avatarUrl ||
                'https://www.drumeo.com/laravel/public/assets/images/default-avatars/default-male-profile-thumbnail.png'
            }}
          />
          <TextInput
            multiline={true}
            autoFocus={true}
            autoCapitalize={'sentences'}
            autoCorrect={true}
            spellCheck={true}
            style={styles.textInput}
            ref={input}
            placeholder='Add a comment...'
            placeholderTextColor={themeStyles[theme].textColor}
            value={commentText}
            onLayout={e => input.current.focus()}
            onChangeText={text => setCommentText(text)}
          />
          <TouchableOpacity style={styles.sendIcon} onPress={addComment}>
            {send({ icon: { height: 30, width: 30, fill: utils.color } })}
          </TouchableOpacity>
        </SafeAreaView>
      </CustomContentModal>
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    background: {
      backgroundColor: current.background
    },
    subtitle: {
      fontSize: 18,
      fontFamily: 'OpenSans-Bold',
      marginLeft: 15,
      color: current.contrastTextColor
    },
    filterText: {
      fontSize: 12,
      fontFamily: 'OpenSans'
    },
    selectedFilter: {
      color: current.textColor,
      marginLeft: 5
    },
    unselectedFilter: {
      color: current.contrastTextColor,
      marginLeft: 20
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 75
    },
    textInput: {
      flex: 1,
      maxHeight: 300,
      fontSize: 12,
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20
    },
    modalStyle: {
      width: 300,
      height: 200
    },
    cancelText: {
      fontSize: 12,
      fontFamily: 'OpenSans',
      marginLeft: 5,
      color: current.textColor
    },
    filterBox: {
      padding: 10,
      paddingVertical: 20,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1
    },
    filterContainer: {
      padding: 10,
      paddingVertical: 20,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: current.borderColor
    },
    userProfileImg: {
      backgroundColor: 'transparent',
      height: 38,
      aspectRatio: 1,
      borderRadius: 18,
      marginLeft: 15,
      marginRight: 15
    },
    commentInputContainer: {
      flexDirection: 'row',
      backgroundColor: current.background,
      alignItems: 'center'
    },
    placeholderBtn: {
      flex: 1,
      padding: 10
    },
    placeholder: {
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
    filterIcon: {
      position: 'absolute',
      right: 15
    }
  });
