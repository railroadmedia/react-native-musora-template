import React, { useEffect, useState } from 'react';
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
  Header,
  BackHeader,
  MyList,
  Downloads,
  BottomNav
} from 'react-native-musora-templates';

const Stack = createStackNavigator(),
  navigationRef = React.createRef<NavigationContainerRef>(),
  stackOptions: StackNavigationOptions = {
    header: ({
      scene: {
        route: { name },
        progress: { current, next }
      }
    }: StackHeaderProps) => {
      const isMainHeader = !!name.match(/^(home|courses)$/);
      const isBackNavHeaderTransparent = !!name.match(/^(profile)$/);
      const backNavHeaderHasSettings = !!name.match(/^(profile)$/);
      return (
        <Animated.View
          style={{
            opacity: Animated.add(current, next || 0).interpolate({
              inputRange: [0, 1, 2],
              outputRange: [0, 1, 0]
            })
          }}
        >
          {isMainHeader ? (
            <Header
              onLogoPress={() => navigationRef.current?.navigate('home')}
              onDownloadsPress={() =>
                navigationRef.current?.navigate('downloads')
              }
              onMyListPress={() => navigationRef.current?.navigate('myList')}
              onProfilePress={() => navigationRef.current?.navigate('profile')}
            />
          ) : (
            <BackHeader
              onBack={() => navigationRef.current?.goBack()}
              title={name}
              transparent={isBackNavHeaderTransparent}
              onSettings={backNavHeaderHasSettings ? () => {} : undefined}
            />
          )}
        </Animated.View>
      );
    }
  };

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    utils.rootUrl = 'https://staging.pianote.com';
    utils.brand = 'pianote';

    authenticate()
      .then(auth => {
        if (auth?.token) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <State>
        {authenticated && (
          <>
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator screenOptions={stackOptions}>
                <Stack.Screen name='home'>
                  {props => <Catalogue {...props} scene='home' />}
                </Stack.Screen>
                <Stack.Screen name='courses'>
                  {props => <Catalogue {...props} scene='courses' />}
                </Stack.Screen>
                <Stack.Screen name='myList'>
                  {props => <MyList {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen name='downloads'>
                  {props => <Downloads {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen
                  name='profile'
                  options={{ headerTransparent: true }}
                >
                  {props => <Profile {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name='noHeaderScene'
                  options={{ header: () => null }}
                >
                  {props => <Catalogue {...props} scene='courses' />}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
            <BottomNav
              onHomePress={() => navigationRef.current?.navigate('home')}
              onSearchPress={() => navigationRef.current?.navigate('courses')}
              onForumPress={() =>
                navigationRef.current?.navigate('noHeaderScene')
              }
              onMenuPress={() => {}}
            />
          </>
        )}
      </State>
    </SafeAreaProvider>
  );
}
