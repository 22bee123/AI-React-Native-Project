import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Platform,
  LogBox
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Import components
import Navbar from '../../../components/navbar/navbar';
import CameraComponent from '../../../components/navbar/camera';
import FolderComponent from '../../../components/navbar/folder';

// Ignore specific warnings (if needed)
LogBox.ignoreLogs([
  'ViewPropTypes will be removed from React Native',
]);

const HomePage = () => {
  const params = useLocalSearchParams();
  
  // Set up state for active tab
  const [activeTab, setActiveTab] = useState('home');
  const [userImages, setUserImages] = useState([]);
  
  // Initialize with camera tab if coming from splash screen
  useEffect(() => {
    if (params.initialTab === 'camera') {
      setActiveTab('camera');
    }
  }, [params.initialTab]);

  // Handle tab navigation
  const handleGalleryPress = () => {
    setActiveTab('gallery');
  };

  const handleHomePress = () => {
    setActiveTab('home');
  };

  const handleCameraPress = () => {
    setActiveTab('camera');
  };

  // Render home content
  const renderHomeContent = () => {
    return (
      <View style={styles.homeContent}>
        <Text style={styles.welcomeText}>Welcome to GuluGod Posture</Text>
        <Text style={styles.descriptionText}>
          Use the camera to analyze your posture or browse your saved images in the gallery.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navbar at top */}
      <View style={styles.navbarContainer}>
        <Navbar 
          activeTab={activeTab}
          handleGalleryPress={handleGalleryPress}
          handleHomePress={handleHomePress}
          handleCameraPress={handleCameraPress}
        />
      </View>
      
      {/* Content area */}
      <View style={styles.contentContainer}>
        {activeTab === 'camera' && <CameraComponent />}
        {activeTab === 'gallery' && <FolderComponent images={userImages} />}
        {activeTab === 'home' && renderHomeContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbarContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A5741',
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  }
});

export default HomePage; 