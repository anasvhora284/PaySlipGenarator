import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {TextInput, Title, Text, Divider} from 'react-native-paper';
import {colors, spacing, typography, layout} from '../styles/common';
import PropTypes from 'prop-types';

const SalarySlipForm = ({
  formData,
  setFormData,
  updateEarnings,
  updateDeductions,
  totalEarnings,
  totalDeductions,
  netSalary,
}) => {
  const validateMonth = text => {
    const month = parseInt(text);
    if (month >= 1 && month <= 12) {
      setFormData({...formData, month: text});
    } else if (text === '') {
      setFormData({...formData, month: ''});
    }
  };

  const validateYear = text => {
    let length = text.length || 0;
    // Allow typing by always updating the text value
    setFormData({...formData, year: text});
    length = text.length;

    // Only validate if there's a complete 4-digit year
    if (length === 4) {
      const year = parseInt(text);
      const currentYear = new Date().getFullYear();
      // Check if it's a valid year between 2000 and current year + 1
      if (year < 2000 || year > currentYear) {
        Alert.alert(
          'Error',
          `Please enter a valid year (2000-${currentYear + 1})`,
        );
        setFormData({...formData, year: ''});
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <TextInput
          mode="outlined"
          label="Month (1-12)"
          value={formData.month}
          onChangeText={validateMonth}
          keyboardType="numeric"
          style={[styles.input]}
          left={<TextInput.Icon icon="calendar" />}
          maxLength={2}
          error={
            formData.month &&
            (parseInt(formData.month) < 1 || parseInt(formData.month) > 12)
          }
        />
        <TextInput
          mode="outlined"
          label="Year (2000-present)"
          value={formData.year}
          onChangeText={validateYear}
          keyboardType="numeric"
          style={[styles.input]}
          left={<TextInput.Icon icon="calendar" />}
          maxLength={4}
          error={
            formData.year &&
            (parseInt(formData.year) < 2000 ||
              parseInt(formData.year) > new Date().getFullYear() + 1)
          }
        />
      </View>

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>Earnings</Title>
      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="Basic Salary"
          value={formData.earnings.basic}
          onChangeText={text => updateEarnings('basic', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="DA"
          value={formData.earnings.da}
          onChangeText={text => updateEarnings('da', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="HRA"
          value={formData.earnings.hra}
          onChangeText={text => updateEarnings('hra', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="TA"
          value={formData.earnings.ta}
          onChangeText={text => updateEarnings('ta', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <Text style={styles.totalText}>Total Earnings: ₹{totalEarnings}</Text>
      </View>

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>Deductions</Title>
      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="Provident Fund"
          value={formData.deductions.providentFund}
          onChangeText={text => updateDeductions('providentFund', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="ESI"
          value={formData.deductions.esi}
          onChangeText={text => updateDeductions('esi', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Loan"
          value={formData.deductions.loan}
          onChangeText={text => updateDeductions('loan', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Tax"
          value={formData.deductions.tax}
          onChangeText={text => updateDeductions('tax', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={styles.input}
        />
        <Text style={styles.totalText}>
          Total Deductions: ₹{totalDeductions}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.netSalaryText}>Net Salary: ₹{netSalary}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  halfInput: {
    width: '48%',
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  totalText: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.text.error,
  },
  netSalaryText: {
    ...typography.title,
    marginTop: spacing.md,
    color: colors.primary,
    textAlign: 'right',
  },
});

SalarySlipForm.propTypes = {
  formData: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string,
    earnings: PropTypes.shape({
      basic: PropTypes.string,
      da: PropTypes.string,
      hra: PropTypes.string,
      ta: PropTypes.string,
    }),
    deductions: PropTypes.shape({
      providentFund: PropTypes.string,
      esi: PropTypes.string,
      loan: PropTypes.string,
      tax: PropTypes.string,
    }),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  updateEarnings: PropTypes.func.isRequired,
  updateDeductions: PropTypes.func.isRequired,
  totalEarnings: PropTypes.number.isRequired,
  totalDeductions: PropTypes.number.isRequired,
  netSalary: PropTypes.number.isRequired,
};

export default SalarySlipForm;
