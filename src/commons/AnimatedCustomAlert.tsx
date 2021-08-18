import React, {
  forwardRef,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { ThemeContext } from '../state/theme/ThemeContext';
import { utils } from '../utils';
import { themeStyles } from '../themeStyles';

interface AnimatedCustomAlertProps {
  onClose?: () => void;
  children?: any;
}

export const AnimatedCustomAlert = forwardRef<
  RefObject<any>,
  AnimatedCustomAlertProps
>(({ onClose, children }, ref: React.Ref<any>) => {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(new Animated.Value(0));
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const { theme } = useContext(ThemeContext);
  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  useImperativeHandle(ref, () => ({
    toggle(title?: string, message?: string) {
      setTitle(title || 'Unknown');
      setMessage(message || 'Unknown error');
      if (visible) onClose?.();
      setVisible(!visible);
    }
  }));

  const closeModal = useCallback(() => {
    setTitle('');
    setMessage('');
    onClose?.();
    setVisible(false);
  }, []);

  const animate = () => {
    Animated.timing(opacity, {
      duration: 250,
      useNativeDriver: true,
      toValue: visible ? 1 : 0
    }).start();
  };

  return (
    <Modal
      transparent={true}
      onShow={animate}
      visible={visible}
      onRequestClose={closeModal}
      supportedOrientations={['portrait', 'landscape']}
    >
      <TouchableOpacity
        testID='modalBackground'
        style={styles.modalBackground}
        onPress={closeModal}
      >
        <Animated.View
          style={[
            styles.animatedView,
            {
              opacity: opacity
            }
          ]}
        >
          <Text style={styles.text}>{title}</Text>
          <Text style={styles.text}>{message}</Text>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,.5)'
    },
    text: {
      textAlign: 'center',
      paddingVertical: 10,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans'
    },
    animatedView: {
      padding: 10,
      paddingHorizontal: 50,
      borderRadius: 10,
      margin: 5,
      backgroundColor: current.background
    }
  });
