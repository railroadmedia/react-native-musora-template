import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScaledSize
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import PDFView from 'react-native-view-pdf';
import type {
  MusicSheet,
  SelectedAssignment
} from '../../interfaces/lesson.interfaces';
import { x } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { DoubleTapArea } from '../../common_components/lesson/DoubleTapArea';
import { ConnectionContext } from '../../state/connection/ConnectionContext';

interface Props {
  assignment: SelectedAssignment;
  onSeek?: (timecode: number) => void;
  onCloseView: () => void;
  onSheetDoubleTapped: (hide: boolean) => void;
}

export const Assignment: React.FC<Props> = ({
  assignment,
  onSeek,
  onCloseView,
  onSheetDoubleTapped
}) => {
  const [hideTitles, setHideTitles] = useState(false);
  const [width, setWidth] = useState(Dimensions.get('screen').width);

  const { theme } = useContext(ThemeContext);
  const { isConnected, showNoConnectionAlert } = useContext(ConnectionContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const dimChange = ({ window }: { window: ScaledSize }) => {
    setWidth(window.width);
  };

  useEffect(() => {
    const listener = Dimensions.addEventListener('change', dimChange);
    return () => {
      listener?.remove();
    };
  }, [dimChange]);

  const renderDots = (i: number) => (
    <View style={styles.dots}>
      {!!assignment.sheet_music_image_url &&
        assignment.sheet_music_image_url?.map((_, index: number) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === i
                ? { backgroundColor: utils.color }
                : { backgroundColor: '#CCD3D3' }
            ]}
          />
        ))}
    </View>
  );

  const onDoubleTapSheet = useCallback(() => {
    setHideTitles(!hideTitles);
    onSheetDoubleTapped(!hideTitles);
  }, [hideTitles, onSheetDoubleTapped]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView scrollEnabled={true} style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={onCloseView}
          style={[hideTitles ? { padding: 20 } : styles.xBtn]}
        >
          {x({
            icon: {
              height: 35,
              width: 35,
              fill: themeStyles[theme].textColor
            }
          })}
        </TouchableOpacity>
        {!hideTitles && (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.section}>
                ASSIGNMENT# {assignment.index + 1}
              </Text>
              <Text style={styles.title}>{assignment.title}</Text>
              {Array.isArray(assignment.timecode) ? (
                assignment.timecode.map((tc: number) => (
                  <TouchableOpacity
                    key={tc}
                    onPress={() => onSeek?.(tc)}
                    style={styles.timeCodeBtn}
                  >
                    <Text style={styles.timeCode}>
                      SKIP VIDEO TO{' '}
                      {tc < 36000
                        ? new Date(tc * 1000).toISOString().substr(14, 5)
                        : new Date(tc * 1000).toISOString().substr(11, 8)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : !!assignment.timecode ? (
                <TouchableOpacity
                  onPress={() => onSeek?.(assignment.timecode)}
                  style={styles.timeCodeBtn}
                >
                  <Text style={styles.timeCode}>
                    SKIP VIDEO TO{' '}
                    {assignment.timecode < 36000
                      ? new Date(assignment.timecode * 1000)
                          .toISOString()
                          .substr(14, 5)
                      : new Date(assignment.timecode * 1000)
                          .toISOString()
                          .substr(11, 8)}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.description}>
              {assignment.description?.replace(/<(.*?)>/g, '')}
            </Text>
          </>
        )}
        {!!assignment.sheet_music_image_url && (
          <ScrollView
            horizontal={true}
            style={{ flex: 1 }}
            pagingEnabled={true}
            removeClippedSubviews={false}
            showsHorizontalScrollIndicator={false}
          >
            <View
              style={{
                width: width * assignment.sheet_music_image_url?.length,
                flexDirection: 'row'
              }}
            >
              {assignment.sheet_music_image_url?.map(
                (sheet: MusicSheet, i: number) => {
                  if (sheet.value.indexOf('.pdf') < 0) {
                    return (
                      <DoubleTapArea
                        key={i}
                        styles={[styles.sheetContainer, { width }]}
                        onDoubleTap={onDoubleTapSheet}
                      >
                        <View
                          style={{
                            aspectRatio: sheet.whRatio,
                            backgroundColor: 'transparent',
                            marginHorizontal: 10,
                            width: width - 20
                          }}
                        >
                          <SvgUri
                            uri={sheet.value}
                            width={'100%'}
                            height={'100%'}
                          />
                        </View>
                        {assignment.sheet_music_image_url?.length !== 1 &&
                          renderDots(i)}
                      </DoubleTapArea>
                    );
                  }
                  return (
                    <DoubleTapArea
                      key={i}
                      styles={[styles.sheetContainer, { width }]}
                      onDoubleTap={onDoubleTapSheet}
                    >
                      <View
                        style={{
                          aspectRatio: 1 / Math.sqrt(2),
                          backgroundColor: 'transparent',
                          marginHorizontal: 10,
                          width: isConnected ? width - 20 : width
                        }}
                      >
                        <View style={styles.container} />
                        <PDFView
                          resourceType={isConnected ? 'url' : 'file'}
                          resource={sheet.value}
                          fadeInDuration={250.0}
                          style={styles.pdf}
                        />
                      </View>
                      {assignment.sheet_music_image_url?.length !== 1 &&
                        renderDots(i)}
                    </DoubleTapArea>
                  );
                }
              )}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    xBtn: {
      position: 'absolute',
      left: 20,
      top: 20,
      zIndex: 1
    },
    titleContainer: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: current.borderColor
    },
    timeCodeBtn: {
      backgroundColor: current.borderColor,
      paddingHorizontal: 20,
      alignSelf: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      height: 16,
      flex: 1
    },
    section: {
      textAlign: 'center',
      paddingBottom: 20,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    title: {
      textAlign: 'center',
      paddingBottom: 20,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    timeCode: {
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: utils.figmaFontSizeScaler(10),
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    description: {
      paddingHorizontal: 10,
      textAlign: 'center',
      paddingVertical: 20,
      color: current.textColor,
      fontSize: utils.figmaFontSizeScaler(12),
      fontFamily: 'OpenSans'
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10
    },
    dot: {
      height: 10,
      width: 10,
      marginRight: 10,
      borderRadius: 50
    },
    pdf: {
      width: '100%',
      height: '100%'
    },
    container: {
      backgroundColor: 'transparent',
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 10
    },
    sheetContainer: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: 'white'
    }
  });
