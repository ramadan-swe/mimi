import { Card } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Crown, MapPin } from 'lucide-react';
import { mockListings } from '../../../lib/mockData';
import { Link } from 'react-router-dom';
function FeaturedCarCard({ listing }) {
    return (<Link to={`/listings/${listing.id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="relative h-48">
                    <img src={listing.main_image} alt={listing.title} className="w-full h-full object-cover"/>
                    {listing.el_basha_badge && (<div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Crown className="h-4 w-4"/>
                            <span className="text-xs font-bold">El-Basha</span>
                        </div>)}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {listing.waseet_score}
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{listing.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1"/>
                        <span>{listing.governorate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{listing.price_per_day} EGP</p>
                            <p className="text-xs text-gray-500">per day</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">⭐ {listing.avg_rating}</p>
                            <p className="text-xs text-gray-500">{listing.review_count} reviews</p>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>);
}
export default function FeaturedCarousel() {
    // Filter for top-tier listings (Waseet Score 90-100)
    const featuredListings = mockListings.filter(listing => listing.waseet_score >= 90);
    if (featuredListings.length === 0) {
        return null;
    }
    return (<div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full mb-4">
                        <Crown className="h-5 w-5"/>
                        <span className="font-bold">Elite Selection</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Top-Rated Premium Vehicles
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Handpicked vehicles from our highest-rated hosts (Waseet Score 90-100)
                    </p>
                </div>

                <Carousel opts={{
            align: 'start',
            loop: true,
        }} className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {featuredListings.map((listing) => (<CarouselItem key={listing.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <FeaturedCarCard listing={listing}/>
                            </CarouselItem>))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious />
                        <CarouselNext />
                    </div>
                </Carousel>
            </div>
        </div>);
}
