/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {Text, Button, ActivityIndicator} from 'react-native-paper';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import moment from 'moment';
import SalarySlipView from '../components/SalarySlipView';
import {spacing, layout, colors} from '../styles/common';
import {generateSalarySlipPDF} from '../utils/pdfGenerator';
import FileViewer from 'react-native-file-viewer';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ViewSalarySlipScreen = ({route, navigation}) => {
  const {salarySlipId} = route.params;
  const [loading, setLoading] = useState(true);
  const [salarySlip, setSalarySlip] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchSalarySlip();
  }, []);

  useEffect(() => {
    requestStoragePermission();
  }, []);

  const fetchSalarySlip = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/salaryslips/${salarySlipId}`,
      );
      setSalarySlip(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch salary slip details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = generateShareText();
      await Share.share({
        message,
        title: 'Salary Slip',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share salary slip');
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'ios') return true;

    // For Android, we don't need storage permissions for private directory
    return true;
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openSettings();
    } else {
      Linking.openSettings();
    }
  };

  const sharePDF = async filePath => {
    try {
      const message = generateShareText();
      await Share.share({
        message,
        title: 'Salary Slip',
        url: `data:application/pdf;base64,${message}`,
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  const openPDF = async filePath => {
    try {
      // Use FileViewer directly
      await FileViewer.open(filePath, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      });
    } catch (error) {
      console.error('Error opening PDF:', error);
      // Fallback to sharing if can't open
      Alert.alert('Cannot Open PDF', 'Would you like to share it instead?', [
        {
          text: 'Share',
          onPress: () => sharePDF(filePath),
        },
        {text: 'Cancel'},
      ]);
    }
  };

  const handleDownloadPDF = async () => {
    if (!salarySlip) return;

    try {
      setGeneratingPDF(true);

      // Use app's private directory
      const appDir = ReactNativeBlobUtil.fs.dirs.DocumentDir;
      const fileName = `SalarySlip_${salarySlip.employee.name}_${salarySlip.month}_${salarySlip.year}.pdf`;
      const filePath = `${appDir}/${fileName}`;

      // Generate and save PDF
      const pdfContent = await generateSalarySlipPDF(
        salarySlip,
        salarySlip.employee.name,
        salarySlip.employee.employeeId,
      );
      await ReactNativeBlobUtil.fs.writeFile(filePath, pdfContent, 'base64');

      console.log('PDF saved successfully at:', filePath);
      setGeneratingPDF(false);

      Alert.alert('Success', 'PDF generated successfully', [
        {
          text: 'View',
          onPress: async () => {
            try {
              await ReactNativeBlobUtil.android.actionViewIntent(
                filePath,
                'application/pdf',
              );
            } catch (error) {
              console.error('Error opening PDF:', error);
              Alert.alert(
                'No PDF Viewer',
                'Would you like to share the PDF instead?',
                [
                  {
                    text: 'Share',
                    onPress: () => sharePDF(filePath),
                  },
                  {text: 'Cancel'},
                ],
              );
            }
          },
        },
        {
          text: 'Share',
          onPress: () => sharePDF(filePath),
        },
        {text: 'OK'},
      ]);
    } catch (error) {
      setGeneratingPDF(false);
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const generateShareText = () => {
    if (!salarySlip) {
      return '';
    }

    return `
SALARY SLIP
${moment(`${salarySlip.year}-${salarySlip.month}-01`).format('MMMM YYYY')}

Employee: ${salarySlip.employee.name}
Employee ID: ${salarySlip.employee.employeeId}
Designation: ${salarySlip.employee.designation}

EARNINGS
Basic: ₹${salarySlip.earnings.basic}
DA: ₹${salarySlip.earnings.da}
HRA: ₹${salarySlip.earnings.hra}
TA: ₹${salarySlip.earnings.ta}
Total Earnings: ₹${salarySlip.totalEarnings}

DEDUCTIONS
PF: ₹${salarySlip.deductions.providentFund}
ESI: ₹${salarySlip.deductions.esi}
Loan: ₹${salarySlip.deductions.loan}
Tax: ₹${salarySlip.deductions.tax}
Total Deductions: ₹${salarySlip.totalDeductions}

NET SALARY: ₹${salarySlip.netSalary}
(${salarySlip.salaryInWords})
    `.trim();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!salarySlip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{color: colors.error}}>Salary slip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SalarySlipView salarySlip={salarySlip} />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.button}
          icon="share"
          disabled={generatingPDF}>
          Share as Text
        </Button>

        <Button
          mode="contained"
          onPress={handleDownloadPDF}
          style={styles.button}
          icon="file-pdf-box"
          loading={generatingPDF}
          disabled={generatingPDF}>
          {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...layout.container,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    ...layout.container,
    ...layout.centered,
    backgroundColor: colors.background,
  },
  errorContainer: {
    ...layout.container,
    ...layout.centered,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  button: {
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
  },
});

export default ViewSalarySlipScreen;
