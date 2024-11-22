import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Import screens
import EmployeeListScreen from '../screens/EmployeeListScreen';
import EmployeeDetailsScreen from '../screens/EmployeeDetailsScreen';
import GenerateSalarySlipScreen from '../screens/GenerateSalarySlipScreen';
import ViewSalarySlipScreen from '../screens/ViewSalarySlipScreen';
import {colors} from '../styles/common';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="EmployeeList"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="EmployeeList"
          component={EmployeeListScreen}
          options={{
            title: 'Employees',
            headerRight: () => null,
          }}
        />

        <Stack.Screen
          name="EmployeeDetails"
          component={EmployeeDetailsScreen}
          options={({route}) => ({
            title: route.params?.employeeName || 'Employee Details',
          })}
        />

        <Stack.Screen
          name="GenerateSalarySlip"
          component={GenerateSalarySlipScreen}
          options={{
            title: 'Generate Salary Slip',
          }}
        />

        <Stack.Screen
          name="ViewSalarySlip"
          component={ViewSalarySlipScreen}
          options={{
            title: 'Salary Slip',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
