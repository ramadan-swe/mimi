import React from 'react';
import { format } from 'date-fns';

const ChatWindow = ({ messages, currentUser, otherUser, listing, messagesEndRef }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {/* Chat Header */}
      {otherUser && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{otherUser.username}</h3>
                {listing && (
                  <p className="text-sm text-gray-500">{listing.title}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.sender.id === currentUser.id;
          
          return (
            <div key={message.id} className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <p className="text-xs text-gray-500 mb-1 px-1">{message.sender.username}</p>
                )}
                <div className={`px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`flex justify-between items-center mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    <span className="text-xs">{formatTimestamp(message.created_at)}</span>
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
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;