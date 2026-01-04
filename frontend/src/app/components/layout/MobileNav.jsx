import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { Badge } from '../ui/badge';
export default function MobileNav() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    return (<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {/* Explore */}
        <Link to="/" className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/') ? 'text-blue-600' : 'text-gray-600'}`}>
          <Home className="h-6 w-6"/>
          <span className="text-xs mt-1">Explore</span>
        </Link>

        {/* Search */}
        <Link to="/?search=true" className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/search') ? 'text-blue-600' : 'text-gray-600'}`}>
          <Search className="h-6 w-6"/>
          <span className="text-xs mt-1">Search</span>
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
          <Badge className="absolute top-2 right-6 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-xs">
            2
          </Badge>
        </Link>

        {/* Profile */}
        <Link to="/profile" className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600'}`}>
          <User className="h-6 w-6"/>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>);
}
