import React from 'react';
import { format } from 'date-fns';

const ChatWindow = ({ messages, currentUser, otherUser, otherUserTyping, messagesEndRef }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return format(date, 'HH:mm');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">Send a message to start</p>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUser.id;
          
          return (
            <div key={message.id} className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                <div className={`px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex justify-between mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    <span className="text-xs">{formatTimestamp(message.timestamp)}</span>
                    {isOwnMessage && (
                      <span className="text-xs ml-2">{message.is_read ? '✓✓' : '✓'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {otherUserTyping && (
        <div className="flex mb-4 justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600">{otherUser?.username} is typing...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
