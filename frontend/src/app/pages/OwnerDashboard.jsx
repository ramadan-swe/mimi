import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Calendar as CalendarIcon, MessageSquare, Loader2, Car, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { listingsAPI, rentalsAPI } from '../../lib/api';
import { chatAPI } from '../../lib/api/chat';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Calendar Tab Component
function CalendarTab({ listings, requests }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedListing, setSelectedListing] = useState('all');
    const [selectedDay, setSelectedDay] = useState(null);

    // Filter only accepted requests (confirmed bookings)
    const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');

    // Filter requests by selected listing
    const filteredRequests = selectedListing === 'all' 
        ? acceptedRequests 
        : acceptedRequests.filter(r => {
            const listingId = r.listing_details?.id || r.listing?.id || r.listing;
            return String(listingId) === String(selectedListing);
        });

    // Get bookings for a specific day
    const getBookingsForDay = (day) => {
        return filteredRequests.filter(request => {
            try {
                const start = parseISO(request.start_date);
                const end = parseISO(request.end_date);
                return isWithinInterval(day, { start, end });
            } catch {
                return false;
            }
        });
    };

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the starting day of week (0 = Sunday)
    const startDayOfWeek = monthStart.getDay();

    // Create empty slots for days before month starts
    const emptySlots = Array(startDayOfWeek).fill(null);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day) => {
        const bookings = getBookingsForDay(day);
        if (bookings.length > 0) {
            setSelectedDay({ date: day, bookings });
        } else {
            setSelectedDay(null);
        }
    };

    // Get listing title by id
    const getListingTitle = (request) => {
        const listing = request.listing_details || request.listing;
        return listing?.title || 'Unknown Car';
    };

    // Get color for listing (for visual distinction)
    const getListingColor = (request) => {
        const listingId = request.listing_details?.id || request.listing?.id || request.listing;
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
        const index = listings.findIndex(l => String(l.id) === String(listingId));
        return colors[index % colors.length] || 'bg-gray-500';
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Listing Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Filter by car:</span>
                        <Select value={selectedListing} onValueChange={setSelectedListing}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Cars" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cars</SelectItem>
                                {listings.map(listing => (
                                    <SelectItem key={listing.id} value={String(listing.id)}>
                                        {listing.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="border rounded-lg overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                        {/* Empty slots */}
                        {emptySlots.map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[100px] p-2 border-b border-r bg-gray-50" />
                        ))}
                        
                        {/* Actual days */}
                        {calendarDays.map(day => {
                            const bookings = getBookingsForDay(day);
                            const isToday = isSameDay(day, new Date());
                            const isSelected = selectedDay && isSameDay(day, selectedDay.date);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleDayClick(day)}
                                    className={`min-h-[100px] p-2 border-b border-r cursor-pointer hover:bg-gray-50 transition-colors
                                        ${isToday ? 'bg-blue-50' : ''}
                                        ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    {/* Booking indicators */}
                                    <div className="mt-1 space-y-1">
                                        {bookings.slice(0, 3).map((booking, idx) => (
                                            <div
                                                key={`${booking.id}-${idx}`}
                                                className={`text-xs px-2 py-1 rounded text-white truncate ${getListingColor(booking)}`}
                                                title={`${getListingTitle(booking)} - ${booking.renter_name || 'Renter'}`}
                                            >
                                                {getListingTitle(booking)}
                                            </div>
                                        ))}
                                        {bookings.length > 3 && (
                                            <div className="text-xs text-gray-500 px-2">
                                                +{bookings.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                {listings.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        <span className="text-sm text-gray-600">Legend:</span>
                        {listings.map((listing, index) => {
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                            return (
                                <div key={listing.id} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`} />
                                    <span className="text-sm">{listing.title}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Selected Day Details */}
            {selectedDay && selectedDay.bookings.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Bookings for {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-3">
                        {selectedDay.bookings.map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${getListingColor(booking)}`}>
                                        <Car className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{getListingTitle(booking)}</p>
                                        <p className="text-sm text-gray-600">
                                            Rented by {booking.renter_name || 'Renter'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{booking.total_price} EGP</p>
                                    <p className="text-sm text-gray-600">
                                        {booking.start_date} → {booking.end_date}
                                    </p>
                                </div>
                                <Link to={`/chat/${booking.id}`}>
                                    <Button variant="outline" size="sm">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Chat
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {acceptedRequests.length === 0 && (
                <Card className="p-12 text-center">
                    <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No confirmed bookings yet</h3>
                    <p className="text-gray-600">
                        Accepted rental requests will appear on this calendar
                    </p>
                </Card>
            )}
        </div>
    );
}

export default function OwnerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const userId = user?.id || user?.user_id;
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestsLoading, setRequestsLoading] = useState(true);

    // Fetch owner's listings
    useEffect(() => {
        let cancelled = false;
        
        const fetchListings = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const data = await listingsAPI.getAll({ owner: userId });
                if (!cancelled) {
                    setListings(data?.results || data || []);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching listings:', err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        
        fetchListings();
        return () => { cancelled = true; };
    }, [userId]);

    // Fetch incoming rental requests
    useEffect(() => {
        let cancelled = false;
        
        const fetchRequests = async () => {
            try {
                const data = await rentalsAPI.getIncoming();
                if (!cancelled) {
                    const requestsList = data?.results || data || [];
                    // Deduplicate by id
                    const uniqueRequests = requestsList.filter((req, index, self) =>
                        index === self.findIndex(r => r.id === req.id)
                    );
                    setRequests(uniqueRequests);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching requests:', err);
                }
            } finally {
                if (!cancelled) {
                    setRequestsLoading(false);
                }
            }
        };
        
        fetchRequests();
        return () => { cancelled = true; };
    }, []);

    const handleAcceptRequest = async (id) => {
        try {
            await rentalsAPI.accept(id);
            setRequests(requests.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
            toast.success('Rental request accepted!');
        } catch (err) {
            console.error('Error accepting request:', err);
            toast.error('Failed to accept request');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            await rentalsAPI.reject(id);
            setRequests(requests.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
            toast.success('Rental request rejected');
        } catch (err) {
            console.error('Error rejecting request:', err);
            toast.error('Failed to reject request');
        }
    };

    const handleDeleteListing = async (id) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            await listingsAPI.delete(id);
            setListings(listings.filter(l => l.id !== id));
            toast.success('Listing deleted');
        } catch (err) {
            console.error('Error deleting listing:', err);
            toast.error('Failed to delete listing');
        }
    };

    const handleChatWithRenter = async (request) => {
        try {
            const listingId = request.listing_details?.id || request.listing?.id || request.listing;
            const renterId = request.renter_details?.id || request.renter?.id || request.renter;
            
            const chatRoom = await chatAPI.createOrGetChatRoomForRenter(listingId, renterId);
            navigate(`/chat/${chatRoom.id}`);
        } catch (err) {
            console.error('Error opening chat:', err);
            toast.error('Failed to open chat');
        }
    };

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/create-listing">
          <Button>
            <Plus className="h-5 w-5 mr-2"/>
            Add Listing
          </Button>
        </Link>
      </div>

      <Tabs value={searchParams.get('tab') || 'listings'} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingCount > 0 && (<Badge className="ml-2 bg-red-500">
                {pendingCount}
              </Badge>)}
          </TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : listings.length === 0 ? (
            <Card className="p-12 text-center">
              <Car className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first car listing</p>
              <Link to="/create-listing">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const mainImage = listing.images?.find(img => img.image_type === 'MAIN')?.image 
                  || listing.images?.[0]?.image 
                  || '/placeholder-car.jpg';
                return (
                  <Card key={listing.id} className="p-4">
                    <img src={mainImage} alt={listing.title} className="w-full h-48 object-cover rounded-lg mb-4"/>
                    <h3 className="font-semibold mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{listing.daily_price} EGP/day</p>
                    <Badge className={listing.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
                      {listing.status}
                    </Badge>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/listings/${listing.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rental requests</h3>
              <p className="text-gray-600">When someone requests to rent your car, it will appear here</p>
            </Card>
          ) : (
            requests.map((request) => {
              const listing = request.listing_details || request.listing;
              const renterName = request.renter_name || 'Renter';
              return (
                <Card key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          {renterName[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{renterName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Car</p>
                          <p className="font-semibold">{listing?.title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Dates</p>
                          <p className="font-semibold">
                            {request.start_date} - {request.end_date}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="font-semibold">{request.total_price} EGP</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge className={request.status === 'PENDING'
                    ? 'bg-yellow-500'
                    : request.status === 'ACCEPTED'
                        ? 'bg-green-500'
                        : 'bg-red-500'}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      {request.status === 'PENDING' && (<div className="flex gap-2">
                          <Button onClick={() => handleAcceptRequest(request.id)} className="bg-green-600 hover:bg-green-700">
                            Accept
                          </Button>
                          <Button variant="outline" onClick={() => handleRejectRequest(request.id)}>
                            Reject
                          </Button>
                        </div>)}
                      {request.status === 'ACCEPTED' && (
                          <Button onClick={() => handleChatWithRenter(request)}>
                            <MessageSquare className="h-4 w-4 mr-2"/>
                            Chat with Renter
                          </Button>
                        )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarTab listings={listings} requests={requests} />
        </TabsContent>
      </Tabs>
    </div>);
}
