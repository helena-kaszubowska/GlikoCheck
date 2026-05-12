import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { MainTabParamList, ProductFlowParamList } from '../types/navigation';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<ProductFlowParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.background },
};

/** Każda zakładka ma swoją listę, ale szczegóły produktu są wspólne. */
function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProductList" component={ProductsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Szczegóły produktu' }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProductList" component={FavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Szczegóły produktu' }}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProductList" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Szczegóły produktu' }}
      />
    </Stack.Navigator>
  );
}

/** Tutaj jest ustawiona główna nawigacja z dolnymi zakładkami. */
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => {
            const map: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
              ProductsTab: 'nutrition',
              FavoritesTab: 'heart',
              HistoryTab: 'time',
              AboutTab: 'information-circle',
            };
            const name = map[route.name as keyof MainTabParamList];
            return <Ionicons name={name} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="ProductsTab" component={ProductsStack} options={{ title: 'Produkty' }} />
        <Tab.Screen name="FavoritesTab" component={FavoritesStack} options={{ title: 'Ulubione' }} />
        <Tab.Screen name="HistoryTab" component={HistoryStack} options={{ title: 'Historia' }} />
        <Tab.Screen name="AboutTab" component={AboutScreen} options={{ title: 'O aplikacji' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
