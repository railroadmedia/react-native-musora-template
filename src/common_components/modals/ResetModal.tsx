import React, { useContext, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';

interface Props {
  visible: boolean;
  onDismiss: Function;
}

export const ResetModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent={true} animationType={'fade'}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={() => onDismiss()}
      >
        <Text style={styles.text}>Hold your horses...</Text>
        <Text
          style={styles.text}
        >{`This will reset your progress\nand cannot be undone.\nAre you sure about this?`}</Text>
        <TouchableOpacity style={{ backgroundColor: utils.color }}>
          <Text style={{ padding: 15 }}>RESET</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>CANCEL</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    text: {
      color: current.textColor,
      fontSize: 20,
      fontFamily: 'OpenSans-Bold',
      padding: 15,
      textAlign: 'center',
      backgroundColor: 'red'
    },
    msg: {
      padding: 15,
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans',
      color: current.textColor
    }
  });
