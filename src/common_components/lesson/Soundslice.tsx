import React, {
  forwardRef,
  RefObject,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
  View,
  Modal,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { x } from '../../images/svgs';
import { userService } from '../../services/user.service';

interface Props {
  slug: string;
  assignmentId: number;
}

export interface SoundsliceRefObj {
  toggleSoundslice: () => void;
}

export const Soundslice = forwardRef(
  ({ slug, assignmentId }: Props, ref: React.Ref<SoundsliceRefObj>) => {
    const [showModal, setShowModal] = useState(false);
    const webViewRef = useRef<WebView>(null);

    const { theme } = useContext(ThemeContext);
    let styles = useMemo(() => setStyles(theme), [theme]);

    useImperativeHandle(ref, () => ({
      toggleSoundslice() {
        toggle();
      }
    }));

    const toggle = useCallback(() => {
      setShowModal(!showModal);
      webViewRef?.current?.disableIdleTimer?.();
      webViewRef?.current?.injectJavaScript(`
        window.removeEventListener('message', window.currentTimeCallbackListener);
  
        var ss = {};
        window.addEventListener('message', function({data}) {
          var {method, arg} = JSON.parse(data);
          if(method === 'ssDuration') ss.duration = arg;
          if(method === 'ssCurrentTime') ss.currentTime = arg;
          if(!isNaN(ss.duration) && !isNaN(ss.currentTime)) {
            window.ReactNativeWebView.postMessage(JSON.stringify({...ss, close: true}));
            s = {};
          }
        });
        window.postMessage('{"method": "getDuration"}', 'https://www.soundslice.com');
        window.postMessage('{"method": "getCurrentTime"}', 'https://www.soundslice.com');
        true;
      `);
    }, [showModal, webViewRef]);

    return (
      <Modal animationType={'fade'} onRequestClose={toggle} visible={showModal}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar
            backgroundColor={themeStyles[theme].background}
            barStyle={theme === 'DARK' ? 'light-content' : 'dark-content'}
          />
          <KeyboardAvoidingView style={styles.container}>
            <TouchableOpacity onPress={toggle} style={{ padding: 5 }}>
              {x({ icon: { height: 35, width: 35, fill: '#000000' } })}
            </TouchableOpacity>
            <WebView
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              ref={webViewRef}
              allowsInlineMediaPlayback={true}
              automaticallyAdjustContentInsets={true}
              mediaPlaybackRequiresUserAction={false}
              ignoreSilentHardwareSwitch={true}
              onMessage={({ nativeEvent: { data } }) => {
                const dataParsed = JSON.parse(data);
                userService.updateUsersSoundsliceProgress(
                  assignmentId,
                  dataParsed.currentTime,
                  dataParsed.duration
                );
                if (dataParsed.close) {
                  webViewRef.current?.enableIdleTimer?.();
                  setShowModal(false);
                }
              }}
              source={{
                uri: `https://www.soundslice.com/${
                  /^\d+$/.test(slug) ? 'scores' : 'slices'
                }/${slug}/embed/?api=1&scroll_type=2&branding=0&enable_mixer=0`,
                headers: { referer: 'https://www.drumeo.com/' }
              }}
              injectedJavaScript={`
		  var video = document.createElement('video');

		  video.src = 'data:audio/mp3;base64,//tAxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAESAAzMzMzMzMzMzMzMzMzMzMzMzMzZmZmZmZmZmZmZmZmZmZmZmZmZmaZmZmZmZmZmZmZmZmZmZmZmZmZmczMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////8AAAA5TEFNRTMuMTAwAZYAAAAAAAAAABQ4JAMGQgAAOAAABEhNIZS0AAAAAAD/+0DEAAPH3Yz0AAR8CPqyIEABp6AxjG/4x/XiInE4lfQDFwIIRE+uBgZoW4RL0OLMDFn6E5v+/u5ehf76bu7/6bu5+gAiIQGAABQIUJ0QolFghEn/9PhZQpcUTpXMjo0OGzRCZXyKxoIQzB2KhCtGobpT9TRVj/3Pmfp+f8X7Pu1B04sTnc3s0XhOlXoGVCMNo9X//9/r6a10TZEY5DsxqvO7mO5qFvpFCmKIjhpSItGsUYcRO//7QsQRgEiljQIAgLFJAbIhNBCa+JmorCbOi5q9nVd2dKnusTMQg4MFUlD6DQ4OFijwGAijRMfLbHG4nLVTjydyPlJTj8pfPflf9/5GD950A5e+jsrmNZSjSirjs1R7hnkia8vr//l/7Nb+crvr9Ok5ZJOylUKRxf/P9Zn0j2P4pJYXyKkeuy5wUYtdmOu6uobEtFqhIJViLEKIjGxchGev/L3Y0O3bwrIOszTBAZ7Ih28EUaSOZf/7QsQfg8fpjQIADN0JHbGgQBAZ8T//y//t/7d/2+f5m7MdCeo/9tdkMtGLbt1tqnabRroO1Qfvh20yEbei8nfDXP7btW7f9/uO9tbe5IvHQbLlxpf3DkAk0ojYcv///5/u3/7PTfGjPEPUvt5D6f+/3Lea4lz4tc4TnM/mFPrmalWbboeNiNyeyr+vufttZuvrVrt/WYv3T74JFo8qEDiJqJrmDTs///v99xDku2xG02jjunrICP/7QsQtA8kpkQAAgNMA/7FgQAGnobgfghgqA+uXwWQ3XFmGimSbe2X3ksY//KzK1a2k6cnNWOPJnPWUsYbKqkh8RJzrVf///P///////4vyhLKHLrCb5nIrYIUss4cthigL1lQ1wwNAc6C1pf1TIKRSkt+a//z+yLVcwlXKSqeSuCVQFLng2h4AFAFgTkH+Z/8jTX/zr//zsJV/5f//5UX/0ZNCNCCaf5lTCTRkaEdhNP//n/KUjf/7QsQ5AEhdiwAAjN7I6jGddBCO+WGTQ1mXrYatSAgaykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==';

		  video.loop = true;
		  video.autoplay = true;
		  video.setAttribute('playsinline', true);
		  video.setAttribute('webkit-playsinline', true);

		  var sSlice = {};
		  window.currentTimeCallbackListener = function({data}) {
			var {method, arg} = JSON.parse(data);
			switch(method) {
			  case 'ssPlay':
			  case 'ssPause':
				window.postMessage('{"method": "getDuration"}', 'https://www.soundslice.com');
				window.postMessage('{"method": "getCurrentTime"}', 'https://www.soundslice.com');
				break;
			  case 'ssCurrentTime':
				sSlice.currentTime = arg;
				break;
			  case 'ssDuration':
				sSlice.duration = arg;
				break;
			}
			if(!isNaN(sSlice.duration) && !isNaN(sSlice.currentTime)) {
			  window.ReactNativeWebView.postMessage(JSON.stringify(sSlice));
			  sSlice = {};
			}
		  }

		  window.addEventListener('message', window.currentTimeCallbackListener);
		  true;
		`}
            />
            <View style={styles.bottomPlaceholder} />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  }
);

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1
    },
    bottomPlaceholder: {
      height: 20,
      backgroundColor: '#222222'
    }
  });
