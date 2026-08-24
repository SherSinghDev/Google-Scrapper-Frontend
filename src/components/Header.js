import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Users, 
  Search, 
  History, 
  LogOut, 
  ShieldCheck, 
  Compass, 
  Zap, 
  Database 
} from 'lucide-react-native';

export default function Header({ activeTab, setActiveTab }) {
  const { user, logout, isSuperAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Compass size={22} color={Colors.primary} />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>LeadMap</Text>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Google Maps Intelligence & Lead Scraper</Text>
          </View>
        </View>

        {/* User Info & Actions */}
        <View style={styles.userSection}>
          <View style={styles.quotaPill}>
            <Zap size={14} color={Colors.warning} />
            <Text style={styles.quotaText}>
              {isSuperAdmin || (user?.searchQuota || 0) >= 999999
                ? 'Unlimited Searches'
                : `Quota: ${Math.max(0, (user?.searchQuota || 100) - (user?.searchesUsed || 0))} left`}
            </Text>
          </View>

          <View style={styles.userBadge}>
            {isSuperAdmin ? (
              <View style={styles.adminRoleTag}>
                <ShieldCheck size={13} color="#FFFFFF" />
                <Text style={styles.adminRoleText}>SUPER ADMIN</Text>
              </View>
            ) : (
              <View style={styles.userRoleTag}>
                <Text style={styles.userRoleText}>MEMBER</Text>
              </View>
            )}
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || user?.email}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <LogOut size={16} color={Colors.textSecondary} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navBar}>
        {isSuperAdmin ? (
          <>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'admin_dashboard' && styles.activeTabBtn]}
              onPress={() => setActiveTab('admin_dashboard')}
            >
              <Database size={16} color={activeTab === 'admin_dashboard' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'admin_dashboard' && styles.activeTabText]}>
                Analytics & Logs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'admin_users' && styles.activeTabBtn]}
              onPress={() => setActiveTab('admin_users')}
            >
              <Users size={16} color={activeTab === 'admin_users' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'admin_users' && styles.activeTabText]}>
                User Management
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'search' && styles.activeTabBtn]}
              onPress={() => setActiveTab('search')}
            >
              <Search size={16} color={activeTab === 'search' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                Live Scraper
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
              onPress={() => setActiveTab('history')}
            >
              <History size={16} color={activeTab === 'history' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                History & Saved
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'search' && styles.activeTabBtn]}
              onPress={() => setActiveTab('search')}
            >
              <Search size={16} color={activeTab === 'search' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                Find Leads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
              onPress={() => setActiveTab('history')}
            >
              <History size={16} color={activeTab === 'history' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                Search History & Saved
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Platform.OS === 'web' ? 14 : 45,
    paddingHorizontal: 20,
    paddingBottom: 0
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5
  },
  proTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  proTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.textMuted
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  quotaText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600'
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  adminRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  adminRoleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  userRoleTag: {
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  userRoleText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700'
  },
  userName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 140
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  logoutText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  navBar: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 4
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: -1
  },
  activeTabBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700'
  }
});
