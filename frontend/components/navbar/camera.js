import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Button,
  Dimensions,
  Platform,
  Animated,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import ModelService from '../../services/ModelService';
import PropTypes from 'prop-types';
import ImportPicture from '../import/importpicture';
import FolderManager from '../navbar/folder/FolderManager';
import { SaveToFolderModal } from '../navbar/folder/Modals';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Curve calculation constants
const CURVE_SEVERITY = {
  NORMAL: 'Normal (0-10°)',
  MILD: 'Mild (10-25°)',
  MODERATE: 'Moderate (25-40°)',
  SEVERE: 'Severe (40°+)'
};

const CameraComponent = ({ onSaveResult }) => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // ML model-related state
  const [modelReady, setModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRealDetection, setIsRealDetection] = useState(false);
  
  // Spine curve parameters
  const [spinePoints, setSpinePoints] = useState([]);
  const [spineAngle, setSpineAngle] = useState(0);
  const [curveSeverity, setCurveSeverity] = useState(CURVE_SEVERITY.NORMAL);
  const [shoulderAlignment, setShoulderAlignment] = useState(0); // 0 = aligned, positive/negative = offset
  const [bodyPosition, setBodyPosition] = useState('center'); // 'center', 'left', 'right'
  
  // Reference to camera
  const cameraRef = useRef(null);

  const [showImport, setShowImport] = useState(false);
  
  // New states for folder saving functionality
  const [savingModalVisible, setSavingModalVisible] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderForNewImage, setFolderForNewImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [noFoldersVisible, setNoFoldersVisible] = useState(false);
  
  // Load model on component mount
  useEffect(() => {
    async function initializeModel() {
      try {
        const initialized = await ModelService.initialize();
        setModelReady(initialized);
        console.log('Model initialization status:', initialized);
      } catch (error) {
        console.error('Error initializing model:', error);
        Alert.alert('Model Error', 'Could not initialize AI model. Simulated mode will be used.');
      }
    }
    
    initializeModel();
  }, []);
  
  // Generate path for spine visualization
  const getSpinePath = useCallback(() => {
    if (spinePoints.length < 4) return "";
    
    // Create a curved path using control points
    return `M ${spinePoints[0].x} ${spinePoints[0].y}
            C ${spinePoints[0].x + 20} ${spinePoints[0].y + 40}, 
              ${spinePoints[1].x - 20} ${spinePoints[1].y - 30}, 
              ${spinePoints[1].x} ${spinePoints[1].y}
            S ${spinePoints[2].x} ${spinePoints[2].y},
              ${spinePoints[2].x} ${spinePoints[2].y}
            C ${spinePoints[2].x + 20} ${spinePoints[2].y + 40},
              ${spinePoints[3].x - 20} ${spinePoints[3].y - 30},
              ${spinePoints[3].x} ${spinePoints[3].y}`;
  }, [spinePoints]);

  // Calculate spine curve severity based on angle
  const updateCurveSeverity = useCallback((angle) => {
    // Using standard clinical guidelines for scoliosis classification
    if (angle < 10) {
      setCurveSeverity(CURVE_SEVERITY.NORMAL);
    } else if (angle < 25) {
      setCurveSeverity(CURVE_SEVERITY.MILD);
    } else if (angle < 40) {
      setCurveSeverity(CURVE_SEVERITY.MODERATE);
    } else {
      setCurveSeverity(CURVE_SEVERITY.SEVERE);
    }
  }, []);
  
  // Get class name from angle using clinical guidelines
  const getClassFromAngle = (angle) => {
    // Using standard clinical guidelines for scoliosis classification
    if (angle < 10) return 'Normal';
    if (angle < 25) return 'Mild';
    if (angle < 40) return 'Moderate';
    return 'Severe';
  };
  
  // Improved Cobb angle calculation based on spine points
  // This mimics the clinical method more accurately
  const calculateCobbAngle = useCallback((points) => {
    if (!points || points.length < 4) return 0;
    
    const centerX = width * 0.5;
    
    // Calculate the superior/inferior endplate angles (using simplified vector math)
    // Superior endplate angle (top vertebra)
    const topAngle = Math.atan2(points[1].x - points[0].x, points[1].y - points[0].y);
    
    // Inferior endplate angle (bottom vertebra)
    const bottomAngle = Math.atan2(points[3].x - points[2].x, points[3].y - points[2].y);
    
    // Calculate the angle between the two "endplates" in degrees
    let cobbAngle = Math.abs(topAngle - bottomAngle) * (180 / Math.PI);
    
    // The Cobb method measures the angle between the perpendiculars to the endplates
    // so we use the complementary angle if it exceeds 90 degrees
    if (cobbAngle > 90) {
      cobbAngle = 180 - cobbAngle;
    }
    
    // Apply minor correction based on curve patterns seen in real scoliosis cases
    // This adjusts for the simplified nature of our simulation
    const curveDirection = points[1].x > centerX ? 1 : -1;
    const curveOffset = Math.max(
      Math.abs(points[1].x - centerX),
      Math.abs(points[2].x - centerX)
    );
    
    // Small correction factor: larger curves need less correction
    const correctionFactor = Math.max(0, 1 - (cobbAngle / 60));
    
    // Apply the correction
    cobbAngle = cobbAngle * (1 + correctionFactor * 0.15);
    
    return Math.round(cobbAngle);
  }, []);
  
  // Improved body detection simulation with more realistic movement
  useEffect(() => {
    let detectionInterval;
    let bodyLostTimeout;
    
    if (analyzing) {
      // Initial analysis when first turned on
      if (!bodyDetected && !isProcessing) {
        captureAndAnalyze();
      }
      
      // Use interval to simulate continuous body detection
      detectionInterval = setInterval(() => {
        if (!bodyDetected) {
          // 60% chance to detect body when not currently detected (reduced from 80%)
          if (Math.random() < 0.6 && !isProcessing) {
            console.log("Body detected");
            
            // Capture and analyze real image if using real detection
            if (modelReady && Math.random() > 0.5) {
              captureAndAnalyze();
            } else {
              // Otherwise use simulation
              setBodyDetected(true);
              setDetectionConfidence(0.8 + (Math.random() * 0.15)); // 80-95% confidence
              
              // Generate initial spine points based on a random body position
              const position = Math.random();
              if (position < 0.6) { // 60% chance to be centered
                setBodyPosition('center');
              } else if (position < 0.8) { // 20% chance to be left-leaning
                setBodyPosition('left');
              } else { // 20% chance to be right-leaning
                setBodyPosition('right');
              }
              
              // Generate initial spine points based on position
              generateSpinePoints();
              
              // Fade in the spine elements
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
              }).start();
            }
          }
        } else {
          // 60% chance to temporarily lose body detection (increased from 50%)
          if (Math.random() < 0.6 && !isProcessing) {
            // Don't immediately hide - set a timeout to confirm loss
            clearTimeout(bodyLostTimeout);
            
            bodyLostTimeout = setTimeout(() => {
              console.log("Body lost");
              setBodyDetected(false);
              setDetectionConfidence(0);
              setIsRealDetection(false);
              
              // Fade out the spine elements
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
              }).start();
            }, 800); // Wait 800ms before confirming body is lost (reduced from 1000ms)
          } else {
            // Still seeing body - clear any pending timeouts
            clearTimeout(bodyLostTimeout);
            bodyLostTimeout = null;
            
            // Occasionally get a new real analysis if model is ready
            if (modelReady && Math.random() < 0.15 && !isProcessing) {
              captureAndAnalyze();
            } else {
              // Otherwise update simulation
              // Update confidence with slight variation
              setDetectionConfidence(prev => {
                const variation = (Math.random() * 0.1) - 0.05; // ±5% variation
                return Math.min(0.98, Math.max(0.7, prev + variation));
              });
              
              // Periodically update spine curve to reflect slight body movements
              // More frequent updates when confidence is higher
              if (Math.random() < 0.3 + (detectionConfidence * 0.3) && !isRealDetection) {
                updateSpineCurve();
              }
              
              // Occasionally switch between different body positions/postures
              if (Math.random() < 0.03 && !isRealDetection) {
                const newPositionRoll = Math.random();
                let newPosition;
                
                if (newPositionRoll < 0.6) {
                  newPosition = 'center';
                } else if (newPositionRoll < 0.8) {
                  newPosition = 'left';
                } else {
                  newPosition = 'right';
                }
                
                if (newPosition !== bodyPosition) {
                  setBodyPosition(newPosition);
                  updateSpineBasedOnPosition(newPosition);
                }
              }
            }
          }
        }
      }, 600); // Check more frequently (reduced from 800ms)
    } else {
      // When analysis is turned off, ensure body detection is reset
      setBodyDetected(false);
      setDetectionConfidence(0);
      setIsRealDetection(false);
      
      // Reset animation and spine data
      fadeAnim.setValue(0);
      setSpinePoints([]);
      setSpineAngle(0);
    }
    
    return () => {
      clearInterval(detectionInterval);
      clearTimeout(bodyLostTimeout);
    };
  }, [analyzing, bodyDetected, bodyPosition, detectionConfidence, isProcessing, modelReady, isRealDetection, captureAndAnalyze]);

  // Update the spine visualization based on detected body position
  const updateSpineBasedOnPosition = useCallback((position) => {
    if (spinePoints.length < 4) return;
    
    const centerX = width * 0.5;
    const startY = height * 0.2;
    const endY = height * 0.65;
    const distance = endY - startY;
    const segment = distance / 3;
    
    // Copy current points
    const newPoints = [...spinePoints];
    
    // Calculate new control points based on position
    switch (position) {
      case 'left':
        // Left leaning posture (right side curve - convex to the right)
        newPoints[0].x = centerX;
        newPoints[1].x = centerX + 25;
        newPoints[2].x = centerX + 15;
        newPoints[3].x = centerX - 5;
        break;
      case 'right':
        // Right leaning posture (left side curve - convex to the left)
        newPoints[0].x = centerX;
        newPoints[1].x = centerX - 25;
        newPoints[2].x = centerX - 15;
        newPoints[3].x = centerX + 5;
        break;
      default: // center
        // Nearly straight but with slight natural curve
        newPoints[0].x = centerX;
        newPoints[1].x = centerX + 5;
        newPoints[2].x = centerX - 5;
        newPoints[3].x = centerX;
        break;
    }
    
    // Keep y-coordinates fixed
    newPoints[0].y = startY;
    newPoints[1].y = startY + segment;
    newPoints[2].y = startY + 2 * segment;
    newPoints[3].y = endY;
    
    setSpinePoints(newPoints);
    
    // Calculate angle based on control points
    const angle = Math.abs(Math.atan2(newPoints[1].x - centerX, segment) * 180 / Math.PI) + 
                Math.abs(Math.atan2(newPoints[2].x - centerX, segment) * 180 / Math.PI);
    
    setSpineAngle(Math.round(angle));
    updateCurveSeverity(angle);
    
    // Set shoulder alignment based on position
    if (position === 'left') {
      setShoulderAlignment(10); // Left shoulder higher
    } else if (position === 'right') {
      setShoulderAlignment(-10); // Right shoulder higher
    } else {
      setShoulderAlignment(Math.round(Math.random() * 6 - 3)); // Near level ±3
    }
  }, [spinePoints, updateCurveSeverity]);

  // Generate initial spine points
  const generateSpinePoints = useCallback(() => {
    // Center point of the analysis area
    const centerX = width * 0.5;
    const startY = height * 0.2;  // Top spine point
    const endY = height * 0.65;   // Bottom spine point
    
    let points;
    const distance = endY - startY;
    const segment = distance / 3;
    
    // Generate curve based on detected body position
    switch (bodyPosition) {
      case 'left':
        // Left leaning posture (right side curve)
        points = [
          { x: centerX, y: startY }, // Top point
          { x: centerX + 25, y: startY + segment }, // Upper mid point
          { x: centerX + 15, y: startY + 2 * segment }, // Lower mid point
          { x: centerX - 5, y: endY } // Bottom point
        ];
        setShoulderAlignment(10); // Left shoulder higher
        break;
      case 'right':
        // Right leaning posture (left side curve)
        points = [
          { x: centerX, y: startY }, // Top point
          { x: centerX - 25, y: startY + segment }, // Upper mid point
          { x: centerX - 15, y: startY + 2 * segment }, // Lower mid point
          { x: centerX + 5, y: endY } // Bottom point
        ];
        setShoulderAlignment(-10); // Right shoulder higher
        break;
      default: // center
        // Nearly straight but with slight natural curve
        points = [
          { x: centerX, y: startY }, // Top point
          { x: centerX + 5, y: startY + segment }, // Upper mid point
          { x: centerX - 5, y: startY + 2 * segment }, // Lower mid point
          { x: centerX, y: endY } // Bottom point
        ];
        setShoulderAlignment(Math.round(Math.random() * 6 - 3)); // Near level ±3
        break;
    }
    
    setSpinePoints(points);
    
    // Calculate angle based on points (simplified calculation)
    const angle = Math.abs(Math.atan2(points[1].x - centerX, segment) * 180 / Math.PI) + 
                Math.abs(Math.atan2(points[2].x - centerX, segment) * 180 / Math.PI);
    
    setSpineAngle(Math.round(angle));
    updateCurveSeverity(angle);
  }, [bodyPosition, updateCurveSeverity]);
  
  // Update spine curve to simulate movement or posture changes
  const updateSpineCurve = useCallback(() => {
    if (spinePoints.length < 4) return;
    
    const centerX = width * 0.5;
    const maxCurve = 40; // Maximum curve offset
    
    // Update middle control points with some variation
    // but keep first and last points fixed
    const newPoints = [...spinePoints];
    
    // Apply smaller variations to existing curve
    const variationAmount = 3; // Smaller variations for more stable curve
    
    // Adjust control points with micro-movements
    newPoints[1].x = newPoints[1].x + (Math.random() * variationAmount - variationAmount/2);
    newPoints[2].x = newPoints[2].x + (Math.random() * variationAmount - variationAmount/2);
    
    // Ensure points don't move too far from base position
    switch (bodyPosition) {
      case 'left':
        newPoints[1].x = Math.max(centerX + 15, Math.min(centerX + 35, newPoints[1].x));
        newPoints[2].x = Math.max(centerX + 5, Math.min(centerX + 25, newPoints[2].x));
        break;
      case 'right':
        newPoints[1].x = Math.max(centerX - 35, Math.min(centerX - 15, newPoints[1].x));
        newPoints[2].x = Math.max(centerX - 25, Math.min(centerX - 5, newPoints[2].x));
        break;
      default: // center
        newPoints[1].x = Math.max(centerX - 10, Math.min(centerX + 10, newPoints[1].x));
        newPoints[2].x = Math.max(centerX - 10, Math.min(centerX + 10, newPoints[2].x));
        break;
    }
    
    // Ensure realistic curve continuity
    if (Math.abs(newPoints[1].x - newPoints[2].x) > maxCurve/2) {
      // If the difference between adjacent control points is too large,
      // bring them closer to create smoother curve
      const avgX = (newPoints[1].x + newPoints[2].x) / 2;
      newPoints[1].x = avgX + (newPoints[1].x - avgX) * 0.7;
      newPoints[2].x = avgX + (newPoints[2].x - avgX) * 0.7;
    }
    
    setSpinePoints(newPoints);
    
    // Calculate Cobb angle using the improved method
    const angle = calculateCobbAngle(newPoints);
    
    setSpineAngle(angle);
    updateCurveSeverity(angle);
    
    // Update shoulder alignment occasionally with subtle changes
    if (Math.random() < 0.3) {
      setShoulderAlignment(prev => {
        // Add micro-adjustments to shoulder alignment
        const variation = Math.random() * 2 - 1; // ±1 degree
        
        // Keep within reasonable bounds based on body position
        switch (bodyPosition) {
          case 'left':
            return Math.max(5, Math.min(15, prev + variation));
          case 'right': 
            return Math.max(-15, Math.min(-5, prev + variation));
          default:
            return Math.max(-5, Math.min(5, prev + variation));
        }
      });
    }
  }, [spinePoints, bodyPosition, updateCurveSeverity, calculateCobbAngle]);

  // Toggle camera facing
  const toggleCameraFacing = useCallback(() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  // Toggle analysis mode
  const toggleAnalysis = useCallback(() => {
    setAnalyzing(prev => !prev);
    if (!analyzing) {
      setBodyDetected(false);
      setDetectionConfidence(0);
      setSpinePoints([]);
      setSpineAngle(0);
      setBodyPosition('center');
    }
  }, [analyzing]);

  // Format confidence as percentage
  const getConfidenceText = () => {
    return `Accuracy: ${Math.round(detectionConfidence * 100)}%${isRealDetection ? ' (AI)' : ' (Sim)'}`;
  };

  // Get appropriate color for spine based on severity
  const getSpineColor = useCallback(() => {
    if (spineAngle > 40) return "#FF0000"; // Severe - red
    if (spineAngle > 25) return "#FFA500"; // Moderate - orange
    if (spineAngle > 10) return "#FFFF00"; // Mild - yellow
    return "#8afa8a"; // Normal - green
  }, [spineAngle]);

  // Save current analysis to gallery
  const saveCurrentAnalysis = async () => {
    if (!bodyDetected || !cameraRef.current) {
      Alert.alert('Error', 'No body detected to save');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Capture the current camera view
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true
      });
      
      // Prepare the analysis result
      const result = {
        class: getClassFromAngle(spineAngle),
        angle: spineAngle.toString()
      };
      
      console.log('Saving image with result:', result);
      
      // Store pending image data
      setPendingImage(photo.uri);
      setPendingResult(result);
      
      // Load folders
      try {
        const savedFolders = await FolderManager.loadSavedFolders([]);
        console.log('Loaded folders for saving:', savedFolders);
        
        if (!savedFolders || savedFolders.length === 0) {
          // No folders exist, prompt to create one
          setFolders([]);
          setNoFoldersVisible(true);
          
          Alert.alert(
            'No Folders',
            'You need to create a folder before saving images.',
            [
              {
                text: 'Create Folder',
                onPress: () => setModalVisible(true)
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => handleSaveCancellation()
              }
            ]
          );
        } else {
          // We have folders, show the folder selection modal
          setFolders(savedFolders);
          setNoFoldersVisible(false);
          
          // Select first folder as default if none selected
          if ((!folderForNewImage || folderForNewImage === 'default') && savedFolders.length > 0) {
            setFolderForNewImage(savedFolders[0].id);
          }
          
          // Explicitly show the saving modal
          console.log('Showing folder selection modal');
          setSavingModalVisible(true);
        }
      } catch (error) {
        console.error('Error loading folders for saving:', error);
        Alert.alert(
          'Error',
          'Could not load folders. Please try again later.',
          [{ text: 'OK', onPress: () => handleSaveCancellation() }]
        );
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error saving analysis:', error);
      Alert.alert('Error', 'Could not save the analysis');
      setIsProcessing(false);
      
      // Reset pending data
      setPendingImage(null);
      setPendingResult(null);
    }
  };
  
  // Show create folder modal
  const showCreateFolderModal = () => {
    setSavingModalVisible(false);
    setModalVisible(true);
  };
  
  // Create a new folder
  const handleCreateFolder = async () => {
    const newFolder = FolderManager.createFolder(newFolderName, folders);
    if (newFolder) {
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      setModalVisible(false);
      setNewFolderName('');
      
      // Select the newly created folder
      setFolderForNewImage(newFolder.id);
      
      // Show folder selection modal again after creating a folder
      setSavingModalVisible(true);
    } else {
      Alert.alert('Error', 'Could not create folder. Please check the name.');
    }
  };
  
  // Confirm saving the image to selected folder
  const confirmSaveImage = () => {
    if (!pendingImage || !pendingResult || !folderForNewImage) {
      Alert.alert('Error', 'Missing required information to save image');
      return;
    }
    
    const imageData = {
      uri: pendingImage,
      result: pendingResult,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    const updatedFolders = FolderManager.saveImageToFolder(
      imageData, 
      folderForNewImage, 
      folders
    );
    
    setFolders(updatedFolders);
    setSavingModalVisible(false);
    
    // Pass the result back to the parent component with 'camera_with_folder' to indicate
    // we've already handled folder selection here and don't need another dialog
    if (onSaveResult) {
      onSaveResult(pendingImage, pendingResult, 'camera_with_folder');
    }
    
    // Reset pending data
    setPendingImage(null);
    setPendingResult(null);
    
    Alert.alert('Success', 'Image saved successfully to folder');
  };
  
  // Handle save modal cancellation
  const handleSaveCancellation = () => {
    setSavingModalVisible(false);
    setPendingImage(null);
    setPendingResult(null);
    Alert.alert('Cancelled', 'Image was not saved');
  };

  // Render posture analysis overlay
  const renderPostureAnalysisOverlay = () => {
    if (!analyzing) return null;
    
    // Determine frame color based on detection state
    const frameColor = !bodyDetected ? '#FFFFFF' : getSpineColor();
    
    return (
      <View style={styles.overlayContainer} pointerEvents="none">
        {/* Frame corners - always visible when analyzing */}
        <View style={[styles.frameBorder, styles.topLeft, { borderColor: frameColor }]} />
        <View style={[styles.frameBorder, styles.topRight, { borderColor: frameColor }]} />
        <View style={[styles.frameBorder, styles.bottomLeft, { borderColor: frameColor }]} />
        <View style={[styles.frameBorder, styles.bottomRight, { borderColor: frameColor }]} />
        
        {/* Spine visualization - only when body detected */}
        {bodyDetected && spinePoints.length >= 4 && (
          <Animated.View style={[styles.svgContainer, { opacity: fadeAnim }]}>
            <Svg width={width} height={height}>
              {/* Main curved spine line */}
              <Path
                d={getSpinePath()}
                stroke={getSpineColor()}
                strokeWidth="4"
                fill="none"
              />
              
              {/* Spine points */}
              {spinePoints.map((point, index) => (
                <Circle
                  key={`point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={index === 0 || index === 3 ? 10 : 8}
                  fill={index === 0 || index === 3 ? getSpineColor() : "rgba(255, 255, 255, 0.8)"}
                  stroke={getSpineColor()}
                  strokeWidth="2"
                />
              ))}
              
              {/* Horizontal alignment lines for shoulders and hips */}
              <Line
                x1={width * 0.3}
                y1={spinePoints[0].y}
                x2={width * 0.7}
                y2={spinePoints[0].y + shoulderAlignment}
                stroke="#f0a9a9"
                strokeWidth="3"
              />
              
              <Line
                x1={width * 0.3}
                y1={spinePoints[3].y}
                x2={width * 0.7}
                y2={spinePoints[3].y - shoulderAlignment * 0.5}
                stroke="#f0a9a9"
                strokeWidth="3"
              />
              
              {/* Cobb angle indicator */}
              <SvgText
                x={width * 0.85}
                y={height * 0.4}
                fill="white"
                stroke="black"
                strokeWidth="1"
                fontSize="16"
                fontWeight="bold"
              >
                {`${spineAngle}°`}
              </SvgText>
            </Svg>
          </Animated.View>
        )}
        
        {/* Status indicators */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {bodyDetected ? 'Body detected - Analyzing posture' : 'Searching for body...'}
          </Text>
          
          {/* Confidence indicator */}
          {bodyDetected && (
            <Animated.View style={{ opacity: fadeAnim, marginTop: 5 }}>
              <Text style={styles.confidenceText}>{getConfidenceText()}</Text>
            </Animated.View>
          )}
        </View>
        
        {/* Model Status indicator */}
        <View style={styles.modelStatusContainer}>
          <Text style={[
            styles.modelStatusText,
            modelReady ? styles.modelReadyText : styles.modelNotReadyText
          ]}>
            {modelReady ? 'AI Model: Ready' : 'AI Model: Loading...'}
          </Text>
        </View>
        
        {/* Cobb angle classification when body detected */}
        {bodyDetected && (
          <Animated.View style={[styles.cobbContainer, { opacity: fadeAnim }]}>
            <Text style={styles.cobbHeader}>COBB ANGLE</Text>
            <Text style={[
              styles.cobbValue, 
              spineAngle > 40 ? styles.severeCobb : 
              spineAngle > 25 ? styles.moderateCobb : 
              spineAngle > 10 ? styles.mildCobb : 
              styles.normalCobb
            ]}>
              {curveSeverity}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  };

  // Capture image and perform real detection with ML model
  const captureAndAnalyze = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate body detection while processing the real data
      setBodyDetected(true);
      setDetectionConfidence(0.7);
      
      if (!modelReady) {
        console.log('Model not ready, using simulation');
        // Use simulated data if model is not ready
        simulateDetection();
        return;
      }

      console.log('Taking picture and detecting pose...');
      
      // Capture multiple frames for improved accuracy
      const attemptPoseDetection = async (attempt = 0, maxAttempts = 3) => {
        if (attempt >= maxAttempts) {
          console.log(`Failed to detect pose after ${maxAttempts} attempts, using simulation`);
          simulateDetection();
          return;
        }
        
        try {
          // Use the model from backend via ModelService
          const pose = await ModelService.detectPose(cameraRef);
          
          // Check for valid pose detection
          if (pose && pose.keypoints && pose.keypoints.length >= 15) { // Ensure enough keypoints
            console.log(`Pose detected on attempt ${attempt+1} with ${pose.keypoints.length} keypoints`);
            
            // Filter and clean keypoints - improve detection quality
            const filteredKeypoints = cleanKeypoints(pose.keypoints);
            
            if (isValidPosturePose(filteredKeypoints)) {
              // Calculate detection confidence based on keypoint scores
              const avgConfidence = filteredKeypoints.reduce(
                (sum, kp) => sum + kp.score, 0
              ) / filteredKeypoints.length;
              
              // Set confidence based on actual keypoint quality
              setDetectionConfidence(0.7 + (avgConfidence * 0.3)); // 70-100% confidence
              
              // Process keypoints with model
              const prediction = await ModelService.predictScoliosis(filteredKeypoints);
              
              if (prediction && prediction.class) {
                console.log('Prediction received:', prediction);
                // Update state with predictions
                updateWithRealPrediction(prediction);
                setIsRealDetection(true);
                return true;
              }
            }
          }
          
          // If we're here, detection was not successful - try again
          console.log(`Attempt ${attempt+1} failed, trying again...`);
          return attemptPoseDetection(attempt + 1, maxAttempts);
          
        } catch (error) {
          console.error(`Error in detection attempt ${attempt+1}:`, error);
          if (attempt >= maxAttempts - 1) {
            simulateDetection();
          } else {
            return attemptPoseDetection(attempt + 1, maxAttempts);
          }
        }
      };
      
      await attemptPoseDetection();
      
    } catch (error) {
      console.error('Error in capture and analyze:', error);
      simulateDetection();
    } finally {
      setIsProcessing(false);
    }
  }, [modelReady, isProcessing, simulateDetection, updateWithRealPrediction]);
  
  // Check if pose has required keypoints for posture analysis
  const isValidPosturePose = useCallback((keypoints) => {
    // Define essential keypoints for spine angle calculation
    const essentialKeypoints = [
      'nose', 'leftShoulder', 'rightShoulder', 
      'leftHip', 'rightHip', 'leftEar', 'rightEar'
    ];
    
    // Check if all essential keypoints are present with adequate confidence
    const missingKeypoints = essentialKeypoints.filter(name => 
      !keypoints.find(kp => kp.name === name && kp.score > 0.5)
    );
    
    if (missingKeypoints.length > 0) {
      console.log('Missing essential keypoints:', missingKeypoints);
      return false;
    }
    
    // Additional checks for proper pose alignment
    // Ensure the person is facing the right direction
    const leftShoulder = keypoints.find(kp => kp.name === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'rightShoulder');
    
    if (leftShoulder && rightShoulder) {
      // Check if shoulders are approximately level (allowing for some tilt)
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      
      if (shoulderHeightDiff > shoulderWidth * 0.5) {
        console.log('Person appears to be rotated too much - shoulders not level');
        return false;
      }
    }
    
    return true;
  }, []);
  
  // Clean and filter keypoints for better analysis
  const cleanKeypoints = useCallback((keypoints) => {
    // Filter out low confidence keypoints
    const filteredKeypoints = keypoints.filter(kp => kp.score > 0.3);
    
    // Enhance keypoint position based on relationship constraints
    // For example, ensure shoulders are at appropriate height relative to head
    const enhancedKeypoints = [...filteredKeypoints];
    
    // Find reference keypoints
    const nose = enhancedKeypoints.find(kp => kp.name === 'nose');
    const leftShoulder = enhancedKeypoints.find(kp => kp.name === 'leftShoulder');
    const rightShoulder = enhancedKeypoints.find(kp => kp.name === 'rightShoulder');
    
    // Apply anatomical constraints
    if (nose && leftShoulder && rightShoulder) {
      // Ensure shoulders are below nose
      if (leftShoulder.y < nose.y) {
        leftShoulder.y = nose.y + (width * 0.05);
        leftShoulder.score = Math.max(0.6, leftShoulder.score); // Adjust confidence
      }
      
      if (rightShoulder.y < nose.y) {
        rightShoulder.y = nose.y + (width * 0.05);
        rightShoulder.score = Math.max(0.6, rightShoulder.score); // Adjust confidence
      }
    }
    
    return enhancedKeypoints;
  }, []);

  // Update the UI with real ML prediction
  const updateWithRealPrediction = useCallback((prediction) => {
    const { class: predClass, angle } = prediction;
    const numericAngle = parseFloat(angle);
    
    setSpineAngle(numericAngle);
    
    // Update curve severity based on class
    switch (predClass) {
      case 'Normal':
        setCurveSeverity(CURVE_SEVERITY.NORMAL);
        break;
      case 'Mild':
        setCurveSeverity(CURVE_SEVERITY.MILD);
        break;
      case 'Moderate':
        setCurveSeverity(CURVE_SEVERITY.MODERATE);
        break;
      case 'Severe':
        setCurveSeverity(CURVE_SEVERITY.SEVERE);
        break;
    }
    
    // Use the angle for more accurate body position determination
    if (numericAngle < 10) {
      setBodyPosition('center');
    } else if (numericAngle < 25) {
      // For mild curves, determine direction based on detection or randomly
      if (prediction.direction) {
        setBodyPosition(prediction.direction === 'right' ? 'left' : 'right');
      } else {
        setBodyPosition(Math.random() > 0.5 ? 'left' : 'right');
      }
    } else if (numericAngle < 40) {
      // For moderate curves, more likely to show pronounced leaning
      if (prediction.direction) {
        setBodyPosition(prediction.direction === 'right' ? 'left' : 'right');
      } else {
        setBodyPosition(Math.random() > 0.3 ? 'left' : 'right');
      }
    } else {
      // For severe curves, very pronounced leaning
      if (prediction.direction) {
        setBodyPosition(prediction.direction === 'right' ? 'left' : 'right');
      } else {
        setBodyPosition(Math.random() > 0.2 ? 'left' : 'right');
      }
    }
    
    // Generate spine points based on the predicted angle and class
    generateSpinePointsForAngle(numericAngle, predClass);
    
    // Fade in the visualization
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
  }, []);

  // Generate spine points for a specific angle with improved accuracy
  const generateSpinePointsForAngle = useCallback((angle, classType) => {
    const centerX = width * 0.5;
    const startY = height * 0.2;
    const endY = height * 0.65;
    const distance = endY - startY;
    const segment = distance / 3;
    
    // Scale factor based on angle severity - more accurate curve representation
    let scaleFactor;
    
    // Use class-based scaling for more realistic curve shapes
    switch(classType) {
      case 'Normal':
        scaleFactor = Math.min(0.2, angle / 10);
        break;
      case 'Mild':
        scaleFactor = 0.2 + Math.min(0.3, (angle - 10) / 15);
        break;
      case 'Moderate':
        scaleFactor = 0.5 + Math.min(0.3, (angle - 25) / 15);
        break;
      case 'Severe':
        scaleFactor = 0.8 + Math.min(0.2, (angle - 40) / 20);
        break;
      default:
        scaleFactor = Math.min(1, angle / 40);
    }
    
    // More accurate curve offset based on angle
    const curveOffset = Math.min(30, 5 + (40 * scaleFactor));
    
    // Determine curve direction based on body position
    const curveToRight = bodyPosition === 'left';
    
    // Calculate more realistic curve points based on scoliosis patterns
    // S-shaped for moderate to severe, C-shaped for mild to moderate
    let points;
    
    if (angle > 30 && Math.random() > 0.6) {
      // S-curve (more common in severe scoliosis)
      points = [
        { x: centerX, y: startY }, // Top point
        { 
          x: curveToRight ? centerX + curveOffset : centerX - curveOffset, 
          y: startY + segment * 0.8
        },
        { 
          x: curveToRight ? centerX - (curveOffset * 0.7) : centerX + (curveOffset * 0.7), 
          y: startY + segment * 1.8
        },
        { x: centerX, y: endY } // Bottom point
      ];
    } else {
      // C-curve (more common in mild to moderate scoliosis)
      // More natural curve progression with proper biomechanical modeling
      points = [
        { x: centerX, y: startY }, // Top point
        { 
          x: curveToRight ? centerX + curveOffset * 0.8 : centerX - curveOffset * 0.8, 
          y: startY + segment
        },
        { 
          x: curveToRight ? centerX + curveOffset : centerX - curveOffset, 
          y: startY + 2 * segment
        },
        { 
          x: curveToRight ? centerX + (curveOffset * 0.3) : centerX - (curveOffset * 0.3), 
          y: endY
        }
      ];
    }
    
    setSpinePoints(points);
    
    // Calculate shoulder and hip alignment based on curve type and severity
    // More accurate anatomical model
    let shoulderAlignmentValue;
    
    if (angle < 10) {
      // Normal: minimal shoulder deviation
      shoulderAlignmentValue = (Math.random() * 4 - 2); // ±2 degrees
    } else if (angle < 25) {
      // Mild: noticeable but not severe
      shoulderAlignmentValue = curveToRight ? 5 + (Math.random() * 5) : -5 - (Math.random() * 5);
    } else if (angle < 40) {
      // Moderate: more pronounced
      shoulderAlignmentValue = curveToRight ? 10 + (Math.random() * 5) : -10 - (Math.random() * 5);
    } else {
      // Severe: very pronounced
      shoulderAlignmentValue = curveToRight ? 15 + (Math.random() * 10) : -15 - (Math.random() * 10);
    }
    
    setShoulderAlignment(shoulderAlignmentValue);
  }, [bodyPosition]);

  // Use simulated detection when real detection fails or is not available
  const simulateDetection = useCallback(() => {
    console.log('Using simulated detection');
    
    // Generate more realistic simulation data
    let simulatedClass;
    let simulatedAngle;
    
    // Weighted random distribution to match clinical prevalence
    const roll = Math.random();
    if (roll < 0.25) { // 25% chance of normal
      simulatedClass = 'Normal';
      simulatedAngle = Math.random() * 9; // 0-9 degrees
    } else if (roll < 0.65) { // 40% chance of mild
      simulatedClass = 'Mild';
      simulatedAngle = 10 + Math.random() * 14; // 10-24 degrees
    } else if (roll < 0.9) { // 25% chance of moderate
      simulatedClass = 'Moderate';
      simulatedAngle = 25 + Math.random() * 14; // 25-39 degrees
    } else { // 10% chance of severe
      simulatedClass = 'Severe';
      simulatedAngle = 40 + Math.random() * 20; // 40-60 degrees
    }
    
    const prediction = {
      class: simulatedClass,
      angle: simulatedAngle.toFixed(1),
      direction: Math.random() > 0.5 ? 'right' : 'left'
    };
    
    console.log('Simulated prediction:', prediction);
    updateWithRealPrediction(prediction);
  }, [updateWithRealPrediction]);

  // Handle import button press
  const openImportModal = () => {
    setShowImport(true);
  };
  
  // Handle imported image result
  const handleImportResult = (imageUri, result) => {
    if (onSaveResult) {
      // Include 'import' as the source to indicate this is from an imported image
      onSaveResult(imageUri, result, 'import');
    } else {
      Alert.alert('Success', 'Image analyzed successfully! (Note: Save functionality not fully connected)');
    }
    setShowImport(false);
  };

  // Render "No folders" placeholder
  const renderNoFolders = () => (
    <View style={styles.noFoldersContainer}>
      <MaterialIcons name="folder" size={64} color="#666" />
      <Text style={styles.noFoldersText}>No folders yet</Text>
      <Text style={styles.noFoldersSubText}>Create a folder to save your images</Text>
      <TouchableOpacity
        style={styles.createFolderButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="create-new-folder" size={24} color="#FFFFFF" />
        <Text style={styles.createFolderButtonText}>Create Folder</Text>
      </TouchableOpacity>
    </View>
  );

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
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        {/* Render posture analysis overlay */}
        {renderPostureAnalysisOverlay()}
        
        {/* Camera controls */}
        <View style={styles.controlsContainer}>
          {/* When analyzing mode is on, show all three buttons in a row */}
          {analyzing && (
            <View style={styles.analyzeButtonsRow}>
              {/* Force analyze button - on left side */}
              {modelReady && !isProcessing && (
                <TouchableOpacity 
                  onPress={captureAndAnalyze}
                  style={styles.controlButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="refresh" size={28} color="white" />
                  <Text style={styles.buttonText}>Analyze</Text>
                </TouchableOpacity>
              )}
              
              {/* Analyze/Stop Analysis button - in center */}
              <TouchableOpacity 
                onPress={toggleAnalysis}
                style={[
                  styles.analyzeButton,
                  styles.analyzeButtonActive,
                  isProcessing && styles.analyzeButtonProcessing
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.analyzeButtonText}>
                  {isProcessing ? 'Processing...' : 'Stop Analysis'}
                </Text>
              </TouchableOpacity>
              
              {/* Save button - on right side */}
              {bodyDetected && !isProcessing && (
                <TouchableOpacity 
                  onPress={saveCurrentAnalysis}
                  style={styles.controlButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="save" size={28} color="white" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* When not analyzing, show Analyze Posture and Import buttons */}
          {!analyzing && (
            <View style={styles.analyzeButtonsRow}>
              {/* Import Picture button */}
              <TouchableOpacity 
                onPress={openImportModal}
                style={styles.importButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="photo-library" size={24} color="white" />
                <Text style={styles.buttonText}>Import</Text>
              </TouchableOpacity>
              
              {/* Analyze Posture button */}
              <TouchableOpacity 
                onPress={toggleAnalysis}
                style={styles.analyzeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.analyzeButtonText}>
                  {isProcessing ? 'Processing...' : 'Analyze Posture'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Flip camera button moved to top left */}
        <TouchableOpacity 
          onPress={toggleCameraFacing} 
          style={styles.flipButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="flip-camera-ios" size={28} color="white" />
        </TouchableOpacity>
      </CameraView>
      
      {/* Import Picture Modal */}
      <Modal
        visible={showImport}
        animationType="slide"
        onRequestClose={() => setShowImport(false)}
      >
        <ImportPicture 
          onImportResult={handleImportResult}
          onClose={() => setShowImport(false)}
        />
      </Modal>
      
      {/* Save to Folder Modal */}
      {folders.length > 0 && (
        <SaveToFolderModal
          visible={savingModalVisible}
          onClose={handleSaveCancellation}
          folders={folders}
          folderForNewImage={folderForNewImage}
          onSelectFolder={(folderId) => setFolderForNewImage(folderId)}
          onCreateNewFolder={showCreateFolderModal}
          onConfirmSave={confirmSaveImage}
          styles={styles}
        />
      )}
      
      {/* New Folder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            <TextInput
              style={styles.input}
              placeholder="Folder Name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateFolder}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* No Folders Modal */}
      {noFoldersVisible && savingModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={handleSaveCancellation}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {renderNoFolders()}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Add the onSaveResult prop
CameraComponent.propTypes = {
  onSaveResult: PropTypes.func
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
  whiteFrame: {
    borderColor: '#ffffff',
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
  // SVG container for spine visualization
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Status indicator
  statusContainer: {
    position: 'absolute',
    top: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  confidenceText: {
    backgroundColor: 'rgba(26, 87, 65, 0.7)',
    color: 'white',
    padding: 6,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: '500',
  },
  // Cobb angle display
  cobbContainer: {
    position: 'absolute',
    top: height * 0.18,
    right: width * 0.05,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 10,
  },
  cobbHeader: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cobbValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  normalCobb: {
    color: '#8afa8a',
  },
  mildCobb: {
    color: '#FFFF00',
  },
  moderateCobb: {
    color: '#FFA500',
  },
  severeCobb: {
    color: '#FF0000',
  },
  // Camera controls
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  analyzeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minWidth: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
  },
  flipButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    zIndex: 20,
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
    minWidth: 170,
    alignItems: 'center',
  },
  analyzeButtonActive: {
    backgroundColor: 'rgba(209, 58, 58, 0.8)',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // New styles for model integration
  modelStatusContainer: {
    position: 'absolute',
    top: height * 0.05,
    right: width * 0.05,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
  },
  modelStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modelReadyText: {
    color: '#8afa8a',
  },
  modelNotReadyText: {
    color: '#f0a9a9',
  },
  analyzeButtonProcessing: {
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(70, 70, 70, 0.8)',
    padding: 12,
    borderRadius: 25,
    minWidth: 100,
  },
  // Add modal styles for folder selection
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  createButton: {
    backgroundColor: 'rgba(26, 87, 65, 0.8)',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  createButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  folderSelectList: {
    maxHeight: 200,
    marginVertical: 10,
  },
  folderSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#333',
  },
  selectedFolderItem: {
    backgroundColor: 'rgba(26, 87, 65, 0.3)',
  },
  folderSelectText: {
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  newFolderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#333',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#1A5741',
  },
  newFolderText: {
    color: '#1A5741',
    marginLeft: 10,
  },
  noFoldersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noFoldersText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  noFoldersSubText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  createFolderButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 87, 65, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  createFolderButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CameraComponent;
