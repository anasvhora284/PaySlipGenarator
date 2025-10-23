/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Platform,
  Switch,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Text, ActivityIndicator} from 'react-native-paper';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import moment from 'moment';
import SalarySlipView from '../components/SalarySlipView';
import {spacing, colors, typography} from '../styles/common';
import {generateSalarySlipPDF} from '../utils/pdfGenerator';
import ReactNativeBlobUtil from 'react-native-blob-util';
import SalarySlipForm from '../components/SalarySlipForm';
import ScreenHeader from '../components/common/ScreenHeader';
import {Button} from '../components/common';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define AuthModal as a separate component
const AuthModal = ({
  passwordModalVisible,
  setPasswordModalVisible,
  password,
  setPassword,
  handlePasswordSubmit,
  authType,
  handleDownloadPDF,
}) => (
  <Modal
    visible={passwordModalVisible}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setPasswordModalVisible(false)}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Authentication Required</Text>
          {authType !== 'password' && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleDownloadPDF}>
              <Icon
                name={
                  authType === BiometryTypes.FaceID
                    ? 'face-recognition'
                    : 'fingerprint'
                }
                size={30}
                color={colors.primary}
                theme={{
                  colors: {
                    text: colors.text.primary,
                    primary: colors.primary,
                    underlineColor: colors.primary,
                  },
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.modalSubtitle}>
          Enter your password to continue
        </Text>

        <TextInput
          style={styles.passwordInput}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor={colors.text.secondary}
          autoFocus={true}
          theme={{
            colors: {
              text: colors.text.primary,
              primary: colors.primary,
              underlineColor: colors.primary,
            },
          }}
        />

        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              setPasswordModalVisible(false);
              setPassword('');
            }}
            style={[styles.modalButton, styles.cancelButton]}
            labelStyle={styles.cancelButtonText}
            textColor={colors.text.primary}
            theme={{
              colors: {
                text: colors.text.primary,
                primary: colors.primary,
                underlineColor: colors.primary,
              },
            }}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handlePasswordSubmit}
            style={[styles.modalButton, styles.confirmButton]}
            labelStyle={styles.confirmButtonText}
            textColor="#fff"
            disabled={!password}
            theme={{
              colors: {
                text: '#fff',
                primary: colors.primary,
                underlineColor: colors.primary,
              },
            }}>
            Confirm
          </Button>
        </View>
      </View>
    </View>
  </Modal>
);

const ViewSalarySlipScreen = ({route, navigation}) => {
  const {salarySlipId} = route.params;
  const [loading, setLoading] = useState(true);
  const [salarySlip, setSalarySlip] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [downloadedFilePath, setDownloadedFilePath] = useState('');
  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    fetchSalarySlip();
  }, []);

  useEffect(() => {
    requestStoragePermission();
  }, []);

  useEffect(() => {
    checkBiometricSupport();
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
    if (Platform.OS === 'ios') {
      return true;
    }

    // For Android, we don't need storage permissions for private directory
    return true;
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

  const handleDownloadPDF = async () => {
    if (!salarySlip) {
      return;
    }

    try {
      if (
        authType === BiometryTypes.Biometrics ||
        authType === BiometryTypes.FaceID ||
        authType === BiometryTypes.TouchID
      ) {
        const {success} = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to download PDF',
          cancelButtonText: 'Use Password',
        });

        if (success) {
          await generateAndSavePDF();
        } else {
          // User cancelled biometric auth, show password prompt
          setPasswordModalVisible(true);
        }
      } else {
        // No biometrics available, show password prompt
        setPasswordModalVisible(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setPasswordModalVisible(true);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/salaryslips/verify-password`, {
        password,
      });

      if (response.data.success) {
        setPasswordModalVisible(false);
        setPassword('');
        await generateAndSavePDF();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Incorrect password');
    }
  };

  const generateAndSavePDF = async () => {
    try {
      setGeneratingPDF(true);

      const {dirs} = ReactNativeBlobUtil.fs;
      const appBaseDir = `${dirs.DownloadDir}/Pay Slip Pro`;
      const salarySlipDir = `${appBaseDir}/Salary Slips`;

      const baseDirExists = await ReactNativeBlobUtil.fs.exists(appBaseDir);
      if (!baseDirExists) {
        await ReactNativeBlobUtil.fs.mkdir(appBaseDir);
      }

      const salarySlipDirExists = await ReactNativeBlobUtil.fs.exists(salarySlipDir);
      if (!salarySlipDirExists) {
        await ReactNativeBlobUtil.fs.mkdir(salarySlipDir);
      }

      const fileName = `SalarySlip_${salarySlip.employee.name}_${salarySlip.month}_${salarySlip.year}.pdf`;
      const filePath = `${salarySlipDir}/${fileName}`;

      // Generate and save PDF
      const pdfContent = await generateSalarySlipPDF(
        salarySlip,
        salarySlip.employee.name,
        salarySlip.employee.employeeId,
      );
      await ReactNativeBlobUtil.fs.writeFile(filePath, pdfContent, 'base64');

      console.log('PDF saved successfully at:', filePath);
      setGeneratingPDF(false);
      setDownloadedFilePath(filePath);
      setSuccessModalVisible(true);
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
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
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

  const checkBiometricSupport = async () => {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      if (available) {
        setAuthType(biometryType);
      } else {
        setAuthType('password');
      }
    } catch (error) {
      console.log('Biometric check error:', error);
      setAuthType('password');
    }
  };

  const handleViewPDF = async () => {
    try {
      setSuccessModalVisible(false);
      await ReactNativeBlobUtil.android.actionViewIntent(
        downloadedFilePath,
        'application/pdf',
      );
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert(
        'No PDF Viewer',
        'No PDF viewer app found. Please install a PDF reader app.',
      );
    }
  };

  const handleSharePDF = () => {
    setSuccessModalVisible(false);
    sharePDF(downloadedFilePath);
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
              icon="content-copy"
              disabled={generatingPDF}
              title="Copy"
            />
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.button, {backgroundColor: colors.error}]}
              icon="delete"
              title="Delete"
            />
            <Button
              mode="contained"
              onPress={handleDownloadPDF}
              style={[styles.button, {backgroundColor: colors.primary}]}
              icon="download"
              title="Download PDF"
              loading={generatingPDF}
              disabled={generatingPDF}>
              {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </View>
        </View>
      )}

      <AuthModal
        passwordModalVisible={passwordModalVisible}
        setPasswordModalVisible={setPasswordModalVisible}
        password={password}
        setPassword={setPassword}
        handlePasswordSubmit={handlePasswordSubmit}
        authType={authType}
        handleDownloadPDF={handleDownloadPDF}
      />

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={64} color={colors.success} />
            </View>

            <Text style={styles.successTitle}>Download Complete!</Text>
            <Text style={styles.successMessage}>
              Salary Slip has been successfully saved to your device
            </Text>
            <Text style={styles.successPath}>
              Location: Downloads/Pay Slip Pro/Salary Slips/
            </Text>

            <View style={styles.successModalButtons}>
              <Button
                title="View"
                icon="visibility"
                variant="primary"
                onPress={handleViewPDF}
                style={styles.successButton}
              />

              <Button
                title="Share"
                icon="share"
                variant="primary"
                onPress={handleSharePDF}
                style={styles.successButton}
              />

              <Button
                title="OK"
                variant="secondary"
                onPress={() => setSuccessModalVisible(false)}
                style={styles.successButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  updateButton: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  biometricButton: {
    padding: spacing.sm,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    color: colors.text.primary,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    width: '85%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  successIconContainer: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successPath: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  successModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  successButton: {
    flex: 1,
  },
});

export default ViewSalarySlipScreen;
