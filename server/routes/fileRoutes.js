import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
// Import serverless-compatible upload middleware
import { upload } from '../middleware/uploadServerless.js';
import { uploadFile, deleteMessage, getFileInfo } from '../controllers/fileController.js';

const router = express.Router();

// Upload file and send message
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// Delete message with file
router.delete('/message/:messageId', authenticate, deleteMessage);

// Get file info
router.get('/message/:messageId/file', authenticate, getFileInfo);

export default router;
