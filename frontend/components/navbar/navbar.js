import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Simple button component for all platforms
const SimpleButton = ({ onPress, style, isActive, children }) => {
  return (
    <TouchableOpacity 
      style={[styles.baseButton, style, isActive && styles.activeButton]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      {children}
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const Navbar = ({ activeTab, handleGalleryPress, handleHomePress, handleCameraPress }) => {
  return (
    <View style={styles.navbar}>
      <SimpleButton 
        isActive={activeTab === 'gallery'} 
        onPress={handleGalleryPress}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="folder" size={24} color="#1A5741" />
        </View>
      </SimpleButton>

      <SimpleButton 
        isActive={activeTab === 'home'} 
        onPress={handleHomePress}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/gulugod_logo.png')} 
            style={styles.navLogoIcon}
            resizeMode="contain"
          />
        </View>
      </SimpleButton>

      <SimpleButton 
        isActive={activeTab === 'camera'} 
        onPress={handleCameraPress}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="camera-alt" size={24} color="#1A5741" />
        </View>
      </SimpleButton>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 65,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  activeButton: {
    backgroundColor: 'rgba(230, 248, 244, 0.5)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 2,
    backgroundColor: '#1A5741',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5F1',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A5741',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  navLogoIcon: {
    width: 35,
    height: 35,
  }
});

export default Navbar;
