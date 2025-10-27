import { FiDownload, FiFile, FiTrash2 } from 'react-icons/fi';

const FileMessage = ({ message, isOwnMessage, onDelete }) => {
  const { fileUrl, fileType, fileName, fileSize } = message;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message and file?')) {
      onDelete(message._id);
    }
  };

  // Render based on file type
  if (fileType === 'image') {
    return (
      <div className="max-w-md">
        <div className="relative group">
          <img
            src={fileUrl}
            alt={fileName}
            className="rounded-lg max-h-96 w-auto cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Download"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            {isOwnMessage && (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {message.content && message.content !== `Sent a ${fileType}` && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}
        {fileName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileName}</p>
        )}
      </div>
    );
  }

  if (fileType === 'video') {
    return (
      <div className="max-w-md">
        <div className="relative group">
          <video
            controls
            className="rounded-lg max-h-96 w-full"
            preload="metadata"
          >
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Download"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            {isOwnMessage && (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {message.content && message.content !== `Sent a ${fileType}` && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}
        {fileName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileName}</p>
        )}
      </div>
    );
  }

  if (fileType === 'audio') {
    return (
      <div className="max-w-md">
        <div className="relative group p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <audio controls className="w-full">
            <source src={fileUrl} />
            Your browser does not support audio playback.
          </audio>
          <div className="flex items-center justify-between mt-2">
            <div className="flex-1 min-w-0">
              {fileName && (
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{fileName}</p>
              )}
              {fileSize && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <div className="flex gap-2 ml-2">
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title="Download"
              >
                <FiDownload className="w-4 h-4" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        {message.content && message.content !== `Sent a ${fileType}` && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}
      </div>
    );
  }

  // Document or other file types
  return (
    <div className="max-w-md">
      <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
          <FiFile className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {fileName || 'File'}
          </p>
          {fileSize && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(fileSize)}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            title="Download"
          >
            <FiDownload className="w-4 h-4" />
          </button>
          {isOwnMessage && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {message.content && message.content !== `Sent a ${fileType}` && (
        <p className="mt-2 text-sm">{message.content}</p>
      )}
    </div>
  );
};

export default FileMessage;
