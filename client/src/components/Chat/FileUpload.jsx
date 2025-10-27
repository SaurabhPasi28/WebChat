import { useState, useRef } from 'react';
import { FiPaperclip, FiX, FiFile, FiImage, FiVideo, FiMusic } from 'react-icons/fi';

const FileUpload = ({ onFileSelect, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Pass file to parent
      onFileSelect(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <FiVideo className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <FiMusic className="w-5 h-5" />;
    return <FiFile className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <FiPaperclip className="w-5 h-5" />
        </button>
      ) : (
        <div className="absolute bottom-12 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-3 mb-2">
          <div className="flex items-start gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                {getFileIcon(selectedFile.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFile}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Remove file"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
