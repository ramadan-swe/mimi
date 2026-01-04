import { useParams } from 'react-router-dom';
import { mockListings, mockReviews, getWaseetScoreBadgeStyle } from '../../lib/mockData';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Shield, Star, Crown, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
export default function ListingDetailPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) {
        return <div className="p-8 text-center">Listing not found</div>;
    }
    const waseetScore = listing.waseet_score || listing.owner.waseet_score || 0;
    const isEliteHost = waseetScore >= 91;
    const handleRequestRental = () => {
        if (!user?.is_verified_identity) {
            toast.error('Please verify your identity to rent a car');
            return;
        }
        toast.success('Rental request sent!');
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
            <img src={listing.main_image} alt={listing.title} className="w-full h-full object-cover"/>
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
                <p className="font-semibold">{listing.brand}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Model</p>
                <p className="font-semibold">{listing.model}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Year</p>
                <p className="font-semibold">{listing.year}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Transmission</p>
                <p className="font-semibold">{listing.transmission}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fuel Type</p>
                <p className="font-semibold">{listing.fuel_type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Seats</p>
                <p className="font-semibold">{listing.seats}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((feature) => (<Badge key={feature} variant="secondary">{feature}</Badge>))}
              </div>
            </div>
          </Card>

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {mockReviews.filter(r => r.listing_id === id).map((review) => (<div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {review.reviewer.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{review.reviewer.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Pricing Card */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600">{listing.price_per_day} EGP</span>
                  <span className="text-gray-600">/day</span>
                </div>
                {listing.price_per_week && (<p className="text-sm text-gray-600 mt-1">
                    {listing.price_per_week} EGP/week
                  </p>)}
              </div>

              <Button className="w-full mb-4" size="lg" onClick={handleRequestRental} disabled={!isAuthenticated || !user?.is_verified_identity}>
                <Calendar className="h-5 w-5 mr-2"/>
                Request Rental
              </Button>

              {!user?.is_verified_identity && isAuthenticated && (<p className="text-xs text-red-600 text-center">
                  Please verify your identity to rent
                </p>)}
            </Card>

            {/* Owner Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hosted by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg">
                  {listing.owner.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{listing.owner.name}</p>
                  {isEliteHost && (<Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs mt-1">
                      <Crown className="h-3 w-3 mr-1"/>
                      Elite Host
                    </Badge>)}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Waseet Score</span>
                  <span className="font-semibold">{listing.owner.waseet_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold">{listing.owner.response_rate}%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Profile
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>);
}
