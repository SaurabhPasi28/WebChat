# File Upload Feature Documentation

## Overview
The WebChat application now supports file uploads with the following capabilities:
- **Supported File Types**: Images, Videos, Audio, Documents (PDF, DOCX, XLSX, etc.), Archives (ZIP, RAR, etc.)
- **Storage**: Cloudinary cloud storage
- **Max File Size**: 100MB
- **Features**: Upload, preview, download, and delete files

## Architecture

### Backend Components

#### 1. Cloudinary Configuration (`server/config/cloudinary.js`)
- **uploadToCloudinary()**: Uploads files to Cloudinary with folder organization
- **deleteFromCloudinary()**: Deletes single file from Cloudinary
- **deleteMultipleFromCloudinary()**: Bulk delete files from Cloudinary

#### 2. Upload Middleware (`server/middleware/upload.js`)
- Uses Multer for handling multipart/form-data
- Stores files temporarily in `./uploads` directory
- File type validation and size limits
- Auto-cleanup of temporary files

#### 3. File Controller (`server/controllers/fileController.js`)
- **uploadFile()**: Handles file upload and message creation
- **deleteMessage()**: Deletes message and associated file
- **getFileInfo()**: Retrieves file metadata

#### 4. Message Model Updates (`server/models/Message.js`)
New fields:
- `fileUrl`: Cloudinary URL
- `fileType`: enum ['image', 'video', 'audio', 'document', 'other']
- `fileName`: Original filename
- `fileSize`: Size in bytes
- `cloudinaryPublicId`: For deletion reference

#### 5. Socket Handler Updates (`server/utils/socketHandler.js`)
- `fileMessageSent`: Event for real-time file message delivery
- `messageDeleted`: Event for real-time message deletion sync

### Frontend Components

#### 1. FileUpload Component (`client/src/components/Chat/FileUpload.jsx`)
- Paperclip button for file selection
- File preview with thumbnail (for images)
- File info display (name, size, icon)
- Clear/remove file option

#### 2. FileMessage Component (`client/src/components/Chat/FileMessage.jsx`)
- **Image messages**: Full preview with lightbox-style view
- **Video messages**: Embedded video player
- **Audio messages**: Audio player with controls
- **Document messages**: Download button with file info

#### 3. ChatInput Updates (`client/src/components/Chat/ChatInput.jsx`)
- Integrated FileUpload component
- File upload progress indicator
- Caption support for file messages
- Toast notifications for upload status

#### 4. ChatContext Updates (`client/src/context/ChatContext.jsx`)
- `deleteMessage()`: Delete message with API call and socket event
- `messageRemoved` socket listener for real-time deletion

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install cloudinary multer multer-storage-cloudinary
```

**Frontend:**
```bash
cd client
npm install react-icons
```

### 2. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Environment Variables

Create `server/.env` file:
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Create Uploads Directory

```bash
cd server
mkdir uploads
```

Add to `.gitignore`:
```
/server/uploads/*
!/server/uploads/.gitkeep
```

## Usage

### Upload a File

1. Click the paperclip icon in the chat input
2. Select a file (max 100MB)
3. Optionally add a caption
4. Click send button
5. File uploads with progress indicator
6. File appears in chat with appropriate preview

### Delete a File Message

1. Hover over your own message with a file
2. Click the trash icon
3. Confirm deletion
4. File is deleted from both database and Cloudinary
5. Message is removed from both users' chat

## File Type Support

### Images
- **Formats**: JPEG, PNG, GIF, WEBP, SVG
- **Display**: Full image preview, click to open in new tab
- **Actions**: Download, Delete (if own message)

### Videos
- **Formats**: MP4, MPEG, MOV, AVI, WEBM
- **Display**: Embedded video player with controls
- **Actions**: Play, Download, Delete (if own message)

### Audio
- **Formats**: MP3, WAV, OGG
- **Display**: Audio player with controls
- **Actions**: Play, Download, Delete (if own message)

### Documents
- **Formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- **Display**: File icon with name and size
- **Actions**: Download, Delete (if own message)

### Archives
- **Formats**: ZIP, RAR, 7Z
- **Display**: File icon with name and size
- **Actions**: Download, Delete (if own message)

## API Endpoints

### POST `/api/file/upload`
Upload a file and create a message.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File to upload
  - `receiverId`: Recipient user ID
  - `caption`: Optional caption text

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "message_id",
    "sender": { ... },
    "receiver": { ... },
    "content": "caption or default text",
    "fileUrl": "cloudinary_url",
    "fileType": "image",
    "fileName": "original_name.jpg",
    "fileSize": 123456,
    "cloudinaryPublicId": "public_id",
    "status": "sent",
    "createdAt": "timestamp"
  }
}
```

### DELETE `/api/file/message/:messageId`
Delete a message and its associated file.

**Response:**
```json
{
  "success": true,
  "message": "Message and file deleted successfully"
}
```

### GET `/api/file/message/:messageId/file`
Get file information for a message.

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "cloudinary_url",
    "type": "image",
    "name": "filename.jpg",
    "size": 123456
  }
}
```

## Socket Events

### Emit Events

#### `fileMessageSent`
Emitted after successful file upload.
```javascript
socket.emit('fileMessageSent', messageId);
```

#### `messageDeleted`
Emitted when a message is deleted.
```javascript
socket.emit('messageDeleted', {
  messageId,
  senderId,
  receiverId
});
```

### Listen Events

#### `receiveMessage`
Received when a new message (including file messages) arrives.
```javascript
socket.on('receiveMessage', (message) => {
  // Handle incoming message
});
```

#### `messageRemoved`
Received when a message is deleted by other user.
```javascript
socket.on('messageRemoved', (messageId) => {
  // Remove message from UI
});
```

## Security Considerations

1. **File Size Limits**: Enforced at 100MB to prevent abuse
2. **File Type Validation**: Only allowed file types can be uploaded
3. **Authentication Required**: All endpoints require JWT token
4. **Ownership Validation**: Only message sender can delete their messages
5. **Cloudinary Security**: Uses signed upload API with secure credentials

## Error Handling

### Upload Errors
- Network issues → Toast notification with retry option
- File too large → Toast notification with size limit
- Invalid file type → Toast notification with allowed types
- Server error → Toast notification with error details

### Deletion Errors
- Cloudinary deletion fails → Logs warning, continues with DB deletion
- Not authorized → 403 error
- Message not found → 404 error

## Performance Optimization

1. **Chunked Uploads**: Large files uploaded in chunks
2. **Lazy Loading**: Images loaded on scroll
3. **Thumbnail Generation**: Cloudinary auto-generates thumbnails
4. **CDN Delivery**: Files served via Cloudinary's global CDN
5. **Local Cleanup**: Temporary files deleted immediately after upload

## Future Enhancements

- [ ] Multiple file uploads at once
- [ ] Drag & drop file upload
- [ ] Image compression before upload
- [ ] File upload progress cancellation
- [ ] Voice message recording
- [ ] File sharing expiration
- [ ] Encrypted file storage

## Troubleshooting

### File Upload Fails
1. Check Cloudinary credentials in `.env`
2. Verify file size is under 100MB
3. Ensure file type is supported
4. Check server logs for errors
5. Verify `uploads` directory exists and is writable

### Files Not Displaying
1. Check browser console for errors
2. Verify Cloudinary URLs are accessible
3. Check CORS configuration
4. Ensure message has `fileUrl` field

### Deletion Not Working
1. Verify user is message sender
2. Check Cloudinary API credentials
3. Review server logs for errors
4. Ensure message has `cloudinaryPublicId`

## Testing

### Manual Testing Checklist
- [ ] Upload image file
- [ ] Upload video file
- [ ] Upload PDF document
- [ ] Upload audio file
- [ ] Upload ZIP archive
- [ ] File preview displays correctly
- [ ] Download file works
- [ ] Delete own message
- [ ] Cannot delete other's message
- [ ] File appears in both users' chats
- [ ] Upload progress shows correctly
- [ ] Error handling works for oversized files
- [ ] Error handling works for invalid file types

## Support
For issues or questions, refer to:
- Main README: `README.md`
- Cloudinary Setup: `CLOUDINARY_SETUP.md`
- Server Setup: `server/README.md`
