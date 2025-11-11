import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useCartStore } from '../../store/cartStore';

export default function TabLayout() {
  const theme = useTheme();
  const { cart } = useCartStore();
  const items = cart?.items || [];
  const cartItemsCount = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 6,
          shadowColor: '#001f3f',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          height: Platform.OS === 'ios' ? 72 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 16,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 'bold',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'cart' : 'cart-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'clipboard-clock' : 'clipboard-clock-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
