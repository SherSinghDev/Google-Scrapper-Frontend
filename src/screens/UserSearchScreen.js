import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  FlatList,
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api, { downloadExcelFile, downloadCSVFile } from '../config/api';
import LeadCard from '../components/LeadCard';
import FilterBar from '../components/FilterBar';
import { 
  Search, 
  MapPin, 
  Sliders, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Building,
  Check
} from 'lucide-react-native';

const PRESET_SEARCHES = [
  { query: 'Dental Clinics', city: 'Austin' },
  { query: 'Digital Marketing Agencies', city: 'New York' },
  { query: 'Real Estate Brokers', city: 'Miami' },
  { query: 'Law Firms', city: 'Chicago' },
  { query: 'Coffee Roasters', city: 'London' }
];

export default function UserSearchScreen() {
  const { user, refreshProfile } = useAuth();
  const [query, setQuery] = useState('Dental Clinics');
  const [city, setCity] = useState('New York');
  const [maxResults, setMaxResults] = useState(25);
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [leads, setLeads] = useState([]);
  const [searchMeta, setSearchMeta] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhoneOnly, setFilterPhoneOnly] = useState(false);
  const [filterWebsiteOnly, setFilterWebsiteOnly] = useState(false);
  const [filterRatingMin, setFilterRatingMin] = useState(0);

  const handleSearch = async () => {
    if (!query.trim() || !city.trim()) {
      setErrorMessage('Please enter both a business category and city.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/scraper/search', {
        query: query.trim(),
        city: city.trim(),
        maxResults,
        saveLeads: true
      });

      if (res.data?.success) {
        setLeads(res.data.leads || []);
        setSearchMeta({
          query: res.data.query,
          city: res.data.city,
          total: res.data.total,
          durationMs: res.data.durationMs,
          searchId: res.data.searchId
        });
        setSuccessMessage(`Successfully scraped ${res.data.total} business leads in ${res.data.durationMs}ms!`);
        refreshProfile();
      } else {
        setErrorMessage(res.data?.message || 'Search failed.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Network error while scraping Google Maps.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (filteredLeads.length === 0) return;
    setExportingExcel(true);
    try {
      await downloadExcelFile(filteredLeads, searchMeta || { query, city });
      setSuccessMessage('Excel spreadsheet downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to export Excel file.');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportCSV = async () => {
    if (filteredLeads.length === 0) return;
    setExportingCSV(true);
    try {
      await downloadCSVFile(filteredLeads, searchMeta || { query, city });
      setSuccessMessage('CSV file downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to export CSV file.');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleSaveLead = async (lead) => {
    try {
      await api.post('/scraper/save-lead', {
        ...lead,
        searchId: searchMeta?.searchId
      });
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  // Filter computation
  const filteredLeads = leads.filter((lead) => {
    if (filterPhoneOnly && (!lead.phone || lead.phone === 'N/A')) return false;
    if (filterWebsiteOnly && (!lead.website || lead.website === 'N/A')) return false;
    if (filterRatingMin > 0 && (lead.rating || 0) < filterRatingMin) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (lead.name || '').toLowerCase().includes(term);
      const matchEmail = (lead.email || '').toLowerCase().includes(term);
      const matchAddr = (lead.address || '').toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchAddr) return false;
    }
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Search Input Box */}
      <View style={styles.searchCard}>
        <View style={styles.searchHeader}>
          <View style={styles.searchHeaderLeft}>
            <Sparkles size={18} color={Colors.primary} />
            <Text style={styles.searchHeaderTitle}>Google Maps Lead Finder</Text>
          </View>
        </View>

        {/* Input Row */}
        <View style={styles.inputsGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Category / Keywords</Text>
            <View style={styles.inputWrapper}>
              <Building size={16} color={Colors.primary} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Dental Clinics, Real Estate, Gyms"
                placeholderTextColor={Colors.textDim}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City & Region / Country</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={16} color={Colors.danger} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. New York, Miami, London"
                placeholderTextColor={Colors.textDim}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        </View>

        {/* Bottom Options Row */}
        <View style={styles.optionsRow}>
          {/* Preset Buttons */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetLabel}>Quick Presets:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.presetsList}>
                {PRESET_SEARCHES.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => {
                      setQuery(preset.query);
                      setCity(preset.city);
                    }}
                  >
                    <Text style={styles.presetChipText}>{preset.query} ({preset.city})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Limit selector & Action Button */}
          <View style={styles.actionsContainer}>
            <View style={styles.limitPicker}>
              <Sliders size={14} color={Colors.textMuted} />
              {[15, 25, 50, 100].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.limitBtn, maxResults === num && styles.limitBtnActive]}
                  onPress={() => setMaxResults(num)}
                >
                  <Text style={[styles.limitBtnText, maxResults === num && styles.limitBtnTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.searchSubmitBtn}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" size="small" />
              ) : (
                <>
                  <Search size={16} color="#0B0F19" />
                  <Text style={styles.searchSubmitText}>Extract Leads</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Alerts */}
        {errorMessage ? (
          <View style={styles.alertError}>
            <AlertCircle size={16} color={Colors.danger} />
            <Text style={styles.alertErrorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.alertSuccess}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.alertSuccessText}>{successMessage}</Text>
          </View>
        ) : null}
      </View>

      {/* Results & Export Actions Section */}
      {leads.length > 0 && (
        <View style={styles.resultsContainer}>
          {/* Top Actions Bar */}
          <View style={styles.resultsActionBar}>
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsTitle}>
                {searchMeta?.query} in {searchMeta?.city}
              </Text>
              <Text style={styles.resultsSub}>
                Extracted {leads.length} verified business profiles
              </Text>
            </View>

            {/* Download Buttons */}
            <View style={styles.exportButtonsRow}>
              <TouchableOpacity
                style={styles.excelExportBtn}
                onPress={handleExportExcel}
                disabled={exportingExcel}
                activeOpacity={0.8}
              >
                {exportingExcel ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <FileSpreadsheet size={16} color="#FFFFFF" />
                    <Text style={styles.excelExportText}>Download Excel (.xlsx)</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.csvExportBtn}
                onPress={handleExportCSV}
                disabled={exportingCSV}
                activeOpacity={0.8}
              >
                {exportingCSV ? (
                  <ActivityIndicator color={Colors.text} size="small" />
                ) : (
                  <>
                    <Download size={14} color={Colors.text} />
                    <Text style={styles.csvExportText}>CSV</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Bar */}
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPhoneOnly={filterPhoneOnly}
            setFilterPhoneOnly={setFilterPhoneOnly}
            filterWebsiteOnly={filterWebsiteOnly}
            setFilterWebsiteOnly={setFilterWebsiteOnly}
            filterRatingMin={filterRatingMin}
            setFilterRatingMin={setFilterRatingMin}
            totalCount={leads.length}
            filteredCount={filteredLeads.length}
          />

          {/* Lead Cards List */}
          <View style={styles.leadsGrid}>
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id || lead.name}
                lead={lead}
                onSaveLead={handleSaveLead}
              />
            ))}
          </View>
        </View>
      )}

      {/* Empty State when no search yet */}
      {leads.length === 0 && !loading && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <MapPin size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Ready to Extract High-Quality Leads?</Text>
          <Text style={styles.emptySubtitle}>
            Input any business niche and target city above to generate verified business names, telephone numbers, emails, addresses, and instant Excel spreadsheets.
          </Text>
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
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  searchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  aiBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  aiBadgeText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700'
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16
  },
  inputGroup: {
    flex: 1,
    minWidth: 260
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 10
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12
  },
  presetsContainer: {
    flex: 1,
    minWidth: 280
  },
  presetLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  presetsList: {
    flexDirection: 'row',
    gap: 6
  },
  presetChip: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  presetChipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500'
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  limitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  limitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  limitBtnActive: {
    backgroundColor: Colors.primary
  },
  limitBtnText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  limitBtnTextActive: {
    color: '#0B0F19',
    fontWeight: '800'
  },
  searchSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  searchSubmitText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800'
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 14
  },
  alertErrorText: {
    color: Colors.danger,
    fontSize: 12,
    flex: 1
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 14
  },
  alertSuccessText: {
    color: Colors.success,
    fontSize: 12,
    flex: 1
  },
  resultsContainer: {
    marginTop: 8
  },
  resultsActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  resultsInfo: {
    flex: 1,
    minWidth: 200
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2
  },
  resultsSub: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  exportButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  excelExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.excelGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: Colors.excelGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8
  },
  excelExportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  csvExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8
  },
  csvExportText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600'
  },
  leadsGrid: {
    gap: 12
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 460,
    lineHeight: 18
  }
});
