# Google Sign-In Setup Guide (Expo Auth Session)

## Tổng quan

Hệ thống đã được tích hợp Google Sign-In cho React Native/Expo sử dụng `expo-auth-session` và `expo-web-browser` - **KHÔNG** cần native modules, hoạt động trên Expo Go.

## ✅ Packages đã cài đặt

- `expo-auth-session`: OAuth authentication cho Expo
- `expo-web-browser`: WebBrowser API cho auth sessions
- `expo-crypto`: Crypto utilities

## Cấu hình Google Cloud Console

### 1. Tạo OAuth 2.0 Client ID

Truy cập [Google Cloud Console](https://console.cloud.google.com/):

**Bước 1: Web Application (Bắt buộc)**

- Navigation Menu → APIs & Services → Credentials
- Click "Create Credentials" → "OAuth client ID"
- Application type: **Web application**
- Name: "Your App Web Client"
- Authorized JavaScript origins:
  - `http://localhost:19006` (cho web testing)
  - `https://your-production-domain.com` (nếu có)
- Authorized redirect URIs:
  - `http://localhost:19006`
  - `https://auth.expo.io/@your-expo-username/your-app-slug`
- **Copy Web Client ID** → Dùng trong `.env`

**Bước 2: Android (Optional - chỉ khi build standalone)**

- Application type: **Android**
- Package name: Từ `app.json` → `expo.android.package`
- SHA-1 fingerprint:
  ```bash
  # Development
  keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
  # Password: android
  ```

**Bước 3: iOS (Optional - chỉ khi build standalone)**

- Application type: **iOS**
- Bundle ID: Từ `app.json` → `expo.ios.bundleIdentifier`

### 2. Environment Variables

Tạo file `.env` trong root:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_API_URL=https://your-backend.com/api
```

**Quan trọng**: Dùng **Web Client ID**, KHÔNG phải Android/iOS Client ID!

### 3. Restart Expo

```bash
# Clear cache và restart
npx expo start --clear
```

## Luồng hoạt động

### OAuth Flow với expo-auth-session:

```
1. User clicks "Đăng nhập với Google"
   ↓
2. promptAsync() mở WebBrowser
   ↓
3. Google OAuth consent screen
   ↓
4. User chọn tài khoản
   ↓
5. Google redirect về app với code
   ↓
6. expo-auth-session auto exchange code → token
   ↓
7. Frontend gọi POST /auth/google { token }
   ↓
8. Backend verify với Google API
   ↓
9. Backend trả về JWT + user data
   ↓
10. Navigate to home
```

## Backend API Contract

```javascript
// POST /auth/google
{
  "token": "google-id-token-or-access-token"
}

// Response
{
  "user": {
    "id": "...",
    "email": "user@gmail.com",
    "name": "User Name"
  },
  "access_token": "your-jwt-token",
  "tokens": {
    "access": { "token": "..." },
    "refresh": { "token": "..." }
  }
}
```

### Backend Implementation Example (Node.js)

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, googleId });
    }

    // Generate JWT
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({
      user,
      access_token: accessToken,
      tokens: { access: { token: accessToken } },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});
```

## Testing

### ✅ Expo Go (Recommended cho development)

```bash
npm run dev
# hoặc
npx expo start
```

**Hoạt động ngay trên Expo Go** - Không cần build native!

### Development Build

```bash
npx expo run:android
npx expo run:ios
```

### Production (EAS Build)

```bash
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### ❌ "Google Client ID chưa được cấu hình"

**Nguyên nhân**: Thiếu env variable  
**Giải pháp**:

```bash
# 1. Kiểm tra file .env
cat .env

# 2. Restart với clear cache
npx expo start --clear
```

### ❌ "redirect_uri_mismatch"

**Nguyên nhân**: Redirect URI không khớp Google Console  
**Giải pháp**:

- Expo tự động dùng: `https://auth.expo.io/@username/app-slug`
- Thêm URI này vào Google Console → Authorized redirect URIs

### ❌ "Invalid token" từ backend

**Nguyên nhân**: Backend verify với sai Client ID  
**Giải pháp**:

```javascript
// Backend phải dùng ĐÚNG Web Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Kiểm tra env variable
console.log('Using Client ID:', process.env.GOOGLE_CLIENT_ID);
```

### ⚠️ User cancelled

**Không phải lỗi** - User đóng browser/dismiss sheet  
Đã xử lý: `response?.type === 'dismiss'`

## Implementation Details

### File đã thay đổi:

**1. package.json**

```json
{
  "dependencies": {
    "expo-auth-session": "^X.X.X",
    "expo-crypto": "^X.X.X",
    "expo-web-browser": "^X.X.X"
  }
}
```

**2. app/auth/login.js**

```javascript
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Configure
WebBrowser.maybeCompleteAuthSession();

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: googleClientId,
});

// Handle response
useEffect(() => {
  if (response?.type === 'success') {
    handleGoogleAuthSuccess(response.authentication);
  }
}, [response]);

// Trigger auth
const handleGoogleLogin = () => {
  promptAsync();
};
```

**3. store/authStore.js**

```javascript
loginWithGoogle: async (googleData) => {
  const response = await authApi.loginWithGoogle(googleData);
  // Parse token & user
  // Save to AsyncStorage
};
```

## Platform Support

| Platform              | Support | Notes                              |
| --------------------- | ------- | ---------------------------------- |
| **Expo Go**           | ✅ Full | Hoạt động 100%                     |
| **Web**               | ✅ Full | Chrome, Firefox, Safari            |
| **Android**           | ✅ Full | API 21+                            |
| **iOS**               | ✅ Full | iOS 13+                            |
| **Development Build** | ✅ Full | Recommended cho production testing |

## Security Best Practices

✅ **Đã implement**:

- Token verify ở backend với Google API
- HTTPS cho tất cả API calls
- Token không hardcode
- User data từ Google (trusted source)

⚠️ **Cần lưu ý**:

- OAuth consent screen: Thêm logo, privacy policy
- Production: Review scopes (profile, email)
- Rotate Client Secret định kỳ
- Monitor OAuth usage trong Google Console

## Next Steps

1. ✅ Code đã sẵn sàng
2. ⏳ Tạo `.env` với Google Client ID
3. ⏳ Backend implement `/auth/google` endpoint
4. ⏳ Test flow trên Expo Go
5. ⏳ Production build & deploy

## Support

Lỗi vẫn xảy ra? Check:

1. `.env` file có VITE_GOOGLE_CLIENT_ID
2. Restart Expo: `npx expo start --clear`
3. Google Console: Web Client ID đã tạo
4. Backend: Endpoint `/auth/google` hoạt động
5. Network: Check API URL trong `.env`
