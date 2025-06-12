import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMessages, getUsers } from '../controllers/chatController.js';

const router = express.Router();

router.use(authenticate);

router.get('/users', getUsers);
router.get('/messages/:receiverId', getMessages);
// router.get('/users', authenticate, getChatUsers);
// router.post('/messages/:id/read', authenticate, markMessagesAsRead);
// router.post('/messages/:id/reaction', authenticate, addReaction);
// router.put('/messages/:id', authenticate, editMessage);
// router.delete('/messages/:id', authenticate, deleteMessage);

export default router;