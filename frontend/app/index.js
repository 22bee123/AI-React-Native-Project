import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const [ready, setReady] = useState(false);
  
  // Add a small delay to ensure proper initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5741" />
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
  }
});
