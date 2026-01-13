import * as yup from 'yup';

// Login form validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
});

// Sign up form validation schema
export const signUpSchema = yup.object().shape({
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone_number: yup
    .string()
    .required('Phone number is required')
    // Matches international format: optional +, then 1-9 followed by 9-14 more digits (total 10-15 digits)
    // Examples: +201234567890 (13 digits), +15551234567 (11 digits), 15551234567 (11 digits)
    .matches(/^\+?[1-9]\d{9,14}$/, 'Phone number must be 10-15 digits'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match')
});
