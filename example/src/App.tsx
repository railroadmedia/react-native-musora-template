import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
  Header
} from 'react-native-musora-templates';

const Stack = createStackNavigator();

const navigationRef = React.createRef<NavigationContainerRef>();

let sceneOptions = {
  headerShown: false
};
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    utils.rootUrl = 'https://staging.drumeo.com/laravel/public';
    utils.brand = 'drumeo';

    authenticate()
      .then(({ token }) => {
        if (token) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <State>
        {authenticated && (
          <>
            <Header />
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator>
                <Stack.Screen name='home' options={sceneOptions}>
                  {props => <Catalogue {...props} scene='home' />}
                </Stack.Screen>
                <Stack.Screen name='courses' options={sceneOptions}>
                  {props => <Catalogue {...props} scene='courses' />}
                </Stack.Screen>
                <Stack.Screen name='profile' options={sceneOptions}>
                  {props => <Profile {...props} whatever='home' />}
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
            </View>
          </>
        )}
      </State>
    </SafeAreaProvider>
  );
}
