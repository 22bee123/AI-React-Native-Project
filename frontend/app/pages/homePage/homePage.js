import React, { useState, useEffect, useRef } from 'react';
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
  // Add reference to the folder component
  const folderComponentRef = useRef(null);
  const [shouldSaveImage, setShouldSaveImage] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  
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
  
  // Handle saving image results from camera
  const handleSaveResult = (imageUri, result, source = 'camera') => {
    console.log('Saving result from source:', source, imageUri, result);
    
    // Save the image with its prediction result
    const newImage = {
      uri: imageUri,
      result: result,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    // Update local state with the new image
    setUserImages(prevImages => [newImage, ...prevImages]);
    
    // Only automatically save to folder if it's coming from camera
    // Import images don't need folder saving as they'll be saved manually
    if (source === 'camera') {
      // Store for pending save to folder
      setPendingSaveData(newImage);
      setShouldSaveImage(true);
    }
    
    // Switch to gallery tab to show the result
    setActiveTab('gallery');
  };
  
  // Effect to save new image when tab changes to gallery
  useEffect(() => {
    if (activeTab === 'gallery' && shouldSaveImage && pendingSaveData) {
      // Small delay to ensure folder component is ready
      const timer = setTimeout(() => {
        if (folderComponentRef.current && folderComponentRef.current.saveImageWithResult) {
          folderComponentRef.current.saveImageWithResult(
            pendingSaveData.uri,
            pendingSaveData.result
          );
        }
        setShouldSaveImage(false);
        setPendingSaveData(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, shouldSaveImage, pendingSaveData]);

  // Handle deletion of images from the main state
  const handleImageDeleted = (imageId) => {
    // Update the userImages state by removing the deleted image
    setUserImages(prevImages => 
      prevImages.filter(image => image.id !== imageId)
    );
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
        {activeTab === 'camera' && <CameraComponent onSaveResult={handleSaveResult} />}
        {activeTab === 'gallery' && (
          <FolderComponent 
            ref={folderComponentRef}
            images={userImages}
            onImageDeleted={handleImageDeleted}
          />
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