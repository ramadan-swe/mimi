// frontend/src/app/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { useAuth } from '../../contexts/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });

  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    try {
      const response = await api.get('/chat/rooms/');
      setRooms(response.data);
      if (response.data.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      // Fallback to mock data
      setRooms(getMockRooms());
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!selectedRoom || !content.trim() || !user) return;
    
    try {
      const response = await api.post('/chat/messages/', {
        chat_room: selectedRoom.id,
        content: content
      });
      
      setMessages(prev => [...prev, response.data]);
      
      // Update room's last message
      setRooms(prev => prev.map(room => {
        if (room.id === selectedRoom.id) {
          return {
            ...room,
            updated_at: new Date().toISOString(),
            last_message: content
          };
        }
        return room;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mock data fallback
  const getMockRooms = () => {
    return [
      {
        id: 1,
        renter: { id: 1, username: 'Ahmed Mohamed' },
        owner: { id: 2, username: 'محمد صاحب العقار' },
        listing: { id: 1, title: 'شقة في التجمع الخامس' },
        updated_at: new Date().toISOString()
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 border-r border-gray-200">
        <ChatRoomList
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          currentUser={user}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <ChatWindow
              messages={messages}
              currentUser={user}
              otherUser={
                selectedRoom.renter.id === user.id 
                  ? selectedRoom.owner 
                  : selectedRoom.renter
              }
              messagesEndRef={messagesEndRef}
            />
            
            <ChatInput onSendMessage={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                لا توجد محادثات
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ محادثة جديدة من صفحة العقار
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;