import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../lib/api'; 
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Crown, Loader2, Calendar, AlertCircle, Trash2, CheckCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [activeSub, setActiveSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const plansData = await paymentsAPI.getSubscriptions();
            setSubscriptions(Array.isArray(plansData) ? plansData : (plansData.results || []));
            try {
                const currentSub = await paymentsAPI.getCurrentSubscription();
                setActiveSub(currentSub);
            } catch (err) {
                if (err.response?.status === 404) setActiveSub(null);
            }
        } catch (error) {
            toast.error("Failed to load pricing.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubscribe = async (planId) => {
        setProcessingId(planId);
        const toastId = toast.loading("Opening Secure Checkout...");
        try {
            const response = await paymentsAPI.createCheckout(planId);
            if (response.payment_url) window.location.href = response.payment_url;
        } catch (error) {
            toast.error(error.response?.data?.error || "Checkout failed", { id: toastId });
            setProcessingId(null);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Cancel automatic renewal? Access remains until expiry.")) return;
        const toastId = toast.loading("Processing...");
        try {
            await paymentsAPI.cancelSubscription();
            toast.success("Cancelled successfully", { id: toastId });
            fetchData();
        } catch (error) {
            toast.error("Cancellation failed", { id: toastId });
        }
    };

    const userHasActiveSub = activeSub && activeSub.status === 'ACTIVE';

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl font-sans">
            {userHasActiveSub ? (
                <Card className="p-8 bg-gradient-to-r from-blue-700 to-blue-900 border-none mb-16 text-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 ring-8 ring-blue-50">
                    <div className="flex items-center gap-6">
                        <CheckCircle size={44} className="text-blue-200" />
                        <div>
                            <p className="text-blue-200 text-xs font-bold uppercase italic">Your current plan</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">{activeSub.plan_name}</h3>
                            <p className="text-sm mt-2 opacity-80">Cycle Ends: {new Date(activeSub.current_period_end).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Button onClick={handleCancel} className="bg-white text-red-600 hover:bg-red-50 font-black px-10 py-7 rounded-2xl uppercase shadow-xl">Cancel Plan</Button>
                </Card>
            ) : (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mb-12 text-amber-800 font-bold uppercase italic text-center shadow-sm">
                    <AlertCircle className="inline mr-2" /> Free Tier Active. Upgrade to list more cars.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {subscriptions.map((plan) => {
                    const isOwned = activeSub && Number(activeSub.subscription) === Number(plan.id);
                    return (
                        <Card key={plan.id} className={`p-10 flex flex-col border-2 rounded-[3.5rem] transition-all duration-500 ${isOwned ? 'border-blue-600 ring-8 ring-blue-50 scale-105 z-10' : userHasActiveSub ? 'opacity-50 grayscale bg-gray-50' : 'hover:shadow-2xl hover:-translate-y-2 bg-white'}`}>
                            <div className="flex justify-between items-start mb-6 font-black uppercase italic text-2xl tracking-tighter">
                                {plan.name} <Crown className={isOwned ? 'text-blue-600' : 'text-gray-200'} size={32} />
                            </div>
                            <div className="mb-8 flex items-baseline">
                                <span className="text-6xl font-black">{Math.floor(plan.price)}</span>
                                <span className="text-gray-400 font-bold ml-2">EGP / Mo</span>
                            </div>
                            <ul className="space-y-4 mb-12 flex-grow">
                                <li className="flex items-center gap-3 text-gray-800 font-bold uppercase text-xs">
                                    <CheckCircle size={18} className="text-blue-600" /> {plan.max_listings >= 9999 ? "Unlimited" : plan.max_listings} Listings
                                </li>
                                {plan.features && Object.entries(plan.features).map(([k, v]) => (
                                    <li key={k} className="flex items-center gap-3 text-gray-600 text-sm font-medium italic">
                                        <Check size={18} className="text-blue-400" /> {typeof v === 'boolean' ? k : v}
                                    </li>
                                ))}
                            </ul>
                            <Button disabled={userHasActiveSub || processingId === plan.id} onClick={() => handleSubscribe(plan.id)} className={`w-full py-8 text-xl font-black uppercase rounded-2xl shadow-lg ${isOwned ? 'bg-blue-100 text-blue-600 border-none cursor-default' : 'bg-blue-600 text-white hover:bg-black'}`}>
                                {processingId === plan.id ? <Loader2 className="animate-spin" /> : isOwned ? "Active" : userHasActiveSub ? "Locked" : "Select Plan"}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPage;