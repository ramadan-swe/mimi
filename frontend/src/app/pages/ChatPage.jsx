// frontend/src/app/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../lib/api/chat';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (roomId && rooms.length > 0) {
      // If we have a roomId in the URL, select that room
      const room = rooms.find(r => r.id === parseInt(roomId));
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [roomId, rooms]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      markAsRead(selectedRoom.id);
      
      // Set up polling for new messages every 3 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(selectedRoom.id);
      }, 3000);
      
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      const data = await chatAPI.getChatRooms();
      setRooms(data.results || data || []);
      
      if ((data.results || data).length > 0 && !selectedRoom && !roomId) {
        setSelectedRoom((data.results || data)[0]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const data = await chatAPI.getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (roomId) => {
    try {
      await chatAPI.markAsRead(roomId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!selectedRoom || !content.trim() || !user) return;

    try {
      const newMessage = await chatAPI.sendMessage(selectedRoom.id, content);
      setMessages(prev => [...prev, newMessage]);

      // Update room's last message and move to top
      setRooms(prev => {
        const updatedRooms = prev.map(room => {
          if (room.id === selectedRoom.id) {
            return {
              ...room,
              updated_at: new Date().toISOString(),
              last_message: {
                content: content,
                created_at: newMessage.created_at,
                sender_id: user.id
              }
            };
          }
          return room;
        });
        
        // Sort to move updated room to top
        return updatedRooms.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        );
      });

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
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
              listing={selectedRoom.listing}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput onSendMessage={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                No conversations yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start a conversation by messaging a property owner
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;