// src/api/mockFileManager.ts
import { FileItem } from '@/components/FileManager/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Initial mock data
const initialMockData: FileItem[] = [
  // Folders
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    path: '/Documents',
    size: 0,
    createdAt: '2023-04-10T10:00:00Z',
    modifiedAt: '2023-04-10T10:00:00Z',
    isFolder: true,
    parentId: null,
  },
  {
    id: 'folder-2',
    name: 'Images',
    type: 'folder',
    path: '/Images',
    size: 0,
    createdAt: '2023-04-11T10:00:00Z',
    modifiedAt: '2023-04-11T10:00:00Z',
    isFolder: true,
    parentId: null,
  },
  {
    id: 'folder-3',
    name: 'Projects',
    type: 'folder',
    path: '/Projects',
    size: 0,
    createdAt: '2023-04-12T10:00:00Z',
    modifiedAt: '2023-04-12T10:00:00Z',
    isFolder: true,
    parentId: null,
  },

  // Files in root
  {
    id: 'file-1',
    name: 'readme.txt',
    type: 'other',
    path: '/readme.txt',
    size: 1024,
    createdAt: '2023-04-13T10:00:00Z',
    modifiedAt: '2023-04-13T10:00:00Z',
    md5: 'a1b2c3d4',
    isFolder: false,
    parentId: null,
  },
  {
    id: 'file-2',
    name: 'profile.jpg',
    type: 'image',
    path: '/profile.jpg',
    thumbnail: 'https://picsum.photos/600/400',
    size: 2048576,
    createdAt: '2023-04-14T10:00:00Z',
    modifiedAt: '2023-04-14T10:00:00Z',
    md5: 'e5f6g7h8',
    isFolder: false,
    parentId: null,
  },

  // Files in Documents folder
  {
    id: 'file-3',
    name: 'resume.pdf',
    type: 'pdf',
    path: '/Documents/resume.pdf',
    thumbnail: 'https://picsum.photos/600/400',
    size: 3145728,
    createdAt: '2023-04-15T10:00:00Z',
    modifiedAt: '2023-04-15T10:00:00Z',
    md5: 'i9j0k1l2',
    isFolder: false,
    parentId: 'folder-1',
  },
  {
    id: 'file-4',
    name: 'notes.txt',
    type: 'other',
    path: '/Documents/notes.txt',
    thumbnail: 'https://picsum.photos/600/400',
    size: 2048,
    createdAt: '2023-04-16T10:00:00Z',
    modifiedAt: '2023-04-16T10:00:00Z',
    md5: 'm3n4o5p6',
    isFolder: false,
    parentId: 'folder-1',
  },

  // Files in Images folder
  {
    id: 'file-5',
    name: 'vacation.jpg',
    type: 'image',
    path: '/Images/vacation.jpg',
    thumbnail: 'https://picsum.photos/600/400',
    size: 4194304,
    createdAt: '2023-04-17T10:00:00Z',
    modifiedAt: '2023-04-17T10:00:00Z',
    md5: 'q7r8s9t0',
    isFolder: false,
    parentId: 'folder-2',
  },
  {
    id: 'file-6',
    name: 'logo.png',
    type: 'image',
    path: '/Images/logo.png',
    thumbnail: 'https://picsum.photos/600/400',
    size: 1048576,
    createdAt: '2023-04-18T10:00:00Z',
    modifiedAt: '2023-04-18T10:00:00Z',
    md5: 'u1v2w3x4',
    isFolder: false,
    parentId: 'folder-2',
  },

  // Files in Projects folder
  {
    id: 'file-7',
    name: 'project-plan.pdf',
    type: 'pdf',
    path: '/Projects/project-plan.pdf',
    thumbnail: 'https://picsum.photos/600/400',
    size: 5242880,
    createdAt: '2023-04-19T10:00:00Z',
    modifiedAt: '2023-04-19T10:00:00Z',
    md5: 'y5z6a7b8',
    isFolder: false,
    parentId: 'folder-3',
  },
  {
    id: 'file-8',
    name: 'demo.mp4',
    type: 'video',
    path: '/Projects/demo.mp4',
    thumbnail: 'https://picsum.photos/600/400',
    size: 10485760,
    createdAt: '2023-04-20T10:00:00Z',
    modifiedAt: '2023-04-20T10:00:00Z',
    md5: 'c9d0e1f2',
    isFolder: false,
    parentId: 'folder-3',
  },
  {
    id: 'file-9',
    name: 'source.zip',
    type: 'zip',
    path: '/Projects/source.zip',
    thumbnail: 'https://picsum.photos/600/400',
    size: 8388608,
    createdAt: '2023-04-21T10:00:00Z',
    modifiedAt: '2023-04-21T10:00:00Z',
    md5: 'g3h4i5j6',
    isFolder: false,
    parentId: 'folder-3',
  },
];

// In-memory database
let mockDatabase = [...initialMockData];
let lastId = 100;

// Add delay to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get files in a specific folder
export const getFiles = async (folderId: string | number | null): Promise<FileItem[]> => {
  await delay(500);
  return mockDatabase.filter((file) => file.parentId === folderId);
};

// Upload files
export const uploadFiles = async (
  files: any,
  folderId: string | number | null,
): Promise<FileItem[]> => {
  await delay(800);

  const newFiles: FileItem[] = Array.from(files).map((file: any) => {
    const id = `file-${++lastId}`;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    let fileType: 'image' | 'video' | 'zip' | 'pdf' | 'folder' | 'other' = 'other';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(fileExtension)) {
      fileType = 'video';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) {
      fileType = 'zip';
    } else if (fileExtension === 'pdf') {
      fileType = 'pdf';
    }

    return {
      id,
      name: file.name,
      type: fileType,
      path: folderId ? `/${folderId}/${file.name}` : `/${file.name}`,
      size: file.size,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      md5: Math.random().toString(36).substring(2, 10),
      isFolder: false,
      parentId: folderId,
    };
  });

  mockDatabase = [...mockDatabase, ...newFiles];
  return newFiles;
};

// Rename a file
export const renameFile = async (fileId: any, newName: string): Promise<FileItem> => {
  await delay(400);

  const fileIndex = mockDatabase.findIndex((file) => file.id === fileId);
  if (fileIndex === -1) {
    throw new Error('File not found');
  }

  const updatedFile = {
    ...mockDatabase[fileIndex],
    name: newName,
    modifiedAt: new Date().toISOString(),
  };

  mockDatabase = [
    ...mockDatabase.slice(0, fileIndex),
    updatedFile,
    ...mockDatabase.slice(fileIndex + 1),
  ];

  return updatedFile;
};

// Delete files
export const deleteFiles = async (fileIds: any): Promise<void> => {
  await delay(600);

  // Delete files and their children recursively
  const itemsToDelete = new Set(fileIds);

  // Find all descendant folders and files
  let foundMore = true;
  while (foundMore) {
    foundMore = false;
    for (const file of mockDatabase) {
      if (
        file.parentId &&
        itemsToDelete.has('' + file.parentId) &&
        !itemsToDelete.has('' + file.id)
      ) {
        itemsToDelete.add('' + file.id);
        foundMore = true;
      }
    }
  }

  mockDatabase = mockDatabase.filter((file) => !itemsToDelete.has('' + file.id));
};

// Move files
export const moveFiles = async (
  fileIds: any[],
  targetFolderId: any | null,
): Promise<FileItem[]> => {
  await delay(700);

  const movedFiles: FileItem[] = [];

  mockDatabase = mockDatabase.map((file) => {
    if (fileIds.includes('' + file.id)) {
      const updatedFile = {
        ...file,
        parentId: targetFolderId,
        modifiedAt: new Date().toISOString(),
      };
      movedFiles.push(updatedFile);
      return updatedFile;
    }
    return file;
  });

  return movedFiles;
};

// Copy files
export const copyFiles = async (
  fileIds: any[],
  targetFolderId: any | null,
): Promise<FileItem[]> => {
  await delay(800);

  const filesToCopy = mockDatabase.filter((file) => fileIds.includes('' + file.id));
  const copiedFiles: FileItem[] = [];

  // First, copy the selected files
  for (const file of filesToCopy) {
    const newId = `${file.isFolder ? 'folder' : 'file'}-${++lastId}`;
    const newFile = {
      ...file,
      id: newId,
      parentId: targetFolderId,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      md5: file.md5 ? Math.random().toString(36).substring(2, 10) : undefined,
    };

    mockDatabase.push(newFile);
    copiedFiles.push(newFile);

    // If it's a folder, we need to copy all its contents recursively
    if (file.isFolder) {
      const oldToNewIdMap = new Map<string, string>();
      oldToNewIdMap.set('' + file.id, newId);

      let filesToProcess = mockDatabase.filter((item) => item.parentId === file.id);

      while (filesToProcess.length > 0) {
        const currentFile = filesToProcess[0];
        const newParentId = oldToNewIdMap.get('' + currentFile.parentId!);

        if (!newParentId) {
          filesToProcess = filesToProcess.slice(1);
          continue;
        }

        const newChildId = `${currentFile.isFolder ? 'folder' : 'file'}-${++lastId}`;
        const newChild = {
          ...currentFile,
          id: newChildId,
          parentId: newParentId,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          md5: currentFile.md5 ? Math.random().toString(36).substring(2, 10) : undefined,
        };

        mockDatabase.push(newChild);

        if (currentFile.isFolder) {
          oldToNewIdMap.set('' + currentFile.id, newChildId);
          filesToProcess = [
            ...filesToProcess.slice(1),
            ...mockDatabase.filter((item) => item.parentId === currentFile.id),
          ];
        } else {
          filesToProcess = filesToProcess.slice(1);
        }
      }
    }
  }

  return copiedFiles;
};

// Download a file
export const downloadFile = (fileId: string | number): void => {
  const file = mockDatabase.find((file) => file.id === fileId);
  if (file) {
    alert(`Downloading file: ${file.name}`);
  }
};

// Create a new folder
export const createFolder = async (name: string, parentId: string | null): Promise<FileItem> => {
  await delay(300);

  const id = `folder-${++lastId}`;
  const newFolder: FileItem = {
    id,
    name,
    type: 'folder',
    path: parentId ? `/${parentId}/${name}` : `/${name}`,
    size: 0,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    isFolder: true,
    parentId,
  };

  mockDatabase = [...mockDatabase, newFolder];
  return newFolder;
};

// Rename a folder
export const renameFolder = async (folderId: string, newName: string): Promise<FileItem> => {
  // Same implementation as renameFile
  return renameFile(folderId, newName);
};

// Delete folders
export const deleteFolders = async (folderIds: string[]): Promise<void> => {
  // Same implementation as deleteFiles (which already handles recursive deletion)
  return deleteFiles(folderIds);
};

// Get folder path
export const getFolderPath = async (folderId: string): Promise<{ id: string; name: string }[]> => {
  await delay(200);

  const path: { id: string; name: string }[] = [];
  let currentId = folderId;

  while (currentId) {
    const folder = mockDatabase.find((file) => file.id === currentId);
    if (!folder) break;

    path.unshift({ id: '' + folder.id, name: folder.name });
    currentId = '' + folder.parentId || '';
  }

  return path;
};
