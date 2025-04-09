// src/components/FileManager/hooks/useClipboard.tsx
import { useFileManager } from './useFileManager';

/**
 * Hook for clipboard operations (copy, cut, paste)
 */
export const useClipboard = () => {
  const {
    copyItems,
    cutItems,
    pasteItems,
    state: { clipboardItems },
  } = useFileManager();

  /**
   * Copy selected items to clipboard
   */
  const copy = () => 
    // const { selectedItems } = useFileManager().state;
    // if (selectedItems.length > 0) {
    //   copyItems(selectedItems);
    //   return true;
    // }
     false
  ;

  /**
   * Cut selected items to clipboard
   */
  const cut = () => 
    // const { selectedItems } = useFileManager().state;
    // if (selectedItems.length > 0) {
    //   cutItems(selectedItems);
    //   return true;
    // }
     false
  ;

  /**
   * Paste items from clipboard to current folder
   */
  const paste = async () => {
    if (clipboardItems.items.length > 0) {
      await pasteItems();
      return true;
    }
    return false;
  };

  /**
   * Check if there are items in the clipboard
   */
  const hasClipboardItems = clipboardItems.items.length > 0;

  /**
   * Get clipboard operation type
   */
  const clipboardOperation = clipboardItems.operation;

  return {
    copy,
    cut,
    paste,
    hasClipboardItems,
    clipboardOperation,
    clipboardItemCount: clipboardItems.items.length,
  };
};
