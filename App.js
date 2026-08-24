import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from './src/theme/colors';
import Header from './src/components/Header';
import AuthScreen from './src/screens/AuthScreen';
import UserSearchScreen from './src/screens/UserSearchScreen';
import UserHistoryScreen from './src/screens/UserHistoryScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';

function MainApp() {
  const { isAuthenticated, loading, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('search');

  // Auto-switch default tab depending on role
  React.useEffect(() => {
    if (isSuperAdmin) {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('search');
    }
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={styles.content}>
        {activeTab === 'admin_dashboard' && isSuperAdmin && <AdminDashboardScreen />}
        {activeTab === 'admin_users' && isSuperAdmin && <AdminUsersScreen />}
        {activeTab === 'search' && <UserSearchScreen />}
        {activeTab === 'history' && <UserHistoryScreen />}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' ? { height: '100vh', display: 'flex', flexDirection: 'column' } : {})
  },
  content: {
    flex: 1
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { height: '100vh' } : {})
  }
});
