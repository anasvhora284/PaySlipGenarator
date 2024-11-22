import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TextField, InputAdornment, FormHelperText, styled} from '@mui/material';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../../styles/common';

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
  variant = 'outlined',
  multiline = false,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <StyledTextField
        fullWidth
        label={label}
        value={value}
        onChange={e => onChangeText(e.target.value)}
        error={!!error}
        disabled={disabled}
        variant={variant}
        multiline={multiline}
        rows={multiline ? 4 : 1}
        type={keyboardType === 'numeric' ? 'number' : 'text'}
        InputProps={{
          startAdornment: leftIcon ? (
            <InputAdornment position="start">
              <MaterialIcons
                name={leftIcon}
                size={24}
                color={
                  disabled
                    ? colors.text.disabled
                    : error
                    ? colors.error
                    : colors.text.secondary
                }
              />
            </InputAdornment>
          ) : null,
          style: style,
        }}
        {...props}
      />
      {error && (
        <FormHelperText error style={styles.errorText}>
          {error}
        </FormHelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.sm,
    marginTop: spacing.xs / 2,
  },
});

export default Input;
