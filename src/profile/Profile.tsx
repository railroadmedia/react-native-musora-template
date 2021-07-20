import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { userService } from '../services/user.service';

interface Props {
  whatever: string;
}

export const Profile: React.FC<Props> = ({ whatever }) => {
  const [user, setUser] = useState<{} | undefined>({});

  useEffect(() => {
    userService.getUserDetails({}).then(user => {
      console.log(user);
      setUser(user);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
