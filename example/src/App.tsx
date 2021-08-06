import React, { useEffect, useState } from 'react';
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
      header: ({ options: { title, headerTransparent } }: StackHeaderProps) => {
        return (
          <Header
            onLogoPress={() => navigate('home')}
            onDownloadsPress={() => navigate('downloads')}
            onMyListPress={() => navigate('myList')}
            onProfilePress={() => navigate('profile')}
            onBack={title ? goBack : undefined}
            onSettings={
              title?.toLowerCase()?.match(/^(profile)$/) ? () => {} : undefined
            }
            title={title}
            transparent={headerTransparent}
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
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.('search');
                        BottomNav.setVisibility?.(true);
                      }
                    }}
                  >
                    {props => <Catalogue {...props} scene='courses' />}
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
                    options={{ title: 'Profile', headerTransparent: true }}
                    listeners={{
                      focus: () => {
                        BottomNav.changeActiveBtn?.();
                        BottomNav.setVisibility?.(false);
                      }
                    }}
                  >
                    {props => <Profile {...props} />}
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
