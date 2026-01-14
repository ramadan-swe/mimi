import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '../../lib/validationSchemas';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Car } from 'lucide-react';
import { toast } from 'sonner';
export default function SignUpPage() {
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remove confirm_password before sending to API
      const { confirm_password: _confirm_password, ...apiData } = data;
      await registerUser(apiData);
      toast.success('Account created successfully! Please verify your phone.');
      navigate('/login');
    }
    catch {
      toast.error('Registration failed. Please try again.');
    }
    finally {
      setIsLoading(false);
    }
  };

  return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <Car className="h-10 w-10 text-blue-600" />
          <span className="text-3xl font-bold text-gray-900">Mimi</span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join thousands of car owners and renters</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...registerForm("first_name")}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...registerForm("last_name")}
            />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...registerForm("email")}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="+20XXXXXXXXXX"
            {...registerForm("phone_number")}
          />
          {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...registerForm("password")}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input
            id="confirm_password"
            type="password"
            {...registerForm("confirm_password")}
          />
          {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password.message}</p>}
        </div>


        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign In
        </Link>
      </div>
    </Card>
  </div>);
}
