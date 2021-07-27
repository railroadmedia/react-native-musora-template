import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
  Downloads
} from 'react-native-musora-templates';

const Stack = createStackNavigator(),
  navigationRef = React.createRef<NavigationContainerRef>(),
  stackOptions = {
    header: (props: any) => {
      const isMainHeader = props.scene.route.name.match(/^(home|courses)$/);
      const isBackNavHeaderTransparent =
        props.scene.route.name.match(/^(profile)$/);
      const backNavHeaderHasSettings =
        props.scene.route.name.match(/^(profile)$/);
      const opacity = Animated.add(
        props.scene.progress.current,
        props.scene.progress.next || 0
      ).interpolate({
        inputRange: [0, 1, 2],
        outputRange: [isMainHeader ? 1 : 0, 1, 0]
      });
      return (
        <Animated.View style={{ opacity }}>
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
              title={props.scene.route.name}
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
                  options={{ headerShown: false }}
                >
                  {props => <Catalogue {...props} scene='courses' />}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => navigationRef.current?.navigate('home')}
              >
                <Text style={{ padding: 10 }}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigationRef.current?.navigate('courses')}
              >
                <Text style={{ padding: 10 }}>Courses</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigationRef.current?.navigate('noHeaderScene')}
              >
                <Text style={{ padding: 10 }}>No header scene</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </State>
    </SafeAreaProvider>
  );
}
