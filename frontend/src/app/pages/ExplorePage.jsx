import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchHeader from '../components/search/SearchHeader';
import AvailabilityBar from '../components/search/AvailabilityBar';
import FilterSidebar from '../components/search/FilterSidebar';
import CarCard from '../components/listings/CarCard';
import { mockListings } from '../../lib/mockData';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
export default function ExplorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState(mockListings);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    // Read filter params from URL
    const filters = {
        governorate: searchParams.get('governorate') || '',
        price_max: searchParams.get('price_max') || '',
        transmission: searchParams.get('transmission') || '',
        fuel_type: searchParams.get('fuel_type') || '',
        seats: searchParams.get('seats') || '',
        category: searchParams.get('category') || '',
        features: searchParams.get('features') || '',
        waseet_score_min: searchParams.get('waseet_score_min') || '',
    };
    // Read AI search params
    const aiEnabled = searchParams.get('ai_enabled') === 'true';
    const aiQuery = searchParams.get('ai_query') || '';
    useEffect(() => {
        // Apply filters to listings
        let filtered = mockListings;
        if (filters.governorate && filters.governorate !== '#') {
            filtered = filtered.filter(l => l.governorate === filters.governorate);
        }
        if (filters.price_max) {
            filtered = filtered.filter(l => l.price_per_day <= parseInt(filters.price_max));
        }
        if (filters.transmission) {
            const transmissions = filters.transmission.split(',');
            filtered = filtered.filter(l => transmissions.includes(l.transmission));
        }
        if (filters.fuel_type) {
            const fuelTypes = filters.fuel_type.split(',');
            filtered = filtered.filter(l => fuelTypes.includes(l.fuel_type));
        }
        if (filters.category) {
            const categories = filters.category.split(',');
            filtered = filtered.filter(l => categories.includes(l.category));
        }
        if (filters.features) {
            const requiredFeatures = filters.features.split(',');
            filtered = filtered.filter(l => requiredFeatures.every(feature => l.features.includes(feature)));
        }
        if (filters.waseet_score_min) {
            filtered = filtered.filter(l => l.waseet_score >= parseInt(filters.waseet_score_min));
        }
        setListings(filtered);
    }, [searchParams]);
    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== '#') {
                params.set(key, value);
            }
            else {
                params.delete(key);
            }
        });
        setSearchParams(params);
    };
    const handleDateChange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
        const params = new URLSearchParams(searchParams);
        if (start) {
            params.set('start_date', start.toISOString().split('T')[0]);
        }
        else {
            params.delete('start_date');
        }
        if (end) {
            params.set('end_date', end.toISOString().split('T')[0]);
        }
        else {
            params.delete('end_date');
        }
        setSearchParams(params);
    };
    const clearDates = () => {
        handleDateChange(undefined, undefined);
    };
    return (<div className="min-h-screen bg-gray-50">
            {/* Search Header - JIRA-308 */}
            <SearchHeader onSearch={(query, aiEnabled) => {
            console.log('Search:', query, 'AI:', aiEnabled);
            const params = new URLSearchParams(searchParams);
            if (aiEnabled) {
                params.set('ai_enabled', 'true');
                params.set('ai_query', query);
            }
            else {
                params.delete('ai_enabled');
                params.set('q', query);
            }
            setSearchParams(params);
        }} initialQuery={aiQuery} initialAiEnabled={aiEnabled}/>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Availability Bar */}
                <div className="mb-6">
                    <AvailabilityBar startDate={startDate} endDate={endDate} onStartDateChange={(date) => handleDateChange(date, endDate)} onEndDateChange={(date) => handleDateChange(startDate, date)} onClear={clearDates}/>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filter Sidebar - JIRA-309 */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar filters={filters} onFilterChange={handleFilterChange}/>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {listings.length} Cars Available
                            </h2>
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2"/>
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                                    <div className="mt-6">
                                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange}/>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Results Count (Desktop) */}
                        <div className="hidden lg:block mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {listings.length} Cars Available
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Find the perfect car for your journey
                            </p>
                        </div>

                        {/* Active Filters Display */}
                        {(filters.waseet_score_min || filters.category || filters.features) && (<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Active Filters:</p>
                                <div className="flex flex-wrap gap-2">
                                    {filters.waseet_score_min && (<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            Waseet Score ≥ {filters.waseet_score_min}
                                        </span>)}
                                    {filters.category && filters.category.split(',').map(cat => (<span key={cat} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {cat}
                                        </span>))}
                                    {filters.features && filters.features.split(',').map(feat => (<span key={feat} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {feat}
                                        </span>))}
                                </div>
                            </div>)}

                        {/* Listings Grid */}
                        {listings.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing) => (<CarCard key={listing.id} listing={listing}/>))}
                            </div>) : (<div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No cars found matching your criteria</p>
                                <Button variant="outline" className="mt-4" onClick={() => setSearchParams(new URLSearchParams())}>
                                    Clear All Filters
                                </Button>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>);
}
