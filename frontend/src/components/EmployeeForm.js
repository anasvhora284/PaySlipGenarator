import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Card, CardContent, Typography, Divider, Box} from '@mui/material';
import {Input} from './common';
import {colors, spacing} from '../styles/common';

const EmployeeForm = ({formData, setFormData, errors, isNewEmployee}) => {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {isNewEmployee ? 'New Employee' : 'Employee Details'}
          </Typography>
          <Divider style={styles.divider} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Input
              label="Employee ID"
              value={formData.employeeId}
              onChangeText={text =>
                setFormData({...formData, employeeId: text})
              }
              error={errors.employeeId}
              disabled={!isNewEmployee}
              leftIcon="badge"
              variant="outlined"
            />

            <Input
              label="Name"
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
              error={errors.name}
              leftIcon="person"
              autoCapitalize="words"
              variant="outlined"
            />

            <Input
              label="Designation"
              value={formData.designation}
              onChangeText={text =>
                setFormData({...formData, designation: text})
              }
              error={errors.designation}
              leftIcon="work"
              autoCapitalize="words"
              variant="outlined"
            />
          </Box>

          <Divider style={styles.divider} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={text => setFormData({...formData, email: text})}
              error={errors.email}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              variant="outlined"
            />

            <Input
              label="Phone"
              value={formData.phone}
              onChangeText={text => setFormData({...formData, phone: text})}
              error={errors.phone}
              leftIcon="phone"
              keyboardType="phone-pad"
              variant="outlined"
            />
          </Box>

          <Divider style={styles.divider} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Employment Details
            </Typography>
            <Input
              label="Joining Date"
              value={formData.joiningDate}
              onChangeText={text =>
                setFormData({...formData, joiningDate: text})
              }
              leftIcon="calendar-today"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    margin: spacing.md,
    borderRadius: 12,
  },
  divider: {
    marginVertical: spacing.md,
  },
});

export default EmployeeForm;
