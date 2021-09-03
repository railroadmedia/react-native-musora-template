import React, { useEffect } from 'react';

import { utils, Router } from 'react-native-musora-templates';

export default function App() {
  useEffect(() => {
    utils.rootUrl = 'https://staging.drumeo.com/laravel/public';
    utils.brand = 'drumeo';
  }, []);

  return (
    <Router
      catalogues={['home', 'courses']}
      bottomNavVisibleOn={['home', 'search', 'forum', 'courses']}
    />
  );
}
