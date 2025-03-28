import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Button,
  Dimensions
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const CameraComponent = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle analysis mode
  const toggleAnalysis = () => {
    setAnalyzing(!analyzing);
  };

  // Render posture analysis overlay
  const renderPostureAnalysisOverlay = () => {
    if (!analyzing) return null;
    
    return (
      <View style={styles.overlayContainer} pointerEvents="none">
        {/* Frame corners */}
        <View style={[styles.frameBorder, styles.topLeft]} />
        <View style={[styles.frameBorder, styles.topRight]} />
        <View style={[styles.frameBorder, styles.bottomLeft]} />
        <View style={[styles.frameBorder, styles.bottomRight]} />
        
        {/* Spine connection points */}
        <View style={styles.spineContainer}>
          {/* Top point */}
          <View style={[styles.spinePoint, styles.activePoint, { top: height * 0.2 }]} />
          
          {/* Middle point */}
          <View style={[styles.spinePoint, { top: height * 0.35 }]} />
          
          {/* Lower middle point */}
          <View style={[styles.spinePoint, { top: height * 0.5 }]} />
          
          {/* Bottom point */}
          <View style={[styles.spinePoint, styles.activePoint, { top: height * 0.65 }]} />
          
          {/* Vertical spine line */}
          <View style={styles.spineLine} />
          
          {/* Horizontal alignment lines */}
          <View style={[styles.horizontalLine, { top: height * 0.35 }]} />
          <View style={[styles.horizontalLine, { top: height * 0.5 }]} />
        </View>
      </View>
    );
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.cameraContainer}>
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions not granted
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Render posture analysis overlay */}
        {renderPostureAnalysisOverlay()}
        
        {/* Camera controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={28} color="white" />
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonActive]} 
            onPress={toggleAnalysis}
          >
            <Text style={styles.analyzeButtonText}>
              {analyzing ? 'Stop Analysis' : 'Analyze Posture'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="photo-library" size={28} color="white" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  // Overlay styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  frameBorder: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#8afa8a',
    borderWidth: 3,
  },
  topLeft: {
    top: height * 0.15,
    left: width * 0.15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: height * 0.15,
    right: width * 0.15,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: height * 0.15,
    left: width * 0.15,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: height * 0.15,
    right: width * 0.15,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  // Spine elements
  spineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  spineLine: {
    position: 'absolute',
    top: height * 0.2,
    width: 4,
    height: height * 0.45,
    backgroundColor: '#8afa8a',
    zIndex: 1,
  },
  spinePoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#8afa8a',
    zIndex: 2,
  },
  activePoint: {
    backgroundColor: '#8afa8a',
    borderColor: 'white',
  },
  horizontalLine: {
    position: 'absolute',
    width: width * 0.2,
    height: 3,
    backgroundColor: '#f0a9a9',
    zIndex: 2,
  },
  // Camera controls
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: 'rgba(26, 87, 65, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  analyzeButtonActive: {
    backgroundColor: 'rgba(209, 58, 58, 0.8)',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CameraComponent;
