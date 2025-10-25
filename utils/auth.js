import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const USER_DATA_KEY = 'auth_user_data';

export async function setAccessToken(token) {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (err) {
    console.warn('setAccessToken error', err);
  }
}

export async function getAccessToken() {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (err) {
    console.warn('getAccessToken error', err);
    return null;
  }
}

export async function clearAuth() {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (err) {
    console.warn('clearAuth error', err);
  }
}

export async function setUserData(user) {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('setUserData error', err);
  }
}

export async function getUserData() {
  try {
    const raw = await AsyncStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('getUserData error', err);
    return null;
  }
}
