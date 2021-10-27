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
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  StyleSheet,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { back } from '../../images/svgs';
import { Loading, LoadingRefObject } from '../../common_components/Loading';
import { studentFocuService } from '../../services/studentFocus.service';
import { ActionModal } from '../../common_components/modals/ActionModal';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

const windowWidth = Dimensions.get('screen').width;

interface Props {}

export const SubmitCollabVideo: React.FC<Props> = () => {
  const { goBack } = useNavigation();
  const [nextDisabled, setNextDisabled] = useState(true);
  const [width, setWidth] = useState(windowWidth);
  const [activeIndex, setActiveIndex] = useState(0);

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const loadingRef = useRef<LoadingRefObject>(null);
  const alert = useRef<React.ElementRef<typeof ActionModal>>(null);
  const scrollView = useRef<ScrollView>(null);
  const videoUrl = useRef<string>('');

  const styles = useMemo(() => setStyles(theme), [theme]);

  const dimChange = useCallback(e => {
    setWidth(e.window.width);
  }, []);

  useEffect(() => {
    const listener = Dimensions.addEventListener('change', dimChange);
    return () => {
      listener?.remove();
    };
  }, [dimChange]);

  const setVideoUrl = useCallback((text: string) => {
    videoUrl.current = text;
    setNextDisabled(!text.length);
  }, []);

  const renderTextInput = (
    <ScrollView
      bounces={false}
      style={{ width, flex: 1, height: '100%' }}
      contentContainerStyle={styles.contentContainerStyle}
      keyboardShouldPersistTaps={'handled'}
    >
      <View style={styles.backBtn}>
        {back({
          icon: {
            fill: themeStyles[theme].textColor,
            height: 30,
            width: 30
          },
          onPress: goBack
        })}
        <Text style={styles.title}>Submit Your Video</Text>
      </View>
      <Text style={styles.subtitle}>Video URL</Text>
      <TextInput
        keyboardAppearance={'dark'}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={'none'}
        style={styles.textInput}
        onChangeText={text => setVideoUrl(text)}
      />
      <Text style={styles.detail}>
        Please submit your video by entering a URL from either YouTube, Vimeo or
        any other video sharing site. The cutoff for submission is 3 days before
        the end of the month to allow time to edit the video.
      </Text>
    </ScrollView>
  );

  const renderInfo = (
    <ScrollView
      bounces={false}
      style={{ width, flex: 1 }}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <Text style={styles.title}>Submit Your Video</Text>
      <Text style={styles.subtitle}>Thanks for your submission!</Text>
      <Text style={styles.detail}>
        Our team will combine your video with the other student videos to create
        next months episode. Collaborations are tipically released on the first
        of each month.
      </Text>
    </ScrollView>
  );

  const onNext = useCallback(async () => {
    Keyboard.dismiss();
    if (activeIndex) {
      goBack();
    } else {
      if (!isConnected) return showNoConnectionAlert();

      loadingRef.current?.toggleLoading(true);
      let ssrResp = await studentFocuService.submitCollabVideo({
        video: videoUrl.current
      });
      loadingRef.current?.toggleLoading(false);
      if (ssrResp.success) {
        scrollView.current?.scrollToEnd();
        setActiveIndex(1);
        return;
      } else {
        return alert.current?.toggle(
          ssrResp.title || 'Something went wrong',
          ssrResp.message || 'Please try again later!'
        );
      }
    }
  }, [loadingRef, alert, goBack, activeIndex, isConnected]);

  const onScrollViewLayout = useCallback(
    nativeEvent => {
      let scrollW = nativeEvent.layout.width;
      scrollView.current?.scrollTo({
        x: activeIndex * scrollW,
        y: 0,
        animated: false
      });
      if (scrollW !== width) setWidth(scrollW);
    },
    [activeIndex, scrollView, width]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={utils.isiOS ? 'padding' : undefined}
      >
        <View style={styles.scrollContainer}>
          <ScrollView
            bounces={false}
            style={styles.container}
            horizontal={true}
            pagingEnabled={true}
            scrollEnabled={false}
            removeClippedSubviews={false}
            ref={scrollView}
            keyboardShouldPersistTaps={'handled'}
            showsHorizontalScrollIndicator={false}
            onLayout={({ nativeEvent }) => onScrollViewLayout(nativeEvent)}
          >
            {renderTextInput}
            {renderInfo}
          </ScrollView>
          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity
              disabled={nextDisabled}
              style={[
                styles.next,
                nextDisabled
                  ? { backgroundColor: '#e1e6eb', borderColor: '#e1e6eb' }
                  : null
              ]}
              onPress={onNext}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: nextDisabled ? '#b9c5d3' : 'white' }
                ]}
              >
                {activeIndex ? 'BACK TO SHOW' : 'SUBMIT'}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
      <ActionModal ref={alert} onCancel={() => alert.current?.toggle()} />
      <Loading ref={loadingRef} />
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    contentContainerStyle: {
      padding: 20
    },
    scrollContainer: {
      flex: 1,
      justifyContent: 'space-between'
    },
    next: {
      height: 50,
      bottom: 15,
      minWidth: '35%',
      borderRadius: 100,
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: utils.color,
      borderColor: utils.color,
      borderWidth: 2,
      minHeight: 50
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20
    },
    detail: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 50,
      padding: 10,
      marginVertical: 10,
      textAlignVertical: 'center',
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      borderColor: current.borderColor,
      color: current.contrastTextColor,
      backgroundColor: current.borderColor
    },
    title: {
      textAlign: 'center',
      flex: 1,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(24),
      fontFamily: 'OpenSans-Bold'
    },
    subtitle: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold'
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15)
    }
  });
