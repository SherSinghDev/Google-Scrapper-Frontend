import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Search, Phone, Globe, Star, X } from 'lucide-react-native';

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  filterPhoneOnly,
  setFilterPhoneOnly,
  filterWebsiteOnly,
  setFilterWebsiteOnly,
  filterRatingMin,
  setFilterRatingMin,
  totalCount,
  filteredCount
}) {
  return (
    <View style={styles.container}>
      {/* Search Filter Input */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Filter leads by name, email, or address..."
            placeholderTextColor={Colors.textDim}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            Showing {filteredCount} / {totalCount}
          </Text>
        </View>
      </View>

      {/* Filter Badges / Toggles */}
      <View style={styles.filterChipsRow}>
        <TouchableOpacity
          style={[styles.chip, filterPhoneOnly && styles.chipActive]}
          onPress={() => setFilterPhoneOnly(!filterPhoneOnly)}
          activeOpacity={0.7}
        >
          <Phone size={12} color={filterPhoneOnly ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.chipText, filterPhoneOnly && styles.chipTextActive]}>
            Has Phone
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterWebsiteOnly && styles.chipActive]}
          onPress={() => setFilterWebsiteOnly(!filterWebsiteOnly)}
          activeOpacity={0.7}
        >
          <Globe size={12} color={filterWebsiteOnly ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.chipText, filterWebsiteOnly && styles.chipTextActive]}>
            Has Website
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterRatingMin > 0 && styles.chipActive]}
          onPress={() => setFilterRatingMin(filterRatingMin > 0 ? 0 : 4.5)}
          activeOpacity={0.7}
        >
          <Star size={12} color={filterRatingMin > 0 ? '#F59E0B' : Colors.textMuted} fill={filterRatingMin > 0 ? '#F59E0B' : 'none'} />
          <Text style={[styles.chipText, filterRatingMin > 0 && styles.chipTextActive]}>
            4.5+ Rating
          </Text>
        </TouchableOpacity>

        {(filterPhoneOnly || filterWebsiteOnly || filterRatingMin > 0 || searchTerm) && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearchTerm('');
              setFilterPhoneOnly(false);
              setFilterWebsiteOnly(false);
              setFilterRatingMin(0);
            }}
          >
            <Text style={styles.resetText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10
  },
  inputWrapper: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    gap: 8
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 13
  },
  counterBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  counterText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  chipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.primary
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500'
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700'
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  resetText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600'
  }
});
