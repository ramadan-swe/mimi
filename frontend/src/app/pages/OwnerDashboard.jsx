import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { mockListings, mockRentalRequests } from '../../lib/mockData';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
export default function OwnerDashboard() {
    const [requests, setRequests] = useState(mockRentalRequests);
    const handleAcceptRequest = (id) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
        toast.success('Rental request accepted!');
    };
    const handleRejectRequest = (id) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
        toast.success('Rental request rejected');
    };
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

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requests.filter(r => r.status === 'PENDING').length > 0 && (<Badge className="ml-2 bg-red-500">
                {requests.filter(r => r.status === 'PENDING').length}
              </Badge>)}
          </TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.slice(0, 3).map((listing) => (<Card key={listing.id} className="p-4">
                <img src={listing.main_image} alt={listing.title} className="w-full h-48 object-cover rounded-lg mb-4"/>
                <h3 className="font-semibold mb-2">{listing.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{listing.price_per_day} EGP/day</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Delete
                  </Button>
                </div>
              </Card>))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.map((request) => (<Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {request.renter.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{request.renter.name}</p>
                      <p className="text-sm text-gray-600">
                        Waseet Score: {request.renter.waseet_score}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Car</p>
                      <p className="font-semibold">{request.listing.title}</p>
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
                  {request.status === 'ACCEPTED' && (<Link to={`/chat/${request.id}`}>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2"/>
                        Chat with Renter
                      </Button>
                    </Link>)}
                </div>
              </div>
            </Card>))}
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
              <h3 className="text-lg font-semibold mb-2">Availability Calendar</h3>
              <p className="text-gray-600">
                Manage your car availability and view upcoming bookings
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}
