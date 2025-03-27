import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [showUserData, setShowUserData] = useState(false);

  // Request camera permissions when component mounts
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Load saved images
    loadSavedImages();
  }, []);

  // Function to load saved images from file system
  const loadSavedImages = async () => {
    try {
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
        return;
      }
      
      const files = await FileSystem.readDirectoryAsync(imagesDir);
      const images = files.map(file => `${imagesDir}${file}`);
      setUserImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Function to handle taking a photo
  const takePicture = async (camera) => {
    if (camera) {
      try {
        const photo = await camera.takePictureAsync();
        const imagesDir = `${FileSystem.documentDirectory}images/`;
        
        // Ensure directory exists
        const dirInfo = await FileSystem.getInfoAsync(imagesDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
        }
        
        // Save image to file system
        const fileName = `photo_${Date.now()}.jpg`;
        const newPath = `${imagesDir}${fileName}`;
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newPath
        });
        
        // Add to user images
        setUserImages([...userImages, newPath]);
        setCameraVisible(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  // Function to open gallery
  const openGallery = async () => {
    setShowUserData(true);
  };

  // Camera component
  const renderCamera = () => {
    if (hasPermission === null) {
      return <View style={styles.cameraContainer}><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
      return <View style={styles.cameraContainer}><Text>No access to camera</Text></View>;
    }
    
    return (
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => {
            this.camera = ref;
          }}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={() => takePicture(this.camera)}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setCameraVisible(false)}
            >
              <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  };

  // User data/gallery component
  const renderUserData = () => {
    return (
      <View style={styles.galleryContainer}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>Saved Images</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowUserData(false)}
          >
            <MaterialIcons name="close" size={24} color="#1A5741" />
          </TouchableOpacity>
        </View>
        
        {userImages.length === 0 ? (
          <Text style={styles.noImagesText}>No saved images found</Text>
        ) : (
          <View style={styles.imageGrid}>
            {userImages.map((uri, index) => (
              <Image 
                key={index}
                source={{ uri }}
                style={styles.thumbnail}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Main view with icons
  const renderMain = () => {
    return (
      <View style={styles.content}>
        <Text style={styles.welcomeText}>GULUGOD</Text>
        <Text style={styles.subtitleText}>Posture Analysis System</Text>
        
        <View style={styles.iconsContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => openGallery()}
          >
            <View style={styles.iconWrapper}>
              <MaterialIcons name="folder" size={36} color="#1A5741" />
            </View>
            <Text style={styles.iconText}>Gallery</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setCameraVisible(true)}
          >
            <View style={styles.iconWrapper}>
              <MaterialIcons name="camera-alt" size={36} color="#1A5741" />
            </View>
            <Text style={styles.iconText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {cameraVisible ? renderCamera() : 
       showUserData ? renderUserData() : 
       renderMain()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A5741',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 50,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconText: {
    fontSize: 14,
    color: '#1A5741',
    fontWeight: '500',
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  // Gallery styles
  galleryContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 20,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A5741',
  },
  noImagesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: '31%',
    aspectRatio: 1,
    margin: 3,
    borderRadius: 6,
  },
});

export default HomeScreen; 