// src/api/fileManager/folderApi.ts
import { FileItem, ApiResponse } from '@/components/FileManager/types';

// const API_BASE_URL = '/api/folders';
// /* eslint-disable @typescript-eslint/no-explicit-any */
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
//     type: item.type || 'folder',
//     path: item.path || `/${item.name}`,
//     size: item.size || 0,
//     createdAt: item.createdAt || item.createAt,
//     createAt: item.createAt,
//     modifiedAt: item.modifiedAt || item.modifiedDate,
//     modifiedDate: item.modifiedDate,
//     md5: item.md5,
//     isFolder: true,
//     parentId: item.parentId,
//     thumbnail: item.thumbnail,
//     url: item.url,
//     expirationAt: item.expirationAt,
//   }));
// };
//
// /**
//  * Create a new folder
//  * @param name - Name of the folder
//  * @param parentId - ID of the parent folder (null for root)
//  */
// export const createFolder = async (
//   name: string,
//   parentId: string | number | null,
// ): Promise<FileItem> => {
//   const response = await fetch(`${API_BASE_URL}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       name,
//       parentId: parentId || 0,
//     }),
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems([data])[0];
// };
//
// /**
//  * Rename a folder
//  * @param folderId - ID of the folder to rename
//  * @param newName - New name for the folder
//  */
// export const renameFolder = async (folderId: string, newName: string): Promise<FileItem> => {
//   const response = await fetch(`${API_BASE_URL}/${folderId}/rename`, {
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
//  * Delete folders
//  * @param folderIds - IDs of the folders to delete
//  */
// export const deleteFolders = async (folderIds: string[]): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/delete`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ folderIds }),
//   });
//
//   await processApiResponse(response);
// };
//
// /**
//  * Get folder path information (breadcrumb)
//  * @param folderId - ID of the folder to get path for
//  */
// export const getFolderPath = async (folderId: string): Promise<{ id: string; name: string }[]> => {
//   const response = await fetch(`${API_BASE_URL}/${folderId}/path`);
//
//   const data = await processApiResponse(response);
//   return data.map((item: any) => ({
//     id: item.id.toString(),
//     name: item.name,
//   }));
// };
// ('/api/folders');
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
//     type: item.type || 'folder',
//     path: item.path || `/${item.name}`,
//     size: item.size || 0,
//     createdAt: item.createdAt || item.createAt,
//     createAt: item.createAt,
//     modifiedAt: item.modifiedAt || item.modifiedDate,
//     modifiedDate: item.modifiedDate,
//     md5: item.md5,
//     isFolder: true,
//     parentId: item.parentId,
//     thumbnail: item.thumbnail,
//     url: item.url,
//     expirationAt: item.expirationAt,
//   }));
// };
//
// /**
//  * Create a new folder
//  * @param name - Name of the folder
//  * @param parentId - ID of the parent folder (null for root)
//  */
// export const createFolder = async (
//   name: string,
//   parentId: string | number | null,
// ): Promise<FileItem> => {
//   const response = await fetch(`${API_BASE_URL}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       name,
//       parentId: parentId || 0,
//     }),
//   });
//
//   const data = await processApiResponse(response);
//   return mapApiItemsToFileItems([data])[0];
// };
//
// /**
//  * Rename a folder
//  * @param folderId - ID of the folder to rename
//  * @param newName - New name for the folder
//  */
// export const renameFolder = async (folderId: string, newName: string): Promise<FileItem> => {
//   const response = await fetch(`${API_BASE_URL}/${folderId}/rename`, {
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
//  * Delete folders
//  * @param folderIds - IDs of the folders to delete
//  */
// export const deleteFolders = async (folderIds: string[]): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/delete`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ folderIds }),
//   });
//
//   await processApiResponse(response);
// };
//
// /**
//  * Get folder path information (breadcrumb)
//  * @param folderId - ID of the folder to get path for
//  */
// export const getFolderPath = async (folderId: string): Promise<{ id: string; name: string }[]> => {
//   const response = await fetch(`${API_BASE_URL}/${folderId}/path`);
//
//   const data = await processApiResponse(response);
//   return data.map((item: any) => ({
//     id: item.id.toString(),
//     name: item.name,
//   }));
// };
