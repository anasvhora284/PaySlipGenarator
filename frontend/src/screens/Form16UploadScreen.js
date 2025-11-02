import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import {Text, Card, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../styles/common';
import {BASE_URL} from '../utils/api';
import axios from 'axios';
import {Button} from '../components/common';
import ScreenHeader from '../components/common/ScreenHeader';
import DocumentPicker from 'react-native-document-picker';

const Form16UploadScreen = ({route, navigation}) => {
  const {employeeId, employeeName} = route.params;
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  // Generate financial years (last 2 years, current year, and next year)
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    // If month is Jan-Mar, current FY is (year-1)-(year)
    // If month is Apr-Dec, current FY is (year)-(year+1)
    const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;

    const years = [];
    // Last 2 years, current year, and next year (4 years total)
    for (let i = -2; i <= 1; i++) {
      const fyStart = startYear + i;
      const fyEnd = fyStart + 1;
      years.push({
        label: `${fyStart}-${fyEnd}`,
        value: `${fyStart}-${fyEnd}`,
      });
    }
    return years.reverse(); // Most recent first
  };

  const financialYears = generateFinancialYears();

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const handleUpload = () => {
    if (!selectedYear) {
      Alert.alert('Error', 'Please select a financial year');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    // Show password modal
    setPassword('');
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    setPasswordModalVisible(false);
    setLoading(true);
    setShowProgressModal(true);
    setUploadProgress(0);

    const uploadFormData = new FormData();
    uploadFormData.append('form16', {
      uri: selectedFile.uri,
      type: selectedFile.type,
      name: selectedFile.name,
    });
    uploadFormData.append('password', password);
    uploadFormData.append('employeeId', employeeId);
    uploadFormData.append('financialYear', selectedYear);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/form16/upload`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        },
      );

      if (response.data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          setShowProgressModal(false);
          Alert.alert('Success', 'Form-16 uploaded successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        }, 500);
      }
    } catch (error) {
      setShowProgressModal(false);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Upload failed',
      );
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Upload Form-16" />
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.employeeInfo}>
              <Icon name="person" size={24} color={colors.primary} />
              <Text style={styles.employeeName}>{employeeName}</Text>
            </View>

            <Text style={styles.sectionTitle}>Select Financial Year</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(true)}>
              <Text
                style={[
                  styles.dropdownButtonText,
                  !selectedYear && styles.dropdownPlaceholder,
                ]}>
                {selectedYear || 'Select financial year...'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Modal
              visible={dropdownVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setDropdownVisible(false)}>
                <View style={styles.dropdownModal}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownHeaderText}>
                      Select Financial Year
                    </Text>
                    <TouchableOpacity
                      onPress={() => setDropdownVisible(false)}>
                      <Icon name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={financialYears}
                    keyExtractor={item => item.value}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedYear === item.value &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedYear(item.value);
                          setDropdownVisible(false);
                        }}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedYear === item.value &&
                              styles.dropdownItemTextSelected,
                          ]}>
                          {item.label}
                        </Text>
                        {selectedYear === item.value && (
                          <Icon
                            name="check"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            <Text style={styles.sectionTitle}>Select File</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handleFilePick}>
              <Icon name="attach-file" size={24} color={colors.primary} />
              <Text style={styles.filePickerText}>
                {selectedFile ? selectedFile.name : 'Choose PDF or Word file'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileInfo}>
                <Icon name="description" size={20} color={colors.success} />
                <Text style={styles.fileInfoText}>
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)}{' '}
                  KB)
                </Text>
              </View>
            )}

            <Button
              title="Upload Form-16"
              icon="cloud-upload"
              variant="primary"
              fullWidth
              onPress={handleUpload}
              disabled={loading || !selectedYear || !selectedFile}
              style={styles.uploadButton}
            />

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Password Input Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.passwordModalOverlay}>
          <View style={styles.passwordModal}>
            <View style={styles.passwordModalHeader}>
              <Icon name="lock" size={24} color={colors.primary} />
              <Text style={styles.passwordModalTitle}>Enter Password</Text>
            </View>

            <Text style={styles.passwordModalSubtitle}>
              Enter the Form-16 upload password
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
              onSubmitEditing={handlePasswordSubmit}
            />

            <View style={styles.passwordModalButtons}>
              <TouchableOpacity
                style={[styles.passwordModalButton, styles.cancelButton]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPassword('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.passwordModalButton, styles.submitButton]}
                onPress={handlePasswordSubmit}>
                <Text style={styles.submitButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent={true}
        animationType="fade">
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModal}>
            <Icon name="cloud-upload" size={48} color={colors.primary} />
            <Text style={styles.progressTitle}>Uploading Form-16</Text>
            <Text style={styles.progressSubtitle}>{selectedFile?.name}</Text>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {width: `${uploadProgress}%`},
                ]}
              />
            </View>

            <Text style={styles.progressPercentage}>{uploadProgress}%</Text>

            {uploadProgress === 100 && (
              <View style={styles.successContainer}>
                <Icon name="check-circle" size={24} color={colors.success} />
                <Text style={styles.successText}>Upload Complete!</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 50,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '85%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}50`,
  },
  dropdownItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  filePickerText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: `${colors.success}15`,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  fileInfoText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: spacing.xs,
    flex: 1,
  },
  uploadButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
  },
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.xs,
  },
  passwordModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  passwordModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  passwordModalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },
  passwordModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  passwordModalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Form16UploadScreen;
