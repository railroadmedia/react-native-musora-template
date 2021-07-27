import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  whatever: string;
}

export const MyList: React.FC<Props> = ({ whatever }) => {
  return (
    <View style={styles.container}>
      <Text>My List</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
