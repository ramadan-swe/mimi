import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Crown } from 'lucide-react';
import { subscriptionTiers } from '../../lib/mockData';
import { toast } from 'sonner';
export default function SubscriptionPage() {
    const handleUpgrade = (tierId) => {
        console.log('🔄 Upgrading to:', tierId);
        toast.success('Redirecting to Paymob checkout (Test Mode)...');
        // In production: paymentsAPI.createCheckout(tierId)
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 text-lg">
          Select the perfect subscription for your car rental business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionTiers.map((tier, index) => (<Card key={tier.id} className={`p-6 relative ${index === 1 ? 'border-2 border-blue-600 shadow-xl' : ''}`}>
            {index === 1 && (<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>)}
            {index === 3 && (<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Crown className="h-4 w-4"/>
                  Elite
                </span>
              </div>)}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-600">EGP</span>
                {tier.price > 0 && <span className="text-gray-600">/month</span>}
              </div>
              {tier.trial_period && (<p className="text-xs text-gray-500 mt-2">{tier.trial_period}</p>)}
            </div>

            <div className="space-y-3 mb-6">
              {tier.features.map((feature) => (<div key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"/>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>))}
            </div>

            <Button className={`w-full ${index === 3
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white'
                : ''}`} variant={tier.price === 0 ? 'outline' : 'default'} onClick={() => handleUpgrade(tier.id)} disabled={tier.price === 0}>
              {tier.price === 0 ? 'Current Plan' : 'Upgrade'}
            </Button>
          </Card>))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-600">
        <p>
          All payments are processed securely through <strong>Paymob</strong> (Test Mode)
        </p>
        <p className="mt-2">
          Need a custom plan? <a href="#" className="text-blue-600 hover:text-blue-700">Contact us</a>
        </p>
      </div>
    </div>);
}
