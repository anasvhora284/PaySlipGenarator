import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../../styles/common';

const IconButton = ({
  onPress,
  icon,
  color = colors.primary,
  size = 24,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, style]}>
      <MaterialIcons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;
