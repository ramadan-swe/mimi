import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
export default function AvailabilityBar({ startDate, endDate, onStartDateChange, onEndDateChange, onClear, }) {
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isEndOpen, setIsEndOpen] = useState(false);
    const hasDateSelection = startDate || endDate;
    return (<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rental Period
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Start Date */}
                        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={`flex-1 justify-start text-left font-normal ${!startDate && 'text-gray-500'}`}>
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {startDate ? format(startDate, 'PPP') : 'From Date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={startDate} onSelect={(date) => {
            onStartDateChange(date);
            setIsStartOpen(false);
        }} disabled={(date) => date < new Date()} initialFocus/>
                            </PopoverContent>
                        </Popover>

                        <div className="hidden sm:flex items-center justify-center text-gray-400">
                            <span>—</span>
                        </div>

                        {/* End Date */}
                        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={`flex-1 justify-start text-left font-normal ${!endDate && 'text-gray-500'}`} disabled={!startDate}>
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {endDate ? format(endDate, 'PPP') : 'To Date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={endDate} onSelect={(date) => {
            onEndDateChange(date);
            setIsEndOpen(false);
        }} disabled={(date) => !startDate || date <= startDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {hasDateSelection && (<Button variant="ghost" size="sm" onClick={onClear} className="text-blue-600 hover:text-blue-700 mt-7">
                        <X className="h-4 w-4 mr-1"/>
                        Clear Dates
                    </Button>)}
            </div>

            {startDate && endDate && (<div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Duration:</span>{' '}
                    {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>)}
        </div>);
}
