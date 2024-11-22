import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Subheading,
  Card,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import moment from 'moment';
import SalarySlipForm from '../components/SalarySlipForm';
import {colors, spacing, layout} from '../styles/common';

const GenerateSalarySlipScreen = ({route, navigation}) => {
  const {employeeId, employeeName} = route.params;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: moment().format('M'),
    year: moment().format('YYYY'),
    earnings: {
      basic: '',
      da: '',
      hra: '',
      ta: '',
    },
    deductions: {
      providentFund: '',
      esi: '',
      loan: '',
      tax: '',
    },
  });

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [netSalary, setNetSalary] = useState(0);

  // Calculate totals whenever earnings or deductions change
  useEffect(() => {
    const earningsTotal = Object.values(formData.earnings).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0,
    );
    const deductionsTotal = Object.values(formData.deductions).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0,
    );

    setTotalEarnings(earningsTotal);
    setTotalDeductions(deductionsTotal);
    setNetSalary(earningsTotal - deductionsTotal);
  }, [formData.earnings, formData.deductions]);

  const updateEarnings = (field, value) => {
    setFormData({
      ...formData,
      earnings: {
        ...formData.earnings,
        [field]: value,
      },
    });
  };

  const updateDeductions = (field, value) => {
    setFormData({
      ...formData,
      deductions: {
        ...formData.deductions,
        [field]: value,
      },
    });
  };

  const validateForm = () => {
    // Check if all fields are filled
    const earningsValid = Object.values(formData.earnings).every(
      value => value !== '',
    );
    const deductionsValid = Object.values(formData.deductions).every(
      value => value !== '',
    );

    if (!earningsValid || !deductionsValid) {
      Alert.alert('Error', 'Please fill all the fields');
      return false;
    }

    // Check if net salary is positive
    if (netSalary < 0) {
      Alert.alert('Error', 'Net salary cannot be negative');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check for existing salary slip
      const existingSlips = await axios.get(
        `${BASE_URL}/api/salaryslips/employee/${employeeId}`,
      );

      const duplicateSlip = existingSlips.data.find(
        slip =>
          slip.month === parseInt(formData.month) &&
          slip.year === parseInt(formData.year),
      );

      if (duplicateSlip) {
        const monthYear = moment()
          .month(parseInt(formData.month) - 1)
          .year(parseInt(formData.year))
          .format('MMMM YYYY');

        Alert.alert('Error', `Salary slip already exists for ${monthYear}`);
        setLoading(false);
        return;
      }

      // Process the data
      const processedData = {
        ...formData,
        employeeId: formData.employeeId?.toString() || formData.employeeId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        earnings: Object.entries(formData.earnings).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Number(value) || 0,
          }),
          {},
        ),
        deductions: Object.entries(formData.deductions).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Number(value) || 0,
          }),
          {},
        ),
      };

      const response = await axios.post(
        `${BASE_URL}/api/salaryslips`,
        processedData,
      );

      if (response.data) {
        setLoading(false);
        navigation.goBack();
        // Show alert after navigation
        requestAnimationFrame(() => {
          Alert.alert('Success', 'Salary slip generated successfully');
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Salary slip generation error:', error);
      requestAnimationFrame(() => {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to generate salary slip',
        );
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Generate Salary Slip</Title>
          <Subheading>{employeeName}</Subheading>

          <SalarySlipForm
            formData={formData}
            setFormData={setFormData}
            updateEarnings={updateEarnings}
            updateDeductions={updateDeductions}
            totalEarnings={totalEarnings}
            totalDeductions={totalDeductions}
            netSalary={netSalary}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
            style={styles.submitButton}>
            {loading ? 'Generating...' : 'Generate Salary Slip'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...layout.container,
  },
  card: {
    ...layout.card,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  employeeInfo: {
    marginBottom: spacing.md,
  },
});

export default GenerateSalarySlipScreen;
