import React from 'react';

import { utils, Router } from 'react-native-musora-templates';

export default function App() {
  utils.rootUrl = 'https://staging.drumeo.com/laravel/public';
  utils.brand = 'drumeo';

  return (
    <Router
      catalogues={[
        'home',
        'courses',
        'songs',
        'playAlongs',
        'shows',
        'studentFocus',
        'live',
        'scheduled'
      ]}
      bottomNavVisibleOn={[
        'home',
        'search',
        'forum',
        'courses',
        'songs',
        'shows',
        'playAlongs',
        'studentFocus',
        'live',
        'scheduled'
      ]}
    />
  );
}
