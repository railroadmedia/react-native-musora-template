import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackHeaderProps,
  StackNavigationOptions
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  authenticate,
  utils,
  Catalogue,
  Profile,
  State,
  MyList,
  Downloads,
  BottomNav,
  Header
} from 'react-native-musora-templates';

const screensWithBackHeader = ['myList', 'downloads', 'profile'],
  screensWithTransparentHeader = ['profile'],
  screensWithSettingsHeader = ['profile'],
  scenesWithBottomNav = ['home', 'search', 'forum'];

const Stack = createStackNavigator(),
  navigationRef = React.createRef<NavigationContainerRef>(),
  stackOptions: StackNavigationOptions = {
    header: ({
      scene: {
        route: { name },
        progress: { current, next },
        descriptor: {
          options: { title }
        }
      }
    }: StackHeaderProps) => {
      return (
        <Animated.View
          style={{
            opacity: Animated.add(current, next || 0).interpolate({
              inputRange: [0, 1, 2],
              outputRange: [0, 1, 0]
            })
          }}
        >
          <Header
            onDownloadsPress={() =>
              navigationRef.current?.navigate('downloads')
            }
            onLogoPress={() => navigationRef.current?.navigate('home')}
            onMyListPress={() => navigationRef.current?.navigate('myList')}
            onProfilePress={() => navigationRef.current?.navigate('profile')}
            onBack={
              screensWithBackHeader.includes(name)
                ? () => navigationRef.current?.goBack()
                : undefined
            }
            onSettings={
              screensWithSettingsHeader.includes(name) ? () => {} : undefined
            }
            transparent={screensWithTransparentHeader.includes(name)}
            title={title}
          />
        </Animated.View>
      );
    }
  };

export default function App() {
  const bottomNavOpacity = useRef(new Animated.Value(0));
  const [authenticated, setAuthenticated] = useState(false);
  const [bottomNavMaxHeight, setBottomNavMaxHeight] = useState(0);

  useEffect(() => {
    utils.rootUrl = 'https://staging.pianote.com';
    utils.brand = 'pianote';

    authenticate()
      .then(auth => {
        if (auth?.token) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  const animateBottomNav = () => {
    let name = navigationRef.current?.getCurrentRoute()?.name || '';
    if (!bottomNavMaxHeight)
      setBottomNavMaxHeight(scenesWithBottomNav.includes(name) ? 1000 : 0);
    Animated.timing(bottomNavOpacity.current, {
      toValue: scenesWithBottomNav.includes(name) ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setBottomNavMaxHeight(scenesWithBottomNav.includes(name) ? 1000 : 0);
    });
  };

  return (
    <SafeAreaProvider>
      <State>
        {authenticated && (
          <>
            <NavigationContainer
              ref={navigationRef}
              onReady={animateBottomNav}
              onStateChange={animateBottomNav}
            >
              <Stack.Navigator screenOptions={stackOptions}>
                <Stack.Screen name='home'>
                  {props => <Catalogue {...props} scene='home' />}
                </Stack.Screen>
                <Stack.Screen name='search'>
                  {props => <Catalogue {...props} scene='search' />}
                </Stack.Screen>
                <Stack.Screen name='myList' options={{ title: 'My List' }}>
                  {props => <MyList {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen name='downloads' options={{ title: 'Downloads' }}>
                  {props => <Downloads {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen
                  name='profile'
                  options={{ headerTransparent: true, title: 'Profile' }}
                >
                  {props => <Profile {...props} />}
                </Stack.Screen>
                <Stack.Screen name='forum' options={{ header: () => null }}>
                  {props => <Catalogue {...props} scene='forum' />}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
            <Animated.View
              style={{
                overflow: 'hidden',
                maxHeight: bottomNavMaxHeight,
                opacity: bottomNavOpacity.current
              }}
            >
              <BottomNav
                onHomePress={() => navigationRef.current?.navigate('home')}
                onSearchPress={() => navigationRef.current?.navigate('search')}
                onForumPress={() => navigationRef.current?.navigate('forum')}
                onMenuPress={() => {}}
              />
            </Animated.View>
          </>
        )}
      </State>
    </SafeAreaProvider>
  );
}
