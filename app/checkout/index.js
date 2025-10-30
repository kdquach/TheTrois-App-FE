import { View, StyleSheet } from 'react-native';
import { Text, Button, Divider, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function ShippingAddressSection({ address, style }) {
    const router = useRouter();

    const onChangeAddress = () => {
        router.push({ pathname: '/checkout/ChangeAddressScreen', params: { from: 'cart' } });
    };

    const newAddress = () => {
        router.push({ pathname: '/checkout/NewAddressScreen', params: { from: 'newAddress' } });
    }
    const theme = useTheme();
    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }, style]} elevation={3}>
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="map-marker" size={22} color={theme.colors.starbucksGreen || theme.colors.primary} />
                    <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                        Địa chỉ giao hàng
                    </Text>
                </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            {address ? (
                <View style={styles.infoContainer}>
                    <View style={styles.lineRow}>
                        <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={18}
                            color={theme.colors.starbucksGreen || theme.colors.primary}
                            style={styles.lineIcon}
                        />
                        <Text
                            variant="bodyMedium"
                            style={[styles.addressText, { color: theme.colors.onSurface }]}
                        >
                            {address.ward.name}, {address.district.name}, {address.city.name}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.detailBox,
                            {
                                backgroundColor: theme.colors.primaryContainer,
                                borderLeftColor: theme.colors.starbucksGreen || theme.colors.primary,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="home-outline"
                            size={18}
                            color={theme.colors.onSurfaceVariant}
                            style={styles.lineIcon}
                        />
                        <Text
                            variant="bodyMedium"
                            style={[styles.detailText, { color: theme.colors.onSurface }]}
                            numberOfLines={2}
                        >
                            {address.street}
                        </Text>
                    </View>
                </View>
            ) : (
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Chưa có địa chỉ nào</Text>
            )}

            <View style={styles.actions}>
                {address ? (
                    <Button mode="outlined" onPress={onChangeAddress}>
                        Thay đổi
                    </Button>
                ) : (
                    <Button mode="contained" onPress={newAddress}>
                        + Thêm địa chỉ mới
                    </Button>
                )}
            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        marginLeft: 8,
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 12,
        opacity: 0.5,
    },
    infoContainer: {
        marginBottom: 12,
    },
    name: { fontWeight: '700' },
    address: { marginTop: 4, lineHeight: 20 },
    lineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    lineIcon: {
        marginRight: 8,
    },
    addressText: {
        flex: 1,
        lineHeight: 20,
    },
    detailBox: {
        marginTop: 10,
        padding: 10,
        borderRadius: 12,
        borderLeftWidth: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        flex: 1,
    },
    phone: { marginTop: 6 },
    emptyText: { fontStyle: 'italic', marginBottom: 12 },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
});
