import { Stack } from 'expo-router';

export default function Checkout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="ChangeAddressScreen" />
            <Stack.Screen name="NewAddressScreen" />
        </Stack>
    );
}