const dotenv = require('dotenv');
const fs = require('fs');

// Load .env if present
if (fs.existsSync('.env')) {
  dotenv.config();
}

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000/v1',
      VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '',
      VITE_GOOGLE_ANDROID_CLIENT_ID:
        process.env.VITE_GOOGLE_ANDROID_CLIENT_ID || '',
    },
  };
};
