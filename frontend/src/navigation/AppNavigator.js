import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Import screens
import EmployeeListScreen from '../screens/EmployeeListScreen';
import EmployeeDetailsScreen from '../screens/EmployeeDetailsScreen';
import GenerateSalarySlipScreen from '../screens/GenerateSalarySlipScreen';
import ViewSalarySlipScreen from '../screens/ViewSalarySlipScreen';
import LoginScreen from '../screens/LoginScreen';
import Form16UploadScreen from '../screens/Form16UploadScreen';
import Form16DownloadScreen from '../screens/Form16DownloadScreen';
import {colors} from '../styles/common';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}>
        <Stack.Screen
          name="EmployeeList"
          component={EmployeeListScreen}
          options={{
            title: 'Employees',
            headerRight: () => null,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />

        <Stack.Screen
          name="EmployeeDetails"
          component={EmployeeDetailsScreen}
          options={({route}) => ({
            title: route.params?.employeeName || 'Employee Details',
            contentStyle: {
              backgroundColor: colors.background,
            },
          })}
        />

        <Stack.Screen
          name="GenerateSalarySlip"
          component={GenerateSalarySlipScreen}
          options={{
            title: 'Generate Salary Slip',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />

        <Stack.Screen
          name="ViewSalarySlip"
          component={ViewSalarySlipScreen}
          options={{
            title: 'Salary Slip',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />

        <Stack.Screen
          name="Form16Upload"
          component={Form16UploadScreen}
          options={{
            title: 'Upload Form-16',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />

        <Stack.Screen
          name="Form16Download"
          component={Form16DownloadScreen}
          options={{
            title: 'Download Form-16',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
