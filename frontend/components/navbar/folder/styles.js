import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    position: 'relative',
  },
  resultScrollView: {
    flex: 1,
    marginTop: 40,
  },
  fullImage: {
    width: '100%',
    height: 300,
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
  recommendationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  recommendationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 0,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  recommendationContent: {
    padding: 15,
  },
  recommendationItem: {
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1A5741',
  },
  recommendationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#cca300',
    flexDirection: 'row',
  },
  noteIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
    flex: 1,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
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
  normalHeader: {
    backgroundColor: '#1A5741',
  },
  mildHeader: {
    backgroundColor: '#cca300',
  },
  moderateHeader: {
    backgroundColor: '#cc7a00',
  },
  severeHeader: {
    backgroundColor: '#cc0000',
  },
});

export default styles; 