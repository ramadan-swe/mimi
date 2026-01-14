import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Car, ArrowRight, ArrowLeft, Check, Upload } from 'lucide-react';
import { listingsAPI } from '../../lib/api';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Brand, Model, Year' },
  { id: 2, title: 'Details', description: 'Specs & Category' },
  { id: 3, title: 'Features', description: 'Extras & Amenities' },
  { id: 4, title: 'Images', description: 'Upload Photos' },
  { id: 5, title: 'Pricing', description: 'Price & Location' },
];

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    // Vehicle data
    brand: '',
    model: '',
    year: 2025,
    transmission: 'AUTOMATIC',
    fuel_type: 'BENZINE',
    seats: 5,
    doors: 4,
    color: '',
    category: 'MID',
    mileage_range: '30-60K',
    is_insured: false,
    extras: {
      AC: true,
      GPS: false,
      Bluetooth: false,
      Cruise_Control: false,
      Parking_Sensor: false,
      Rear_Camera: false,
      Baby_Seat: false,
    },
    // Listing data
    title: '',
    daily_price: '',
    weekly_discount: 0,
    monthly_discount: 0,
    governorate: 'Cairo',
    city: '',
  });

  const [images, setImages] = useState([]);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraToggle = (extra) => {
    setFormData(prev => ({
      ...prev,
      extras: { ...prev.extras, [extra]: !prev.extras[extra] }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 6)); // Max 6 images
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Generate title if empty
      const title = formData.title || `${formData.year} ${formData.brand} ${formData.model} in ${formData.city}`;
      
      const listingData = {
        vehicle_data: {
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
          seats: parseInt(formData.seats),
          doors: parseInt(formData.doors),
          color: formData.color,
          category: formData.category,
          mileage_range: formData.mileage_range,
          is_insured: formData.is_insured,
          extras: formData.extras,
        },
        title,
        daily_price: formData.daily_price,
        weekly_discount: formData.weekly_discount,
        monthly_discount: formData.monthly_discount,
        governorate: formData.governorate,
        city: formData.city,
      };

      console.log('Sending listing data:', listingData);
      const response = await listingsAPI.create(listingData);
      console.log('Listing created successfully:', response);
      
      // Upload images if any
      if (images.length > 0) {
        const imageTypes = ['MAIN', 'FRONT', 'BACK', 'LEFT', 'RIGHT', 'INTERIOR'];
        const imagesToUpload = images.slice(0, 6); // Max 6 images, one per type
        
        console.log(`Uploading ${imagesToUpload.length} images for listing ${response.id}`);
        
        for (let i = 0; i < imagesToUpload.length; i++) {
          const imgFormData = new FormData();
          imgFormData.append('image', imagesToUpload[i]);
          imgFormData.append('image_type', imageTypes[i]);
          imgFormData.append('order', i);
          
          console.log(`Uploading image ${i + 1} - Type: ${imageTypes[i]}, Order: ${i}`);
          
          try {
            await listingsAPI.uploadImage(response.id, imgFormData);
            console.log(`Image ${i + 1} uploaded successfully`);
          } catch (imgError) {
            console.error(`Failed to upload image ${i + 1}:`, imgError);
            console.error('Error details:', imgError.response?.data);
          }
        }
      }
      
      alert('Success! Your listing has been created.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed validation errors
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create listing:\n';
      
      if (errorData && typeof errorData === 'object') {
        Object.keys(errorData).forEach(key => {
          const value = errorData[key];
          if (Array.isArray(value)) {
            errorMessage += `${key}: ${value.join(', ')}\n`;
          } else if (typeof value === 'object') {
            errorMessage += `${key}: ${JSON.stringify(value)}\n`;
          } else {
            errorMessage += `${key}: ${value}\n`;
          }
        });
      } else {
        errorMessage = error.response?.data?.detail || 'Failed to create listing. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} onChange={handleInputChange} />;
      case 2:
        return <Step2Details formData={formData} onChange={handleInputChange} />;
      case 3:
        return <Step3Features formData={formData} onToggle={handleExtraToggle} />;
      case 4:
        return <Step4Images images={images} onChange={handleImageChange} onRemove={(idx) => setImages(images.filter((_, i) => i !== idx))} />;
      case 5:
        return <Step5Pricing formData={formData} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${idx !== 0 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <p className="text-xs mt-1 font-medium hidden sm:block">{step.title}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{STEPS[currentStep - 1].title}</h2>
          <p className="text-gray-600 text-sm">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6 mb-6">
        {renderStepContent()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {currentStep < 5 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
function Step1BasicInfo({ formData, onChange }) {
  const brands = ['Toyota', 'Hyundai', 'Nissan', 'Kia', 'Chevrolet', 'Ford', 'Honda', 'Mazda', 'Mercedes', 'BMW', 'Audi'];
  const maxYear = 2025;
  const years = Array.from({ length: maxYear - 1989 }, (_, i) => maxYear - i);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Brand *</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.brand}
          onChange={(e) => onChange('brand', e.target.value)}
          required
        >
          <option value="">Select Brand</option>
          {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Model *</label>
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.model}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="e.g., Corolla, Elantra"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Year *</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.year}
          onChange={(e) => onChange('year', e.target.value)}
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color *</label>
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.color}
          onChange={(e) => onChange('color', e.target.value)}
          placeholder="e.g., Black, White, Silver"
          required
        />
      </div>
    </div>
  );
}

function Step2Details({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Transmission</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.transmission}
          onChange={(e) => onChange('transmission', e.target.value)}
        >
          <option value="AUTOMATIC">Automatic</option>
          <option value="MANUAL">Manual</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Fuel Type</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.fuel_type}
          onChange={(e) => onChange('fuel_type', e.target.value)}
        >
          <option value="BENZINE">Benzine</option>
          <option value="ELECTRIC">Electric</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Seats</label>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={formData.seats}
            onChange={(e) => onChange('seats', e.target.value)}
          >
            {[2, 4, 5, 7, 8].map(n => <option key={n} value={n}>{n} Seats</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Doors</label>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={formData.doors}
            onChange={(e) => onChange('doors', e.target.value)}
          >
            {[2, 4, 5].map(n => <option key={n} value={n}>{n} Doors</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="BASE">Base</option>
          <option value="MID">Mid</option>
          <option value="HIGH">High</option>
          <option value="TOP">Top</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mileage Range</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.mileage_range}
          onChange={(e) => onChange('mileage_range', e.target.value)}
        >
          <option value="0-30K">0-30K km</option>
          <option value="30-60K">30-60K km</option>
          <option value="60-90K">60-90K km</option>
          <option value="90-120K">90-120K km</option>
          <option value="120K+">120K+ km</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_insured"
          checked={formData.is_insured}
          onChange={(e) => onChange('is_insured', e.target.checked)}
          className="h-4 w-4 text-blue-600"
        />
        <label htmlFor="is_insured" className="ml-2 text-sm font-medium">Car is Insured</label>
      </div>
    </div>
  );
}

function Step3Features({ formData, onToggle }) {
  const features = [
    { key: 'AC', label: 'Air Conditioning' },
    { key: 'GPS', label: 'GPS Navigation' },
    { key: 'Bluetooth', label: 'Bluetooth' },
    { key: 'Cruise_Control', label: 'Cruise Control' },
    { key: 'Parking_Sensor', label: 'Parking Sensor' },
    { key: 'Rear_Camera', label: 'Rear Camera' },
    { key: 'Baby_Seat', label: 'Baby Seat Available' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Select the features available in your car</p>
      <div className="grid grid-cols-2 gap-4">
        {features.map(feature => (
          <div key={feature.key} className="flex items-center">
            <input
              type="checkbox"
              id={feature.key}
              checked={formData.extras[feature.key]}
              onChange={() => onToggle(feature.key)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor={feature.key} className="ml-2 text-sm">{feature.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4Images({ images, onChange, onRemove }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Upload up to 6 photos of your car (Note: Image upload will be implemented soon)</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <label className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-medium">Choose files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB each</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt={`Preview ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step5Pricing({ formData, onChange }) {
  const governorates = [
    'Cairo', 'Alexandria', 'Giza', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
    'Gharbia', 'Ismailia', 'Monufia', 'Minya', 'Qalyubia', 'New Valley', 'Suez',
    'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharkia',
    'South Sinai', 'Kafr Al-Sheikh', 'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Listing Title (Optional)</label>
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Auto-generated if left empty"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Daily Price (EGP) *</label>
        <input
          type="number"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.daily_price}
          onChange={(e) => onChange('daily_price', e.target.value)}
          placeholder="e.g., 500"
          min="0"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Weekly Discount (%)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.weekly_discount}
            onChange={(e) => onChange('weekly_discount', e.target.value)}
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Monthly Discount (%)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.monthly_discount}
            onChange={(e) => onChange('monthly_discount', e.target.value)}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Governorate *</label>
        <select
          className="w-full border rounded-lg px-4 py-2"
          value={formData.governorate}
          onChange={(e) => onChange('governorate', e.target.value)}
        >
          {governorates.map(gov => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">City *</label>
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.city}
          onChange={(e) => onChange('city', e.target.value)}
          placeholder="e.g., Nasr City, Maadi"
          required
        />
      </div>
    </div>
  );
}
