const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Enhanced response handler
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error(data.message || 'Session expired. Please login again.');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid response format from server');
    }
    throw error;
  }
};

// Add request interceptor
const authFetch = async (url, options = {}) => {
  const userData = localStorage.getItem('user');
  const token = userData ? JSON.parse(userData).token : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// Auth functions
export const authAPI = {
  login: async (username, password) => {
    return authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  signup: async (username, password) => {
    return authFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  logout: async () => {
    return authFetch('/auth/logout', {
      method: 'POST'
    });
  },

  refreshToken: async () => {
    return authFetch('/auth/refresh-token', {
      method: 'POST'
    });
  }
};

// Chat functions
export const chatAPI = {
  getUsers: async () => {
    const users = await authFetch('/chat/users');
    return users.map(user => ({
      ...user,
      _id: user._id || user.id,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen || null
    }));
  },
  
  getMessages: async (receiverId) => {
    const messages = await authFetch(`/chat/messages/${receiverId}`);
    return messages.map(msg => ({
      ...msg,
      _id: msg._id || msg.id,
      sender: typeof msg.sender === 'string' 
        ? { _id: msg.sender, username: 'Unknown User' } 
        : { 
            _id: msg.sender._id || msg.sender.id, 
            username: msg.sender.username || 'Unknown User',
            avatar: msg.sender.avatar
          },
      receiver: typeof msg.receiver === 'string' 
        ? { _id: msg.receiver, username: 'Unknown User' } 
        : { 
            _id: msg.receiver._id || msg.receiver.id, 
            username: msg.receiver.username || 'Unknown User',
            avatar: msg.receiver.avatar
          }
    }));
  },

  searchMessages: async (query) => {
    return authFetch(`/chat/search?query=${encodeURIComponent(query)}`);
  },

  deleteConversation: async (receiverId) => {
    return authFetch(`/chat/conversation/${receiverId}`, {
      method: 'DELETE'
    });
  },

  getUserStatus: async (userId) => {
    return authFetch(`/chat/user/${userId}/status`);
  },

  deleteMessage: async (messageId) => {
    return authFetch(`/file/message/${messageId}`, {
      method: 'DELETE'
    });
  }
};