# Form Validation with Yup and State Management with Redux

## Overview

This document describes the implementation of Yup for form validation and Redux for state management in the Mimi car rental application.

## What was Added

### 1. Dependencies

The following npm packages were installed:

- **yup** (^1.x.x): Schema validation library
- **@hookform/resolvers** (^3.x.x): Integration between react-hook-form and Yup
- **@reduxjs/toolkit** (^2.x.x): Modern Redux with simplified API
- **react-redux** (^9.x.x): React bindings for Redux

### 2. Validation Schemas

Created `/frontend/src/lib/validationSchemas.js` with Yup schemas for:

#### Login Schema
- **email**: Required, must be valid email format
- **password**: Required

#### Sign Up Schema
- **first_name**: Required, 2-50 characters
- **last_name**: Required, 2-50 characters
- **email**: Required, must be valid email format
- **phone_number**: Required, must match international format (E.164)
- **password**: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **confirm_password**: Required, must match password field

### 3. Redux Store

Created Redux store structure:

#### Store Configuration (`/frontend/src/store/index.js`)
- Configured with Redux Toolkit's `configureStore`
- Single auth reducer for authentication state

#### Auth Slice (`/frontend/src/store/slices/authSlice.js`)
Redux slice for authentication with:
- **State**:
  - `user`: Current user object (null if not authenticated)
  - `isAuthenticated`: Boolean flag for authentication status
  - `isLoading`: Boolean flag for loading state
- **Actions**:
  - `setUser`: Set the current user
  - `clearUser`: Clear user data on logout
  - `setLoading`: Set loading state

### 4. Integration

#### AuthContext Integration
Updated `/frontend/src/contexts/AuthContext.jsx`:
- Integrated Redux hooks (`useDispatch`, `useSelector`)
- State now managed by Redux instead of local component state
- Dispatch actions to update Redux store on login, logout, and user updates

#### App Component
Updated `/frontend/src/app/App.jsx`:
- Wrapped the application with Redux `Provider`
- Store is accessible throughout the component tree

#### Form Pages
Updated form pages to use Yup validation:

**LoginPage** (`/frontend/src/app/pages/LoginPage.jsx`):
- Integrated `yupResolver` with `react-hook-form`
- Uses `loginSchema` for validation
- Removed inline validation rules

**SignUpPage** (`/frontend/src/app/pages/SignUpPage.jsx`):
- Integrated `yupResolver` with `react-hook-form`
- Uses `signUpSchema` for validation
- Removed inline validation rules
- Enhanced password validation with complexity requirements

## Benefits

### Form Validation with Yup
1. **Centralized Validation Logic**: All validation rules are in one place
2. **Reusable Schemas**: Can be used across different components
3. **Better Type Safety**: Schema-based validation with TypeScript support
4. **Consistent Error Messages**: Standardized error messages across forms
5. **Complex Validation**: Easy to add custom validation rules
6. **Server-Side Compatibility**: Same schemas can be used on backend if needed

### State Management with Redux
1. **Predictable State**: Centralized state management
2. **Time-Travel Debugging**: Redux DevTools support
3. **Middleware Support**: Can add logging, analytics, etc.
4. **Scalable**: Easy to add more slices as app grows
5. **Testable**: Actions and reducers are pure functions
6. **Performance**: Selective re-rendering with `useSelector`

## Usage Examples

### Adding a New Form Validation

To add validation for a new form:

```javascript
// 1. Define schema in validationSchemas.js
export const myFormSchema = yup.object().shape({
  fieldName: yup.string().required('This field is required'),
  // ... more fields
});

// 2. Use in component
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { myFormSchema } from '../../lib/validationSchemas';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(myFormSchema),
  });

  // ... rest of component
}
```

### Adding a New Redux Slice

To add a new Redux slice:

```javascript
// 1. Create slice file (e.g., /src/store/slices/listingsSlice.js)
import { createSlice } from '@reduxjs/toolkit';

const listingsSlice = createSlice({
  name: 'listings',
  initialState: { items: [], loading: false },
  reducers: {
    setListings: (state, action) => {
      state.items = action.payload;
    },
    // ... more reducers
  },
});

export const { setListings } = listingsSlice.actions;
export default listingsSlice.reducer;

// 2. Add to store configuration
// In /src/store/index.js
import listingsReducer from './slices/listingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingsReducer, // Add new reducer
  },
});

// 3. Use in component
import { useSelector, useDispatch } from 'react-redux';
import { setListings } from '../store/slices/listingsSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const listings = useSelector((state) => state.listings.items);
  
  // Dispatch actions
  dispatch(setListings(newListings));
}
```

## Testing

### Manual Testing

1. **Form Validation Testing**:
   - Navigate to `/signup`
   - Try submitting with:
     - Empty fields → Should show "required" errors
     - Invalid email → Should show "Invalid email address"
     - Weak password → Should show password requirements error
     - Mismatched passwords → Should show "Passwords do not match"
   - Navigate to `/login`
   - Try submitting with:
     - Empty fields → Should show "required" errors
     - Invalid email format → Should show validation error

2. **Redux State Testing**:
   - Install Redux DevTools extension in browser
   - Open DevTools → Redux tab
   - Perform login → Watch `auth/setUser` action
   - Perform logout → Watch `auth/clearUser` action
   - Inspect state tree to see current auth state

### Automated Testing (Future)

Consider adding:
- Unit tests for validation schemas
- Unit tests for Redux reducers
- Integration tests for form submission
- E2E tests with Cypress or Playwright

## Migration Notes

### Breaking Changes
None. The implementation maintains backward compatibility with existing functionality.

### Deprecation Warnings
- The inline validation rules in `react-hook-form` have been replaced with Yup schemas
- Local state management in `AuthContext` has been migrated to Redux

## Future Enhancements

1. **Validation**:
   - Add async validation (e.g., check if email exists)
   - Add i18n support for error messages
   - Create custom validation rules for Egyptian phone numbers

2. **Redux**:
   - Add Redux persist for state persistence
   - Create middleware for API calls
   - Add Redux Thunk or Redux Saga for complex async logic
   - Add more slices for listings, chat, notifications, etc.

3. **Developer Experience**:
   - Set up Redux DevTools logging in development
   - Add TypeScript types for better autocomplete
   - Create utility hooks for common Redux patterns

## Resources

- [Yup Documentation](https://github.com/jquense/yup)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Hook Form + Yup Guide](https://react-hook-form.com/get-started#SchemaValidation)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)

## Support

For questions or issues, please refer to the project's main README or contact the development team.
