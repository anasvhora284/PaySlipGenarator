import React from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import {TextField, InputAdornment, FormHelperText, styled} from '@mui/material';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../../styles/common';
import {Text} from 'react-native-paper';

const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

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
    // backgroundColor: '#fff',
    // borderRadius: 20,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 1},
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginLeft: spacing.sm,
    marginTop: 4,
  },
});

export default Input;
