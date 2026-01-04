import { Card } from '../components/ui/card';
import { MessageSquare } from 'lucide-react';
export default function ChatPage() {
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto text-blue-600 mb-4"/>
          <h1 className="text-2xl font-bold mb-2">Chat</h1>
          <p className="text-gray-600 mb-4">
            Real-time messaging with Firebase Firestore
          </p>
          <div className="text-left max-w-md mx-auto text-sm text-gray-600 space-y-2">
            <p>This page will include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Left sidebar: List of active conversations</li>
              <li>Right panel: Message thread (real-time)</li>
              <li>"Confirm Rental Deal" button</li>
              <li>Phone number reveal after both parties confirm</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Integration: GET /api/chat/token/&lt;rental_id&gt;/ for Firebase custom token
            </p>
          </div>
        </div>
      </Card>
    </div>);
}
