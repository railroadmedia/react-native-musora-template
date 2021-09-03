import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackHeaderProps
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Catalogue } from './components/catalogue/Catalogue';
import { Downloads } from './components/downloads/Downloads';
import { MyList } from './components/myList/MyList';
import { Profile } from './components/profile/Profile';
import { Search } from './components/search/Search';

import { authenticate } from './services/auth.service';

import { Store } from './state/Store';
import { BottomNav } from './components/bottomNav/BottomNav';
import { Header } from './components/header/Header';
import { SeeAll } from './components/catalogue/SeeAll';
import { utils } from './utils';

type Scenes =
  | 'home'
  | 'courses'
  | 'songs'
  | 'playAlongs'
  | 'coaches'
  | 'shows'
  | 'search'
  | 'forum'
  | 'seeAll';
interface Props {
  bottomNavVisibleOn: Scenes[];
  catalogues: Scenes[];
}

const Stack = createStackNavigator<{
  [key: string]: {};
  seeAll: {
    title: string;
    fetcher: {
      scene: string;
      fetcherName: 'getAll' | 'getInProgress' | 'getRecentlyViewed' | 'getNew';
    };
  };
}>();

export const Router: React.FC<Props> = ({ catalogues, bottomNavVisibleOn }) => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    authenticate()
      .then(auth => {
        if (auth?.token) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <Store>
        {authenticated && (
          <>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  header: ({ options: { title } }: StackHeaderProps) => {
                    return (
                      <Header
                        title={title}
                        transparent={
                          !!title?.toLowerCase()?.match(/^(profile)$/)
                        }
                        settingsVisible={
                          !!title?.toLowerCase()?.match(/^(profile)$/)
                        }
                      />
                    );
                  },
                  transitionSpec: {
                    open: {
                      config: { duration: utils.navigationAnimationSpeed },
                      animation: 'timing'
                    },
                    close: {
                      config: { duration: utils.navigationAnimationSpeed },
                      animation: 'timing'
                    }
                  }
                }}
              >
                {catalogues.map(c => (
                  <Stack.Screen name={c} key={c}>
                    {props => <Catalogue {...props} scene={c} />}
                  </Stack.Screen>
                ))}
                <Stack.Screen name='search' options={{ title: 'Search' }}>
                  {props => <Search {...props} />}
                </Stack.Screen>
                <Stack.Screen name='myList' options={{ title: 'My List' }}>
                  {props => <MyList {...props} />}
                </Stack.Screen>
                <Stack.Screen name='downloads' options={{ title: 'Downloads' }}>
                  {props => <Downloads {...props} whatever='whatever' />}
                </Stack.Screen>
                <Stack.Screen name='profile' options={{ title: 'Profile' }}>
                  {props => <Profile />}
                </Stack.Screen>
                <Stack.Screen
                  name='seeAll'
                  options={props => ({ title: props.route.params.title })}
                >
                  {props => <SeeAll {...props} />}
                </Stack.Screen>
              </Stack.Navigator>
              <BottomNav visibleOn={bottomNavVisibleOn} />
            </NavigationContainer>
          </>
        )}
      </Store>
    </SafeAreaProvider>
  );
};
