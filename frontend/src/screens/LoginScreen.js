import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import {colors, spacing} from '../styles/common';
import axios from 'axios';
import {BASE_URL} from '../utils/api';

const {width, height} = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef(null);
  const headerHeightAnim = useRef(new Animated.Value(height * 0.35)).current;
  const illustrationOpacityAnim = useRef(new Animated.Value(1)).current;
  const bottomPaddingAnim = useRef(new Animated.Value(0)).current;
  const bottomPositionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Animated.parallel([
          Animated.timing(headerHeightAnim, {
            toValue: height * 0.12,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(illustrationOpacityAnim, {
            toValue: 0.3,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(bottomPositionAnim, {
            toValue: height * 0.3,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.parallel([
          Animated.timing(headerHeightAnim, {
            toValue: height * 0.35,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(illustrationOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(bottomPositionAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [headerHeightAnim, illustrationOpacityAnim, bottomPositionAnim]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        setLoading(false);
        navigation.replace('EmployeeList');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Invalid credentials');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeightAnim,
          },
        ]}>
        <View style={styles.illustrationWrapper}>
          <Animated.View
            style={[
              styles.illustrationbg,
              {
                opacity: illustrationOpacityAnim,
              },
            ]}
          />
          <Animated.Image
            source={require('../../assets/doctor-illustration.png')}
            style={[
              styles.illustration,
              {
                opacity: illustrationOpacityAnim,
              },
            ]}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.formSection, {paddingBottom: bottomPaddingAnim}]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.formInner}>
            <View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Login to access your Salary Slip App
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor={colors.text.secondary}
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, styles.lastInputSpacing]}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={colors.text.secondary}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  illustrationWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationbg: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  illustration: {
    width: Math.min(width, 300),
    height: Math.min(width, 300),
    zIndex: 1,
  },
  formSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.65,
  },
  formContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  formInner: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  lastInputSpacing: {
    marginBottom: 0,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    height: 54,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default LoginScreen;
