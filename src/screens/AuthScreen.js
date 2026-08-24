import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  FileSpreadsheet, 
  Zap,
  AlertCircle
} from 'lucide-react-native';

export default function AuthScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.cardWrapper}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Compass size={32} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>LeadMap Enterprise</Text>
          <Text style={styles.brandSubtitle}>
            Live Google Maps Intelligence & B2B Lead Extraction Platform
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightItem}>
            <Zap size={14} color={Colors.primary} />
            <Text style={styles.highlightText}>Real-Time Google Maps Scraper</Text>
          </View>
          <View style={styles.highlightItem}>
            <FileSpreadsheet size={14} color={Colors.success} />
            <Text style={styles.highlightText}>Excel (.xlsx) & CSV Exports</Text>
          </View>
        </View>

        {/* Login Form Box */}
        <View style={styles.formCard}>
          <View style={styles.formTitleRow}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.formCardTitle}>Account Login</Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="name@company.com"
                placeholderTextColor={Colors.textDim}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••••"
                placeholderTextColor={Colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0B0F19" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Sign In to Workspace</Text>
                <ArrowRight size={18} color="#0B0F19" />
              </>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.noticeBox}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.noticeText}>
              Security Policy: All user accounts are created and provisioned exclusively by the Super Administrator.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  contentContainer: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center'
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 360
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  highlightText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  formCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    flex: 1
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 10
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 46,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitBtnText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800'
  },
  quickFillContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginBottom: 16
  },
  quickFillTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center'
  },
  quickBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 10,
    borderRadius: 8
  },
  quickBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600'
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 8,
    padding: 10
  },
  noticeText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    flex: 1
  }
});
