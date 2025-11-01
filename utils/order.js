import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setOrderData(cacheKey, order) {
    try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(order));
    } catch (err) {
        console.warn('setOrderData error', err);
    }
}
export async function getOrderData(cacheKey) {
    try {
        const json = await AsyncStorage.getItem(cacheKey);
        return json ? JSON.parse(json) : null;
    } catch (err) {
        console.warn('getOrderData error', err);
    }
}