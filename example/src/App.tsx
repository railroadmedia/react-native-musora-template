import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRefWithCurrent,
  ParamListBase,
  RouteProp,
  useNavigationContainerRef
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

const Stack = createStackNavigator();

export default function App() {
  const navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList> & {
    navigate: (scene: string) => void;
  } = useNavigationContainerRef();

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

  const navigate = navigationRef.navigate;

  const screenOptions: (props: {
    route: RouteProp<ParamListBase, string>;
    navigation: any;
  }) => StackNavigationOptions = ({ navigation: { navigate, goBack } }) => {
    return {
      headerMode: 'float',
      header: ({
        progress: { current, next },
        options: { title, headerTransparent }
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
              onLogoPress={() => navigate('home')}
              onDownloadsPress={() => navigate('downloads')}
              onMyListPress={() => navigate('myList')}
              onProfilePress={() => navigate('profile')}
              onBack={title ? goBack : undefined}
              onSettings={
                title?.toLowerCase()?.match(/^(profile)$/)
                  ? () => {}
                  : undefined
              }
              title={title}
              transparent={headerTransparent}
            />
          </Animated.View>
        );
      }
    };
  };

  return (
    <>
      <SafeAreaProvider>
        <State>
          {authenticated && (
            <>
              <NavigationContainer ref={navigationRef}>
                <Stack.Navigator screenOptions={screenOptions}>
                  <Stack.Screen
                    name='home'
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.('home')
                    }}
                  >
                    {props => <Catalogue {...props} scene='home' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='search'
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.('search')
                    }}
                  >
                    {props => <Catalogue {...props} scene='courses' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='myList'
                    options={{ title: 'My List' }}
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.()
                    }}
                  >
                    {props => <MyList {...props} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='downloads'
                    options={{ title: 'Downloads' }}
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.()
                    }}
                  >
                    {props => <Downloads {...props} whatever='whatever' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='profile'
                    options={{ title: 'Profile', headerTransparent: true }}
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.()
                    }}
                  >
                    {props => <Profile {...props} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='forum'
                    listeners={{
                      focus: () => BottomNav.changeActiveBtn?.('forum')
                    }}
                  >
                    {props => <Catalogue {...props} scene='forum' />}
                  </Stack.Screen>
                </Stack.Navigator>
              </NavigationContainer>
              <BottomNav
                onHomePress={() => navigate('home')}
                onSearchPress={() => navigate('search')}
                onForumPress={() => navigate('forum')}
                onMenuPress={() => {}}
              />
            </>
          )}
        </State>
      </SafeAreaProvider>
    </>
  );
}
