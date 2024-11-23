import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import {colors, typography, spacing} from '../styles/common';

const {width} = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      navigation.replace('EmployeeList');
    } else {
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <View style={styles.glowCircle} /> */}
        <View
          //   source={require('../../assets/illustrationbg.svg')}
          style={styles.illustrationbg}
        />
        <Image
          source={require('../../assets/doctor-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.form}>
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
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%',
    position: 'relative',
  },
  illustrationbg: {
    position: 'absolute',
    left: '22%',
    backgroundColor: '#fff',
    opacity: 0.4,
    height: width * 0.6,
    width: width * 0.6,
    borderRadius: '50%',
    filter: 'blur(40px)',
    backdropFilter: 'blur(40px)',
    // position: 'absolute',
    // width: width * 0.8,
    // height: width * 0.8,
    // borderRadius: width * 0.4, // Makes it a perfect circle (half of width/height)
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // top: 0,
    // left: 0,
    // height: 100,
    // width: 100,
    // transform: [{translateY: -(width * 0.4)}],
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.1,
    // shadowRadius: 20,
    // elevation: 10,
    // filter: 'blur(1px)',
    // backdropFilter: 'blur(1px)',
  },
  illustration: {
    width: width * 0.9,
    height: width * 0.9,
    zIndex: 1,
  },
  form: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    flex: 1,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: colors.text.primary,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default LoginScreen;
