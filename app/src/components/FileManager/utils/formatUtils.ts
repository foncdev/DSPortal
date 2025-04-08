// src/components/FileManager/utils/formatUtils.ts

/**
 * Format file size into human-readable string
 * @param bytes - Size in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date string to localized format
 * @param dateString - ISO date string or date in format 'YYYY-MM-DD HH:MM:SS'
 */
export const formatDate = (dateString: string): string => {
  try {
    // Check if the date is in the format 'YYYY-MM-DD HH:MM:SS'
    let date: Date;
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Convert 'YYYY-MM-DD HH:MM:SS' to ISO format
      const [datePart, timePart] = dateString.split(' ');
      date = new Date(`${datePart}T${timePart}`);
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date and time string to localized format
 * @param dateString - ISO date string or date in format 'YYYY-MM-DD HH:MM:SS'
 */
export const formatDateTime = (dateString: string): string => {
  try {
    // Check if the date is in the format 'YYYY-MM-DD HH:MM:SS'
    let date: Date;
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Convert 'YYYY-MM-DD HH:MM:SS' to ISO format
      const [datePart, timePart] = dateString.split(' ');
      date = new Date(`${datePart}T${timePart}`);
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate time ago from date string
 * @param dateString - ISO date string or date in format 'YYYY-MM-DD HH:MM:SS'
 */
export const getTimeAgo = (dateString: string): string => {
  try {
    // Check if the date is in the format 'YYYY-MM-DD HH:MM:SS'
    let date: Date;
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Convert 'YYYY-MM-DD HH:MM:SS' to ISO format
      const [datePart, timePart] = dateString.split(' ');
      date = new Date(`${datePart}T${timePart}`);
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }

    return seconds < 5 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'some time ago';
  }
};
