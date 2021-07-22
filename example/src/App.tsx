import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  authenticate,
  utils,
  Catalogue,
  Profile,
  State
} from 'react-native-musora-templates';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [scene, setScene] = useState('home');

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
    <State>
      {authenticated && (
        <>
          {scene === 'home' && (
            <View style={{ flex: 1 }}>
              <Catalogue scene='home' />
            </View>
          )}
          {scene === 'courses' && (
            <View style={{ flex: 1 }}>
              <Catalogue scene='courses' />
            </View>
          )}
          {scene === 'profile' && (
            <View style={{ flex: 1 }}>
              <Profile whatever='home' />
            </View>
          )}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setScene('home')}>
              <Text style={{ padding: 10 }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScene('courses')}>
              <Text style={{ padding: 10 }}>Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScene('profile')}>
              <Text style={{ padding: 10 }}>Profile</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </State>
  );
}
