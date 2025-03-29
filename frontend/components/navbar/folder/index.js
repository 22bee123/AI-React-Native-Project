import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// Import utilities and components
import { styles } from './styles';
import FolderManager from './FolderManager';
import { 
  NewFolderModal, 
  RenameFolderModal,
  DeleteImageModal,
  DeleteFolderModal,
  ImageResultModal,
  SaveToFolderModal
} from './Modals';
import { 
  FolderItem,
  ImageGallery
} from './ListComponents';

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

  // Load saved folders from storage on component mount and when images change
  useEffect(() => {
    loadSavedFoldersData();
  }, [images]);

  const loadSavedFoldersData = async () => {
    try {
      const savedFolders = await FolderManager.loadSavedFolders(images);
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

  // Create a new folder
  const handleCreateFolder = () => {
    const newFolder = FolderManager.createFolder(newFolderName, folders);
    if (newFolder) {
      setFolders([...folders, newFolder]);
      setModalVisible(false);
      setNewFolderName('');
      
      // If we're saving a new image, select this folder
      if (savingModalVisible) {
        setFolderForNewImage(newFolder.id);
      }
    } else {
      Alert.alert('Error', 'Could not create folder. Please check the name.');
    }
  };

  // Confirm saving the image to selected folder
  const confirmSaveImage = () => {
    if (!newImageData) return;
    
    const updatedFolders = FolderManager.saveImageToFolder(
      newImageData, 
      folderForNewImage, 
      folders
    );
    
    setFolders(updatedFolders);
    setSavingModalVisible(false);
    setNewImageData(null);
    
    Alert.alert('Success', 'Image saved successfully');
  };

  // Handle image press (view details)
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
    const updatedFolders = FolderManager.renameFolder(
      editingFolder, 
      newFolderRename, 
      folders
    );
    
    if (updatedFolders) {
      setFolders(updatedFolders);
      setRenameModalVisible(false);
      setEditingFolder(null);
      
      Alert.alert('Success', 'Folder renamed successfully');
    } else {
      Alert.alert('Error', 'Could not rename folder. Please check the name.');
    }
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
    const { updatedFolders, newCurrentFolder } = FolderManager.deleteFolder(
      folderToDelete, 
      folders, 
      currentFolder
    );
    
    setFolders(updatedFolders);
    setCurrentFolder(newCurrentFolder);
    setDeleteFolderModalVisible(false);
    setFolderToDelete(null);
    
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
    const updatedFolders = FolderManager.deleteImage(imageToDelete, folders);
    
    setFolders(updatedFolders);
    setDeleteImageModalVisible(false);
    
    // Notify parent component about deletion
    if (onImageDeleted && imageToDelete.id) {
      onImageDeleted(imageToDelete.id);
    }
    
    setImageToDelete(null);
    
    // Close image modal if it was open
    setShowResultModal(false);
    
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
              <FolderItem
                key={folder.id}
                folder={folder}
                isSelected={currentFolder === folder.id}
                onPress={handleFolderPress}
                onLongPress={handleFolderLongPress}
                styles={styles}
              />
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Images grid */}
      <ImageGallery
        images={getCurrentFolderImages()}
        onImagePress={handleImagePress}
        onImageLongPress={handleImageLongPress}
        styles={styles}
      />
      
      {/* Modals */}
      <NewFolderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        folderName={newFolderName}
        onChangeFolderName={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        styles={styles}
      />
      
      <RenameFolderModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        folderName={newFolderRename}
        onChangeFolderName={setNewFolderRename}
        onRenameFolder={confirmFolderRename}
        styles={styles}
      />
      
      <DeleteImageModal
        visible={deleteImageModalVisible}
        onClose={() => setDeleteImageModalVisible(false)}
        onConfirmDelete={confirmImageDelete}
        styles={styles}
      />
      
      <DeleteFolderModal
        visible={deleteFolderModalVisible}
        onClose={() => setDeleteFolderModalVisible(false)}
        folderToDelete={folderToDelete}
        onConfirmDelete={confirmFolderDelete}
        styles={styles}
      />
      
      <ImageResultModal
        visible={showResultModal}
        onClose={() => setShowResultModal(false)}
        selectedImage={selectedImage}
        onDeleteImage={handleImageDelete}
        styles={styles}
      />
      
      <SaveToFolderModal
        visible={savingModalVisible}
        onClose={() => setSavingModalVisible(false)}
        folders={folders}
        folderForNewImage={folderForNewImage}
        onSelectFolder={setFolderForNewImage}
        onCreateNewFolder={() => setModalVisible(true)}
        onConfirmSave={confirmSaveImage}
        styles={styles}
      />
    </View>
  );
});

export default FolderComponent; 