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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import PDFView from 'react-native-view-pdf';
import type { MusicSheet } from '../../interfaces/lesson.interfaces';
import { x } from '../../images/svgs';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { themeStyles } from '../../themeStyles';
import { utils } from '../../utils';
import { DoubleTapArea } from '../../common_components/lesson/DoubleTapArea';

interface Props {
  index: number;
  title: string;
  sheets: MusicSheet[];
  timecode: number;
  description: string;
  onSeek?: (timecode: number) => void;
  onCloseView: () => void;
}

export const Assignment: React.FC<Props> = ({
  index,
  title,
  sheets,
  timecode,
  description,
  onSeek,
  onCloseView
}) => {
  const [hideTitles, setHideTitles] = useState(false);
  const [width, setWidth] = useState(Dimensions.get('screen').width);
  const scrollViewRef = useRef<ScrollView>(null);

  const { theme } = useContext(ThemeContext);
  let styles = useMemo(() => setStyles(theme), [theme]);

  const dimChange = useCallback(e => {
    setWidth(e.window.width);
  }, []);

  useEffect(() => {
    const listener = Dimensions.addEventListener('change', dimChange);
    return () => {
      listener?.remove();
    };
  }, [dimChange]);

  const renderDots = (i: number) => (
    <View style={styles.dots}>
      {!!sheets &&
        sheets?.map((dot, index) => (
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
  }, [hideTitles]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView scrollEnabled={true} style={{ flex: 1 }} ref={scrollViewRef}>
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
              <Text style={styles.section}>ASSIGNMENT# {index + 1}</Text>
              <Text style={styles.title}>{title}</Text>
              {Array.isArray(timecode) ? (
                timecode.map(tc => (
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
              ) : !!timecode ? (
                <TouchableOpacity
                  onPress={() => onSeek?.(timecode)}
                  style={styles.timeCodeBtn}
                >
                  <Text style={styles.timeCode}>
                    SKIP VIDEO TO{' '}
                    {timecode < 36000
                      ? new Date(timecode * 1000).toISOString().substr(14, 5)
                      : new Date(timecode * 1000).toISOString().substr(11, 8)}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.description}>
              {description?.replace(/<(.*?)>/g, '')}
            </Text>
          </>
        )}

        <ScrollView
          horizontal={true}
          style={{ flex: 1 }}
          pagingEnabled={true}
          removeClippedSubviews={false}
          showsHorizontalScrollIndicator={false}
        >
          <View
            style={{
              width: width * sheets?.length,
              flexDirection: 'row'
            }}
          >
            {!!sheets &&
              sheets?.map((sheet: MusicSheet, i: number) => {
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
                      {sheets?.length !== 1 && renderDots(i)}
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
                        width: true ? width - 20 : width // TBD: replace true with this.context.isConnected
                      }}
                    >
                      <View style={styles.container} />
                      <PDFView
                        resourceType={true ? 'url' : 'file'} // TBD: replace true with this.context.isConnected
                        resource={sheet.value}
                        fadeInDuration={250.0}
                        style={styles.pdf}
                      />
                    </View>
                    {sheets?.length !== 1 && renderDots(i)}
                  </DoubleTapArea>
                );
              })}
          </View>
        </ScrollView>
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
      fontSize: 12,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    title: {
      textAlign: 'center',
      paddingBottom: 20,
      fontSize: 12,
      fontFamily: 'OpenSans',
      color: current.textColor
    },
    timeCode: {
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: 10,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    description: {
      paddingHorizontal: 10,
      textAlign: 'center',
      paddingVertical: 20,
      color: current.textColor,
      fontSize: 12,
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
      justifyContent: 'space-between'
    }
  });
