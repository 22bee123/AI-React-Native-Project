import React from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Path to store folder data
const FOLDERS_STORAGE_KEY = FileSystem.documentDirectory + 'folders.json';

const FolderManager = {
  // Load saved folders from storage
  loadSavedFolders: async (images = []) => {
    try {
      // Check if the folders file exists
      const fileInfo = await FileSystem.getInfoAsync(FOLDERS_STORAGE_KEY);
      
      if (fileInfo.exists) {
        // Read the file
        const foldersString = await FileSystem.readAsStringAsync(FOLDERS_STORAGE_KEY);
        let folders = JSON.parse(foldersString);
        
        // Create default folder if it doesn't exist
        if (!folders.some(folder => folder.id === 'default')) {
          folders.unshift({ id: 'default', name: 'All Images', images: [] });
        }
        
        // Update the default folder with all images
        folders = folders.map(folder => {
          if (folder.id === 'default') {
            return { ...folder, images: [...images] };
          }
          return folder;
        });
        
        console.log('Loaded folders from storage:', folders.length);
        return folders;
      } else {
        // File doesn't exist, create default folder with all images
        const defaultFolders = [{ id: 'default', name: 'All Images', images }];
        await saveFolders(defaultFolders);
        console.log('Created default folder');
        return defaultFolders;
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      // Return default folder if there's an error
      return [{ id: 'default', name: 'All Images', images }];
    }
  },
  
  // Create a new folder
  createFolder: (name, folders) => {
    if (!name || name.trim() === '') {
      console.error('Folder name cannot be empty');
      return null;
    }
    
    // Check if folder with same name exists
    if (folders.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      console.error('Folder with this name already exists');
      return null;
    }
    
    // Create new folder
    const newFolder = {
      id: 'folder_' + Date.now().toString(),
      name: name.trim(),
      images: []
    };
    
    // Save the updated folders list
    saveFolders([...folders, newFolder]);
    
    return newFolder;
  },
  
  // Save image to a folder
  saveImageToFolder: (image, folderId, folders) => {
    // Find the target folder
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
      console.error('Folder not found');
      return folders;
    }
    
    // Update folders
    const updatedFolders = folders.map(f => {
      if (f.id === 'default') {
        // Add to default "All Images" folder if not already there
        if (!f.images.some(img => img.id === image.id)) {
          return { ...f, images: [image, ...f.images] };
        }
      } else if (f.id === folderId) {
        // Add to the selected folder
        return { ...f, images: [image, ...f.images] };
      }
      return f;
    });
    
    // Save the updated folders list
    saveFolders(updatedFolders);
    
    return updatedFolders;
  },
  
  // Rename a folder
  renameFolder: (folder, newName, folders) => {
    if (!folder || !newName || newName.trim() === '') {
      console.error('Invalid folder or name');
      return null;
    }
    
    // Check if another folder with same name exists
    if (folders.some(f => f.id !== folder.id && f.name.toLowerCase() === newName.toLowerCase())) {
      console.error('Another folder with this name already exists');
      return null;
    }
    
    // Update folders
    const updatedFolders = folders.map(f => {
      if (f.id === folder.id) {
        return { ...f, name: newName.trim() };
      }
      return f;
    });
    
    // Save the updated folders list
    saveFolders(updatedFolders);
    
    return updatedFolders;
  },
  
  // Delete a folder
  deleteFolder: (folder, folders, currentFolder) => {
    if (!folder || folder.id === 'default') {
      console.error('Cannot delete default folder');
      return { updatedFolders: folders, newCurrentFolder: currentFolder };
    }
    
    // Remove folder from list
    const updatedFolders = folders.filter(f => f.id !== folder.id);
    
    // Update current folder if it was the deleted one
    const newCurrentFolder = currentFolder === folder.id ? 'default' : currentFolder;
    
    // Save the updated folders list
    saveFolders(updatedFolders);
    
    return { updatedFolders, newCurrentFolder };
  },
  
  // Delete an image from all folders
  deleteImage: (image, folders) => {
    if (!image) {
      console.error('No image to delete');
      return folders;
    }
    
    // Remove image from all folders
    const updatedFolders = folders.map(folder => ({
      ...folder,
      images: folder.images.filter(img => img.id !== image.id)
    }));
    
    // Save the updated folders list
    saveFolders(updatedFolders);
    
    return updatedFolders;
  }
};

// Helper function to save folders to persistent storage
const saveFolders = async (folders) => {
  try {
    // Create a saveable version of folders (no circular references)
    const foldersCopy = JSON.parse(JSON.stringify(folders));
    
    // Save to file
    await FileSystem.writeAsStringAsync(
      FOLDERS_STORAGE_KEY,
      JSON.stringify(foldersCopy)
    );
    
    console.log('Folders saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving folders:', error);
    return false;
  }
};

export default FolderManager; 