import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Shield, Upload, CheckCircle, Clock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyIdentityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [files, setFiles] = useState({
    national_id_image_front: null,
    national_id_image_back: null,
    driver_license_image: null
  });
  const [previews, setPreviews] = useState({
    national_id_image_front: null,
    national_id_image_back: null,
    driver_license_image: null
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const data = await api.auth.getVerificationStatus();
      setVerificationStatus(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all files are selected
    if (!files.national_id_image_front || !files.national_id_image_back || !files.driver_license_image) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('national_id_image_front', files.national_id_image_front);
      formData.append('national_id_image_back', files.national_id_image_back);
      formData.append('driver_license_image', files.driver_license_image);

      await api.auth.submitVerification(formData);
      toast.success('Documents submitted successfully! Our team will review them shortly.');
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already verified
  if (user.is_verified_identity || verificationStatus?.is_verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified</h1>
          <p className="text-gray-600 mb-4">
            Your identity has been verified. You now have full access to all features.
          </p>
          <Badge className="bg-green-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </Badge>
        </Card>
      </div>
    );
  }

  // Pending verification
  if (verificationStatus?.has_submitted && !verificationStatus?.is_verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="p-8 text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
          <p className="text-gray-600 mb-4">
            Your documents are being reviewed by our team. This usually takes 1-2 business days.
          </p>
          <Badge className="bg-orange-500">
            <Clock className="h-4 w-4 mr-1" />
            Pending Review
          </Badge>
          {verificationStatus?.verification_notes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> {verificationStatus.verification_notes}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setVerificationStatus({ ...verificationStatus, has_submitted: false })}
          >
            Resubmit Documents
          </Button>
        </Card>
      </div>
    );
  }

  // Upload form
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/profile')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Profile
      </Button>

      <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
      <p className="text-gray-600 mb-8">
        Upload your documents to verify your identity. This helps keep our platform safe and trustworthy.
      </p>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-lg">Why verify?</h2>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Build trust with renters and car owners</li>
              <li>• Access premium features</li>
              <li>• Increase your Waseet score</li>
              <li>• Required for listing cars</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Your documents are encrypted and stored securely. They will only be used for verification purposes.
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* National ID Front */}
          <div className="space-y-2">
            <Label htmlFor="national_id_front">National ID (Front)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              {previews.national_id_image_front ? (
                <div className="relative">
                  <img 
                    src={previews.national_id_image_front} 
                    alt="National ID Front" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFiles(prev => ({ ...prev, national_id_image_front: null }));
                      setPreviews(prev => ({ ...prev, national_id_image_front: null }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Click to upload front of National ID</span>
                  <Input
                    id="national_id_front"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange('national_id_image_front', e)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* National ID Back */}
          <div className="space-y-2">
            <Label htmlFor="national_id_back">National ID (Back)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              {previews.national_id_image_back ? (
                <div className="relative">
                  <img 
                    src={previews.national_id_image_back} 
                    alt="National ID Back" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFiles(prev => ({ ...prev, national_id_image_back: null }));
                      setPreviews(prev => ({ ...prev, national_id_image_back: null }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Click to upload back of National ID</span>
                  <Input
                    id="national_id_back"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange('national_id_image_back', e)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Driver's License */}
          <div className="space-y-2">
            <Label htmlFor="driver_license">Driver&apos;s License</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              {previews.driver_license_image ? (
                <div className="relative">
                  <img 
                    src={previews.driver_license_image} 
                    alt="Driver's License" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFiles(prev => ({ ...prev, driver_license_image: null }));
                      setPreviews(prev => ({ ...prev, driver_license_image: null }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Click to upload Driver&apos;s License</span>
                  <Input
                    id="driver_license"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange('driver_license_image', e)}
                  />
                </label>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !files.national_id_image_front || !files.national_id_image_back || !files.driver_license_image}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
