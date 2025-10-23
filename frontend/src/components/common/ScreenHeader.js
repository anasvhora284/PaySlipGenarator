import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {colors} from '../../styles/common';
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
          navigation.canGoBack() ? styles.headerTextWithBack : styles.headerTextWithoutBack,
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
  headerTextWithBack: {
    marginLeft: 0,
  },
  headerTextWithoutBack: {
    marginLeft: 20,
  },
});

export default ScreenHeader;
