import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  whatever: string;
}

export const Downloads: React.FC<Props> = ({ whatever }) => {
  return (
    <View style={styles.container}>
      <Text>Downloads</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
