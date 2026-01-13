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
            // 1. Fetch all available plans from backend
            const plansData = await paymentsAPI.getSubscriptions();
            const finalPlans = Array.isArray(plansData) ? plansData : (plansData.results || []);
            setSubscriptions(finalPlans);

            // 2. Fetch the logged-in user's active subscription
            try {
                const currentSub = await paymentsAPI.getCurrentSubscription();
                setActiveSub(currentSub);
            } catch (err) {
                // 404 is expected if the user has no active plan
                if (err.response?.status === 404) {
                    setActiveSub(null);
                }
            }
        } catch (error) {
            console.error("Load error:", error);
            toast.error("Failed to load subscription data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getDaysRemaining = (dateString) => {
        if (!dateString) return 0;
        const endDate = new Date(dateString);
        const now = new Date();
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const handleSubscribe = async (planId) => {
        setProcessingId(planId);
        const toastId = toast.loading("Opening Secure Checkout...");
        try {
            const response = await paymentsAPI.createCheckout(planId);
            // Matches the 'payment_url' we set in SubscriptionService.initialize_subscription
            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Checkout failed", { id: toastId });
            setProcessingId(null);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Warning: This will stop your automatic renewal. Access remains until the current period ends. Proceed?")) return;
        const toastId = toast.loading("Processing cancellation...");
        try {
            await paymentsAPI.cancelSubscription();
            toast.success("Cancellation successful", { id: toastId });
            fetchData(); // Refresh state
        } catch (error) {
            toast.error("Failed to cancel subscription", { id: toastId });
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        </div>
    );

    // Global state to see if the user is already subbed to something
    const userHasActiveSub = activeSub && activeSub.status === 'ACTIVE';

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl font-sans">
            
            {/* TOP HEADER SECTION */}
            <div className="text-center mb-16">
                <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase">Pricing Plans</h1>
                <p className="text-gray-500 font-bold italic uppercase tracking-widest">Select the best tier for your business</p>
                <div className="h-2 w-24 bg-blue-600 mx-auto mt-6 rounded-full"></div>
            </div>

            {/* ACTIVE SUBSCRIPTION BANNER */}
            {userHasActiveSub ? (
                <Card className="p-8 bg-gradient-to-r from-blue-700 to-blue-900 border-none mb-16 shadow-2xl text-white rounded-[2.5rem] relative overflow-hidden ring-8 ring-blue-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <CheckCircle size={44} className="text-blue-200" />
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1 italic">Your current plan</p>
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                    {activeSub.plan_name}
                                </h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-sm bg-black/20 px-4 py-1.5 rounded-xl flex items-center gap-2 font-medium">
                                        <Calendar size={14} /> 
                                        Renews/Ends: {new Date(activeSub.current_period_end).toLocaleDateString()}
                                    </span>
                                    <span className="bg-green-400 text-green-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">
                                        {getDaysRemaining(activeSub.current_period_end)} Days Left
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancel} 
                            className="bg-white text-red-600 hover:bg-red-50 font-black px-10 py-7 rounded-2xl shadow-xl border-none uppercase tracking-widest text-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Cancel Subscription
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2rem] mb-12 flex items-center gap-4 text-amber-800 shadow-sm font-bold uppercase italic justify-center">
                    <AlertCircle size={24} />
                    You are currently on the free tier. No active plan found.
                </div>
            )}

            {/* PRICING GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {subscriptions.map((plan) => {
                    // Logic to see if this card belongs to the user
                    const isOwnedByMe = activeSub && Number(activeSub.subscription) === Number(plan.id);
                    
                    return (
                        <Card 
                            key={plan.id} 
                            className={`p-10 flex flex-col border-2 relative transition-all duration-500 rounded-[3rem] ${
                                isOwnedByMe
                                ? 'border-blue-600 bg-blue-50/20 ring-8 ring-blue-50 scale-105 z-20 shadow-2xl' 
                                : userHasActiveSub 
                                ? 'opacity-60 grayscale-[0.3] bg-gray-50 border-gray-200' 
                                : 'hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 bg-white'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-8 font-black uppercase italic text-2xl text-gray-900 tracking-tighter leading-none">
                                {plan.name}
                                <Crown className={isOwnedByMe ? 'text-blue-600' : 'text-gray-200'} size={32} />
                            </div>

                            <div className="mb-8 flex items-baseline">
                                <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none">{Math.floor(plan.price)}</span>
                                <div className="ml-3">
                                    <p className="text-gray-400 font-bold text-xs uppercase italic leading-none">EGP</p>
                                    <p className="text-gray-400 font-bold text-xs uppercase italic leading-none">
                                        / {plan.period === 'YEARLY' ? 'Yr' : 'Mo'}
                                    </p>
                                </div>
                            </div>

                            {/* FEATURES LIST */}
                            <ul className="space-y-4 mb-12 flex-grow">
                                <li className="flex items-center gap-3 text-gray-800 font-bold italic uppercase text-sm">
                                    <CheckCircle className="text-blue-600" size={18} />
                                    {plan.max_listings >= 9999 ? "Unlimited" : `Up to ${plan.max_listings}`} Listings
                                </li>
                                
                                {/* Mapping through the JSON features field from Django */}
                                {plan.features && typeof plan.features === 'object' && (
                                    Object.entries(plan.features).map(([key, value]) => (
                                        <li key={key} className="flex items-center gap-3 text-gray-600 font-medium italic text-sm">
                                            <Check className="text-blue-400" size={18} />
                                            <span>{typeof value === 'boolean' ? key : value}</span>
                                        </li>
                                    ))
                                )}
                            </ul>

                            {/* DYNAMIC BUTTON */}
                            <Button 
                                className={`w-full py-8 text-xl font-black uppercase rounded-2xl shadow-xl transition-all tracking-widest ${
                                    isOwnedByMe
                                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600 cursor-default shadow-none' 
                                    : userHasActiveSub 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-black text-white'
                                }`}
                                disabled={userHasActiveSub || processingId === plan.id}
                                onClick={() => handleSubscribe(plan.id)}
                            >
                                {processingId === plan.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    isOwnedByMe ? "Current Plan" : userHasActiveSub ?  "Select Plan" : ""
                                )}
                            </Button>

                         
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPage;