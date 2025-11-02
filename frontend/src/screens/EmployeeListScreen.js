import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Searchbar,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing} from '../styles/common';
import {BASE_URL} from '../utils/api';
import axios from 'axios';
import {Button, IconButton} from '../components/common';
import ScreenHeader from '../components/common/ScreenHeader';

const EmployeeListScreen = ({navigation}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [error, setError] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/api/employees`);
      if (response?.data) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });

    return unsubscribe;
  }, [navigation]);

  // Search functionality
  useEffect(() => {
    const filtered = employees.filter(
      employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // Delete employee
  const handleDelete = async employeeId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this employee?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/employees/${employeeId}`);
              fetchEmployees();
              Alert.alert('Success', 'Employee deleted successfully');
            } catch (deleteError) {
              Alert.alert('Error', 'Failed to delete employee');
              console.error(deleteError);
            }
          },
        },
      ],
    );
  };

  // Upload Form 16
  const handleUploadForm16 = (employeeId, employeeName) => {
    navigation.navigate('Form16Upload', {
      employeeId,
      employeeName,
    });
  };

  // Download Form 16
  const handleDownloadForm16 = (employeeId, employeeName) => {
    navigation.navigate('Form16Download', {
      employeeId,
      employeeName,
    });
  };

  // Generate Form 16
  const handleGenerateForm16 = (employeeId, employeeName) => {
    navigation.navigate('Form16Generate', {
      employeeId,
      employeeName,
    });
  };

  // Render empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyText}>No employees found</Text>
    </View>
  );

  // Render employee card
  const renderEmployee = ({item}) => {
    if (!item) {
      return null;
    }

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.employeeInfo}>
              <Avatar.Text
                size={60}
                label={item?.name?.substring(0, 2).toUpperCase() || 'NA'}
                style={styles.avatar}
                labelStyle={styles.avatarText}
              />
              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>
                  {item?.name || 'Unnamed'}
                </Text>
                <View style={styles.employeeSubInfo}>
                  <Icon name="badge" size={16} color={colors.text.secondary} />
                  <Text style={styles.employeeId}>
                    ID: {item?.employeeId || 'N/A'}
                  </Text>
                </View>
                <View style={styles.employeeSubInfo}>
                  <Icon name="work" size={16} color={colors.text.secondary} />
                  <Text style={styles.designation}>
                    {item?.designation || 'No Designation'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.quickActions}>
              <IconButton
                icon="edit"
                color={colors.success}
                size={22}
                onPress={() =>
                  navigation.navigate('EmployeeDetails', {
                    employeeId: item._id,
                    employeeName: item.name,
                  })
                }
              />
              <IconButton
                icon="delete"
                color={colors.error}
                size={22}
                onPress={() => handleDelete(item._id)}
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <View style={styles.buttonWrapper}>
              <Button
                title="View Details"
                icon="visibility"
                variant="secondary"
                fullWidth
                style={styles.alignedButton}
                onPress={() =>
                  navigation.navigate('EmployeeDetails', {
                    employeeId: item._id,
                  })
                }
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title="Generate Slip"
                icon="description"
                variant="primary"
                fullWidth
                style={styles.alignedButton}
                onPress={() =>
                  navigation.navigate('GenerateSalarySlip', {
                    employeeId: item._id,
                    employeeName: item.name,
                  })
                }
              />
            </View>
          </View>

          <View style={styles.form16Buttons}>
            <View style={styles.buttonWrapper}>
              <Button
                title={'Upload\nForm-16'}
                icon="upload"
                variant="secondary"
                fullWidth
                style={styles.alignedButton}
                textStyle={styles.multilineButtonText}
                onPress={() => handleUploadForm16(item._id, item.name)}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title={'Download\nForm-16'}
                icon="download"
                variant="secondary"
                fullWidth
                style={styles.alignedButton}
                textStyle={styles.multilineButtonText}
                onPress={() => handleDownloadForm16(item._id, item.name)}
              />
            </View>
          </View>
          <View style={styles.form16Buttons}>
            <View style={styles.buttonWrapper}>
              <Button
                title={'Generate\nForm-16'}
                icon="description"
                variant="primary"
                fullWidth
                style={styles.alignedButton}
                textStyle={styles.multilineButtonText}
                onPress={() => handleGenerateForm16(item._id, item.name)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // FAB for adding new employee
  const renderFAB = () => (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('EmployeeDetails')}>
      <Icon name="add" size={24} color={colors.surface} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEmployees}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Employees" styles={styles.HeaderText} />
      <Searchbar
        placeholder="Search by name or ID..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />

      {renderFAB()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  HeaderText: {
    marginLeft: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    boxShadow: '0px 1px 20px 10px #e3e3e3',
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    color: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  employeeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: spacing.md,
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  employeeDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  employeeId: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  designation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  form16Buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  alignedButton: {
    justifyContent: 'flex-start',
    paddingLeft: spacing.md,
  },
  multilineButtonText: {
    textAlign: 'left',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: spacing.md,
  },
});

export default EmployeeListScreen;
