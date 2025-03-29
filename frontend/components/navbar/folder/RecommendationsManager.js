import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Recommendations based on posture classification
export const getRecommendations = (classification) => {
  switch(classification) {
    case 'Normal':
      return {
        title: 'Maintain Your Good Posture',
        recommendations: [
          'The patient should maintain good posture, avoid frequent slouching, engage in regular exercise, and adopt lifestyle modifications to support spinal health.'
        ],
        icon: 'check-circle'
      };
    case 'Mild':
      return {
        title: 'Mild Scoliosis Management',
        recommendations: [
          'In this case, exercise is usually recommended, along with necessary lifestyle modifications to help manage the condition and prevent progression.'
        ],
        note: 'For children with mild scoliosis, treatment may not be necessary as their spine is still developing. Regular check-ups are recommended to monitor any progression. If needed, posture correction and specific exercises can help maintain spinal health.',
        icon: 'info'
      };
    case 'Moderate':
      return {
        title: 'Moderate Scoliosis Care',
        recommendations: [
          'The patient may require bracing to provide spinal support, in addition to exercise and lifestyle modifications to improve posture and reduce discomfort.'
        ],
        icon: 'medical-services'
      };
    case 'Severe':
      return {
        title: 'Severe Scoliosis Treatment',
        recommendations: [
          'Surgical intervention may be necessary to correct the spinal curvature. However, exercise and lifestyle modifications remain important for overall spinal health and recovery.'
        ],
        icon: 'priority-high'
      };
    default:
      return {
        title: 'General Recommendations',
        recommendations: [
          'Maintain good posture throughout the day',
          'Exercise regularly to strengthen core muscles',
          'Take breaks from prolonged sitting',
          'Consult with healthcare professionals'
        ],
        icon: 'help'
      };
  }
};

export const RecommendationsSection = ({ classification, styles }) => {
  if (!classification) return null;
  
  const recData = getRecommendations(classification);
  const borderColor = 
    classification === 'Normal' ? '#1A5741' :
    classification === 'Mild' ? '#cca300' :
    classification === 'Moderate' ? '#cc7a00' :
    '#cc0000';
    
  return (
    <View style={styles.recommendationsContainer}>
      <View style={[
        styles.recommendationHeaderRow,
        classification === 'Normal' ? styles.normalHeader :
        classification === 'Mild' ? styles.mildHeader :
        classification === 'Moderate' ? styles.moderateHeader :
        styles.severeHeader
      ]}>
        <MaterialIcons 
          name={recData.icon} 
          size={28} 
          color="#FFFFFF" 
        />
        <Text style={styles.recommendationsTitle}>{recData.title}</Text>
      </View>
      
      <View style={styles.recommendationContent}>
        {recData.recommendations.map((rec, index) => (
          <View key={index} style={[
            styles.recommendationItem,
            { borderLeftColor: borderColor }
          ]}>
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
        
        {recData.note && (
          <View style={styles.noteContainer}>
            <View style={styles.noteIconContainer}>
              <MaterialIcons name="lightbulb" size={20} color="#cca300" />
            </View>
            <Text style={styles.noteText}>{recData.note}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecommendationsSection; 