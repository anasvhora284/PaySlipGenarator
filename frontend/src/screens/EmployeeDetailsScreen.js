/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
  Text,
  ActivityIndicator,
  Divider,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import moment from 'moment';
import {spacing, typography, layout, colors} from '../styles/common';
import ScreenHeader from '../components/common/ScreenHeader';
import {useFocusEffect} from '@react-navigation/native';

const EmployeeDetailsScreen = ({route, navigation}) => {
  const {employeeId} = route.params || {};
  const isNewEmployee = !employeeId;

  const [loading, setLoading] = useState(false);
  const [salarySlips, setSalarySlips] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    designation: '',
    email: '',
    phone: '',
    joiningDate: new Date(),
  });
  const [errors, setErrors] = useState({});

  // Fetch employee details if editing
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
      fetchEmployeeSalarySlips();
    }
  }, [employeeId, route]);

  // Refresh salary slips when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (employeeId) {
        fetchEmployeeSalarySlips();
      }
    }, [employeeId]),
  );

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/employees/${employeeId}`,
      );
      const employee = response.data;
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        email: employee.email,
        phone: employee.phone,
        joiningDate: new Date(employee.joiningDate),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employee details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeSalarySlips = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/salaryslips/employee/${employeeId}`,
      );
      setSalarySlips(response.data);
    } catch (error) {
      console.error('Failed to fetch salary slips:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (isNewEmployee) {
        await axios.post(`${BASE_URL}/api/employees`, formData);
        Alert.alert('Success', 'Employee created successfully');
      } else {
        await axios.put(`${BASE_URL}/api/employees/${employeeId}`, formData);
        Alert.alert('Success', 'Employee updated successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderSalarySlipItem = slip => (
    <Card
      key={slip._id}
      style={styles.salarySlipCard}
      onPress={() =>
        navigation.navigate('ViewSalarySlip', {salarySlipId: slip._id})
      }>
      <Card.Content style={styles.cardContent}>
        <View style={styles.salarySlipMainInfo}>
          <Text style={styles.salarySlipMonth}>
            {moment(`${slip.year}-${slip.month}-01`).format('MMMM YYYY')}
          </Text>
          <Text style={styles.salarySlipAmount}>
            ₹
            {slip.netSalary?.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.salarySlipDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gross:</Text>
            <Text style={styles.detailValue}>
              ₹
              {slip.totalEarnings?.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deductions:</Text>
            <Text style={styles.detailValue}>
              ₹
              {slip.totalDeductions?.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        joiningDate: selectedDate,
      }));
    }
  };

  if (loading && !isNewEmployee) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary}/>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader
        title={isNewEmployee ? 'New Employee' : 'Employee Details'}
      />
      <View style={styles.formContainer}>
        <TextInput
          mode="flat"
          label="Employee ID"
          value={formData.employeeId}
          onChangeText={text => setFormData({...formData, employeeId: text})}
          error={!!errors.employeeId}
          disabled={!isNewEmployee}
          left={<TextInput.Icon icon="card-account-details" />}
          style={styles.input}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />
        {errors.employeeId && (
          <Text style={styles.errorText}>{errors.employeeId}</Text>
        )}

        <TextInput
          mode="flat"
          label="Name"
          value={formData.name}
          onChangeText={text => setFormData({...formData, name: text})}
          error={!!errors.name}
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          mode="flat"
          label="Designation"
          value={formData.designation}
          onChangeText={text => setFormData({...formData, designation: text})}
          error={!!errors.designation}
          left={<TextInput.Icon icon="briefcase" />}
          style={styles.input}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />
        {errors.designation && (
          <Text style={styles.errorText}>{errors.designation}</Text>
        )}

        <TextInput
          mode="flat"
          label="Email"
          value={formData.email}
          onChangeText={text => setFormData({...formData, email: text})}
          error={!!errors.email}
          keyboardType="email-address"
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          mode="flat"
          label="Phone"
          value={formData.phone}
          onChangeText={text => setFormData({...formData, phone: text})}
          error={!!errors.phone}
          keyboardType="phone-pad"
          left={<TextInput.Icon icon="phone" />}
          style={styles.input}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <View style={styles.dateInputContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              mode="flat"
              label="Joining Date"
              value={moment(formData.joiningDate).format('DD MMM YYYY')}
              editable={false}
              left={<TextInput.Icon icon="calendar" />}
              right={
                <TextInput.Icon
                  icon="calendar-edit"
                  onPress={() => setShowDatePicker(true)}
                />
              }
              style={styles.input}
              theme={{
                colors: {
                  text: colors.text.primary,
                  primary: colors.primary,
                  underlineColor: colors.primary,
                },
              }}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.joiningDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          icon={isNewEmployee ? 'account-plus' : 'content-save'}>
          {isNewEmployee ? 'Create Employee' : 'Update Employee'}
        </Button>
      </View>

      {!isNewEmployee && (
        <View style={styles.salarySlipsContainer}>
          <Divider style={styles.divider} />
          <View style={styles.salarySlipsHeader}>
            <Title style={styles.salarySlipsTitle}>Salary Slips</Title>
            <Button
              mode="contained"
              style={styles.generateButton}
              onPress={() =>
                navigation.navigate('GenerateSalarySlip', {
                  employeeId: employeeId,
                  employeeName: formData.name || '',
                })
              }
              icon="plus">
              Generate
            </Button>
          </View>
          {salarySlips.length > 0 ? (
            salarySlips.map(renderSalarySlipItem)
          ) : (
            <Text style={styles.noSalarySlipsText}>No salary slips found</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    color: colors.primary,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  dateInputContainer: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  salarySlipsContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  salarySlipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  salarySlipsTitle: {
    ...typography.subtitle,
  },
  noSalarySlipsText: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  salarySlipCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    padding: spacing.sm,
  },
  salarySlipMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  salarySlipMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  salarySlipAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  salarySlipDetails: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chevronIcon: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -20,
  },
  generateButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  colors: {
    ...colors,
    border: '#E0E0E0',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: '#2E7D32',
  },
});

export default EmployeeDetailsScreen;
