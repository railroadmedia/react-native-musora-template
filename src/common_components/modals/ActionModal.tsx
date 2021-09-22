import React, {
  forwardRef,
  RefObject,
  useContext,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal
} from 'react-native';
import { utils } from '../../utils';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';

interface Props {
  title?: string;
  message: string;
  btnText: string;
  icon?: Element;
  onAction: () => void;
  onCancel: () => void;
}

const ActionModal = forwardRef<RefObject<any>, Props>(
  (
    { title, message, btnText, icon, onAction, onCancel },
    ref: React.Ref<any>
  ) => {
    const [visible, setVisible] = useState(false);
    const { theme } = useContext(ThemeContext);
    let styles = setStyles(theme);

    useEffect(() => {
      styles = setStyles(theme);
    }, [theme]);

    useImperativeHandle(ref, () => ({
      toggle() {
        setVisible(!visible);
      }
    }));

    return (
      <Modal transparent={true} visible={visible} onRequestClose={onCancel}>
        <TouchableOpacity style={styles.modalBackground} onPress={onCancel}>
          <View style={styles.animatedView}>
            <View style={styles.icon}>{icon}</View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{btnText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
);

export default ActionModal;

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
