import React, { useContext, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { check, sort, x } from '../images/svgs';
import { utils } from '../utils';
import { ThemeContext } from '../state/theme/ThemeContext';
import { themeStyles } from '../themeStyles';

interface Props {
  onSort: (sortBy: string) => void;
}
export const Sort: React.FC<Props> = ({ onSort }) => {
  const { theme } = useContext(ThemeContext);

  const styles = useMemo(() => setStyles(theme), [theme]);

  const iconStyle = useMemo(
    () => ({
      width: 18,
      height: 18,
      fill: styles.touchableTextSortingSelected.color
    }),
    []
  );

  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOptions, setSortOptions] = useState([
    { text: 'Progress', selected: false },
    { text: 'Newest First', selected: true },
    { text: 'Oldest First', selected: false }
  ]);

  const toggleModal = () => {
    setShowSortModal(!showSortModal);
  };

  const applySort = (sortBy: string) => {
    setSortOptions(
      sortOptions.map(s => ({ ...s, selected: s.text === sortBy }))
    );
    toggleModal();
    switch (sortBy) {
      case 'Progress': {
        onSort('-progress');
        break;
      }
      case 'Newest First': {
        onSort('-published_on');
        break;
      }
      case 'Oldest First': {
        onSort('published_on');
        break;
      }
    }
  };

  return (
    <>
      <Text style={styles.selectedSortText}>
        {sortOptions.find(f => f.selected)?.text.toUpperCase()}
      </Text>
      {sort({
        icon: { width: 30, fill: utils.color },
        container: { paddingRight: 10 },
        onPress: toggleModal
      })}
      <Modal
        transparent={true}
        visible={showSortModal}
        onRequestClose={toggleModal}
        supportedOrientations={['portrait', 'landscape']}
        animationType='slide'
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleModal}
          style={styles.modalBackground}
        >
          <View style={styles.modalContent}>
            <View style={styles.sortingsContainer}>
              {sortOptions.map(({ text, selected }) => (
                <TouchableOpacity
                  key={text}
                  onPress={() => applySort(text)}
                  style={styles.touchableSorting}
                >
                  {selected && check({ icon: iconStyle })}
                  <Text
                    style={
                      selected
                        ? styles.touchableTextSortingSelected
                        : styles.touchableTextSorting
                    }
                  >
                    {text}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.touchableSorting}
                onPress={toggleModal}
              >
                {x({ icon: iconStyle })}
                <Text style={styles.touchableTextSortingSelected}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    modalBackground: {
      backgroundColor: 'rgba(0, 0, 0, .8)',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    modalContent: {
      width: '100%',
      alignSelf: 'flex-end'
    },
    sortText: {
      color: utils.color,
      textTransform: 'uppercase',
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(10)
    },
    sortingsContainer: {
      backgroundColor: current.background
    },
    touchableSorting: {
      padding: 10,
      paddingVertical: 20,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: current.borderColor
    },
    touchableTextSorting: {
      fontSize: utils.figmaFontSizeScaler(16),
      marginLeft: 28,
      fontFamily: 'OpenSans',
      color: current.contrastTextColor
    },
    touchableTextSortingSelected: {
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(16),
      marginLeft: 10,
      color: current.textColor
    },
    selectedSortText: {
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(12),
      marginLeft: 10,
      color: utils.color
    }
  });
