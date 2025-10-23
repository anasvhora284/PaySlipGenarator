import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {MaterialIcons} from '@expo/vector-icons';
import {colors, spacing, layout} from '../styles/common';

// Icon component defined outside render
const RefreshIcon = ({size, color}) => (
  <MaterialIcons name="refresh" size={size} color={color} />
);

const ErrorScreen = ({message, onRetry}) => {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={64} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.button}
          icon={RefreshIcon}>
          Retry
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...layout.container,
    ...layout.centered,
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.md,
  },
});

export default ErrorScreen;
