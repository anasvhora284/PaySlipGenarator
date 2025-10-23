import React from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import {colors, spacing} from '../../styles/common';
import {Text} from 'react-native-paper';

const Input = ({
  label,
  value,
  onChangeText,
  error,
  leftIcon,
  disabled = false,
  style,
  containerStyle,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        mode="flat"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        disabled={disabled}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        left={leftIcon && <TextInput.Icon icon={leftIcon} />}
        style={[styles.input]}
        theme={{
          colors: {
            primary: colors.primary,
            background: colors.surface,
          },
        }}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    boxShadow: '0px 1px 20px 10px #e3e3e3',
    borderRadius: 20,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginLeft: spacing.sm,
    marginTop: 4,
  },
});

export default Input;
