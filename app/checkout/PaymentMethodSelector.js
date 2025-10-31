

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const METHODS = [
    {
        key: 'cash',
        title: 'Thanh toán khi nhận hàng',
        description: 'Trả tiền mặt (COD) khi nhận hàng',
        icon: 'cash-multiple',
    },
    {
        key: 'card',
        title: 'VNPay',
        description: 'Thanh toán trực tuyến qua VNPay',
        icon: 'bank-transfer',
    },
];

export default function PaymentMethodSelector({
    value,
    onChange,
    disabled = false,
    style,
}) {
    const theme = useTheme();

    return (
        <View style={[styles.container, style]}>
            {METHODS.map((m, idx) => {
                const selected = value === m.key;
                return (
                    <Surface
                        key={m.key}
                        elevation={selected ? 3 : 1}
                        style={[
                            styles.item,
                            {
                                borderColor: selected
                                    ? theme.colors.primary
                                    : theme.colors.outlineVariant,
                                opacity: disabled ? 0.6 : 1,
                                backgroundColor: selected
                                    ? theme.colors.primaryContainer
                                    : theme.colors.surface,
                            },
                        ]}
                    >
                        <TouchableRipple
                            disabled={disabled}
                            onPress={() => onChange && onChange(m.key)}
                            borderless
                            style={styles.ripple}
                        >
                            <View style={styles.row}>
                                <View style={styles.left}>
                                    <MaterialCommunityIcons
                                        name={m.icon}
                                        size={24}
                                        color={
                                            selected ? theme.colors.primary : theme.colors.onSurface
                                        }
                                        style={styles.icon}
                                    />
                                    <View style={styles.texts}>
                                        <Text
                                            variant="titleMedium"
                                            style={[
                                                styles.title,
                                                {
                                                    color: selected
                                                        ? theme.colors.primary
                                                        : theme.colors.onSurface,
                                                },
                                            ]}
                                        >
                                            {m.title}
                                        </Text>
                                        {m.description ? (
                                            <Text
                                                variant="bodySmall"
                                                style={{
                                                    color: theme.colors.onSurfaceVariant,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {m.description}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>

                                <MaterialCommunityIcons
                                    name={selected ? 'check-circle' : 'circle-outline'}
                                    size={24}
                                    color={selected ? theme.colors.primary : theme.colors.outline}
                                />
                            </View>
                        </TouchableRipple>
                    </Surface>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    item: {
        borderWidth: 1.5,
        borderRadius: 14,
        overflow: 'hidden',
    },
    ripple: {
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 12,
    },
    icon: {
        marginRight: 12,
    },
    texts: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        marginBottom: 2,
    },
});