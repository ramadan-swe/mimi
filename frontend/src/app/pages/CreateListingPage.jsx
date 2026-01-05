import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Car } from 'lucide-react';
export default function CreateListingPage() {
    return (<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="text-center py-12">
          <Car className="h-16 w-16 mx-auto text-blue-600 mb-4"/>
          <h1 className="text-2xl font-bold mb-2">Create New Listing</h1>
          <p className="text-gray-600 mb-6">
            Multi-step form for adding a new car listing
          </p>
          <p className="text-sm text-gray-500">
            This page will include a 5-step form with:
            <br />Step 1: Basic Info (Brand, Model, Year)
            <br />Step 2: Details (Transmission, Fuel, etc.)
            <br />Step 3: Features (GPS, Bluetooth, etc.)
            <br />Step 4: Images (Drag-drop upload)
            <br />Step 5: Pricing & Location
          </p>
          <Button className="mt-6">Start Creating Listing</Button>
        </div>
      </Card>
    </div>);
}
