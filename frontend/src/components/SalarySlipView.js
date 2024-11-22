import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Title, Text, Divider} from 'react-native-paper';
import moment from 'moment';
import {colors, spacing, typography, layout} from '../styles/common';

const SalarySlipView = ({salarySlip}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.companyName}>Your Company Name</Title>
          <Text style={styles.slipTitle}>Salary Slip</Text>
          <Text style={styles.period}>
            {moment(`${salarySlip.year}-${salarySlip.month}-01`).format(
              'MMMM YYYY',
            )}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.employeeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Employee Name</Text>
            <Text style={styles.value}>{salarySlip.employee.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{salarySlip.employee.employeeId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.value}>{salarySlip.employee.designation}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.salarySection, styles.earningsSection]}>
          <Title style={styles.sectionTitle}>Earnings</Title>
          {Object.entries(salarySlip.earnings).map(([key, value]) => (
            <View key={key} style={styles.amountRow}>
              <Text style={styles.label}>{key.toUpperCase()}</Text>
              <Text style={styles.earningAmount}>₹{value}</Text>
            </View>
          ))}
          <View style={[styles.amountRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.earningTotalAmount}>
              ₹{salarySlip.totalEarnings}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.salarySection, styles.deductionsSection]}>
          <Title style={styles.sectionTitle}>Deductions</Title>
          {Object.entries(salarySlip.deductions).map(([key, value]) => (
            <View key={key} style={styles.amountRow}>
              <Text style={styles.label}>{key.toUpperCase()}</Text>
              <Text style={styles.deductionAmount}>₹{value}</Text>
            </View>
          ))}
          <View style={[styles.amountRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Deductions</Text>
            <Text style={styles.deductionTotalAmount}>
              ₹{salarySlip.totalDeductions}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.netSalarySection}>
          <View style={styles.netSalaryRow}>
            <Text style={styles.netSalaryLabel}>Net Salary</Text>
            <Text style={styles.netSalaryAmount}>₹{salarySlip.netSalary}</Text>
          </View>
          <Text style={styles.amountInWords}>{salarySlip.salaryInWords}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    ...layout.card,
  },
  header: {
    ...layout.centered,
    marginBottom: spacing.md,
  },
  companyName: {
    ...typography.title,
  },
  slipTitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  period: {
    ...typography.caption,
  },
  divider: {
    marginVertical: spacing.md,
  },
  employeeDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    ...layout.row,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
  },
  value: {
    ...typography.body,
    fontWeight: '500',
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  amountRow: {
    ...layout.row,
    marginBottom: spacing.sm,
  },
  earningAmount: {
    ...typography.body,
    color: colors.success,
  },
  deductionAmount: {
    ...typography.body,
    color: colors.error,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: 'bold',
  },
  earningTotalAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.success,
  },
  deductionTotalAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.error,
  },
  netSalarySection: {
    marginTop: spacing.md,
  },
  netSalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  netSalaryLabel: {
    ...typography.subtitle,
    fontWeight: 'bold',
  },
  netSalaryAmount: {
    ...typography.title,
    color: colors.primary,
  },
  amountInWords: {
    ...typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default SalarySlipView;
