import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { listingsAPI, reviewsAPI } from '../../lib/api';
import { chatAPI } from '../../lib/api/chat';
import { getWaseetScoreBadgeStyle } from '../../lib/mockData';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Shield, Star, Crown, Calendar, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RentalDatePicker from '../components/listings/RentalDatePicker';
import { toast } from 'react-hot-toast';

export default function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [listing, setListing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactingOwner, setContactingOwner] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch listing data - response is already the data (interceptor extracts .data)
                const listing = await listingsAPI.getById(id);
                setListing(listing);
                
                // Try to fetch reviews (may not exist yet)
                try {
                    const reviewsRes = await reviewsAPI.getByListing(id);
                    setReviews(reviewsRes?.results || reviewsRes || []);
                } catch (reviewErr) {
                    console.warn('Reviews not available:', reviewErr);
                    setReviews([]);
                }
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError('Failed to load listing');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !listing) {
        return <div className="p-8 text-center text-red-600">{error || 'Listing not found'}</div>;
    }

    const vehicle = listing.vehicle || {};
    const waseetScore = listing.owner?.waseet_score || 0;
    const isEliteHost = waseetScore >= 91;

    // Get features from vehicle extras
    const features = vehicle.extras 
        ? Object.entries(vehicle.extras).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' '))
        : [];

    // Get main image from listing images
    const mainImage = listing.images?.find(img => img.image_type === 'MAIN')?.image 
        || listing.images?.[0]?.image 
        || '/placeholder-car.jpg';

    const handleContactOwner = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to contact the owner');
            navigate('/login');
            return;
        }

        if (listing.owner?.id === user?.id) {
            toast.error('You cannot message yourself');
            return;
        }

        setContactingOwner(true);
        try {
            const chatRoom = await chatAPI.createOrGetChatRoom(listing.id);
            navigate(`/chat/${chatRoom.id}`);
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Failed to start conversation. Please try again.');
        } finally {
            setContactingOwner(false);
        }
    };

    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
            <img src={mainImage} alt={listing.title} className="w-full h-full object-cover"/>
          </div>

          {/* Title & Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5"/>
                    <span>{listing.city}, {listing.governorate}</span>
                  </div>
                  {listing.avg_rating && (<div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>
                      <span className="font-semibold">{listing.avg_rating}</span>
                      <span>({listing.review_count} reviews)</span>
                    </div>)}
                </div>
              </div>
              <Badge className={getWaseetScoreBadgeStyle(waseetScore)}>
                <Shield className="h-4 w-4 mr-1"/>
                Score: {waseetScore}
              </Badge>
            </div>
          </div>

          {/* Specifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Brand</p>
                <p className="font-semibold">{vehicle.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Model</p>
                <p className="font-semibold">{vehicle.model || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Year</p>
                <p className="font-semibold">{vehicle.year || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Transmission</p>
                <p className="font-semibold">{vehicle.transmission || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fuel Type</p>
                <p className="font-semibold">{vehicle.fuel_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Seats</p>
                <p className="font-semibold">{vehicle.seats || 'N/A'}</p>
              </div>
            </div>

            {features.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (<Badge key={feature} variant="secondary">{feature}</Badge>))}
              </div>
            </div>
            )}
          </Card>

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
              reviews.map((review) => (<div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {review.reviewer_name?.[0] || review.reviewer?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{review.reviewer_name || review.reviewer?.name || 'User'}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>)))
}</div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Rental Date Picker Card */}
            {isAuthenticated && user?.is_verified_identity ? (
              <RentalDatePicker 
                listing={listing} 
                onSuccess={() => {
                  // Optionally redirect or refresh
                }}
              />
            ) : (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">{listing.daily_price} EGP</span>
                    <span className="text-gray-600">/day</span>
                  </div>
                  {listing.weekly_discount > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {listing.weekly_discount}% off for weekly rentals
                    </p>
                  )}
                </div>

                <Button className="w-full mb-4" size="lg" disabled>
                  <Calendar className="h-5 w-5 mr-2"/>
                  Request Rental
                </Button>

                <Button 
                  className="w-full mb-4" 
                  size="lg"
                  variant="outline"
                  onClick={handleContactOwner}
                  disabled={contactingOwner || !isAuthenticated || listing.owner?.id === user?.id}
                >
                  <MessageCircle className="h-5 w-5 mr-2"/>
                  {contactingOwner ? 'Starting...' : 'Contact Owner'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-amber-600 text-center">
                    Please log in to rent this car
                  </p>
                )}
                {isAuthenticated && !user?.is_verified_identity && (
                  <p className="text-xs text-red-600 text-center">
                    Please verify your identity to rent
                  </p>
                )}
              </Card>
            )}

            {/* Owner Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hosted by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg">
                  {listing.owner_name?.[0] || listing.owner?.name?.[0] || 'H'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{listing.owner_name || listing.owner?.name || 'Host'}</p>
                  {isEliteHost && (<Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs mt-1">
                      <Crown className="h-3 w-3 mr-1"/>
                      Elite Host
                    </Badge>)}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Waseet Score</span>
                  <span className="font-semibold">{waseetScore}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate(`/user/${listing.owner?.id}`)}
              >
                View Profile
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>);
}
