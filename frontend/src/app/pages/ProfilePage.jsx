import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, Phone, CheckCircle, Crown, Loader2 } from 'lucide-react';
import { getWaseetScoreBadgeStyle } from '../../lib/mockData';
export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.auth.getProfile();
        setProfile(profile);
        // console.log(profile);
      } catch (error) {
          console.error('Failed to fetch profile:', error);
      } finally {
          setIsLoading(false);
        }
    };
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  if (isLoading) {
    return (<div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>);
  }

  const waseetScore = user.waseet_score || 0;
  const isEliteHost = waseetScore >= 91;

  return (<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold mb-8">Profile</h1>

    <div className="space-y-6">
      {/* Personal Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">First Name</p>
              <p className="font-semibold">{user.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Name</p>
              <p className="font-semibold">{user.last_name}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{profile.phone_number || 'Not provided'}</p>
              {user.phone_verified && (<Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>)}
            </div>
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          Edit Profile
        </Button>
      </Card>

      {/* Verification Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold">Phone Verification</p>
                <p className="text-sm text-gray-600">WhatsApp OTP verification</p>
              </div>
            </div>
            {user.phone_verified ? (<Badge className="bg-green-500">Verified</Badge>) : (<Button size="sm">Verify Now</Button>)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold">Identity Verification</p>
                <p className="text-sm text-gray-600">National ID & Driver's License</p>
              </div>
            </div>
            {user.is_verified_identity ? (<Badge className="bg-green-500">Verified</Badge>) : (<Button size="sm">Verify Now</Button>)}
          </div>
        </div>
      </Card>

      {/* Waseet Score */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Waseet Score</h2>
        <div className="text-center py-6">
          <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${getWaseetScoreBadgeStyle(waseetScore)}`}>
            {isEliteHost && <Crown className="h-6 w-6 inline mr-2" />}
            <Shield className="h-6 w-6 inline mr-2" />
            {waseetScore}
          </div>
          {isEliteHost && (<Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white mt-4">
            <Crown className="h-4 w-4 mr-1" />
            Elite Host Status
          </Badge>)}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average Rating</span>
            <span className="font-semibold">×40 = {Math.round((waseetScore / 100) * 40)} points</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Response Rate (92%)</span>
            <span className="font-semibold">×30 = {Math.round((92 / 100) * 30)} points</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completion Rate (88%)</span>
            <span className="font-semibold">×30 = {Math.round((88 / 100) * 30)} points</span>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Subscription</h2>
            <p className="text-gray-600 mt-1">
              Current Plan: {user.current_subscription?.tier || 'Free Trial'}
            </p>
          </div>
          <Button>Upgrade</Button>
        </div>
      </Card>
    </div>
  </div>);
}
