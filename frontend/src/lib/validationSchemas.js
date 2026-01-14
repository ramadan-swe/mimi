import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

// Sign up form validation schema
export const signUpSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    // Matches international format: optional +, then 1-9 followed by 9-14 more digits (total 10-15 digits)
    // Examples: +201234567890 (13 digits), +15551234567 (11 digits), 15551234567 (11 digits)
    .regex(/^\+?[1-9]\d{9,14}$/, 'Phone number must be 10-15 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
