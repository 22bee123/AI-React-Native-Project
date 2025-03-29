import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// Use forwardRef to expose methods to parent components
const FolderComponent = forwardRef(({ images = [], onImageSelected, onImageDeleted }, ref) => {
  const [folders, setFolders] = useState([
    { id: 'default', name: 'All Images', images: [] }
  ]);
  const [currentFolder, setCurrentFolder] = useState('default');
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [savingModalVisible, setSavingModalVisible] = useState(false);
  const [folderForNewImage, setFolderForNewImage] = useState('default');
  const [newImageData, setNewImageData] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newFolderRename, setNewFolderRename] = useState('');
  const [deleteImageModalVisible, setDeleteImageModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteFolderModalVisible, setDeleteFolderModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const DOUBLE_TAP_DELAY = 300; // ms between taps to count as double tap

  // Load saved folders from storage on component mount
  useEffect(() => {
    loadSavedFolders();
  }, []);

  const loadSavedFolders = async () => {
    try {
      // In a real app, load from FileSystem or AsyncStorage
      // For now, we'll use mock data
      const savedFolders = [
        { 
          id: 'default', 
          name: 'All Images', 
          images: images
        },
        {
          id: 'folder1',
          name: 'Posture Analysis',
          images: images.slice(0, Math.min(3, images.length))
        }
      ];
      
      if (savedFolders.length > 0) {
        setFolders(savedFolders);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveImageWithResult: (imageUri, result, selectedFolder) => {
      setSavingModalVisible(true);
      setNewImageData({
        uri: imageUri,
        result: result,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      setFolderForNewImage(selectedFolder || 'default');
    }
  }));

  // Save new image with its prediction result
  const saveImageWithResult = (imageUri, result, selectedFolder) => {
    setSavingModalVisible(true);
    setNewImageData({
      uri: imageUri,
      result: result,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    });
    setFolderForNewImage(selectedFolder || 'default');
  };

  // Confirm saving the image to selected folder
  const confirmSaveImage = () => {
    if (!newImageData) return;
    
    // Update folders with new image
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderForNewImage || folder.id === 'default') {
        return {
          ...folder,
          images: [newImageData, ...folder.images]
        };
      }
      return folder;
    });
    
    setFolders(updatedFolders);
    setSavingModalVisible(false);
    setNewImageData(null);
    
    // In a real app, save to persistent storage
    Alert.alert('Success', 'Image saved successfully');
  };

  // Create a new folder
  const createNewFolder = () => {
    if (newFolderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      images: []
    };
    
    setFolders([...folders, newFolder]);
    setModalVisible(false);
    setNewFolderName('');
    
    // If we're saving a new image, select this folder
    if (savingModalVisible) {
      setFolderForNewImage(newFolder.id);
    }
  };

  // View image details
  const handleImagePress = (image) => {
    setSelectedImage(image);
    setShowResultModal(true);
  };

  // Handle folder press with double tap detection for rename
  const handleFolderPress = (folder) => {
    const now = Date.now();
    
    if (folder.id === 'default') {
      // Don't allow renaming default folder, just change to it
      setCurrentFolder(folder.id);
      return;
    }
    
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      // Double tap detected - initiate rename
      handleFolderRename(folder);
    } else {
      // Single tap - just change folders
      setCurrentFolder(folder.id);
    }
    
    setLastTapTime(now);
  };

  // Initiate folder rename
  const handleFolderRename = (folder) => {
    if (folder.id === 'default') return; // Don't allow renaming default folder
    
    setEditingFolder(folder);
    setNewFolderRename(folder.name);
    setRenameModalVisible(true);
  };

  // Execute folder rename
  const confirmFolderRename = () => {
    if (!editingFolder || newFolderRename.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    
    const updatedFolders = folders.map(folder => {
      if (folder.id === editingFolder.id) {
        return {
          ...folder,
          name: newFolderRename.trim()
        };
      }
      return folder;
    });
    
    setFolders(updatedFolders);
    setRenameModalVisible(false);
    setEditingFolder(null);
    
    // In a real app, save to persistent storage
    Alert.alert('Success', 'Folder renamed successfully');
  };

  // Handle folder delete request
  const handleFolderDelete = (folder) => {
    if (folder.id === 'default') {
      Alert.alert('Error', 'Cannot delete the default folder');
      return;
    }
    
    setFolderToDelete(folder);
    setDeleteFolderModalVisible(true);
  };

  // Execute folder deletion
  const confirmFolderDelete = () => {
    if (!folderToDelete) return;
    
    // Check if folder is not empty
    if (folderToDelete.images.length > 0) {
      Alert.alert(
        'Warning',
        'This folder contains images. Deleting it will remove the images from this folder only. Images in "All Images" will remain.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Anyway', onPress: executeFolderDeletion }
        ]
      );
    } else {
      executeFolderDeletion();
    }
  };

  // Perform folder deletion
  const executeFolderDeletion = () => {
    // Remove the folder from the list
    const updatedFolders = folders.filter(folder => folder.id !== folderToDelete.id);
    setFolders(updatedFolders);
    
    // If the deleted folder was the current one, switch to default
    if (currentFolder === folderToDelete.id) {
      setCurrentFolder('default');
    }
    
    setDeleteFolderModalVisible(false);
    setFolderToDelete(null);
    
    // In a real app, update persistent storage
    Alert.alert('Success', 'Folder deleted successfully');
  };

  // Handle image delete request
  const handleImageDelete = (image) => {
    setImageToDelete(image);
    setDeleteImageModalVisible(true);
  };

  // Execute image deletion
  const confirmImageDelete = () => {
    if (!imageToDelete) return;
    
    // Remove from all folders
    const updatedFolders = folders.map(folder => {
      return {
        ...folder,
        images: folder.images.filter(img => img.id !== imageToDelete.id)
      };
    });
    
    setFolders(updatedFolders);
    setDeleteImageModalVisible(false);
    
    // Notify parent component about deletion
    if (onImageDeleted && imageToDelete.id) {
      onImageDeleted(imageToDelete.id);
    }
    
    setImageToDelete(null);
    
    // Close image modal if it was open
    setShowResultModal(false);
    
    // In a real app, update persistent storage
    Alert.alert('Success', 'Image deleted successfully');
  };

  // Long press handler for images
  const handleImageLongPress = (image) => {
    handleImageDelete(image);
  };

  // Long press handler for folders
  const handleFolderLongPress = (folder) => {
    if (folder.id === 'default') {
      Alert.alert('Info', 'The default "All Images" folder cannot be deleted');
      return;
    }
    
    handleFolderDelete(folder);
  };

  const renderEmptyGallery = () => {
    return (
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
  };

  const renderImage = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => handleImagePress(item)}
        onLongPress={() => handleImageLongPress(item)}
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
  };

  const renderFolder = ({ item }) => {
    const isSelected = currentFolder === item.id;
    return (
      <TouchableOpacity
        style={[styles.folderButton, isSelected && styles.selectedFolder]}
        onPress={() => setCurrentFolder(item.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name={item.id === 'default' ? "photo-library" : "folder"} 
          size={22} 
          color={isSelected ? "#FFFFFF" : "#1A5741"} 
        />
        <Text style={[styles.folderText, isSelected && styles.selectedFolderText]}>
          {item.name}
        </Text>
        <Text style={[styles.imageCount, isSelected && styles.selectedFolderText]}>
          {item.images.length}
        </Text>
      </TouchableOpacity>
    );
  };

  // Get current folder's images
  const getCurrentFolderImages = () => {
    const folder = folders.find(f => f.id === currentFolder);
    return folder ? folder.images : [];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Photo Gallery</Text>
        <TouchableOpacity
          style={styles.addFolderButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="create-new-folder" size={24} color="#1A5741" />
        </TouchableOpacity>
      </View>
      
      {/* Folders horizontal list */}
      <View style={styles.foldersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.folderList}>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={[styles.folderButton, currentFolder === folder.id && styles.selectedFolder]}
                onPress={() => handleFolderPress(folder)}
                onLongPress={() => handleFolderLongPress(folder)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={folder.id === 'default' ? "photo-library" : "folder"} 
                  size={22} 
                  color={currentFolder === folder.id ? "#FFFFFF" : "#1A5741"} 
                />
                <Text style={[styles.folderText, currentFolder === folder.id && styles.selectedFolderText]}>
                  {folder.name}
                </Text>
                <Text style={[styles.imageCount, currentFolder === folder.id && styles.selectedFolderText]}>
                  {folder.images.length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Images grid */}
      {getCurrentFolderImages().length === 0 ? (
        renderEmptyGallery()
      ) : (
        <FlatList
          data={getCurrentFolderImages()}
          renderItem={renderImage}
          keyExtractor={(item) => item.id || item.uri}
          numColumns={3}
          contentContainerStyle={styles.imageList}
          initialNumToRender={12}
          removeClippedSubviews={true}
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
                onPress={createNewFolder}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Rename Folder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Folder</Text>
            <TextInput
              style={styles.input}
              placeholder="New Folder Name"
              value={newFolderRename}
              onChangeText={setNewFolderRename}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={confirmFolderRename}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Delete Image Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteImageModalVisible}
        onRequestClose={() => setDeleteImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="delete-forever" size={48} color="#ff6b6b" style={styles.deleteIcon} />
            <Text style={styles.modalTitle}>Delete Image</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to delete this image? This action cannot be undone.</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteImageModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmImageDelete}
              >
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Delete Folder Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteFolderModalVisible}
        onRequestClose={() => setDeleteFolderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="folder-delete" size={48} color="#ff6b6b" style={styles.deleteIcon} />
            <Text style={styles.modalTitle}>Delete Folder</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to delete the folder "{folderToDelete?.name}"? 
              {folderToDelete?.images.length > 0 ? 
                " This folder contains images which will be removed from this folder only." :
                " This folder is empty."}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteFolderModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmFolderDelete}
              >
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Image Result Modal with Delete Option */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showResultModal}
        onRequestClose={() => setShowResultModal(false)}
      >
        {selectedImage && (
          <View style={styles.resultModalOverlay}>
            <View style={styles.resultModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowResultModal(false)}
                >
                  <MaterialIcons name="close" size={24} color="#1A5741" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteImageButton}
                  onPress={() => {
                    setShowResultModal(false);
                    setTimeout(() => handleImageDelete(selectedImage), 300);
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
              
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.fullImage} 
                resizeMode="contain"
              />
              
              {selectedImage.result && (
                <View style={styles.resultDetails}>
                  <Text style={styles.resultTitle}>
                    Posture Analysis Result
                  </Text>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Classification:</Text>
                    <Text style={[
                      styles.resultValue,
                      selectedImage.result.class === 'Normal' ? styles.normalText :
                      selectedImage.result.class === 'Mild' ? styles.mildText :
                      selectedImage.result.class === 'Moderate' ? styles.moderateText :
                      styles.severeText
                    ]}>
                      {selectedImage.result.class}
                    </Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Cobb Angle:</Text>
                    <Text style={styles.resultValue}>{selectedImage.result.angle}°</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Date:</Text>
                    <Text style={styles.resultValue}>
                      {selectedImage.timestamp ? new Date(selectedImage.timestamp).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>
      
      {/* Save to Folder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={savingModalVisible}
        onRequestClose={() => setSavingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save to Folder</Text>
            <Text style={styles.modalSubtitle}>Select a folder to save your result</Text>
            
            <FlatList
              data={folders}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.folderSelectItem,
                    folderForNewImage === item.id && styles.selectedFolderItem
                  ]}
                  onPress={() => setFolderForNewImage(item.id)}
                >
                  <MaterialIcons 
                    name={item.id === 'default' ? "photo-library" : "folder"} 
                    size={24} 
                    color={folderForNewImage === item.id ? "#1A5741" : "#666666"} 
                  />
                  <Text style={styles.folderSelectText}>{item.name}</Text>
                  {folderForNewImage === item.id && (
                    <MaterialIcons name="check" size={24} color="#1A5741" />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              style={styles.folderSelectList}
            />
            
            <TouchableOpacity
              style={styles.newFolderItem}
              onPress={() => {
                setModalVisible(true);
              }}
            >
              <MaterialIcons name="add" size={24} color="#1A5741" />
              <Text style={styles.newFolderText}>Create New Folder</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSavingModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={confirmSaveImage}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addFolderButton: {
    padding: 8,
  },
  foldersContainer: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  folderList: {
    flexDirection: 'row',
    padding: 10,
  },
  folderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFolder: {
    backgroundColor: '#1A5741',
  },
  folderText: {
    color: '#1A5741',
    fontWeight: '500',
    marginLeft: 5,
    marginRight: 5,
  },
  selectedFolderText: {
    color: '#FFFFFF',
  },
  imageCount: {
    color: '#1A5741',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 15,
  },
  smallText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },
  imageList: {
    padding: 5,
  },
  imageContainer: {
    flex: 1/3,
    margin: 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
  },
  normalIndicator: {
    backgroundColor: 'rgba(26, 87, 65, 0.7)',
  },
  mildIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.7)',
  },
  moderateIndicator: {
    backgroundColor: 'rgba(255, 165, 0, 0.7)',
  },
  severeIndicator: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#1A5741',
  },
  buttonText: {
    fontWeight: '500',
    color: '#333',
  },
  createButtonText: {
    color: '#FFFFFF',
  },
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  fullImage: {
    width: '100%',
    height: '60%',
    borderRadius: 8,
    marginBottom: 15,
  },
  resultDetails: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  resultLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  normalText: { 
    color: '#1A5741' 
  },
  mildText: { 
    color: '#cca300' 
  },
  moderateText: { 
    color: '#cc7a00' 
  },
  severeText: { 
    color: '#cc0000' 
  },
  folderSelectList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  folderSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedFolderItem: {
    backgroundColor: '#E8F5F1',
  },
  folderSelectText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  newFolderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#1A5741',
    borderRadius: 5,
  },
  newFolderText: {
    fontSize: 16,
    color: '#1A5741',
    marginLeft: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  deleteIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  deleteImageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});

export default FolderComponent;
