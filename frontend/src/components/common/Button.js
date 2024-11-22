import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../../styles/common';

const Button = ({
  onPress,
  title,
  icon,
  variant = 'primary', // primary, secondary, warning, error
  size = 'medium', // small, medium, large
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={variant === 'primary' ? colors.surface : colors[variant]}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          styles[`${variant}Text`],
          disabled && styles.disabledText,
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  warning: {
    backgroundColor: `${colors.warning}15`,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: `${colors.error}15`,
    borderWidth: 1,
    borderColor: colors.error,
  },
  // Text colors
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.primary,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
  // Sizes
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  // Modifiers
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.secondary,
  },
});

export default Button;
