import React, {useState, useEffect} from 'react';
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
import ReactNativeBlobUtil from 'react-native-blob-util';

const Form16DownloadScreen = ({route, navigation}) => {
  const {employeeId, employeeName} = route.params;
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [fetchingYears, setFetchingYears] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [downloadedFilePath, setDownloadedFilePath] = useState('');

  const fetchAvailableYears = async () => {
    try {
      setFetchingYears(true);
      const response = await axios.get(
        `${BASE_URL}/api/form16/available-years/${employeeId}`,
      );
      if (response.data.success) {
        setAvailableYears(response.data.years || []);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
      Alert.alert(
        'Error',
        'Failed to fetch available years. Please try again.',
      );
    } finally {
      setFetchingYears(false);
    }
  };

  useEffect(() => {
    fetchAvailableYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!selectedYear) {
      Alert.alert('Error', 'Please select a financial year');
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

    try {
      console.log('Download URL:', `${BASE_URL}/api/form16/download/${employeeId}?password=${password}&financialYear=${selectedYear}`);

      // Create Pay Slip Pro directory structure
      const {dirs} = ReactNativeBlobUtil.fs;
      const appBaseDir = `${dirs.DownloadDir}/Pay Slip Pro`;
      const form16Dir = `${appBaseDir}/Form-16s`;

      // Ensure directories exist
      const baseDirExists = await ReactNativeBlobUtil.fs.exists(appBaseDir);
      if (!baseDirExists) {
        await ReactNativeBlobUtil.fs.mkdir(appBaseDir);
      }

      const form16DirExists = await ReactNativeBlobUtil.fs.exists(form16Dir);
      if (!form16DirExists) {
        await ReactNativeBlobUtil.fs.mkdir(form16Dir);
      }

      const filename = `Form16_${employeeName}_${selectedYear}.pdf`;
      const path = `${form16Dir}/${filename}`;

      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: path,
      }).fetch(
        'GET',
        `${BASE_URL}/api/form16/download/${employeeId}?password=${password}&financialYear=${selectedYear}`,
      );

      console.log('Download response:', response);

      // Check if download was successful
      if (response.info().status === 200) {
        setDownloadedFilePath(path);
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);

      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Download failed',
      );
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const handleViewFile = async () => {
    try {
      setSuccessModalVisible(false);

      // Determine MIME type based on file extension
      const fileExtension = downloadedFilePath.split('.').pop().toLowerCase();
      let mimeType = 'application/pdf';

      if (fileExtension === 'doc') {
        mimeType = 'application/msword';
      } else if (fileExtension === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      // Use Android actionViewIntent with appropriate MIME type
      await ReactNativeBlobUtil.android.actionViewIntent(
        downloadedFilePath,
        mimeType,
      );
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert(
        'Cannot Open File',
        'No app found to open this file. Please install a suitable viewer app.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Download Form-16" />
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.employeeInfo}>
              <Icon name="person" size={24} color={colors.primary} />
              <Text style={styles.employeeName}>{employeeName}</Text>
            </View>

            <Text style={styles.sectionTitle}>Select Financial Year</Text>

            {fetchingYears ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Loading available years...
                </Text>
              </View>
            ) : availableYears.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="info-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyText}>
                  No Form-16 files have been uploaded yet
                </Text>
              </View>
            ) : (
              <>
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
                        data={availableYears}
                        keyExtractor={item => item}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            style={[
                              styles.dropdownItem,
                              selectedYear === item &&
                                styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              setSelectedYear(item);
                              setDropdownVisible(false);
                            }}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedYear === item &&
                                  styles.dropdownItemTextSelected,
                              ]}>
                              {item}
                            </Text>
                            {selectedYear === item && (
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
              </>
            )}

            {availableYears.length > 0 && (
              <Button
                title="Download Form-16"
                icon="cloud-download"
                variant="primary"
                fullWidth
                onPress={handleDownload}
                disabled={loading || !selectedYear}
                style={styles.downloadButton}
              />
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Downloading...</Text>
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
              Password format: First 4 letters of name (CAPS) + Last 4 digits of phone
            </Text>
            <Text style={styles.passwordHint}>
              Example: JOHN1234
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
                <Text style={styles.submitButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              Form-16 has been successfully downloaded to your device
            </Text>
            <Text style={styles.successPath}>
              Location: Downloads/Pay Slip Pro/Form-16s/
            </Text>

            <View style={styles.successModalButtons}>
              <Button
                title="View"
                icon="visibility"
                variant="primary"
                onPress={handleViewFile}
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
  downloadButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
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
    marginBottom: spacing.xs,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
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

export default Form16DownloadScreen;
