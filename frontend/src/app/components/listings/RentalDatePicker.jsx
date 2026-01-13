import { useState, useEffect } from 'react';
import { format, differenceInDays, addDays, isBefore, isAfter, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';
import { listingsAPI, rentalsAPI } from '../../../lib/api';
import { toast } from 'sonner';

export default function RentalDatePicker({ listing, onSuccess }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    // Fetch unavailable dates on mount
    useEffect(() => {
        const fetchUnavailableDates = async () => {
            try {
                setLoading(true);
                const data = await listingsAPI.getUnavailableDates(listing.id);
                // Convert ISO date strings to Date objects
                const dates = (data?.unavailable_dates || []).map(d => parseISO(d));
                setUnavailableDates(dates);
            } catch (error) {
                console.error('Error fetching unavailable dates:', error);
                toast.error('Failed to load availability');
            } finally {
                setLoading(false);
            }
        };
        fetchUnavailableDates();
    }, [listing.id]);

    // Check if a date is unavailable
    const isDateUnavailable = (date) => {
        return unavailableDates.some(unavailable => isSameDay(date, unavailable));
    };

    // Disable dates that are in the past or unavailable
    const disabledDays = [
        { before: new Date() }, // Disable past dates
        ...unavailableDates.map(date => date), // Disable unavailable dates
    ];

    // Calculate rental details (inclusive day count - both start and end date)
    const numDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
    const dailyPrice = listing.daily_price || 0;
    
    // Calculate total price with discounts
    let totalPrice = dailyPrice * numDays;
    let discountApplied = null;
    
    if (numDays >= 30 && listing.monthly_discount) {
        const discount = listing.monthly_discount / 100;
        totalPrice = dailyPrice * numDays * (1 - discount);
        discountApplied = `${listing.monthly_discount}% monthly discount`;
    } else if (numDays >= 7 && listing.weekly_discount) {
        const discount = listing.weekly_discount / 100;
        totalPrice = dailyPrice * numDays * (1 - discount);
        discountApplied = `${listing.weekly_discount}% weekly discount`;
    }

    // Validate date range doesn't include unavailable dates
    const validateDateRange = () => {
        if (!startDate || !endDate) return true;
        
        let current = startDate;
        while (isBefore(current, endDate)) {
            if (isDateUnavailable(current)) {
                return false;
            }
            current = addDays(current, 1);
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        if (!validateDateRange()) {
            toast.error('Your selected dates include unavailable dates. Please choose different dates.');
            return;
        }

        try {
            setSubmitting(true);
            await rentalsAPI.createRequest({
                listing: listing.id,
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
            });
            toast.success('Rental request sent successfully!');
            onSuccess?.();
        } catch (error) {
            console.error('Error creating rental request:', error);
            const errorMessage = error.response?.data?.detail 
                || error.response?.data?.non_field_errors?.[0]
                || 'Failed to send rental request';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 border rounded-lg bg-white">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading availability...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border rounded-lg bg-white space-y-4">
            <h3 className="font-semibold text-lg">Select Rental Dates</h3>
            
            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pick-up Date</label>
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    setStartDate(date);
                                    // Reset end date if it's before new start date
                                    if (endDate && date && isBefore(endDate, date)) {
                                        setEndDate(null);
                                    }
                                    setStartOpen(false);
                                }}
                                disabled={disabledDays}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Return Date</label>
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                                disabled={!startDate}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                    setEndDate(date);
                                    setEndOpen(false);
                                }}
                                disabled={[
                                    ...disabledDays,
                                    { before: startDate || new Date() }
                                ]}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Price Summary */}
            {numDays > 0 && (
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{dailyPrice.toLocaleString()} EGP × {numDays} days</span>
                        <span>{(dailyPrice * numDays).toLocaleString()} EGP</span>
                    </div>
                    {discountApplied && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>{discountApplied}</span>
                            <span>-{((dailyPrice * numDays) - totalPrice).toLocaleString()} EGP</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-blue-600">{totalPrice.toLocaleString()} EGP</span>
                    </div>
                </div>
            )}

            {/* Unavailable Dates Warning */}
            {startDate && endDate && !validateDateRange() && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">
                        Your selected date range includes unavailable dates. Please choose different dates.
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubmit}
                disabled={!startDate || !endDate || numDays < 1 || submitting || !validateDateRange()}
            >
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Request...
                    </>
                ) : (
                    'Request Rental'
                )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                You won't be charged until the owner accepts your request
            </p>
        </div>
    );
}
