import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  FlatList,
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import api, { downloadExcelFile } from '../config/api';
import LeadCard from '../components/LeadCard';
import { 
  History, 
  Bookmark, 
  Calendar, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle, 
  RefreshCw,
  Search,
  Clock
} from 'lucide-react-native';

export default function UserHistoryScreen() {
  const [activeTab, setActiveTab] = useState('searches'); // 'searches' | 'saved'
  const [searches, setSearches] = useState([]);
  const [savedLeads, setSavedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, savedRes] = await Promise.all([
        api.get('/scraper/history'),
        api.get('/scraper/saved-leads')
      ]);

      if (historyRes.data?.success) {
        setSearches(historyRes.data.searches || []);
      }
      if (savedRes.data?.success) {
        setSavedLeads(savedRes.data.leads || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSavedLead = async (id) => {
    try {
      await api.delete(`/scraper/saved-leads/${id}`);
      setSavedLeads(savedLeads.filter(lead => (lead.id || lead._id) !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleExportSavedLeads = async () => {
    if (savedLeads.length === 0) return;
    try {
      await downloadExcelFile(savedLeads, { city: 'Saved_Leads' });
    } catch (err) {
      console.error('Export saved leads error:', err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header & Tabs */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Search Logs & Saved Leads</Text>
            <Text style={styles.headerSub}>Access your past Google Maps queries and bookmark library</Text>
          </View>

          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={fetchData}
            activeOpacity={0.7}
          >
            <RefreshCw size={14} color={Colors.textSecondary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'searches' && styles.tabActive]}
            onPress={() => setActiveTab('searches')}
          >
            <History size={14} color={activeTab === 'searches' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'searches' && styles.tabTextActive]}>
              Past Searches ({searches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Bookmark size={14} color={activeTab === 'saved' ? Colors.secondary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved Leads ({savedLeads.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading history & records...</Text>
        </View>
      ) : activeTab === 'searches' ? (
        /* Searches History Table */
        <View style={styles.listContainer}>
          {searches.length === 0 ? (
            <View style={styles.emptyCard}>
              <History size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Searches Yet</Text>
              <Text style={styles.emptySub}>Your search logs will automatically appear here.</Text>
            </View>
          ) : (
            searches.map((item, index) => (
              <View key={item.id || item._id || index} style={styles.searchItem}>
                <View style={styles.searchItemLeft}>
                  <View style={styles.searchIconBox}>
                    <Search size={16} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.queryTitle}>
                      {item.query} <Text style={styles.cityText}>in {item.city}</Text>
                    </Text>
                    <View style={styles.searchMetaRow}>
                      <View style={styles.metaBadge}>
                        <CheckCircle size={10} color={Colors.success} />
                        <Text style={styles.metaBadgeText}>{item.totalResults || item.total_results || 0} Leads Found</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Clock size={10} color={Colors.textMuted} />
                        <Text style={styles.metaBadgeText}>{item.durationMs || item.duration_ms || 0}ms</Text>
                      </View>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt || item.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      ) : (
        /* Saved Leads View */
        <View style={styles.listContainer}>
          {savedLeads.length > 0 && (
            <View style={styles.savedActionBar}>
              <Text style={styles.savedCountText}>{savedLeads.length} bookmarked leads</Text>
              <TouchableOpacity 
                style={styles.exportAllBtn}
                onPress={handleExportSavedLeads}
              >
                <FileSpreadsheet size={14} color="#FFFFFF" />
                <Text style={styles.exportAllText}>Export All Saved to Excel</Text>
              </TouchableOpacity>
            </View>
          )}

          {savedLeads.length === 0 ? (
            <View style={styles.emptyCard}>
              <Bookmark size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Saved Leads</Text>
              <Text style={styles.emptySub}>Click the bookmark icon on any lead card to save it for later.</Text>
            </View>
          ) : (
            savedLeads.map((lead) => (
              <LeadCard
                key={lead.id || lead._id}
                lead={lead}
                isSaved={true}
                onSaveLead={() => handleDeleteSavedLead(lead.id || lead._id)}
              />
            ))
          )}
        </View>
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
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4
  },
  headerSub: {
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
    paddingVertical: 6,
    borderRadius: 6
  },
  refreshText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 4,
    gap: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 6
  },
  tabActive: {
    backgroundColor: Colors.surfaceHover
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '700'
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
  listContainer: {
    gap: 12
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16
  },
  searchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  searchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  queryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4
  },
  cityText: {
    color: Colors.primary,
    fontWeight: '600'
  },
  searchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  metaBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500'
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 11
  },
  savedActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8
  },
  savedCountText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  exportAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.excelGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  exportAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary
  }
});
