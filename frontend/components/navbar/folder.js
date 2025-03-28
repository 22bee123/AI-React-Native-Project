import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  FlatList
} from 'react-native';

const FolderComponent = ({ images = [] }) => {
  const renderEmptyGallery = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.headerText}>Photo Gallery</Text>
        <Text style={styles.descriptionText}>
          Your saved photos will appear here.
        </Text>
      </View>
    );
  };

  const renderImage = ({ item }) => {
    return (
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.uri }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Photo Gallery</Text>
      
      {images.length === 0 ? (
        renderEmptyGallery()
      ) : (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.imageList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  },
  imageList: {
    paddingVertical: 10,
  },
  imageContainer: {
    flex: 1/3,
    margin: 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});

export default FolderComponent;
