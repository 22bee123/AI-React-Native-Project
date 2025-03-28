import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Navbar = ({ activeTab, handleGalleryPress, handleHomePress, handleCameraPress }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'gallery' && styles.activeNavItem]} 
        onPress={handleGalleryPress}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="folder" size={24} color="#1A5741" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]} 
        onPress={handleHomePress}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/gulugod_logo.png')} 
            style={styles.navLogoIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'camera' && styles.activeNavItem]} 
        onPress={handleCameraPress}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="camera-alt" size={24} color="#1A5741" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 60,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#1A5741',
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
