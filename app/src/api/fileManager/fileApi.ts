// src/api/fileManager/fileApi.ts
import { FileItem, ApiResponse } from '@/components/FileManager/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// const API_BASE_URL = '/api/files';
//
// /**
//  * Process API response
//  */
// const processApiResponse = async (response: Response) => {
//   if (!response.ok) {
//     throw new Error(`API error: ${response.statusText}`);
//   }
//
//   const apiResponse: ApiResponse = await response.json();
//
//   if (!apiResponse.success) {
//     throw new Error(`API error: ${apiResponse.msg || 'Unknown error'}`);
//   }
//
//   return apiResponse.data;
// };
//
// /**
//  * Map API items to FileItem format
//  */
// const mapApiItemsToFileItems = (items: any[]): FileItem[] => {
//   return items.map((item) => ({
//     id: item.id,
//     name: item.name,
//     type: item.type || 'other',
//     path: item.path || `/${item.name}`,
//     size: item.size || 0,
//     createdAt: item.createdAt || item.createAt,
//     createAt: item.createAt,
//     modifiedAt: item.modifiedAt || item.modifiedDate,
//     modifiedDate: item.modifiedDate,
//     md5: item.md5,
//     isFolder: item.type === 'folder',
//     parentId: item.parentId,
//     thumbnail: item.thumbnail,
//     url: item.url,
//     expirationAt: item.expirationAt,
//   }));
// };
//
// /**
//  * Get files and folders in a specific folder
//  * @param folderId - ID of the folder to get contents of (null for root)
//  */
// export const getFiles = async (folderId: string | number | null): Promise<FileItem[]> => {
//   const url = folderId
//     ? `${API_BASE_URL}?folderId=${encodeURIComponent(folderId.toString())}`
//     : `${API_BASE_URL}`;
//
//   const response = await fetch(url);
//   const data = await processApiResponse(response);
//
//   return mapApiItemsToFileItems(data);
// };
//
// /**
//  * Upload files to a specific folder
//  * @param files - Files to upload
//  * @param folderId - ID of the folder to upload to (null for root)
//  */
// export const uploadFiles = async (
//   files: File[],
//   folderId: string | number | null,
// ): Promise<FileItem[]> => {
//   const formData = new FormData();
//
//   files.forEach((file) => {
//     formData.append('files', file);
//   });
//
//   if (folderId) {
//     formData.append('folderId', folderId.toString());
//   }
//
//   const response = await fetch(`${API_BASE_URL}/upload`, {
//     method: 'POST',
//     body: formData,
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems(data);
// };
//
// /**
//  * Rename a file
//  * @param fileId - ID of the file to rename
//  * @param newName - New name for the file
//  */
// export const renameFile = async (fileId: string, newName: string): Promise<FileItem> => {
//   const response = await fetch(`${API_BASE_URL}/${fileId}/rename`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ name: newName }),
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems([data])[0];
// };
//
// /**
//  * Delete files
//  * @param fileIds - IDs of the files to delete
//  */
// export const deleteFiles = async (fileIds: string[]): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/delete`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ fileIds }),
//   });
//
//   await processApiResponse(response);
// };
//
// /**
//  * Move files to a target folder
//  * @param fileIds - IDs of the files to move
//  * @param targetFolderId - ID of the folder to move to (null for root)
//  */
// export const moveFiles = async (
//   fileIds: string[],
//   targetFolderId: string | number | null,
// ): Promise<FileItem[]> => {
//   const response = await fetch(`${API_BASE_URL}/move`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       fileIds,
//       targetFolderId: targetFolderId || 'root',
//     }),
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems(data);
// };
//
// /**
//  * Copy files to a target folder
//  * @param fileIds - IDs of the files to copy
//  * @param targetFolderId - ID of the folder to copy to (null for root)
//  */
// export const copyFiles = async (
//   fileIds: string[],
//   targetFolderId: string | number | null,
// ): Promise<FileItem[]> => {
//   const response = await fetch(`${API_BASE_URL}/copy`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       fileIds,
//       targetFolderId: targetFolderId || 'root',
//     }),
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems(data);
// };
//
// /**
//  * Download a file
//  * @param fileId - ID of the file to download
//  */
// export const downloadFile = (fileId: string): void => {
//   window.open(`${API_BASE_URL}/${fileId}/download`, '_blank');
// };
