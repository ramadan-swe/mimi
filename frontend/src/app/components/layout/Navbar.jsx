import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Bell, MessageSquare, User, LogOut, Car } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (<nav className="bg-white border-b border-gray-200 fixed right-0 left-0 top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600"/>
            <span className="text-2xl font-bold text-gray-900">Mimi</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center md:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Explore
            </Link>

            {isAuthenticated ? (<>
                {/* Messages */}
                <Link to="/chat" className="relative text-gray-700 hover:text-gray-900">
                  <MessageSquare className="h-6 w-6"/>
                  {/* Unread badge - example */}
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                    2
                  </Badge>
                </Link>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative text-gray-700 hover:text-gray-900">
                      <Bell className="h-6 w-6"/>
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                        3
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">Notifications</h3>
                      <div className="space-y-2">
                        <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="text-sm">New rental request received</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="text-sm">Your request was accepted!</p>
                          <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                        <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="text-sm">New message from Ahmed</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full mt-2" size="sm">
                        View all notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <span className="hidden lg:block">{user?.first_name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.waseet_score && (<div className="mt-1">
                          <span className="text-xs font-medium">Waseet Score: {user.waseet_score}</span>
                        </div>)}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2"/>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Car className="h-4 w-4 mr-2"/>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      Subscription
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2"/>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>) : (<div className="flex items-center">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>)}
          </div>
        </div>
      </div>
    </nav>);
}
