import apiClient from "./apiClient";



export const getOrders = async (status) => {
    try {
        const data = await apiClient.get('/orders', { params: { status } });
        return data.data;
    } catch (error) {
        // caller can handle the error
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await apiClient.post('/orders', orderData);
        return response;
    }
    catch (error) {
        // caller can handle the error
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const data = await apiClient.patch(`/orders/${orderId}/${status}`);
        return data;
    } catch (error) {
        // caller can handle the error
        throw error;
    }
};

export const getOrderById = async (orderId) => {
    try {
        const data = await apiClient.get(`/orders/${orderId}`);
        return data;
    } catch (error) {
        // caller can handle the error
        throw error;
    }
};

export const getOrderLogs = async (orderId) => {
    try {
        const data = await apiClient.get(`/orders/${orderId}/logs`);
        return data?.data || data; // { success, data } or raw
    } catch (error) {
        throw error;
    }
};


