// frontend/src/components/chat/ChatRoomList.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatRoomList = ({ rooms, selectedRoom, onSelectRoom, currentUser }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {rooms?.map((room) => {
          const otherUser = room.renter.id === currentUser.id ? room.owner : room.renter;
          const lastMessage = room.last_message;
          const isUnread = room.unread_count && room.unread_count[currentUser.id] > 0;

          return (
            <div
              key={room.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                }`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser.username}
                    </p>
                    {room.updated_at && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {lastMessage?.content || 'No messages yet'}
                    </p>

                    {isUnread && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {room.unread_count[currentUser.id]}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {room.listing?.title || 'Property listing'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a conversation by messaging a property owner
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomList;