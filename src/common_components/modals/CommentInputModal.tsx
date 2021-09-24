import React, {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useState
} from 'react';
import {
  KeyboardAvoidingView,
  View,
  Modal,
  TouchableOpacity,
  Text,
  ViewStyle,
  StyleSheet
} from 'react-native';
import { utils } from 'react-native-musora-templates';

interface Props {
  modalStyle: ViewStyle;
  translucentStyle: ViewStyle;
  children: React.ReactNode;
}

export interface CommentInputModalRefObj {
  toggle: () => void;
}

export const CommentInputModal = forwardRef(
  (
    { modalStyle, translucentStyle, children }: Props,
    ref: React.Ref<CommentInputModalRefObj>
  ) => {
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      toggle() {
        toggleModal();
      }
    }));

    const toggleModal = useCallback(() => {
      setModalVisible(!modalVisible);
    }, [modalVisible]);

    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
        supportedOrientations={['portrait', 'landscape']}
        animationType='slide'
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleModal}
          style={[styles.modalContainer, translucentStyle]}
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={utils.isiOS ? 'padding' : undefined}
          >
            <View style={modalStyle}>{children}</View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, .8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center'
  }
});
