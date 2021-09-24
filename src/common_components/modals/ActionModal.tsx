import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemeContext } from '../../state/theme/ThemeContext';

import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';

interface Props {
  btnText?: string;
  icon?: Element;
  onAction?: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ActionModal = forwardRef<
  { toggle: (title?: string, message?: string) => void },
  Props
>((props, ref) => {
  const { btnText, icon, onAction, onCancel, children } = props;
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  useImperativeHandle(ref, () => ({
    toggle(title, message) {
      setVisible(!visible);
      setTitle(title || 'Unknown');
      setMessage(message || 'Unknown error');
    }
  }));

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
      animationType={'fade'}
    >
      <TouchableOpacity
        style={styles.modalBackground}
        onPress={onCancel}
        activeOpacity={0.95}
      >
        <View style={styles.animatedView}>
          {!!icon && <View style={styles.icon}>{icon}</View>}
          {!!title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          {!!onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{btnText}</Text>
            </TouchableOpacity>
          )}
          {!!onCancel && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          )}
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

let setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    actionBtn: {
      padding: 15,
      marginHorizontal: 30,
      backgroundColor: utils.color,
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    actionBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: '#ffffff'
    },
    cancelBtnText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: utils.color,
      padding: 15
    },
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,.5)'
    },
    title: {
      padding: 15,
      textAlign: 'center',
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(20),
      fontFamily: 'OpenSans-Bold'
    },
    message: {
      padding: 15,
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(18),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    animatedView: {
      padding: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      margin: 5,
      backgroundColor: current.background
    },
    icon: {
      alignSelf: 'center'
    }
  });
