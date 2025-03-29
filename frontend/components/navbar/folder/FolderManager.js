import React from 'react';
import { Alert } from 'react-native';

export const loadSavedFolders = async (images) => {
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
    
    return savedFolders;
  } catch (error) {
    console.error('Error loading folders:', error);
    return [{ id: 'default', name: 'All Images', images: [] }];
  }
};

export const createFolder = (newFolderName, folders) => {
  if (newFolderName.trim() === '') {
    Alert.alert('Error', 'Please enter a folder name');
    return null;
  }
  
  const newFolder = {
    id: `folder_${Date.now()}`,
    name: newFolderName.trim(),
    images: []
  };
  
  return newFolder;
};

export const renameFolder = (editingFolder, newFolderRename, folders) => {
  if (!editingFolder || newFolderRename.trim() === '') {
    Alert.alert('Error', 'Please enter a folder name');
    return null;
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
  
  return updatedFolders;
};

export const deleteFolder = (folderToDelete, folders, currentFolder) => {
  // Remove the folder from the list
  const updatedFolders = folders.filter(folder => folder.id !== folderToDelete.id);
  
  // If the deleted folder was the current one, return new current folder id
  const newCurrentFolder = currentFolder === folderToDelete.id ? 'default' : currentFolder;
  
  return { updatedFolders, newCurrentFolder };
};

export const saveImageToFolder = (newImageData, folderForNewImage, folders) => {
  if (!newImageData) return folders;
  
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
  
  return updatedFolders;
};

export const deleteImage = (imageToDelete, folders) => {
  if (!imageToDelete) return folders;
  
  // Remove from all folders
  const updatedFolders = folders.map(folder => {
    return {
      ...folder,
      images: folder.images.filter(img => img.id !== imageToDelete.id)
    };
  });
  
  return updatedFolders;
};

export default {
  loadSavedFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  saveImageToFolder,
  deleteImage
}; 