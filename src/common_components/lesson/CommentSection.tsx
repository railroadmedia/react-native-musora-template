import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
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
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../../state/user/UserContext';
import { filters, x, check, send } from '../../images/svgs';
import {
  CommentInputModal,
  CommentInputModalRefObj
} from '../modals/CommentInputModal';
import type { Comment } from '../../interfaces/lesson.interfaces';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { CommentCard, CommentCardRefObj } from './CommentCard';
import { commentService } from '../../services/comment.service';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

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

export const CommentSection = forwardRef<
  { loadMoreComments: () => void },
  Props
>(({ commentsArray, nrOfComments, lessonId }, ref) => {
  const [comments, setComments] = useState(commentsArray);
  const [commentText, setCommentText] = useState('');
  const [sortByComments, setSortByComments] = useState('latest');
  const [animate, setAnimate] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const allCommentsNum = useRef(nrOfComments);
  const page = useRef(1);
  const allowScroll = useRef(true);
  const input = useRef<TextInput>(null);
  const commentCardRef = useRef<CommentCardRefObj>(null);
  const actionModalCommentInput = useRef<CommentInputModalRefObj>(null);

  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const addComment = useCallback(async () => {
    if (!isConnected) return showNoConnectionAlert();

    actionModalCommentInput.current?.toggle();
    if (commentText.length > 0) {
      page.current = 1;
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
  }, [commentText, lessonId, sortByComments, isConnected]);

  const showAddComment = useCallback(() => {
    actionModalCommentInput.current?.toggle();
  }, [actionModalCommentInput]);

  const toggleFilterModal = useCallback(() => {
    setFilterModalVisible(!filterModalVisible);
  }, [filterModalVisible]);

  const selectFilter = useCallback(
    async (sort: string) => {
      if (!isConnected) return showNoConnectionAlert();

      page.current = 1;
      toggleFilterModal();
      const c = await commentService.getComments(lessonId, sort, page.current);
      allCommentsNum.current = c.meta.totalCommentsAndReplies;
      setComments(c.data);
      setSortByComments(sort);
    },
    [lessonId, sortByComments, toggleFilterModal, isConnected]
  );

  const onDeleteComment = useCallback(
    (id: number) => {
      if (!isConnected) return showNoConnectionAlert();

      allCommentsNum.current -= 1;
      setComments(comments.filter(c => c.id !== id));
      commentService.deleteComment(id);
    },
    [comments, isConnected]
  );

  useImperativeHandle(ref, () => ({
    async loadMoreComments() {
      if (!isConnected) return showNoConnectionAlert();

      if (!allowScroll.current) {
        return;
      }

      if (page.current * 10 < nrOfComments) {
        setAnimate(true);

        page.current += 1;
        allowScroll.current = false;
        const c = await commentService.getComments(
          lessonId,
          sortByComments,
          page.current
        );
        allCommentsNum.current = c.meta.totalCommentsAndReplies;
        setComments(page.current === 1 ? c.data : comments.concat(c.data));
        setAnimate(false);
        allowScroll.current = true;
      }
    }
  }));

  const onAddOrRemoveReply = useCallback(async () => {
    if (!isConnected) return showNoConnectionAlert();

    const c = await commentService.getComments(
      lessonId,
      sortByComments,
      page.current
    );
    allCommentsNum.current = c.meta.totalCommentsAndReplies;
    setComments(page.current === 1 ? c.data : comments.concat(c.data));
  }, [lessonId, sortByComments, isConnected]);

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
          {filters({ icon: { height: 25, width: 25, fill: utils.color } })}
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={toggleFilterModal}
          supportedOrientations={['portrait', 'landscape']}
          animationType='slide'
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleFilterModal}
            style={styles.modalContainer}
          >
            <View style={styles.background}>
              {filterOptions.map((option, index) => (
                <TouchableOpacity
                  style={styles.filterContainer}
                  key={index}
                  onPress={() => selectFilter(option.value)}
                >
                  {option.value === sortByComments &&
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
                      option.value === sortByComments
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
          </TouchableOpacity>
        </Modal>
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
      <CommentInputModal
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
            onLayout={e => input.current?.focus()}
            onChangeText={text => setCommentText(text)}
          />
          <TouchableOpacity style={styles.sendIcon} onPress={addComment}>
            {send({ icon: { height: 30, width: 30, fill: utils.color } })}
          </TouchableOpacity>
        </SafeAreaView>
      </CommentInputModal>
    </View>
  );
});

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
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold',
      marginLeft: 15,
      color: current.contrastTextColor
    },
    filterText: {
      fontSize: utils.figmaFontSizeScaler(12),
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
      fontSize: utils.figmaFontSizeScaler(12),
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
      fontSize: utils.figmaFontSizeScaler(12),
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
    },
    modalContainer: {
      backgroundColor: 'rgba(0, 0, 0, .8)',
      flex: 1,
      justifyContent: 'flex-end'
    }
  });
