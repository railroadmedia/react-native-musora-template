import React, { useCallback, useContext, useEffect, useState } from 'react';

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

import { Store } from './state/Store';
import { BottomNav } from './components/bottomNav/BottomNav';
import { Header } from './components/header/Header';
import { SeeAll } from './components/catalogue/SeeAll';
import { utils } from './utils';
import { Settings } from './components/profile/Settings';
import { NotificationSettings } from './components/profile/NotificationSettings';
import { Support } from './components/profile/Support';
import { TermsOfUse } from './components/profile/TermsOfUse';
import { PrivacyPolicy } from './components/profile/PrivacyPolicy';
import { Level } from './components/method/Level';
import { Packs } from './components/packs/Packs';
import { PackOverview } from './components/packs/PackOverview';
import { ShowOverview } from './components/show/ShowOverview';
import type { Show } from './interfaces/show.interfaces';
import { Method } from './components/method/Method';
import { CourseOverview } from './components/course/CourseOverview';
import { StudentReview } from './components/forms/StudentReview';
import { AskQuestion } from './components/forms/AskQuestion';
import { SubmitCollabVideo } from './components/forms/SubmitCollabVideo';
import { LikeList } from './common_components/lesson/LikeList';
import { Replies } from './common_components/lesson/Replies';
import type {
  Comment,
  Lesson,
  LessonResponse
} from './interfaces/lesson.interfaces';
import { LessonPart } from './common_components/lesson/LessonPart';
import { Login } from './components/auth/Login';
import { LaunchScreen } from './components/auth/LaunchScreen';
import { CoachOverview } from './components/coach/CoachOverview';
import { Subscriptions } from './components/auth/Subscriptions';
import { Foundation } from './components/method/Foundation';
import { SubscriptionOnboarding } from './components/auth/SubscriptionOnboarding';
import { LoginOnboarding } from './components/auth/LoginOnboarding';
const Forum = require('react-native-musora-forum');

type Scenes =
  | 'home'
  | 'courses'
  | 'songs'
  | 'playAlongs'
  | 'studentFocus'
  | 'coaches'
  | 'shows'
  | 'search'
  | 'forum'
  | 'seeAll'
  | 'coachOverview'
  | 'live'
  | 'scheduled';
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
  level: { mobile_app_url: string };
  packOverview: { mobile_app_url: string };
  showOverview: { show: Show };
  courseOverview: {
    mobile_app_url?: string;
    id: number;
    isMethod: boolean;
  };
  lessonPart: {
    id: number;
    parentId: number;
    contentType: string;
    item?: LessonResponse;
  };
  likeList: { commentId: number };
  replies: {
    parentComment: Comment;
    onDeleteComment: () => void;
    likeOrDislikeComment: () => void;
    onAddOrRemoveReply: (num: number) => void;
  };
  coachOverview: { id: number };
}>();

export const Router: React.FC<Props> = ({ catalogues, bottomNavVisibleOn }) => {
  const hideHeader = useCallback((route: string) => {
    const titleExceptions: string[] = [
      'login',
      'subscriptions',
      'launch',
      'level',
      'showOverview',
      'courseOverview',
      'coachOverview',
      'packOverview',
      'studentReview',
      'askQuestion',
      'submitCollabVideo',
      'lessonPart',
      'forum',
      'subscriptionOnboarding'
    ];
    return titleExceptions.includes(route);
  }, []);

  return (
    <SafeAreaProvider>
      <Store>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              header: ({
                options: { title },
                route: { name }
              }: StackHeaderProps) => {
                if (hideHeader(name)) return null;
                return (
                  <Header
                    title={title}
                    transparent={!!title?.toLowerCase()?.match(/^(profile)$/)}
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
            <Stack.Screen name='launch' component={LaunchScreen} />
            <Stack.Screen name='subscriptions' component={Subscriptions} />
            <Stack.Screen
              name='subscriptionOnboarding'
              component={SubscriptionOnboarding}
            />
            <Stack.Screen name='loginOnboarding' component={LoginOnboarding} />
            <Stack.Screen name='login' component={Login} />
            {catalogues.map(c => (
              <Stack.Screen name={c} key={c} component={Catalogue} />
            ))}
            <Stack.Screen
              name='search'
              options={{ title: 'Search' }}
              component={Search}
            />
            <Stack.Screen
              name='myList'
              options={{ title: 'My List' }}
              component={MyList}
            />
            <Stack.Screen name='downloads' options={{ title: 'Downloads' }}>
              {props => <Downloads {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name='profile'
              options={{ title: 'Profile' }}
              component={Profile}
            />
            <Stack.Screen
              name='seeAll'
              options={props => ({ title: props.route.params.title })}
              component={SeeAll}
            />
            <Stack.Screen name='foundation' component={Foundation} />
            <Stack.Screen name='method' component={Method} />
            <Stack.Screen name='level' component={Level} />
            <Stack.Screen name='courseOverview' component={CourseOverview} />
            <Stack.Screen name='lessonPart' component={LessonPart} />
            <Stack.Screen name='packs' component={Packs} />
            <Stack.Screen name='packOverview' component={PackOverview} />
            <Stack.Screen name='coachOverview' component={CoachOverview} />
            <Stack.Screen name='showOverview' component={ShowOverview} />
            <Stack.Screen name='forum' component={Forum.default} />

            <Stack.Screen
              name='settings'
              options={{ title: 'Settings' }}
              component={Settings}
            />
            <Stack.Screen
              name='notificationSettings'
              options={{ title: 'Notification Settings' }}
              component={NotificationSettings}
            />
            <Stack.Screen
              name='support'
              options={{ title: 'Support' }}
              component={Support}
            />
            <Stack.Screen
              name='terms'
              options={{ title: 'Terms Of Use' }}
              component={TermsOfUse}
            />
            <Stack.Screen
              name='privacyPolicy'
              options={{ title: 'Privacy Policy' }}
              component={PrivacyPolicy}
            />
            <Stack.Screen name='studentReview' component={StudentReview} />
            <Stack.Screen name='askQuestion' component={AskQuestion} />
            <Stack.Screen
              name='submitCollabVideo'
              component={SubmitCollabVideo}
            />
            <Stack.Screen
              name='likeList'
              options={{ title: 'Likes' }}
              component={LikeList}
            />
            <Stack.Screen
              name='replies'
              options={{ title: 'Replies' }}
              component={Replies}
            />
          </Stack.Navigator>
          <BottomNav visibleOn={bottomNavVisibleOn} />
        </NavigationContainer>
      </Store>
    </SafeAreaProvider>
  );
};
