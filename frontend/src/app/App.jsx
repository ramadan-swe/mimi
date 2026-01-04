import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
// Layout Components
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import ScrollToTop from './components/layout/ScrollToTop';
// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ListingDetailPage from './pages/ListingDetailPage';
import OwnerDashboard from './pages/OwnerDashboard';
import CreateListingPage from './pages/CreateListingPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }
    return <>{children}</>;
};
function AppRoutes() {
    const { isAuthenticated } = useAuth();
    return (<div className="min-h-screen bg-gray-50">
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Desktop Navigation - Always show */}
      {/* Mobile Navigation - Show only when NOT authenticated */}
      <div className={isAuthenticated ? 'hidden md:block' : 'block mb-16'}>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/explore" element={<ExplorePage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/signup" element={<SignUpPage />}/>
          <Route path="/listings/:id" element={<ListingDetailPage />}/>

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>}/>
          <Route path="/create-listing" element={<ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>}/>
          <Route path="/chat" element={<ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>}/>
          <Route path="/chat/:rentalId" element={<ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>}/>
          <Route path="/subscription" element={<ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>}/>
        </Routes>
      </main>

      {/* Mobile Navigation */}
      {isAuthenticated && (<div className="md:hidden">
          <MobileNav />
        </div>)}

      <Toaster />
    </div>);
}
export default function App() {
    return (<AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>);
}
