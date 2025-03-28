import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  // Navigate to home page with camera tab active
  const navigateToHome = () => {
    router.replace({
      pathname: '/pages/homePage',
      params: { initialTab: 'camera' }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/gulugod_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <Text style={styles.logoText}>GULUGOD</Text>
      
      <TouchableOpacity
        onPress={navigateToHome}
        activeOpacity={0.8}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#1A5741', '#1e6e54']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A5741',
    marginBottom: 60,
    letterSpacing: 2,
  },
  buttonContainer: {
    width: width * 0.7,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  }
});

export default SplashScreen;
