import React, { useEffect, useState } from 'react';

import {
  authenticate,
  utils,
  Catalogue,
  Profile
} from 'react-native-musora-templates';

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

  return <>{authenticated && <Catalogue scene='home' />}</>;
  // return <>{authenticated && <Profile whatever='home' />}</>;
}
