import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const FolderItem = ({ 
  folder, 
  isSelected, 
  onPress, 
  onLongPress,
  styles
}) => (
  <TouchableOpacity
    key={folder.id}
    style={[
      styles.folderButton, 
      isSelected && styles.selectedFolder,
      folder.id !== 'default' && styles.deletableFolderButton
    ]}
    onPress={() => onPress(folder)}
    onLongPress={() => onLongPress(folder)}
    delayLongPress={400}
    activeOpacity={0.7}
  >
    <MaterialIcons 
      name={folder.id === 'default' ? "photo-library" : "folder"} 
      size={22} 
      color={isSelected ? "#FFFFFF" : "#1A5741"} 
    />
    <Text style={[styles.folderText, isSelected && styles.selectedFolderText]}>
      {folder.name}
    </Text>
    <Text style={[styles.imageCount, isSelected && styles.selectedFolderText]}>
      {folder.images.length}
    </Text>
    {folder.id !== 'default' && (
      <MaterialIcons 
        name="delete-outline" 
        size={14} 
        color={isSelected ? "#FFFFFF" : "#1A5741"} 
        style={styles.deleteIcon}
      />
    )}
  </TouchableOpacity>
);

export const ImageItem = ({ 
  item, 
  onPress, 
  onLongPress,
  styles
}) => (
  <TouchableOpacity 
    style={styles.imageContainer}
    onPress={() => onPress(item)}
    onLongPress={() => onLongPress(item)}
    delayLongPress={500}
    activeOpacity={0.7}
  >
    <Image 
      source={{ uri: item.uri }} 
      style={styles.image} 
      resizeMode="cover"
    />
    {item.result && (
      <View style={[
        styles.resultIndicator, 
        item.result.class === 'Normal' ? styles.normalIndicator :
        item.result.class === 'Mild' ? styles.mildIndicator :
        item.result.class === 'Moderate' ? styles.moderateIndicator :
        styles.severeIndicator
      ]}>
        <Text style={styles.resultText}>{item.result.class}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const EmptyGallery = ({ styles }) => (
  <View style={styles.emptyContainer}>
    <MaterialIcons name="photo-library" size={60} color="#cccccc" />
    <Text style={styles.descriptionText}>
      Your saved photos will appear here.
    </Text>
    <Text style={styles.smallText}>
      When you analyze posture, you can save the results to this gallery.
    </Text>
  </View>
);

export const ImageGallery = ({ 
  images, 
  onImagePress, 
  onImageLongPress,
  styles
}) => {
  if (images.length === 0) {
    return <EmptyGallery styles={styles} />;
  }
  
  return (
    <FlatList
      data={images}
      renderItem={({ item }) => (
        <ImageItem 
          item={item} 
          onPress={onImagePress} 
          onLongPress={onImageLongPress}
          styles={styles}
        />
      )}
      keyExtractor={(item) => item.id || item.uri}
      numColumns={3}
      contentContainerStyle={styles.imageList}
      initialNumToRender={12}
      removeClippedSubviews={true}
    />
  );
};

export default {
  FolderItem,
  ImageItem,
  EmptyGallery,
  ImageGallery
}; 