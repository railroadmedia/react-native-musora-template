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
  BackHeader
} from 'react-native-musora-templates';

const Stack = createStackNavigator(),
  navigationRef = React.createRef<NavigationContainerRef>(),
  stackOptions = {
    header: (props: any) => {
      const isMainHeader = props.scene.route.name.match(/^(home|courses)$/);
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
              onDownloadsPress={() => {}}
              onMyListPress={() => {}}
              onProfilePress={() => {}}
            />
          ) : (
            <BackHeader
              onBack={() => navigationRef.current?.goBack()}
              title={props.scene.route.name}
            />
          )}
        </Animated.View>
      );
    }
  };

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    utils.rootUrl = 'https://staging.drumeo.com/laravel/public';
    utils.brand = 'drumeo';

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
                <Stack.Screen name='profile'>
                  {props => <Profile {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen name='songs' options={{ headerShown: false }}>
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
                onPress={() => navigationRef.current?.navigate('profile')}
              >
                <Text style={{ padding: 10 }}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigationRef.current?.navigate('songs')}
              >
                <Text style={{ padding: 10 }}>Songs</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </State>
    </SafeAreaProvider>
  );
}
