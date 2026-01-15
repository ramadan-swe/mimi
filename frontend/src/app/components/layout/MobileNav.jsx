import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, Plus, MessageSquare, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { chatAPI } from '../../../lib/api/chat';
import { rentalsAPI } from '../../../lib/api';

export default function MobileNav() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const isActive = (path) => location.pathname === path;

    useEffect(() => {
      if (isAuthenticated) {
        fetchUnreadCount();
        fetchPendingRequestsCount();
        const interval = setInterval(() => {
          fetchUnreadCount();
          fetchPendingRequestsCount();
        }, 10000);
        return () => clearInterval(interval);
      }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
      try {
        const data = await chatAPI.getUnreadCount();
        setUnreadCount(data.unread_count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    const fetchPendingRequestsCount = async () => {
      try {
        const data = await rentalsAPI.getPendingCount();
        setPendingRequestsCount(data.pending_count || 0);
      } catch (error) {
        console.error('Error fetching pending requests count:', error);
      }
    };

    return (<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {/* Explore */}
        <Link to="/" className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/') ? 'text-blue-600' : 'text-gray-600'}`}>
          <Home className="h-6 w-6"/>
          <span className="text-xs mt-1">Explore</span>
        </Link>

        {/* Dashboard / Requests */}
        <Link to="/dashboard?tab=requests" className={`flex flex-col items-center justify-center flex-1 h-full relative ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'}`}>
          <Bell className="h-6 w-6"/>
          <span className="text-xs mt-1">Requests</span>
          {pendingRequestsCount > 0 && (
            <Badge className="absolute top-2 right-6 h-4 w-4 flex items-center justify-center p-0 bg-orange-500 text-xs">
              {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
            </Badge>
          )}
        </Link>

        {/* Add Listing */}
        <Link to="/create-listing" className="flex flex-col items-center justify-center flex-1 h-full -mt-8">
          <div className="bg-blue-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
            <Plus className="h-8 w-8"/>
          </div>
        </Link>

        {/* Chat */}
        <Link to="/chat" className={`flex flex-col items-center justify-center flex-1 h-full relative ${isActive('/chat') ? 'text-blue-600' : 'text-gray-600'}`}>
          <MessageSquare className="h-6 w-6"/>
          <span className="text-xs mt-1">Chats</span>
          {unreadCount > 0 && (
            <Badge className="absolute top-2 right-6 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Link>

        {/* Profile */}
        <Link to="/profile" className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600'}`}>
          <User className="h-6 w-6"/>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>);
}
