# Push Notifications System - Complete Guide

## Overview

This is a production-ready push notification system for the Nexio fintech app built with Expo and React Native. It supports notifications when the app is in foreground, background, or fully closed.

## Architecture

### Frontend (React Native + Expo)

- **expo-notifications**: Core notification handling
- **expo-device**: Device information
- **@react-native-async-storage/async-storage**: Local notification storage

### Backend (Node.js + Express)

- **expo-server-sdk**: Send push notifications via Expo
- **PostgreSQL**: Store push tokens
- **Prisma**: Database ORM

## Features

✅ Request notification permissions on app startup
✅ Generate and store Expo Push Token
✅ Android notification channels with high importance
✅ Foreground, background, and closed app support
✅ Notification listeners (received & tapped)
✅ Reusable notification service
✅ Backend API integration
✅ Deep linking/navigation
✅ Modern fintech UI design
✅ Notification history with grouping
✅ Mark as read/unread
✅ Badge count management
✅ Notification settings screen
✅ TypeScript support
✅ Production-ready architecture

## Notification Types

1. **Payment Sent** - When user sends a payment
2. **Payment Received** - When user receives a payment
3. **Payment Verified** - When payment is confirmed
4. **Fiat Payout Completed** - When withdrawal completes
5. **Transaction Failed** - When transaction fails
6. **Wallet Connected** - When Solana wallet is connected
7. **KYC Approved** - When KYC verification passes
8. **KYC Rejected** - When KYC verification fails
9. **Security Alert** - Security-related notifications
10. **Promotional** - Marketing and announcements

## File Structure

```
client/
├── types/
│   └── notification.types.ts          # TypeScript types
├── services/
│   ├── notification.service.ts        # Core notification service
│   └── push-notification-api.service.ts # Backend API integration
├── contexts/
│   └── NotificationContext.tsx        # React context provider
├── hooks/
│   └── useNotifications.ts            # Custom hook
├── components/
│   └── notifications/
│       ├── NotificationToast.tsx      # In-app toast
│       └── NotificationItem.tsx       # List item component
└── app/
    ├── notifications.tsx              # Notification history screen
    └── notification-settings.tsx      # Settings screen

Nexio-Backend/
├── prisma/
│   ├── schema.prisma                  # Database schema (PushToken model)
│   └── migrations/
│       └── 20260510000000_add_push_tokens/
│           └── migration.sql          # Push tokens table
├── src/
│   ├── services/
│   │   ├── push-notification.service.ts # Push notification logic
│   │   └── wallet.service.ts          # Updated with notifications
│   ├── controllers/
│   │   └── notification.controller.ts # API controllers
│   └── routes/
│       └── notification.routes.ts     # API routes
```

## Setup Instructions

### 1. Install Dependencies

**Client:**

```bash
cd client
npm install expo-notifications expo-device @react-native-async-storage/async-storage
```

**Backend:**

```bash
cd Nexio-Backend
npm install expo-server-sdk
```

### 2. Run Database Migration

```bash
cd Nexio-Backend
bunx prisma migrate dev
bunx prisma generate
```

### 3. Configure app.json (Client)

Add notification configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6",
          "sounds": ["./assets/notification-sound.wav"],
          "mode": "production"
        }
      ]
    ],
    "android": {
      "useNextNotificationsApi": true,
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 4. Rebuild Native Code

After adding expo-notifications, rebuild:

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Usage

### Client-Side

#### 1. Wrap App with NotificationProvider

Already done in `app/_layout.tsx`:

```typescript
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <NotificationProvider>
      <InnerLayout />
    </NotificationProvider>
  </AuthProvider>
</QueryClientProvider>
```

#### 2. Use Notifications in Components

```typescript
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const {
    pushToken,
    notifications,
    unreadCount,
    markAsRead,
    showInAppNotification,
  } = useNotifications();

  // Show in-app notification
  const handleAction = () => {
    showInAppNotification(
      'Success',
      'Your payment was sent successfully',
      { paymentId: '123' }
    );
  };

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {/* ... */}
    </View>
  );
}
```

#### 3. Navigate to Notification Screens

```typescript
// View notification history
router.push("/notifications");

// Open notification settings
router.push("/notification-settings");
```

### Backend-Side

#### 1. Send Notification When Payment is Received

Already integrated in `wallet.service.ts`:

```typescript
// Send push notification to recipient
setImmediate(() => {
  pushNotificationService.sendPaymentReceivedNotification({
    userId: recipientUserId,
    senderName,
    amount: localAmount.toFixed(2),
    currency: payment.receiverCurrency,
    paymentId: payment.id,
  });
});
```

#### 2. Send Notification When Payment is Sent

```typescript
// Send push notification to sender
setImmediate(() => {
  pushNotificationService.sendPaymentSentNotification({
    userId: payment.senderId,
    recipientName: payment.recipientUsername,
    amount: localAmount.toFixed(2),
    currency: payment.receiverCurrency,
    paymentId: payment.id,
  });
});
```

#### 3. Send Custom Notifications

```typescript
import {
  pushNotificationService,
  NotificationType,
} from "../services/push-notification.service";

// Send custom notification
await pushNotificationService.sendToUser({
  userId: "user-id",
  type: NotificationType.SECURITY_ALERT,
  title: "Security Alert",
  body: "Unusual login detected from new device",
  data: { alertId: "123" },
  priority: "high",
});
```

## API Endpoints

### POST `/api/v1/notifications/register-token`

Register device push token

**Request:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxx]",
  "platform": "android",
  "deviceId": "device-123",
  "deviceName": "Pixel 6"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

### POST `/api/v1/notifications/unregister-token`

Unregister device push token

**Request:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxx]"
}
```

### POST `/api/v1/notifications/test`

Send test notification (for development)

**Response:**

```json
{
  "success": true,
  "message": "Test notification sent"
}
```

## Notification Payload Structure

### Backend to Expo Push Service

```typescript
{
  to: "ExponentPushToken[xxxxxx]",
  sound: "default",
  title: "Payment Received",
  body: "John Doe sent you $100.00 USD",
  data: {
    type: "payment_received",
    paymentId: "payment-123",
    amount: "100.00",
    currency: "USD"
  },
  badge: 1,
  priority: "high",
  channelId: "payment"
}
```

### Received on Client

```typescript
{
  request: {
    identifier: "notification-id",
    content: {
      title: "Payment Received",
      body: "John Doe sent you $100.00 USD",
      data: {
        type: "payment_received",
        paymentId: "payment-123",
        amount: "100.00",
        currency: "USD"
      }
    }
  }
}
```

## Deep Linking

Notifications automatically navigate to relevant screens:

| Notification Type     | Navigation                               |
| --------------------- | ---------------------------------------- |
| payment_sent          | `/transaction-detail?id={paymentId}`     |
| payment_received      | `/transaction-detail?id={paymentId}`     |
| payment_verified      | `/transaction-detail?id={paymentId}`     |
| fiat_payout_completed | `/withdrawal-history`                    |
| transaction_failed    | `/transaction-detail?id={transactionId}` |
| wallet_connected      | `/profile`                               |
| kyc_approved          | `/profile`                               |
| kyc_rejected          | `/profile`                               |
| security_alert        | `/profile`                               |

## Android Notification Channels

| Channel     | Importance | Use Case              |
| ----------- | ---------- | --------------------- |
| payment     | HIGH       | Payment notifications |
| security    | MAX        | Security alerts       |
| general     | DEFAULT    | General notifications |
| promotional | LOW        | Marketing messages    |

## Testing

### 1. Test on Physical Device

Push notifications only work on physical devices, not simulators.

### 2. Send Test Notification

From the app:

1. Go to Settings → Notification Settings
2. Tap "Send Test Notification"

From backend:

```bash
curl -X POST http://localhost:3000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Payment Notifications

1. Send a payment from one user to another
2. Both users should receive push notifications:
   - Sender: "Payment Sent"
   - Receiver: "Payment Received"

## Troubleshooting

### No Push Token Generated

**Issue:** `pushToken` is null

**Solutions:**

- Ensure you're testing on a physical device
- Check notification permissions are granted
- Verify Expo project ID in `app.json`
- Check console for errors

### Notifications Not Received

**Issue:** Notifications not showing up

**Solutions:**

- Check push token is registered in database
- Verify backend is sending notifications (check logs)
- Ensure notification permissions are granted
- Check Android notification channels are configured
- Verify app is not in battery optimization mode (Android)

### Deep Links Not Working

**Issue:** Tapping notification doesn't navigate

**Solutions:**

- Check `handleDeepLink` function in `NotificationContext.tsx`
- Verify notification data includes required fields
- Check router navigation paths are correct

## Production Considerations

### 1. Expo Push Notification Service Limits

- Free tier: 600 notifications/hour
- Paid tier: Higher limits
- Consider upgrading for production

### 2. Badge Count Management

Update badge count when:

- New notification received
- Notification marked as read
- App opened

### 3. Notification Retention

- Keep last 100 notifications locally
- Implement server-side notification history for longer retention

### 4. Error Handling

- Log failed notification sends
- Retry failed notifications
- Handle invalid push tokens

### 5. Privacy

- Don't send sensitive data in notification body
- Use notification data field for IDs only
- Fetch full details after user taps notification

## Performance Optimization

1. **Batch Notifications**: Send multiple notifications in chunks
2. **Async Processing**: Use `setImmediate()` to avoid blocking
3. **Local Caching**: Store notifications locally for offline access
4. **Lazy Loading**: Load notification history on demand

## Security

1. **Token Validation**: Validate Expo push tokens before storing
2. **Authentication**: Require auth for all notification endpoints
3. **Rate Limiting**: Prevent notification spam
4. **Data Sanitization**: Sanitize notification content

## Future Enhancements

- [ ] Rich notifications with images
- [ ] Action buttons on notifications
- [ ] Notification categories/filters
- [ ] Scheduled notifications
- [ ] Notification analytics
- [ ] Multi-language support
- [ ] Custom notification sounds
- [ ] Notification preferences per type

## Support

For issues or questions:

1. Check console logs for errors
2. Review Expo documentation: https://docs.expo.dev/push-notifications/overview/
3. Check backend logs for notification send failures

## License

This notification system is part of the Nexio fintech application.
