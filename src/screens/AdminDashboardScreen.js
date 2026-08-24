import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import api from '../config/api';
import StatsCard from '../components/StatsCard';
import { 
  Users, 
  Search, 
  Database, 
  FileSpreadsheet, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  MapPin, 
  TrendingUp,
  Clock,
  UserCheck
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [topCities, setTopCities] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
        setActivities(res.data.recentActivity || []);
        setTopCities(res.data.topCities || []);
        setTopCategories(res.data.topCategories || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getActionBadge = (type) => {
    switch (type) {
      case 'LOGIN':
        return { label: 'LOGIN', color: Colors.primary, bg: 'rgba(6, 182, 212, 0.12)' };
      case 'SEARCH':
        return { label: 'SEARCH', color: Colors.secondary, bg: 'rgba(99, 102, 241, 0.12)' };
      case 'EXPORT_EXCEL':
        return { label: 'EXCEL EXPORT', color: Colors.success, bg: 'rgba(16, 185, 129, 0.15)' };
      case 'EXPORT_CSV':
        return { label: 'CSV EXPORT', color: Colors.warning, bg: 'rgba(245, 158, 11, 0.15)' };
      case 'USER_CREATED':
        return { label: 'USER CREATED', color: Colors.accent, bg: 'rgba(139, 92, 246, 0.15)' };
      case 'STATUS_CHANGE':
        return { label: 'STATUS CHANGE', color: Colors.danger, bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: type, color: Colors.textMuted, bg: Colors.surfaceLight };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View>
          <View style={styles.titleRow}>
            <ShieldCheck size={22} color={Colors.primary} />
            <Text style={styles.bannerTitle}>Super Admin Command Center</Text>
          </View>
          <Text style={styles.bannerSub}>
            Platform analytics, user tracking, and real-time audit stream powered by MongoDB
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshBtn}
          onPress={fetchAdminData}
          activeOpacity={0.7}
        >
          <RefreshCw size={14} color={Colors.textSecondary} />
          <Text style={styles.refreshText}>Live Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching system metrics & logs...</Text>
        </View>
      ) : (
        <>
          {/* KPI Metrics Grid */}
          <View style={styles.kpiGrid}>
            <StatsCard
              title="Total Accounts"
              value={stats?.totalUsers || 0}
              subtitle={`${stats?.totalMembers || 0} Members · ${stats?.totalAdmins || 0} Admins`}
              icon={Users}
              color={Colors.primary}
              badge={`${stats?.activeUsers || 0} ACTIVE`}
            />
            <StatsCard
              title="Platform Searches"
              value={stats?.totalSearches || 0}
              subtitle={`${stats?.totalExports || 0} Excel/CSV downloads`}
              icon={Search}
              color={Colors.secondary}
              badge="LOGGED"
            />
            <StatsCard
              title="Leads Extracted"
              value={stats?.totalLeadsExtracted || 0}
              subtitle="Scraped from Google Maps"
              icon={TrendingUp}
              color={Colors.success}
              badge="REAL DATA"
            />
            <StatsCard
              title="Database Engine"
              value="MongoDB"
              subtitle="Status: Live & Operational"
              icon={Database}
              color={Colors.accent}
              badge="CONNECTED"
            />
          </View>

          {/* Analytics Breakdown Grid */}
          <View style={styles.twoColumnGrid}>
            {/* Top Searched Cities */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={Colors.danger} />
                <Text style={styles.sectionTitle}>Top Searched Cities</Text>
              </View>
              {topCities.length === 0 ? (
                <Text style={styles.emptyNotice}>No city search data yet.</Text>
              ) : (
                topCities.map((item, idx) => (
                  <View key={idx} style={styles.rankItem}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                    </View>
                    <Text style={styles.rankName}>{item.city}</Text>
                    <Text style={styles.rankScore}>{item.count} searches ({item.leads || 0} leads)</Text>
                  </View>
                ))
              )}
            </View>

            {/* Top Business Categories */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Top Target Niches</Text>
              </View>
              {topCategories.length === 0 ? (
                <Text style={styles.emptyNotice}>No category search data yet.</Text>
              ) : (
                topCategories.map((item, idx) => (
                  <View key={idx} style={styles.rankItem}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                    </View>
                    <Text style={styles.rankName}>{item.query}</Text>
                    <Text style={styles.rankScore}>{item.count} runs</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Real-time Activity Audit Feed */}
          <View style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <View style={styles.feedHeaderLeft}>
                <Activity size={18} color={Colors.primary} />
                <Text style={styles.feedTitle}>Real-Time User Activity & Audit Stream</Text>
              </View>
              <Text style={styles.feedSubtitle}>Tracking all searches, logins, and export actions</Text>
            </View>

            <View style={styles.feedList}>
              {activities.length === 0 ? (
                <Text style={styles.emptyNotice}>No activities logged yet.</Text>
              ) : (
                activities.map((act) => {
                  const badge = getActionBadge(act.actionType);
                  return (
                    <View key={act.id || act._id} style={styles.activityRow}>
                      <View style={[styles.actionTag, { backgroundColor: badge.bg, borderColor: `${badge.color}40` }]}>
                        <Text style={[styles.actionTagText, { color: badge.color }]}>{badge.label}</Text>
                      </View>

                      <View style={styles.activityContent}>
                        <View style={styles.activityUserRow}>
                          <Text style={styles.userNameText}>{act.userName || act.userEmail || 'System'}</Text>
                          <Text style={styles.timeText}>
                            {new Date(act.createdAt).toLocaleTimeString()} · {new Date(act.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.descText}>{act.description}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  contentContainer: {
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text
  },
  bannerSub: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  refreshText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20
  },
  sectionCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700'
  },
  rankName: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600'
  },
  rankScore: {
    color: Colors.textSecondary,
    fontSize: 12
  },
  feedCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20
  },
  feedHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  feedSubtitle: {
    fontSize: 12,
    color: Colors.textMuted
  },
  feedList: {
    gap: 12
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  actionTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  activityContent: {
    flex: 1
  },
  activityUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted
  },
  descText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16
  },
  emptyNotice: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 10
  }
});
