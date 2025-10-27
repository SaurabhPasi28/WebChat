import Message from '../models/Message.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { deleteLocalFile } from '../middleware/upload.js';

/**
 * Upload file and send message
 */
export const uploadFile = async (req, res) => {
  console.log('📥 Upload request received');
  console.log('📥 Request body:', req.body);
  console.log('📥 Request file:', req.file ? {
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file');
  console.log('📥 Request user:', req.user);
  
  try {
    const { receiverId, caption } = req.body;
    const senderId = req.user.userId;

    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!receiverId) {
      console.error('❌ No receiverId in request');
      // Clean up uploaded file
      deleteLocalFile(req.file.path);
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    console.log('📁 File upload initiated:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      sender: senderId,
      receiver: receiverId
    });

    // Determine file type
    let fileType = 'other';
    let resourceType = 'auto';

    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
      resourceType = 'video'; // Cloudinary uses 'video' for audio
    } else if (
      req.file.mimetype.includes('pdf') ||
      req.file.mimetype.includes('document') ||
      req.file.mimetype.includes('text') ||
      req.file.mimetype.includes('sheet') ||
      req.file.mimetype.includes('presentation')
    ) {
      fileType = 'document';
      resourceType = 'raw';
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(
      req.file.path,
      'webchat/messages',
      resourceType
    );

    // Delete local file after upload
    deleteLocalFile(req.file.path);

    if (!cloudinaryResult.success) {
      console.error('❌ Cloudinary upload failed:', cloudinaryResult.error);
      return res.status(500).json({ error: 'Failed to upload file to cloud storage' });
    }

    console.log('✅ File uploaded to Cloudinary:', cloudinaryResult.url);

    // Create message with file attachment
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: caption || `Sent a ${fileType}`,
      fileUrl: cloudinaryResult.url,
      fileType: fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      cloudinaryPublicId: cloudinaryResult.publicId,
      status: 'sent'
    });

    await message.save();
    await message.populate('sender', 'username');
    await message.populate('receiver', 'username');

    console.log('💾 Message saved to database:', message._id);

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('❌ File upload error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Clean up local file if exists
    if (req.file && req.file.path) {
      deleteLocalFile(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Delete message and associated file
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    console.log('🗑️ Deleting message:', messageId);

    // If message has file, delete from Cloudinary
    if (message.cloudinaryPublicId && message.fileUrl) {
      console.log('☁️ Deleting file from Cloudinary:', message.cloudinaryPublicId);
      
      // Determine resource type
      let resourceType = 'image';
      if (message.fileType === 'video') {
        resourceType = 'video';
      } else if (message.fileType === 'audio') {
        resourceType = 'video';
      } else if (message.fileType === 'document' || message.fileType === 'other') {
        resourceType = 'raw';
      }

      const deleteResult = await deleteFromCloudinary(
        message.cloudinaryPublicId,
        resourceType
      );

      if (deleteResult.success) {
        console.log('✅ File deleted from Cloudinary');
      } else {
        console.warn('⚠️ Failed to delete file from Cloudinary:', deleteResult.error);
      }
    }

    // Delete message from database
    await Message.findByIdAndDelete(messageId);

    console.log('✅ Message deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Message and file deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({ 
      error: 'Failed to delete message',
      details: error.message 
    });
  }
};

/**
 * Get file info
 */
export const getFileInfo = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .select('fileUrl fileType fileName fileSize cloudinaryPublicId');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.fileUrl) {
      return res.status(404).json({ error: 'No file attached to this message' });
    }

    res.status(200).json({
      success: true,
      file: {
        url: message.fileUrl,
        type: message.fileType,
        name: message.fileName,
        size: message.fileSize
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
};
