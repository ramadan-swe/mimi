import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Fuel, Users, Star, Shield, Crown } from 'lucide-react';
import { getWaseetScoreBadgeStyle } from '../../../lib/mockData';
/**
 * Car Card Component
 *
 * Displays listing with:
 * - Main image (clickable)
 * - Title (Brand + Model + Year)
 * - Price/Day (EGP)
 * - Location (Governorate, City)
 * - Waseet Score Badge (0-100, color-coded)
 * - Quick stats: Transmission, Fuel Type, Seats
 */
export default function CarCard({ listing }) {
    const vehicle = listing.vehicle || {};
    const waseetScore = listing.waseet_score || listing.owner?.waseet_score || 0;
    const isEliteHost = waseetScore >= 91;
    
    // Get main image from listing images
    const mainImage = listing.images?.find(img => img.image_type === 'MAIN')?.image 
        || listing.images?.[0]?.image 
        || listing.main_image
        || '/placeholder-car.jpg';
    
    // Get price (API uses daily_price, mock uses price_per_day)
    const price = listing.daily_price || listing.price_per_day || 0;
    
    // Get vehicle details
    const transmission = vehicle.transmission || listing.transmission || 'N/A';
    const fuelType = vehicle.fuel_type || listing.fuel_type || 'N/A';
    const seats = vehicle.seats || listing.seats || 'N/A';
    const category = vehicle.category || listing.category || '';
    
    // Get owner name
    const ownerName = listing.owner_name || listing.owner?.name || 'Host';

    return (<Link to={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img src={mainImage} alt={listing.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
          
          {/* Waseet Score Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg flex items-center gap-1 ${getWaseetScoreBadgeStyle(waseetScore)}`}>
              {isEliteHost && <Crown className="h-4 w-4"/>}
              <Shield className="h-4 w-4"/>
              {waseetScore}
            </div>
          </div>

          {/* Category Badge */}
          {category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-gray-900 hover:bg-white">
              {category}
            </Badge>
          </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & Price */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {price} EGP
                </span>
                <span className="text-sm text-gray-500"> /day</span>
              </div>
              {listing.avg_rating && (<div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                  <span className="font-semibold">{listing.avg_rating}</span>
                  <span className="text-gray-500">({listing.review_count})</span>
                </div>)}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <MapPin className="h-4 w-4"/>
            <span>{listing.city}, {listing.governorate}</span>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4"/>
              <span>{fuelType}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚙️</span>
              <span>{transmission}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4"/>
              <span>{seats}</span>
            </div>
          </div>

          {/* Owner Info */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Hosted by <span className="font-medium text-gray-900">{ownerName}</span>
              </span>
              {isEliteHost && (<Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs">
                  <Crown className="h-3 w-3 mr-1"/>
                  Elite
                </Badge>)}
            </div>
          </div>
        </div>
      </Card>
    </Link>);
}
