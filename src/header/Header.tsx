import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { utils } from '../utils';

export const Header: React.FC = () => {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <SafeAreaView>
      {/* {utils.headerSvgBrand({ width: '50%', fill: 'red' })} */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {}
});
