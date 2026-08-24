import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { 
  Phone, 
  Globe, 
  Mail, 
  MapPin, 
  Star, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Instagram,
  Linkedin,
  Facebook,
  Copy,
  Check
} from 'lucide-react-native';

export default function LeadCard({ lead, onSaveLead, isSaved = false }) {
  const [copiedField, setCopiedField] = useState(null);
  const [saved, setSaved] = useState(isSaved);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const openUrl = (url) => {
    if (!url) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(finalUrl, '_blank');
    } else {
      Linking.openURL(finalUrl).catch(err => console.error('Error opening URL:', err));
    }
  };

  const handleSaveToggle = () => {
    setSaved(!saved);
    if (onSaveLead) {
      onSaveLead(lead);
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{lead.category || 'Business'}</Text>
          </View>
          <Text style={styles.businessName} numberOfLines={1}>
            {lead.name}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saved && styles.savedBtnActive]} 
          onPress={handleSaveToggle}
          activeOpacity={0.7}
        >
          {saved ? (
            <BookmarkCheck size={16} color={Colors.primary} />
          ) : (
            <Bookmark size={16} color={Colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Ratings & Status Row */}
      <View style={styles.metaRow}>
        <View style={styles.ratingBox}>
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>{lead.rating || '4.8'}</Text>
          <Text style={styles.reviewsText}>({lead.reviewsCount || 0} reviews)</Text>
        </View>

        {lead.workingHours && (
          <View style={styles.hoursBox}>
            <Clock size={12} color={Colors.textMuted} />
            <Text style={styles.hoursText} numberOfLines={1}>{lead.workingHours}</Text>
          </View>
        )}
      </View>

      {/* Contact Grid */}
      <View style={styles.contactSection}>
        {/* Phone */}
        {lead.phone && lead.phone !== 'N/A' && (
          <View style={styles.contactRow}>
            <Phone size={14} color={Colors.primary} />
            <TouchableOpacity 
              style={styles.contactLink} 
              onPress={() => openUrl(`tel:${lead.phone}`)}
            >
              <Text style={styles.contactText}>{lead.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.miniCopyBtn} 
              onPress={() => handleCopy(lead.phone, 'phone')}
            >
              {copiedField === 'phone' ? (
                <Check size={12} color={Colors.success} />
              ) : (
                <Copy size={12} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Email */}
        {lead.email && (
          <View style={styles.contactRow}>
            <Mail size={14} color={Colors.secondary} />
            <TouchableOpacity 
              style={styles.contactLink} 
              onPress={() => openUrl(`mailto:${lead.email}`)}
            >
              <Text style={styles.contactText}>{lead.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.miniCopyBtn} 
              onPress={() => handleCopy(lead.email, 'email')}
            >
              {copiedField === 'email' ? (
                <Check size={12} color={Colors.success} />
              ) : (
                <Copy size={12} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Website */}
        {lead.website && lead.website !== 'N/A' && (
          <View style={styles.contactRow}>
            <Globe size={14} color={Colors.accent} />
            <TouchableOpacity 
              style={styles.contactLink} 
              onPress={() => openUrl(lead.website)}
            >
              <Text style={[styles.contactText, styles.linkText]} numberOfLines={1}>
                {lead.domain || lead.website.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
            <ExternalLink size={12} color={Colors.textMuted} />
          </View>
        )}

        {/* Address */}
        {lead.address && (
          <View style={styles.contactRow}>
            <MapPin size={14} color={Colors.danger} />
            <TouchableOpacity 
              style={styles.contactLink} 
              onPress={() => openUrl(lead.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(lead.name + ' ' + lead.address)}`)}
            >
              <Text style={styles.addressText} numberOfLines={2}>
                {lead.address}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Socials & Actions Footer */}
      <View style={styles.footerRow}>
        <View style={styles.socialsGroup}>
          {lead.socials?.instagram && (
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => openUrl(lead.socials.instagram)}
            >
              <Instagram size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          {lead.socials?.linkedin && (
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => openUrl(lead.socials.linkedin)}
            >
              <Linkedin size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          {lead.socials?.facebook && (
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => openUrl(lead.socials.facebook)}
            >
              <Facebook size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.viewMapsBtn}
          onPress={() => openUrl(lead.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(lead.name)}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewMapsText}>Google Maps</Text>
          <ExternalLink size={12} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8
  },
  titleArea: {
    flex: 1
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6
  },
  categoryText: {
    color: Colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  savedBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.primary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 12
  },
  reviewsText: {
    color: Colors.textMuted,
    fontSize: 11
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  hoursText: {
    color: Colors.textMuted,
    fontSize: 11
  },
  contactSection: {
    gap: 8,
    marginBottom: 12
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  contactLink: {
    flex: 1
  },
  contactText: {
    color: Colors.text,
    fontSize: 13
  },
  linkText: {
    color: Colors.primary
  },
  addressText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16
  },
  miniCopyBtn: {
    padding: 4
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  socialsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  viewMapsText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600'
  }
});
