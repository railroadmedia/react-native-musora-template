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
  Text,
  View,
  Linking,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';
import {
  bell,
  creditCard,
  folder,
  phone,
  privacy,
  profile,
  right,
  termsOfUse,
  turnOff
} from '../../images/svgs';
import { AnimatedCustomAlert } from '../../common_components/AnimatedCustomAlert';
import { Loading } from '../../common_components/Loading';
import { UserContext } from '../../state/user/UserContext';
import { ProfileSettings } from './ProfileSettings';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface Props {}

export const Settings: React.FC<Props> = () => {
  const { navigate } = useNavigation<
    NavigationProp<ReactNavigation.RootParamList> & {
      navigate: (scene: string, props: {}) => void;
    }
  >();

  const [alertBtnText, setAlertBtnText] = useState('');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user: cachedUser } = useContext(UserContext);

  const loadingRef = createRef<any>();
  const animatedAlert = createRef<any>();
  const restoreAlert = createRef<any>();
  const restoreSuccessfull = createRef<any>();
  let alertBtn = useRef<string>();
  let styles = setStyles(theme);

  const iconStyle = useMemo(() => {
    return { height: 20, width: 20, fill: utils.color };
  }, []);

  const navigationItems = useMemo(() => {
    return [
      { title: 'Profile Settings', icon: profile({ icon: iconStyle }) },
      {
        title: 'Notification Settings',
        icon: bell({ icon: iconStyle }),
        route: 'notificationSettings'
      },
      { title: 'Support', icon: phone({ icon: iconStyle }), route: 'support' },
      { title: 'Manage Subscription', icon: folder({ icon: iconStyle }) },
      {
        title: 'Terms of Use',
        icon: termsOfUse({ icon: iconStyle }),
        route: 'terms'
      },
      {
        title: 'Privacy Policy',
        icon: privacy({ icon: iconStyle }),
        route: 'privacyPolicy'
      },
      { title: 'Restore Purchases', icon: creditCard({ icon: iconStyle }) }, // tbd
      { title: 'Log out', icon: turnOff({ icon: iconStyle }) }
    ];
  }, []);

  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  const onButtonPress = useCallback((title: string, route?: string) => {
    if (title === 'Manage Subscription') manageSubscription();
    else if (title === 'Restore Purchases') restorePurchases();
    else if (title === 'Profile Settings') setShowProfileSettings(true);
    else if (title === 'Log out') {
      // TODO
    } else if (route) {
      navigate(route, {});
    }
  }, []);

  const manageSubscription = useCallback(() => {
    let { isAppleAppSubscriber, isGoogleAppSubscriber } = cachedUser || {};
    if (utils.isiOS) {
      if (isAppleAppSubscriber) {
        setAlertBtnText('View Subscriptions');
        alertBtn.current = 'viewiOS';
        animatedAlert.current?.toggle(
          'Manage Subscription',
          'You have an Apple App Store subscription that can only be managed through the Apple I.D. used to purchase it.'
        );
      } else {
        setAlertBtnText('Got it!');
        alertBtn.current = 'gotIt';
        animatedAlert.current?.toggle(
          'Manage Subscription',
          'Sorry! You can only manage your Apple App Store based subscriptions here.'
        );
      }
    } else {
      if (isGoogleAppSubscriber) {
        setAlertBtnText('View Subscriptions');
        alertBtn.current = 'viewAndroid';
        animatedAlert.current?.toggle(
          'Manage Subscription',
          'You have a Google Play subscription that can only be managed through the Google Account used to purchase it.'
        );
      } else {
        setAlertBtnText('Got it!');
        alertBtn.current = 'gotIt';
        animatedAlert.current?.toggle(
          'Manage Subscription',
          `You can only manage Google Play subscriptions here. Please sign in to ${utils.brand} on your original subscription platform to manage your settings.`
        );
      }
    }
  }, []);

  const restorePurchases = useCallback(async () => {}, []);

  const onContactSupport = useCallback(() => {
    alertBtn.current = '';
    animatedAlert.current?.toggle();
    Linking.openURL(`mailto:support@${utils.brand}.com`);
  }, []);

  const onViewSubscription = useCallback(() => {
    if (alertBtn.current === 'viewiOS')
      Linking.openURL('itms-apps://apps.apple.com/account/subscriptions');
    else if (alertBtn.current === 'viewAndroid')
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    animatedAlert.current?.toggle();
    alertBtn.current = '';
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={themeStyles[theme].background}
        barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
      />
      <ScrollView style={styles.container}>
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => onButtonPress(item.title, item.route)}
          >
            <View style={styles.iconContainer}>
              {item.icon}
              <Text style={styles.btnTitle}>{item.title}</Text>
            </View>
            {right({
              icon: {
                height: 20,
                width: 20,
                fill: themeStyles[theme].textColor
              }
            })}
          </TouchableOpacity>
        ))}
        <View style={styles.centerRow}>
          <TouchableOpacity
            style={styles.darkThemeBtn}
            onPress={() => toggleTheme()}
          >
            <Text style={styles.darkThemeBtnText}>DARK MODE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.lightThemeBtn}
            onPress={() => toggleTheme()}
          >
            <Text style={styles.lightThemeBtnText}>LIGHT MODE</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionNum}>VERSION {DeviceInfo.getVersion()}</Text>
        {utils.rootUrl.includes('staging') && (
          <Text style={styles.versionNum}>
            BUILD NUMBER {DeviceInfo.getBuildNumber()}
          </Text>
        )}
      </ScrollView>
      <AnimatedCustomAlert ref={animatedAlert}>
        <TouchableOpacity
          style={styles.additionalBtn}
          onPress={onViewSubscription}
        >
          <Text style={styles.additionalBtnText}>{alertBtnText}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onContactSupport}>
          <Text style={styles.additionalTextBtn}>Contact Support</Text>
        </TouchableOpacity>
      </AnimatedCustomAlert>
      <AnimatedCustomAlert
        ref={restoreAlert}
        onClose={() => {
          if (loadingRef) loadingRef.current?.toggleLoading(false);
        }}
      />
      <Loading ref={loadingRef} />
      <AnimatedCustomAlert
        ref={restoreSuccessfull}
        onClose={() => {
          if (loadingRef) loadingRef.current?.toggleLoading(false);
        }}
      >
        <TouchableOpacity
          onPress={() => restoreSuccessfull.current?.toggle()}
          style={styles.additionalBtn}
        >
          <Text style={styles.additionalBtnText}>OK</Text>
        </TouchableOpacity>
      </AnimatedCustomAlert>
      {showProfileSettings && (
        <ProfileSettings closeModal={() => setShowProfileSettings(false)} />
      )}
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    centerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    darkThemeBtn: {
      flex: 1,
      margin: 10,
      borderWidth: 1,
      marginRight: 5,
      backgroundColor: '#002539',
      borderColor: current.contrastTextColor,
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    lightThemeBtn: {
      flex: 1,
      margin: 10,
      borderWidth: 1,
      marginLeft: 5,
      backgroundColor: '#e1e6eb',
      borderColor: '#ced6dd',
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    button: {
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: current.borderColor,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    },
    versionNum: {
      alignSelf: 'center',
      textAlign: 'center',
      padding: 10,
      color: current.contrastTextColor,
      fontSize: 12,
      fontFamily: 'OpenSans'
    },
    additionalBtn: {
      backgroundColor: utils.color,
      marginTop: 10,
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    additionalBtnText: {
      padding: 15,
      color: '#ffffff',
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15
    },
    additionalTextBtn: {
      color: utils.color,
      padding: 20,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'OpenSans'
    },
    btnTitle: {
      fontSize: 14,
      fontFamily: 'OpenSans-Bold',
      color: current.textColor,
      marginLeft: 10
    },
    darkThemeBtnText: {
      color: '#486178',
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15
    },
    lightThemeBtnText: {
      color: '#b9c5d3',
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: 15
    }
  });
