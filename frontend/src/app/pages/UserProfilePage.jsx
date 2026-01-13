import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { listingsAPI } from '../../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Crown, Car, Loader2, ArrowLeft } from 'lucide-react';
import { getWaseetScoreBadgeStyle } from '../../lib/mockData';
import CarCard from '../components/listings/CarCard';

export default function UserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Fetch user profile
                const userData = await apiClient.users.getById(userId);
                setUser(userData);

                // Fetch user's listings
                const listingsData = await listingsAPI.getAll({ owner: userId });
                setListings(listingsData?.results || listingsData || []);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
                <div className="p-8 text-center text-red-600">{error || 'User not found'}</div>
            </div>
        );
    }

    const waseetScore = user.waseet_score || 0;
    const isEliteHost = waseetScore >= 91;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const memberSince = user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-24">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-semibold mb-4">
                                {userName[0]?.toUpperCase() || 'U'}
                            </div>
                            <h1 className="text-2xl font-bold">{userName}</h1>
                            {isEliteHost && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white mt-2">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Elite Host
                                </Badge>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600">Waseet Score</span>
                                <Badge className={getWaseetScoreBadgeStyle(waseetScore)}>
                                    {waseetScore}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600">Total Listings</span>
                                <span className="font-semibold">{listings.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600">Member Since</span>
                                <span className="font-semibold">{memberSince}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Listings */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {userName}'s Listings ({listings.length})
                    </h2>

                    {listings.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                            <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No listings available</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {listings.map((listing) => (
                                <CarCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
