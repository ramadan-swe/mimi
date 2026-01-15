import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchHeader from '../components/search/SearchHeader';
import AvailabilityBar from '../components/search/AvailabilityBar';
import FilterSidebar from '../components/search/FilterSidebar';
import CarCard from '../components/listings/CarCard';
import { listingsAPI } from '../../lib/api';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const PAGE_SIZE = 20;

export default function ExplorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
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
    const q = searchParams.get('q') || '';

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                // Build API params from URL filters with pagination
                const offset = (currentPage - 1) * PAGE_SIZE;
                const params = { limit: PAGE_SIZE, offset };

                let response;

                // Use AI search endpoint when AI is enabled
                if (aiEnabled && aiQuery) {
                    // Call the explore endpoint with semantic search
                    response = await listingsAPI.aiSearch(aiQuery);
                } else {
                    // Standard listing fetch with filters
                    if (q) {
                        params.search = q;
                    }
                    if (filters.governorate && filters.governorate !== '#') {
                        params.governorate = filters.governorate;
                    }
                    if (filters.transmission) {
                        params.vehicle__transmission = filters.transmission;
                    }
                    if (filters.fuel_type) {
                        params.vehicle__fuel_type = filters.fuel_type;
                    }
                    if (filters.category) {
                        params.vehicle__category = filters.category;
                    }
                    if (filters.seats) {
                        params.vehicle__seats = filters.seats;
                    }
                    if (filters.features) {
                        params.features = filters.features;
                    }

                    response = await listingsAPI.getAll(params);
                }

                let data = response?.results || response || [];
                const count = response?.count || data.length;

                // Client-side filtering for fields not supported by API
                if (filters.price_max) {
                    data = data.filter(l => parseFloat(l.daily_price) <= parseInt(filters.price_max));
                }

                // Filter by waseet_score_min
                if (filters.waseet_score_min) {
                    const minScore = parseInt(filters.waseet_score_min);
                    data = data.filter(l => (l.owner?.waseet_score || 0) >= minScore);
                }

                setListings(data);
                setTotalCount(count);
            } catch (error) {
                console.error('Error fetching listings:', error);
                setListings([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [searchParams, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchParams]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
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
        }} initialQuery={aiQuery} initialAiEnabled={aiEnabled} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Availability Bar */}
            <div className="mb-6">
                <AvailabilityBar startDate={startDate} endDate={endDate} onStartDateChange={(date) => handleDateChange(date, endDate)} onEndDateChange={(date) => handleDateChange(startDate, date)} onClear={clearDates} />
            </div>

            <div className="flex gap-8">
                {/* Desktop Filter Sidebar - JIRA-309 */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-24">
                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            {totalCount} Cars Available
                        </h2>
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                                <div className="mt-6">
                                    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Results Count (Desktop) */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {totalCount} Cars Available
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
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : listings.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing) => (<CarCard key={listing.id} listing={listing} />))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, current, and nearby pages
                                                return page === 1 ||
                                                    page === totalPages ||
                                                    Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, index, arr) => (
                                                <span key={page} className="flex items-center">
                                                    {index > 0 && arr[index - 1] !== page - 1 && (
                                                        <span className="px-2 text-gray-400">...</span>
                                                    )}
                                                    <Button
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                        className="min-w-[40px]"
                                                    >
                                                        {page}
                                                    </Button>
                                                </span>
                                            ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Page info */}
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} cars
                            </p>
                        </>
                    ) : (<div className="text-center py-12">
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
