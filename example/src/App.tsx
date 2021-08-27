import React, { useEffect, useState } from 'react';
import { Easing } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRefWithCurrent,
  ParamListBase,
  RouteProp,
  useNavigationContainerRef
} from '@react-navigation/native';
import type { TransitionSpec } from '@react-navigation/stack/lib/typescript/src/types';
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
  Header,
  Search
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

  const config: TransitionSpec = {
    animation: 'timing',
    config: {
      duration: utils.navigationAnimationSpeed,
      easing: Easing.ease
    }
  };
  const screenOptions: (props: {
    route: RouteProp<ParamListBase, string>;
    navigation: any;
  }) => StackNavigationOptions = ({ navigation: { navigate, goBack } }) => {
    return {
      transitionSpec: { open: config, close: config },
      header: ({ options: { title } }: StackHeaderProps) => {
        return (
          <Header
            onLogoPress={() => {
              navigate('home');
              BottomNav.setVisibility?.(true);
            }}
            onDownloadsPress={() => {
              navigate('downloads');
              BottomNav.setVisibility?.(true);
            }}
            onMyListPress={() => {
              navigate('myList');
              BottomNav.setVisibility?.(true);
            }}
            onProfilePress={() => {
              navigate('profile');
              BottomNav.setVisibility?.(false);
            }}
            onBack={title ? goBack : undefined}
            onSettings={
              title?.toLowerCase()?.match(/^(profile)$/) ? () => {} : undefined
            }
            title={title}
            transparent={!!title?.toLowerCase()?.match(/^(profile)$/)}
          />
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
                      focus: () => {
                        BottomNav.changeActiveBtn?.('home');
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Catalogue {...props} scene='home' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='search'
                    options={{ title: 'Search' }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.('search');
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Search {...props} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='myList'
                    options={{ title: 'My List' }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.();
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <MyList {...props} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='downloads'
                    options={{ title: 'Downloads' }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.();
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Downloads {...props} whatever='whatever' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='profile'
                    options={{ title: 'Profile' }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.();
                        BottomNav.setVisibility?.(false);
                      }
                    }}
                  >
                    {props => <Profile />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='forum'
                    options={{ headerShown: false }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.('forum');
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Catalogue {...props} scene='forum' />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='courses'
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.();
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Catalogue {...props} scene='courses' />}
                  </Stack.Screen>
                </Stack.Navigator>
              </NavigationContainer>
              <BottomNav
                onHomePress={() => {
                  navigate('home');
                  BottomNav.setVisibility?.(true);
                }}
                onSearchPress={() => {
                  navigate('search');
                  BottomNav.setVisibility?.(true);
                }}
                onForumPress={() => {
                  navigate('forum');
                  BottomNav.setVisibility?.(true);
                }}
                onMenuPress={() => {
                  navigate('courses');
                  BottomNav.setVisibility?.(true);
                }}
              />
            </>
          )}
        </State>
      </SafeAreaProvider>
    </>
  );
}
