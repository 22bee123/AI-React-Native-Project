import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';

// Import components
import Navbar from '../../components/navbar/navbar';
import CameraComponent from '../../components/navbar/camera';
import FolderComponent from '../../components/navbar/folder';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();

  // Handle camera tab press
  const handleCameraPress = () => {
    setActiveTab('camera');
    setCameraVisible(true);
  };

  // Handle gallery tab press
  const handleGalleryPress = () => {
    setActiveTab('gallery');
    setCameraVisible(false);
  };

  // Handle home tab press
  const handleHomePress = () => {
    setActiveTab('home');
    setCameraVisible(false);
  };

  // Render home content
  const renderHomeContent = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Posture Analysis System</Text>
        <Text style={styles.descriptionText}>
          Welcome to GULUGOD Posture Analysis System. Use the camera to analyze your posture or check your gallery to view past analyses.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Navigation Bar */}
      <View style={styles.navbarContainer}>
        <Navbar 
          activeTab={activeTab}
          handleGalleryPress={handleGalleryPress}
          handleHomePress={handleHomePress}
          handleCameraPress={handleCameraPress}
        />
      </View>
      
      {/* Welcome Text */}
      {!cameraVisible && (
        <Text style={styles.welcomeText}>GULUGOD</Text>
      )}
      
      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'camera' && (
          <CameraComponent />
        )}
        
        {activeTab === 'gallery' && (
          <FolderComponent images={userImages} />
        )}
        
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A5741',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  }
});

export default HomePage;
