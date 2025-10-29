import { useState, useRef, useEffect } from 'react';
import { FiPaperclip, FiX, FiFile, FiImage, FiVideo, FiMusic, FiPlus } from 'react-icons/fi';

const FileUpload = ({ onFilesSelect, disabled, selectedFiles = [] }) => {
  const [previews, setPreviews] = useState({});
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  // Load files from local storage on mount
  useEffect(() => {
    loadFilesFromStorage();
  }, []);

  // Save files to local storage whenever they change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      saveFilesToStorage(selectedFiles);
      generatePreviews(selectedFiles);
    }
  }, [selectedFiles]);

  const saveFilesToStorage = (files) => {
    try {
      const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
      localStorage.setItem('unsent_files_metadata', JSON.stringify(fileData));
    } catch (error) {
      console.error('Error saving files to storage:', error);
    }
  };

  const loadFilesFromStorage = () => {
    try {
      const savedData = localStorage.getItem('unsent_files_metadata');
      if (savedData) {
        // Note: We can only save metadata, not actual File objects
        // Files will be lost on page refresh (browser security limitation)
        // But we show the user they had unsent files
        console.log('Found unsent file metadata:', JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading files from storage:', error);
    }
  };

  const clearFilesFromStorage = () => {
    try {
      localStorage.removeItem('unsent_files_metadata');
    } catch (error) {
      console.error('Error clearing files from storage:', error);
    }
  };

  const generatePreviews = async (files) => {
    const newPreviews = {};
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          const preview = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          newPreviews[file.name] = preview;
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      }
    }
    
    setPreviews(newPreviews);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large! Maximum size is 20MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Add to existing files
      const newFiles = [...selectedFiles, ...validFiles];
      onFilesSelect(newFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileName) => {
    const newFiles = selectedFiles.filter(f => f.name !== fileName);
    onFilesSelect(newFiles);
    
    // Remove preview
    const newPreviews = { ...previews };
    delete newPreviews[fileName];
    setPreviews(newPreviews);
    
    // Clear storage if no files left
    if (newFiles.length === 0) {
      clearFilesFromStorage();
    }
  };

  const handleClearAll = () => {
    onFilesSelect([]);
    setPreviews({});
    clearFilesFromStorage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <FiVideo className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <FiMusic className="w-4 h-4" />;
    return <FiFile className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
      />

      {/* Attach Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach files"
      >
        <FiPaperclip className="w-5 h-5" />
      </button>

      {/* File Preview Popup - Shows ABOVE the input */}
      {selectedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-[400px] max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-3 z-[100] max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 font-medium"
                title="Add more files"
              >
                <FiPlus className="w-3 h-3" />
                Add More
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                title="Clear all files"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {previews[file.name] ? (
                  <img
                    src={previews[file.name]}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded text-gray-500 dark:text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.name)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Press Send to upload these files
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
