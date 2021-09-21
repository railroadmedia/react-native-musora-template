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
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal
} from 'react-native';
import type Svg from 'react-native-svg';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';

interface Props {
  svg: Element;
  type: string;
  xp: number;
  buttonText: string;
  onGoToNextBtn: () => void;
}

export const CompletedModal = forwardRef<RefObject<any>, Props>(
  ({ svg, type, xp, onGoToNextBtn, buttonText }, ref: React.Ref<any>) => {
    const [visible, setVisible] = useState(false);

    const { theme } = useContext(ThemeContext);
    let styles = setStyles(theme);
    useEffect(() => {
      styles = setStyles(theme);
    }, [theme]);

    useImperativeHandle(ref, () => ({
      toggleView() {
        toggle();
      }
    }));

    const toggle = useCallback(() => {
      setVisible(!visible);
    }, [visible]);

    return (
      <Modal transparent={true} visible={visible} onRequestClose={toggle}>
        <TouchableOpacity style={styles.modalBackground} onPress={toggle}>
          <Animated.View style={[styles.animatedView, {}]}>
            <View style={styles.imageContainer}>{svg}</View>
            <Text style={styles.text}>{type} complete!</Text>
            {!!xp && <Text style={styles.text}>You earned {xp} XP!</Text>}
            <TouchableOpacity
              style={styles.assignmentBtn}
              onPress={onGoToNextBtn}
            >
              <Text style={styles.buttonText}>{buttonText?.toUpperCase()}</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,.5)'
    },
    assignmentBtn: {
      width: 245,
      backgroundColor: utils.color,
      margin: 15,
      borderRadius: 25,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageContainer: {
      height: 140,
      justifyContent: 'center',
      alignItems: 'center'
    },
    animatedView: {
      padding: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      margin: 5,
      backgroundColor: current.background
    },
    text: {
      padding: 15,
      textAlign: 'center',
      fontSize: utils.figmaFontSizeScaler(14),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    buttonText: {
      textAlign: 'center',
      fontFamily: 'RobotoCondensed-Bold',
      fontSize: utils.figmaFontSizeScaler(15),
      color: '#FFFFFF'
    }
  });
