import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [appInitMessage, setAppInitMessage] = useState('Initializing app...');
  
  // Add a delay to ensure proper initialization of components
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitMessage('Starting app...');
      setTimeout(() => {
        setReady(true);
      }, 300);
    }, 700);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5741" />
        <Text style={styles.loadingText}>{appInitMessage}</Text>
      </View>
    );
  }
  
  // Redirect to the splash screen
  return <Redirect href="/pages/screen" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1A5741',
  }
});
