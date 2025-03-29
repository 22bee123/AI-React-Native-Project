import React from 'react';
import { 
  View, 
  Text, 
  Modal,
  TouchableOpacity, 
  TextInput,
  FlatList,
  ScrollView,
  Image 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RecommendationsSection } from './RecommendationsManager';

export const NewFolderModal = ({ 
  visible, 
  onClose, 
  folderName, 
  onChangeFolderName, 
  onCreateFolder,
  styles 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Create New Folder</Text>
        <TextInput
          style={styles.input}
          placeholder="Folder Name"
          value={folderName}
          onChangeText={onChangeFolderName}
          autoFocus
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={onCreateFolder}
          >
            <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const RenameFolderModal = ({ 
  visible, 
  onClose, 
  folderName, 
  onChangeFolderName, 
  onRenameFolder,
  styles 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Rename Folder</Text>
        <TextInput
          style={styles.input}
          placeholder="New Folder Name"
          value={folderName}
          onChangeText={onChangeFolderName}
          autoFocus
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={onRenameFolder}
          >
            <Text style={[styles.buttonText, styles.createButtonText]}>Rename</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const DeleteImageModal = ({ 
  visible, 
  onClose, 
  onConfirmDelete,
  styles 
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <MaterialIcons name="delete-forever" size={48} color="#ff6b6b" style={styles.deleteIcon} />
        <Text style={styles.modalTitle}>Delete Image</Text>
        <Text style={styles.modalSubtitle}>Are you sure you want to delete this image? This action cannot be undone.</Text>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.deleteButton]}
            onPress={onConfirmDelete}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const DeleteFolderModal = ({ 
  visible, 
  onClose, 
  folderToDelete,
  onConfirmDelete,
  styles 
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
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
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.deleteButton]}
            onPress={onConfirmDelete}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const ImageResultModal = ({ 
  visible, 
  onClose, 
  selectedImage,
  onDeleteImage,
  styles 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    {selectedImage && (
      <View style={styles.resultModalOverlay}>
        <View style={styles.resultModalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
            >
              <MaterialIcons name="arrow-back" size={24} color="#1A5741" />
            </TouchableOpacity>
            
            <Text style={styles.modalHeaderTitle}>Result Details</Text>
            
            <TouchableOpacity
              style={styles.deleteImageButton}
              onPress={() => {
                onClose();
                setTimeout(() => onDeleteImage(selectedImage), 300);
              }}
            >
              <MaterialIcons name="delete" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.resultScrollView}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.fullImage} 
              resizeMode="contain"
            />
            
            {selectedImage.result && (
              <>
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
                
                <RecommendationsSection 
                  classification={selectedImage.result.class} 
                  styles={styles} 
                />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    )}
  </Modal>
);

export const SaveToFolderModal = ({ 
  visible, 
  onClose, 
  folders,
  folderForNewImage,
  onSelectFolder,
  onCreateNewFolder,
  onConfirmSave,
  styles 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
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
              onPress={() => onSelectFolder(item.id)}
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
          onPress={onCreateNewFolder}
        >
          <MaterialIcons name="add" size={24} color="#1A5741" />
          <Text style={styles.newFolderText}>Create New Folder</Text>
        </TouchableOpacity>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={onConfirmSave}
          >
            <Text style={[styles.buttonText, styles.createButtonText]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default {
  NewFolderModal,
  RenameFolderModal,
  DeleteImageModal,
  DeleteFolderModal,
  ImageResultModal,
  SaveToFolderModal
}; 