import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, spacing} from '../../styles/common';

const ScreenHeader = ({title}) => {
  return (
    <View style={styles.headerContainer}>
      {/* <View style={styles.glassmorphism} /> */}
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 'auto',
    marginTop: 30,
    marginBottom: 10,
  },
  glassmorphism: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 20,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'left',
    marginLeft: 20,
    zIndex: 1,
  },
});

export default ScreenHeader;
