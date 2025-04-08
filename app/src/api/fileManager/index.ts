// src/api/fileManager/index.ts

// export * from './fileApi';
// export * from './folderApi';

// src/api/fileManager/index.js
// We're using .js instead of .ts to make it easier to override with our mock functions

// Import mock implementation
import * as mockApi from '../mockFileManager';

// Default export all mock functions
export const getFiles = mockApi.getFiles;
export const uploadFiles = mockApi.uploadFiles;
export const renameFile = mockApi.renameFile;
export const deleteFiles = mockApi.deleteFiles;
export const moveFiles = mockApi.moveFiles;
export const copyFiles = mockApi.copyFiles;
export const downloadFile = mockApi.downloadFile;
export const createFolder = mockApi.createFolder;
export const renameFolder = mockApi.renameFolder;
export const deleteFolders = mockApi.deleteFolders;
export const getFolderPath = mockApi.getFolderPath;
