const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


///hadle response
const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};


export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
};

export const signupUser = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
};

// Helper function to get token
const getToken = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.token;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Update all functions to use getToken()
export const getUsers = async () => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_URL}/chat/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getMessages = async (receiverId) => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_URL}/chat/messages/${receiverId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

   const messages = await handleResponse(response);
  return messages.map(msg => ({
    ...msg,
    // Ensure sender is always an object with _id
    sender: typeof msg.sender === 'string' ? { _id: msg.sender } : msg.sender
  }));
  // return handleResponse(response);
};