import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext'; // Up to src, then contexts
import { Toaster } from './components/ui/sonner'; // Inside app folder
import { Toaster as HotToaster } from 'react-hot-toast';

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
import UserProfilePage from './pages/UserProfilePage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <div className="block mb-16 font-sans">
        <Navbar />
      </div>
      <main className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {isAuthenticated && <div className="md:hidden"><MobileNav /></div>}
      <Toaster position="top-center" richColors />
      <HotToaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}