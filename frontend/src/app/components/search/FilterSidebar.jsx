import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { GOVERNORATES, TRANSMISSION_TYPES, FUEL_TYPES, SEAT_COUNTS, CATEGORIES, FEATURES } from '../../../lib/mockData';
import { X } from 'lucide-react';
/**
 * JIRA-309: Filter Sidebar
 *
 * All filter changes update browser URL params in real-time
 *
 * Filters:
 * - Governorate (Dropdown)
 * - Price Slider (0-10,000+ EGP/day)
 * - Transmission (Checkboxes)
 * - Fuel Type (Checkboxes)
 * - Seats (Dropdown)
 * - Category (Checkboxes)
 * - Features (Checkboxes)
 */
export default function FilterSidebar({ filters, onFilterChange }) {
    const [priceMax, setPriceMax] = useState(parseInt(filters.price_max) || 10000);
    const [selectedTransmission, setSelectedTransmission] = useState(filters.transmission ? filters.transmission.split(',') : []);
    const [selectedFuelTypes, setSelectedFuelTypes] = useState(filters.fuel_type ? filters.fuel_type.split(',') : []);
    const [selectedCategories, setSelectedCategories] = useState(filters.category ? filters.category.split(',') : []);
    const [selectedFeatures, setSelectedFeatures] = useState(filters.features ? filters.features.split(',') : []);
    // Update URL params whenever filter changes
    useEffect(() => {
        const newFilters = {
            ...filters,
            price_max: priceMax < 10000 ? priceMax.toString() : '',
            transmission: selectedTransmission.join(','),
            fuel_type: selectedFuelTypes.join(','),
            category: selectedCategories.join(','),
            features: selectedFeatures.join(','),
        };
        onFilterChange(newFilters);
    }, [priceMax, selectedTransmission, selectedFuelTypes, selectedCategories, selectedFeatures]);
    const handleCheckboxChange = (value, currentValues, setter) => {
        if (currentValues.includes(value)) {
            setter(currentValues.filter((v) => v !== value));
        }
        else {
            setter([...currentValues, value]);
        }
    };
    const clearAllFilters = () => {
        onFilterChange({
            governorate: '',
            price_max: '',
            transmission: '',
            fuel_type: '',
            seats: '',
            category: '',
            features: '',
        });
        setPriceMax(10000);
        setSelectedTransmission([]);
        setSelectedFuelTypes([]);
        setSelectedCategories([]);
        setSelectedFeatures([]);
    };
    const hasActiveFilters = filters.governorate ||
        priceMax < 10000 ||
        selectedTransmission.length > 0 ||
        selectedFuelTypes.length > 0 ||
        filters.seats ||
        selectedCategories.length > 0 ||
        selectedFeatures.length > 0;
    return (<Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (<Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-blue-600">
            <X className="h-4 w-4 mr-1"/>
            Clear All
          </Button>)}
      </div>

      <Separator />

      {/* Governorate */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={filters.governorate || ''} onValueChange={(value) => onFilterChange({ ...filters, governorate: value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Governorates"/>
          </SelectTrigger>
          <SelectContent>
            {GOVERNORATES.map((gov) => (<SelectItem key={gov} value={gov}>
                {gov}
              </SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Price per Day</Label>
          <span className="text-sm font-semibold text-blue-600">
            {priceMax >= 10000 ? '10,000+ EGP' : `${priceMax} EGP`}
          </span>
        </div>
        <Slider value={[priceMax]} onValueChange={(value) => setPriceMax(value[0])} max={10000} min={0} step={50} className="w-full"/>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0 EGP</span>
          <span>10,000+ EGP</span>
        </div>
      </div>

      <Separator />

      {/* Transmission */}
      <div className="space-y-3">
        <Label>Transmission</Label>
        <div className="space-y-2">
          {TRANSMISSION_TYPES.map((type) => (<div key={type} className="flex items-center space-x-2">
              <Checkbox id={`transmission-${type}`} checked={selectedTransmission.includes(type)} onCheckedChange={() => handleCheckboxChange(type, selectedTransmission, setSelectedTransmission)}/>
              <label htmlFor={`transmission-${type}`} className="text-sm cursor-pointer flex-1">
                {type}
              </label>
            </div>))}
        </div>
      </div>

      <Separator />

      {/* Fuel Type */}
      <div className="space-y-3">
        <Label>Fuel Type</Label>
        <div className="space-y-2">
          {FUEL_TYPES.map((type) => (<div key={type} className="flex items-center space-x-2">
              <Checkbox id={`fuel-${type}`} checked={selectedFuelTypes.includes(type)} onCheckedChange={() => handleCheckboxChange(type, selectedFuelTypes, setSelectedFuelTypes)}/>
              <label htmlFor={`fuel-${type}`} className="text-sm cursor-pointer flex-1">
                {type}
              </label>
            </div>))}
        </div>
      </div>

      <Separator />

      {/* Seats */}
      <div className="space-y-2">
        <Label>Number of Seats</Label>
        <Select value={filters.seats || ''} onValueChange={(value) => onFilterChange({ ...filters, seats: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Any"/>
          </SelectTrigger>
          <SelectContent>
            {SEAT_COUNTS.map((count) => (<SelectItem key={count} value={count}>
                {count} Seats
              </SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <Label>Category</Label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (<div key={category} className="flex items-center space-x-2">
              <Checkbox id={`category-${category}`} checked={selectedCategories.includes(category)} onCheckedChange={() => handleCheckboxChange(category, selectedCategories, setSelectedCategories)}/>
              <label htmlFor={`category-${category}`} className="text-sm cursor-pointer flex-1">
                {category}
              </label>
            </div>))}
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div className="space-y-3">
        <Label>Features</Label>
        <div className="space-y-2">
          {FEATURES.map((feature) => (<div key={feature} className="flex items-center space-x-2">
              <Checkbox id={`feature-${feature}`} checked={selectedFeatures.includes(feature)} onCheckedChange={() => handleCheckboxChange(feature, selectedFeatures, setSelectedFeatures)}/>
              <label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer flex-1">
                {feature}
              </label>
            </div>))}
        </div>
      </div>
    </Card>);
}
