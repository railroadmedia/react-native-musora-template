import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../state/ThemeContext';

interface Props {
  whatever: string;
}

export const MyList: React.FC<Props> = ({ whatever }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.container}>
      <Text>My List</Text>
      <TouchableOpacity onPress={() => toggleTheme()}>
        <Text style={{ padding: 20, backgroundColor: 'red' }}>
          change theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
