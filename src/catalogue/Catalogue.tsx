import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { provider } from '../services/catalogueSceneProvider.service';

interface Props {
  scene: string;
}

export const Catalogue: React.FC<Props> = ({ scene }) => {
  let page = 1;

  const [all, setAll] = useState<{} | undefined>([]);
  const [method, setMethod] = useState<{} | undefined>();
  const [inProgress, setInProgress] = useState<{} | undefined>([]);

  useEffect(() => {
    let p = provider[scene];
    Promise.all([
      p.getMethod?.({}),
      p.getAll?.({ page }),
      p.getInProgress?.({ page })
    ]).then(([method, all, inProgress]) => {
      console.log(method, all, inProgress);
      setMethod(method);
      setAll(all);
      setInProgress(inProgress);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>catalogue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
