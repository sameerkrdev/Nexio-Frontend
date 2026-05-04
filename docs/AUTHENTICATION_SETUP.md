# Authentication Setup Guide

## Overview

This React Native app integrates with the Nexio Backend authentication system, providing:

- Phone number-based OTP authentication
- Secure token storage using Expo SecureStore
- Session management with access and refresh tokens
- Username availability checking
- Automatic token refresh

## Architecture

### Services

1. **`services/api.ts`** - HTTP client with automatic token injection
2. **`services/storage.ts`** - Secure token and device ID storage
3. **`services/auth.service.ts`** - Authentication business logic

### Context

**`contexts/AuthContext.tsx`** - Global authentication state management

### Screens

1. **`app/signup.tsx`** - User registration with username validation
2. **`app/otp.tsx`** - Phone number input and OTP verification (signup)
3. **`app/login.tsx`** - Login with username/phone and OTP verification

## Setup Instructions

### 1. Configure API Base URL

Edit `client/config/api.config.ts`:

```typescript
// For iOS Simulator
export const API_BASE_URL = "http://localhost:3000/api/v1";

// For Android Emulator
// export const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';

// For Physical Device (replace with your computer's IP)
// export const API_BASE_URL = 'http://192.168.1.100:3000/api/v1';
```

**Finding your local IP:**

- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

### 2. Start the Backend

```bash
cd Nexio-Backend
bun run dev
```

The backend should be running on `http://localhost:3000`

### 3. Configure Environment Variables

Ensure your backend `.env` file has:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Android SMS Hash (optional, for SMS autofill)
ANDROID_SMS_HASH=your_app_hash

# Database
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# JWT Keys
JWT_PRIVATE_KEY=your_private_key
JWT_PUBLIC_KEY=your_public_key
```

### 4. Run the App

```bash
cd client

# iOS
npm run ios

# Android
npm run android
```

## Authentication Flow

### Signup Flow

1. User enters name and username on `SignupCard`
2. Username is validated in real-time via `/auth/check-username`
3. User proceeds to OTP screen
4. User enters phone number
5. App calls `/auth/send-otp` with `purpose: "signup"`
6. User receives OTP via SMS
7. User enters OTP
8. App calls `/auth/verify-otp` with user details
9. Backend creates account and returns tokens
10. Tokens are stored securely
11. User is redirected to success screen

### Login Flow

1. User enters username or phone number
2. App calls `/auth/send-otp` with `purpose: "login"`
3. User receives OTP via SMS
4. User enters OTP
5. App calls `/auth/verify-otp`
6. Backend validates and returns tokens
7. Tokens are stored securely
8. User is redirected to home screen

### Session Management

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (30 days), used to get new access tokens
- **Device ID**: Unique identifier stored securely, sent with auth requests

## Using Authentication in Your App

### Check Authentication Status

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <AuthenticatedContent user={user} />;
}
```

### Logout

```typescript
import { useAuth } from '../contexts/AuthContext';

function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
}
```

### Make Authenticated API Calls

```typescript
import { apiClient } from "../services/api";

// Authenticated GET request
const response = await apiClient.get("/some-endpoint", true);

// Authenticated POST request
const response = await apiClient.post("/some-endpoint", { data }, true);
```

### Access Current User

```typescript
import { useAuth } from '../contexts/AuthContext';

function ProfileScreen() {
  const { user, refreshUser } = useAuth();

  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Username: @{user?.username}</Text>
      <Text>Phone: {user?.phoneNumber}</Text>
    </View>
  );
}
```

## Protected Routes

To protect routes, check authentication status:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function ProtectedScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <YourProtectedContent />;
}
```

## Token Refresh

Token refresh is handled automatically by the `AuthContext`. When an API call fails with a 401 error, you can implement automatic refresh:

```typescript
// In api.ts, add retry logic
if (response.status === 401) {
  // Try to refresh token
  await authService.refreshToken();
  // Retry the original request
  return this.request(endpoint, options);
}
```

## Error Handling

All authentication errors are thrown with descriptive messages:

```typescript
try {
  await authService.sendSignupOtp(username, phoneNumber);
} catch (error: any) {
  // error.message contains user-friendly error message
  // error.statusCode contains HTTP status code
  Alert.alert("Error", error.message);
}
```

## Security Best Practices

1. **Tokens are stored in Expo SecureStore** - encrypted storage on device
2. **Device ID is generated once** - unique per installation
3. **Access tokens are short-lived** - 15 minutes
4. **Refresh tokens can be revoked** - via logout endpoint
5. **OTP rate limiting** - backend enforces rate limits
6. **Phone number validation** - E.164 format required

## Testing

### Test Signup

1. Open the app
2. Navigate to signup
3. Enter name: "Test User"
4. Enter username: "testuser123"
5. Click Next
6. Enter phone: "+919953094543" (or your verified Twilio number)
7. Click Send OTP
8. Check your phone for OTP
9. Enter OTP
10. Should redirect to success screen

### Test Login

1. Open the app
2. Navigate to login
3. Enter username or phone number
4. Click Continue
5. Enter OTP received via SMS
6. Should redirect to home screen

## Troubleshooting

### "Network error" on API calls

- Check that backend is running
- Verify API_BASE_URL is correct
- For physical devices, ensure phone and computer are on same network
- Check firewall settings

### "Failed to send OTP"

- Verify Twilio credentials in backend `.env`
- Check that phone number is verified in Twilio (trial accounts)
- Check backend logs for Twilio errors

### "Username is already taken" not showing

- Ensure backend is running
- Check network connectivity
- Verify `/auth/check-username` endpoint is working

### Tokens not persisting

- Check that Expo SecureStore is properly installed
- Verify app has necessary permissions
- Check for errors in storage.ts

### OTP not arriving

- Verify Twilio configuration
- Check that phone number is in E.164 format
- For Android autofill, ensure ANDROID_SMS_HASH is configured
- Check Twilio console for delivery status

## API Endpoints Reference

### POST /auth/check-username

Check if username is available

```json
{
  "username": "testuser"
}
```

### POST /auth/send-otp

Send OTP for signup or login

```json
{
  "phoneNumber": "+919953094543",
  "purpose": "signup",
  "username": "testuser"
}
```

### POST /auth/verify-otp

Verify OTP and create account or login

```json
{
  "otp": "123456",
  "purpose": "signup",
  "phoneNumber": "+919953094543",
  "username": "testuser",
  "name": "Test User"
}
```

### POST /auth/refresh

Refresh access token

```json
{
  "refreshToken": "...",
  "deviceId": "..."
}
```

### POST /auth/logout

Logout and revoke refresh token

```json
{
  "refreshToken": "..."
}
```

### GET /auth/me

Get current user profile (requires authentication)

```
Authorization: Bearer <access_token>
```

## Next Steps

1. Implement automatic token refresh on 401 errors
2. Add biometric authentication (Face ID / Touch ID)
3. Implement "Remember Me" functionality
4. Add social login options
5. Implement password reset flow
6. Add multi-device session management
