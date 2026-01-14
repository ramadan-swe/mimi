// frontend/src/lib/api/chat.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const chatAPI = {
  // Get all chat rooms for the current user
  getChatRooms: async () => {
    const response = await axios.get(`${API_URL}/api/chat/rooms/`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Get or create a chat room for a listing
  createOrGetChatRoom: async (listingId) => {
    const response = await axios.post(
      `${API_URL}/api/chat/rooms/create_or_get/`,
      { listing_id: listingId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get messages for a specific chat room
  getMessages: async (roomId) => {
    const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}/messages/`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Send a message
  sendMessage: async (chatRoomId, content) => {
    const response = await axios.post(
      `${API_URL}/api/chat/messages/`,
      {
        chat_room: chatRoomId,
        content: content
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Mark messages as read in a chat room
  markAsRead: async (roomId) => {
    const response = await axios.post(
      `${API_URL}/api/chat/rooms/${roomId}/mark_read/`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/api/chat/unread-count/`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};
