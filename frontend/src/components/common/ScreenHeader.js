import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, spacing} from '../../styles/common';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const ScreenHeader = ({title, style}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.headerContainer, style]}>
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
      <Text
        style={[
          styles.headerText,
          {style},
          {marginLeft: navigation.canGoBack() ? 0 : 20},
        ]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 'auto',
    marginTop: 30,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'left',
    zIndex: 1,
  },
});

export default ScreenHeader;
