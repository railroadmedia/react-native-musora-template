import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemeContext } from '../../state/theme/ThemeContext';

import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';

interface Props {
  primaryBtnText?: string;
  secondaryBtnText?: string;
  icon?: Element;
  onAction?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export const ActionModal = forwardRef<
  { toggle: (title?: string, message?: string) => void },
  Props
>((props, ref) => {
  const {
    primaryBtnText,
    secondaryBtnText,
    icon,
    onAction,
    onCancel,
    children
  } = props;
  const [visible, setVisible] = useState(false);
  const title = useRef('');
  const message = useRef('');
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => setStyles(theme), [theme]);

  useImperativeHandle(ref, () => ({
    toggle(modalTitle, modalMessage) {
      title.current = modalTitle || 'Unknown';
      message.current = modalMessage || 'Unknown error';
      setVisible(!visible);
    }
  }));

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
      animationType={'fade'}
    >
      <TouchableOpacity
        style={styles.modalBackground}
        onPress={closeModal}
        activeOpacity={0.95}
      >
        <View style={styles.animatedView}>
          {!!icon && <View style={styles.icon}>{icon}</View>}
          {!!title.current && <Text style={styles.title}>{title.current}</Text>}
          <Text style={styles.message}>{message.current}</Text>
          {!!onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{primaryBtnText}</Text>
            </TouchableOpacity>
          )}
          {!!onCancel && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelBtnText}>
                {secondaryBtnText || 'CANCEL'}
              </Text>
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
