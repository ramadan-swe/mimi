import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { listingsAPI } from '../../../lib/api';
import { toast } from 'sonner';
/**
 * JIRA-308: Search Bar with AI Toggle
 *
 * This component provides:
 * - Standard search input field
 * - AI Search toggle switch
 * - Toggle OFF: Calls GET /api/listings/search/ with filter params
 * - Toggle ON: Calls POST /api/listings/ai-search/ with prompt
 */
export default function SearchHeader({ onSearch, initialQuery = '', initialAiEnabled = false }) {
    const [query, setQuery] = useState(initialQuery);
    const [aiEnabled, setAiEnabled] = useState(initialAiEnabled);
    const [isLoading, setIsLoading] = useState(false);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.error('Please enter a search query');
            return;
        }
        setIsLoading(true);
        onSearch(query, aiEnabled);
        try {
            if (aiEnabled) {
                // AI Search: POST /api/listings/ai-search/
                console.log('🤖 AI Search activated:', query);
                await listingsAPI.aiSearch(query);
                toast.success('AI search completed!');
            }
            else {
                // Standard Search: GET /api/listings/search/
                console.log('🔍 Standard search:', query);
                const params = { q: query };
                await listingsAPI.search(params);
                toast.success('Search completed!');
            }
        }
        catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-2">
          Find Your Perfect Ride
        </h1>
        <p className="text-center text-blue-100 mb-8">
          Search thousands of cars across Egypt
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <Input type="text" placeholder={aiEnabled
            ? 'Try: "I need a luxury SUV in Cairo for a week"'
            : 'Search by brand, model, or location...'} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 h-12 bg-white text-gray-900"/>
            </div>
            <Button type="submit" size="lg" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* AI Search Toggle */}
          <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Sparkles className={`h-5 w-5 ${aiEnabled ? 'text-yellow-400' : 'text-white/50'}`}/>
            <Label htmlFor="ai-search" className="cursor-pointer text-white">
              AI-Powered Search
            </Label>
            <Switch id="ai-search" checked={aiEnabled} onCheckedChange={setAiEnabled} className="data-[state=checked]:bg-yellow-500"/>
          </div>

          {/* AI Search Info */}
          {aiEnabled && (<div className="text-center text-sm text-blue-100 bg-white/10 rounded-lg p-3">
              <p>
                💡 <strong>AI Search enabled!</strong> Describe what you're looking for in natural language,
                and our AI will find the perfect matches.
              </p>
            </div>)}
        </form>

        {/* Quick Filters */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition" onClick={() => {
            setQuery('Economy cars in Cairo');
            setAiEnabled(false);
        }}>
            Economy Cars
          </button>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition" onClick={() => {
            setQuery('Luxury SUV');
            setAiEnabled(false);
        }}>
            Luxury SUVs
          </button>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition" onClick={() => {
            setQuery('Electric cars');
            setAiEnabled(false);
        }}>
            Electric Cars
          </button>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition" onClick={() => {
            setQuery('Cars in Alexandria');
            setAiEnabled(false);
        }}>
            Alexandria
          </button>
        </div>
      </div>
    </div>);
}
