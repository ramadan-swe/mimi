import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Shield, Star, Clock } from 'lucide-react';
import BentoGrid from '../components/home/BentoGrid';
import FeaturedCarousel from '../components/home/FeaturedCarousel';
import FAQSection from '../components/home/FAQSection';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    
    return (<div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Rent Cars with <span className="text-yellow-400">Confidence</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Egypt&apos;s most trusted car rental platform. Find verified hosts, premium vehicles, and transparent pricing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/explore">
                                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 text-lg">
                                    Explore All Cars
                                    <ArrowRight className="ml-2 h-5 w-5"/>
                                </Button>
                            </Link>
                            <Link to={isAuthenticated ? "/create-listing" : "/signup"}>
                                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 text-lg backdrop-blur-sm">
                                    List Your Car
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-400"/>
                                <p className="font-semibold">Verified Hosts</p>
                                <p className="text-sm text-blue-100">Identity & phone verified</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-400"/>
                                <p className="font-semibold">Waseet Score</p>
                                <p className="text-sm text-blue-100">Transparent trust rating</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-400"/>
                                <p className="font-semibold">60-Day Trial</p>
                                <p className="text-sm text-blue-100">List your first car free</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Grid - AI Discovery */}
            <BentoGrid />

            {/* Featured Carousel */}
            <FeaturedCarousel />

            {/* FAQ Section */}
            <FAQSection />

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of renters and hosts across Egypt
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/explore">
                            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8">
                                Browse Cars
                            </Button>
                        </Link>
                        <Link to={isAuthenticated ? "/create-listing" : "/signup"}>
                            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 backdrop-blur-sm">
                                Become a Host
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>);
}
