import React, { useContext, useMemo } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';

interface Props {
  visible: boolean;
  onDismiss: (reset?: boolean) => void;
}

export const ResetModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent={true} animationType={'fade'}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.containerBaclgroundTOpacity}
        onPress={() => onDismiss()}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Hold your horses...</Text>
          <Text
            style={styles.msg}
          >{`This will reset your progress\nand cannot be undone.\nAre you sure about this?`}</Text>
          <TouchableOpacity
            style={styles.btnTOpacity}
            onPress={() => onDismiss(true)}
          >
            <Text style={styles.btnText}>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDismiss()}>
            <Text style={[styles.btnText, { color: utils.color }]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    containerBaclgroundTOpacity: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    container: {
      backgroundColor: current.background,
      borderRadius: 10,
      padding: 15,
      paddingBottom: 0,
      alignItems: 'center'
    },
    title: {
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans-Bold',
      textAlign: 'center'
    },
    msg: {
      paddingVertical: 15,
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    btnTOpacity: { backgroundColor: utils.color, borderRadius: 300 },
    btnText: {
      color: 'white',
      padding: 15,
      paddingHorizontal: 40,
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(14)
    }
  });
