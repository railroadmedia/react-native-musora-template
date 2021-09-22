import React, {
  createRef,
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
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import { back } from '../../images/svgs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ExpandableView } from '../../common_components/ExpandableView';
import { Loading, LoadingRefObject } from '../../common_components/Loading';
import { studentFocuService } from '../../services/studentFocus.service';
import ActionModal, {
  CustomRefObject
} from '../../common_components/modals/ActionModal';

interface SectionType {
  q: string;
  param: string;
}
const weaknessObj: SectionType = {
  q: `What is your biggest weakness as a drummer?`,
  param: 'weakness'
};
const instructorFocusObj: SectionType = {
  q: `What would you like the instructor to focus on?`,
  param: 'instructor_focus'
};
const improvementObj: SectionType = {
  q: `What is one aspect of your drumming you'd like to improve?`,
  param: 'improvement'
};

const goalObj: SectionType = {
  q: `What is your goal as a drummer?`,
  param: 'goal'
};

const windowWidth = Dimensions.get('screen').width;
interface Props {}

export const StudentReview: React.FC<Props> = () => {
  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string) => void;
    }
  >();

  const { theme } = useContext(ThemeContext);
  const scrollView = useRef<any>();
  const expSkill = createRef<any>();
  const loadingRef = useRef<LoadingRefObject>(null);
  const alert = useRef<CustomRefObject>(null);
  const nextScrollTo = useRef(0);
  const prevScrollTo = useRef(0);
  const goal = useRef('');
  const weakness = useRef('');
  const experience = useRef('Beginner');
  const youtube_url = useRef('');
  const improvement = useRef('');
  const instructor_focus = useRef('');

  const [activeCarouselIndicator, setActiveCarouselIndicator] = useState(0);
  const [width, setWidth] = useState(windowWidth);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [experienceTitle, setExperienceTitle] = useState('Beginner');

  let styles = useMemo(() => setStyles(theme), [theme]);

  const dimChange = useCallback(e => {
    setWidth(e.window.width);
  }, []);

  useEffect(() => {
    const listener = Dimensions.addEventListener('change', dimChange);
    return () => {
      listener?.remove();
    };
  }, [dimChange]);

  const onNext = useCallback(async () => {
    Keyboard.dismiss();
    let disabled = false;
    if (activeCarouselIndicator === 5) {
      loadingRef.current?.toggleLoading(true);
      const ssrResp = await studentFocuService.submitStudentReview({
        goal: goal.current,
        weakness: weakness.current,
        experience: experience.current,
        youtube_url: youtube_url.current,
        improvement: improvement.current,
        instructor_focus: instructor_focus.current
      });
      loadingRef.current?.toggleLoading(false);
      if (ssrResp.success) {
        if (nextScrollTo.current === 0) nextScrollTo.current = width;
        scrollView.current?.scrollTo({
          x: nextScrollTo.current,
          y: 0,
          animated: true
        });
        setActiveCarouselIndicator(activeCarouselIndicator + 1);
        setNextDisabled(disabled);
        return;
      } else {
        return alert.current?.toggle(
          ssrResp.title || 'Something went wrong',
          ssrResp.message || 'Please try again later!'
        );
      }
    } else if (activeCarouselIndicator === 6) {
      return navigate('home');
    }
    if (nextScrollTo.current === 0) {
      nextScrollTo.current = width;
    }
    scrollView.current?.scrollTo({
      x: nextScrollTo.current,
      y: 0,
      animated: true
    });
    switch (activeCarouselIndicator) {
      case 0:
        disabled = !improvement.current.length;
        break;
      case 1:
        disabled = !weakness.current.length;
        break;
      case 2:
        disabled = !instructor_focus.current.length;
        break;
      case 3:
        disabled = !goal.current.length;
        break;
    }

    setActiveCarouselIndicator(activeCarouselIndicator + 1);
    setNextDisabled(disabled);
    prevScrollTo.current = nextScrollTo.current;
    nextScrollTo.current += width;
  }, [activeCarouselIndicator, alert, loadingRef, scrollView, navigate, width]);

  const onBack = useCallback(() => {
    Keyboard.dismiss();
    let disabled = false;
    nextScrollTo.current = prevScrollTo.current;
    prevScrollTo.current -= width;
    scrollView.current?.scrollTo({
      x: prevScrollTo.current,
      y: 0,
      animated: true
    });
    switch (activeCarouselIndicator) {
      case 2:
        disabled = !improvement.current.length;
        break;
      case 3:
        disabled = !weakness.current.length;
        break;
      case 4:
        disabled = !instructor_focus.current.length;
        break;
      case 5:
        disabled = !goal.current.length;
        break;
    }
    setActiveCarouselIndicator(activeCarouselIndicator - 1);
    setNextDisabled(disabled);
  }, [activeCarouselIndicator, scrollView, width]);

  const renderTitle = (
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      {back({
        icon: {
          fill: themeStyles[theme].textColor,
          height: 30,
          width: 30
        }
      })}
      <Text style={styles.title}>Student Review</Text>
    </TouchableOpacity>
  );

  const setExperience = useCallback(
    (experienceType: string) => {
      expSkill.current.toggleView();
      experience.current = experienceType;
      setExperienceTitle(experienceType);
    },
    [expSkill]
  );

  const renderExperience = (
    <ScrollView
      bounces={false}
      style={{ width, flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps={'handled'}
    >
      {renderTitle}
      <Text style={styles.subtitle}>
        What is your current drumming skill level?
      </Text>
      <ExpandableView
        iconColor={themeStyles[theme].contrastTextColor || '#FFFFFF'}
        ref={expSkill}
        title={experienceTitle}
        titleStyle={styles.expandableTitle}
        dropStyle={styles.drop}
      >
        {['Beginner', 'Intermediate', 'Advanced'].map((l, i) => (
          <TouchableOpacity
            key={l}
            style={[
              styles.experienceBtn,
              {
                backgroundColor: `rgba(225, 230, 235, ${i === 1 ? 0.4 : 0.2})`
              }
            ]}
            onPress={() => setExperience(l)}
          >
            <Text style={styles.experienceText}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ExpandableView>
    </ScrollView>
  );

  const setSection = useCallback((text: string, type: string) => {
    switch (type) {
      case 'weakness':
        weakness.current = text;
        break;
      case 'instructor_focus':
        instructor_focus.current = text;
        break;
      case 'improvement':
        improvement.current = text;
        break;
      case 'goal':
        goal.current = text;
        break;
      default:
        return;
    }
    setNextDisabled(!text.length);
  }, []);

  const renderTextInput = (section: SectionType) => (
    <View style={{ width, flex: 1, padding: 20 }}>
      {renderTitle}

      <Text style={styles.subtitle}>{section.q}</Text>
      <TextInput
        maxLength={100}
        multiline={true}
        keyboardAppearance={'dark'}
        style={styles.bigTextInput}
        spellCheck={false}
        autoCorrect={true}
        autoCapitalize={'sentences'}
        onChangeText={text => setSection(text, section.param)}
      />
      <Text style={styles.detail}>
        This field is required. 100 characters max.
      </Text>
    </View>
  );
  const renderYoutube = (
    <ScrollView
      bounces={false}
      style={{ width, flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps={'handled'}
    >
      {renderTitle}
      <Text style={styles.subtitle}>YouTube Video URL</Text>
      <TextInput
        keyboardAppearance={'dark'}
        onChangeText={text => (youtube_url.current = text)}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={'none'}
        style={styles.smallTextInput}
      />
      <Text style={styles.detail}>
        {`It is highly recommended you provide a video of your playing for an instructor to effectively review your drumming and create a customized Student Plan, though it is not required.\n\nYour video may be broadcasted live, and archived, inside one of our Student Focus sessions.`}
      </Text>
    </ScrollView>
  );

  const renderThankYou = (
    <ScrollView
      bounces={false}
      style={{ width, flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Student Review</Text>
      <Text style={styles.subtitle}>Thanks for your submission!</Text>
      <Text style={styles.detail}>
        Your submission has been sent to a Drumeo Instructor. Typically, they'll
        email you within 48 hours to let you know when your review and custom
        Student Plan will be ready!
      </Text>
    </ScrollView>
  );

  const onScrollViewLayout = useCallback(
    nativeEvent => {
      const scrollW = nativeEvent.layout.width;
      nextScrollTo.current = (activeCarouselIndicator + 1) * scrollW;
      prevScrollTo.current = (activeCarouselIndicator - 1) * scrollW;
      scrollView?.current?.scrollTo({
        x: activeCarouselIndicator * scrollW,
        y: 0,
        animated: false
      });
      if (scrollW !== width) setWidth(scrollW);
    },
    [activeCarouselIndicator, scrollView, width]
  );

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar
          backgroundColor={themeStyles[theme].background}
          barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
        />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={utils.isiOS ? 'padding' : undefined}
        >
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
            {renderExperience}
            {renderTextInput(improvementObj)}
            {renderTextInput(weaknessObj)}
            {renderTextInput(instructorFocusObj)}
            {renderTextInput(goalObj)}
            {renderYoutube}
            {renderThankYou}
          </ScrollView>
          <View style={styles.center}>
            {activeCarouselIndicator < 6 && (
              <View style={styles.dotContainer}>
                {[0, 1, 2, 3, 4, 5].map(dot => (
                  <View
                    key={dot}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          activeCarouselIndicator === dot
                            ? utils.color
                            : 'transparent'
                      }
                    ]}
                  />
                ))}
              </View>
            )}
            <TouchableOpacity
              disabled={nextDisabled}
              style={[
                styles.next,
                nextDisabled ? { backgroundColor: '#e1e6eb' } : {}
              ]}
              onPress={onNext}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: nextDisabled ? '#b9c5d3' : 'white' }
                ]}
              >
                {activeCarouselIndicator === 5
                  ? 'SUBMIT'
                  : activeCarouselIndicator < 6
                  ? 'NEXT'
                  : 'HOME'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <ActionModal
          ref={alert}
          onCancel={() => alert.current?.toggle('', '')}
        />
      </SafeAreaView>
      <Loading ref={loadingRef} />
    </>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'space-between'
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    expandableTitle: {
      color: current.contrastTextColor
    },
    detail: {
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    dotContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      bottom: utils.isTablet ? 20 : 10,
      justifyContent: 'center',
      width: '100%'
    },
    dot: {
      width: 10,
      height: 10,
      borderWidth: 1,
      margin: 5,
      borderRadius: 5,
      borderColor: utils.color
    },
    next: {
      height: 50,
      minWidth: '30%',
      marginBottom: 15,
      borderRadius: 100,
      backgroundColor: utils.color,
      alignItems: 'center',
      justifyContent: 'center'
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20
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
    bigTextInput: {
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      textAlignVertical: 'top',
      minHeight: 100,
      marginVertical: 10,
      borderColor: current.borderColor,
      color: current.contrastTextColor,
      backgroundColor: current.borderColor
    },
    smallTextInput: {
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      borderWidth: 1,
      borderRadius: 50,
      padding: 10,
      textAlignVertical: 'center',
      marginVertical: 10,
      borderColor: current.borderColor,
      color: current.contrastTextColor,
      backgroundColor: current.borderColor
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15)
    },
    drop: {
      borderColor: current.contrastTextColor,
      borderWidth: 1,
      borderRadius: 50,
      marginVertical: 10
    },
    experienceText: {
      textAlign: 'center',
      color: current.contrastTextColor
    },
    experienceBtn: {
      padding: 10,
      borderWidth: 1,
      borderColor: current.borderColor
    }
  });
