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
  Switch,
} from 'react-native';
import {Text, Button, ActivityIndicator, Card, Title} from 'react-native-paper';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import moment from 'moment';
import SalarySlipView from '../components/SalarySlipView';
import {spacing, layout, colors, typography} from '../styles/common';
import {generateSalarySlipPDF} from '../utils/pdfGenerator';
import FileViewer from 'react-native-file-viewer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import SalarySlipForm from '../components/SalarySlipForm';
import ScreenHeader from '../components/common/ScreenHeader';
import zIndex from '@mui/material/styles/zIndex';

const ViewSalarySlipScreen = ({route, navigation}) => {
  const {salarySlipId} = route.params;
  const [loading, setLoading] = useState(true);
  const [salarySlip, setSalarySlip] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

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
      initializeFormData(response.data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch salary slip details');
      navigation.goBack();
    }
  };

  const initializeFormData = data => {
    setFormData({
      month: data.month.toString(),
      year: data.year.toString(),
      earnings: {
        basic: data.earnings.basic.toString(),
        da: data.earnings.da.toString(),
        hra: data.earnings.hra.toString(),
        ta: data.earnings.ta.toString(),
      },
      deductions: {
        providentFund: data.deductions.providentFund.toString(),
        esi: data.deductions.esi.toString(),
        loan: data.deductions.loan.toString(),
        tax: data.deductions.tax.toString(),
      },
    });
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

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const processedData = {
        ...formData,
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

      await axios.put(
        `${BASE_URL}/api/salaryslips/${salarySlipId}`,
        processedData,
      );
      Alert.alert('Success', 'Salary slip updated successfully');
      setIsEditing(false);
      fetchSalarySlip();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update salary slip',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this salary slip?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${BASE_URL}/api/salaryslips/${salarySlipId}`);
              Alert.alert('Success', 'Salary slip deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete salary slip');
              setLoading(false);
            }
          },
        },
      ],
    );
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
      <View style={styles.headerContainer}>
        <ScreenHeader title="Salary Slip Details" />
        <View style={styles.editToggleContainer}>
          <Text style={styles.title}>Edit Mode</Text>
          <Switch
            value={isEditing}
            onValueChange={() => setIsEditing(!isEditing)}
            trackColor={{false: colors.text.disabled, true: colors.primary}}
            thumbColor={isEditing ? colors.surface : colors.surface}
            ios_backgroundColor={colors.text.disabled}
            style={styles.switch}
          />
        </View>
      </View>

      {isEditing ? (
        <>
          <SalarySlipForm
            formData={formData}
            setFormData={setFormData}
            updateEarnings={(field, value) => {
              setFormData({
                ...formData,
                earnings: {...formData.earnings, [field]: value},
              });
            }}
            updateDeductions={(field, value) => {
              setFormData({
                ...formData,
                deductions: {...formData.deductions, [field]: value},
              });
            }}
            totalEarnings={Object.values(formData.earnings).reduce(
              (sum, value) => sum + (Number(value) || 0),
              0,
            )}
            totalDeductions={Object.values(formData.deductions).reduce(
              (sum, value) => sum + (Number(value) || 0),
              0,
            )}
            netSalary={
              Object.values(formData.earnings).reduce(
                (sum, value) => sum + (Number(value) || 0),
                0,
              ) -
              Object.values(formData.deductions).reduce(
                (sum, value) => sum + (Number(value) || 0),
                0,
              )
            }
          />
          <Button
            mode="contained"
            onPress={handleUpdate}
            style={styles.updateButton}
            loading={loading}
            theme={{
              colors: {
                primary: colors.primary,
              },
            }}>
            Update Salary Slip
          </Button>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <SalarySlipView salarySlip={salarySlip} />
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={[styles.button, {backgroundColor: colors.primary}]}
              icon="share"
              disabled={generatingPDF}>
              Share as Text
            </Button>
            <Button
              mode="contained"
              onPress={handleDownloadPDF}
              style={[styles.button, {backgroundColor: colors.primary}]}
              icon="file-pdf-box"
              loading={generatingPDF}
              disabled={generatingPDF}>
              {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.button, {backgroundColor: colors.error}]}
              icon="delete">
              Delete
            </Button>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
    // marginBottom: spacing.sm,
  },
  editToggleContainer: {
    position: 'absolute',
    top: '100%',
    right: '5%',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'right',
    gap: spacing.sm,
  },
  editToggleText: {
    ...typography.subtitle,
    color: colors.text.secondary,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  switch: {
    transform: [{scale: 1}],
  },
  previewContainer: {
    marginTop: spacing.md,
  },
  buttonContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  button: {
    marginVertical: spacing.xs,
  },
  updateButton: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.primary,
  },
});

export default ViewSalarySlipScreen;
