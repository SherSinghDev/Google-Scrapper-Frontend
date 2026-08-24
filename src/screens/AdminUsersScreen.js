import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Modal, 
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import api from '../config/api';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  KeyRound, 
  Trash2, 
  Sliders, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  Zap,
  User,
  Infinity as InfinityIcon
} from 'lucide-react-native';

const QUOTA_PRESETS = [50, 100, 250, 500, 1000, 999999];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create User Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newQuota, setNewQuota] = useState('100');
  const [newRole, setNewRole] = useState('USER'); // 'USER' | 'SUPER_ADMIN'
  const [createLoading, setCreateLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Quota Modal State
  const [quotaModalVisible, setQuotaModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editQuotaValue, setEditQuotaValue] = useState('100');

  // Reset Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      setModalError('Please fill name, email, and password.');
      return;
    }

    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    setCreateLoading(true);
    setModalError('');

    try {
      const quotaNum = newRole === 'SUPER_ADMIN' || newQuota === '999999' || String(newQuota).toLowerCase() === 'unlimited'
        ? 999999
        : (parseInt(newQuota, 10) || 100);

      const res = await api.post('/admin/users', {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        searchQuota: quotaNum,
        role: newRole
      });

      if (res.data?.success) {
        setCreateModalVisible(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewQuota('100');
        setNewRole('USER');
        fetchUsers();
      } else {
        setModalError(res.data?.message || 'Failed to create user.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Error creating user account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.patch(`/admin/users/${user.id || user._id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveQuota = async () => {
    if (!selectedUser) return;
    try {
      const quotaNum = editQuotaValue === '999999' || String(editQuotaValue).toLowerCase() === 'unlimited'
        ? 999999
        : (parseInt(editQuotaValue, 10) || 0);

      await api.put(`/admin/users/${selectedUser.id || selectedUser._id}`, {
        searchQuota: quotaNum
      });
      setQuotaModalVisible(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving quota:', err);
    }
  };

  const handleSaveResetPassword = async () => {
    if (!selectedUser || !resetPasswordValue) return;
    try {
      await api.post(`/admin/users/${selectedUser.id || selectedUser._id}/reset-password`, {
        newPassword: resetPasswordValue
      });
      setPasswordModalVisible(false);
      setResetPasswordValue('');
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    );
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View>
          <View style={styles.titleRow}>
            <Users size={22} color={Colors.primary} />
            <Text style={styles.bannerTitle}>User & Client Management</Text>
          </View>
          <Text style={styles.bannerSub}>
            Super Admin Authority: Create new users & administrators, grant quotas, and manage permissions
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.createUserBtn}
          onPress={() => {
            setModalError('');
            setCreateModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <UserPlus size={16} color="#0B0F19" />
          <Text style={styles.createUserBtnText}>Create New User</Text>
        </TouchableOpacity>
      </View>

      {/* Filter / Search Bar */}
      <View style={styles.filterRow}>
        <View style={styles.searchWrapper}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            placeholderTextColor={Colors.textDim}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <Text style={styles.userCountLabel}>{filteredUsers.length} Total Accounts</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading user records from MongoDB...</Text>
        </View>
      ) : (
        /* Users Table List */
        <View style={styles.usersList}>
          {filteredUsers.map((item) => {
            const userId = item.id || item._id;
            const isSuperAdmin = item.role === 'SUPER_ADMIN';
            const isActive = item.status === 'ACTIVE';
            const quota = item.searchQuota || item.search_quota || 0;
            const used = item.searchesUsed || item.searches_used || 0;
            const isUnlimited = isSuperAdmin || quota >= 999999;

            return (
              <View key={userId} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userNameText}>{item.name}</Text>
                      {isSuperAdmin ? (
                        <View style={styles.adminBadge}>
                          <ShieldCheck size={11} color="#FFFFFF" />
                          <Text style={styles.adminBadgeText}>SUPER ADMIN</Text>
                        </View>
                      ) : (
                        <View style={styles.clientBadge}>
                          <User size={11} color={Colors.primary} />
                          <Text style={styles.clientBadgeText}>MEMBER</Text>
                        </View>
                      )}
                      
                      <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.suspendedBadge]}>
                        <Text style={[styles.statusBadgeText, isActive ? styles.activeText : styles.suspendedText]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.emailText}>{item.email}</Text>
                  </View>

                  {/* Quota Gauge */}
                  <View style={styles.quotaBox}>
                    <Zap size={14} color={Colors.warning} />
                    <View>
                      <Text style={styles.quotaLabel}>Search Usage</Text>
                      <Text style={styles.quotaNumbers}>
                        {isUnlimited ? `${used} / Unlimited` : `${used} / ${quota}`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Actions Row */}
                <View style={styles.userActionsRow}>
                  {!isSuperAdmin && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => {
                        setSelectedUser(item);
                        setEditQuotaValue(quota >= 999999 ? '999999' : String(quota));
                        setQuotaModalVisible(true);
                      }}
                    >
                      <Sliders size={13} color={Colors.primary} />
                      <Text style={styles.actionBtnText}>Edit Quota</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtn, isActive ? styles.suspendBtn : styles.activateBtn]}
                    onPress={() => handleToggleStatus(item)}
                  >
                    {isActive ? (
                      <>
                        <UserX size={13} color={Colors.danger} />
                        <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Suspend</Text>
                      </>
                    ) : (
                      <>
                        <UserCheck size={13} color={Colors.success} />
                        <Text style={[styles.actionBtnText, { color: Colors.success }]}>Activate</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      setSelectedUser(item);
                      setResetPasswordValue('');
                      setPasswordModalVisible(true);
                    }}
                  >
                    <KeyRound size={13} color={Colors.secondary} />
                    <Text style={styles.actionBtnText}>Reset Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteUser(userId)}
                  >
                    <Trash2 size={13} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* CREATE USER MODAL */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Provision New User Account</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {modalError ? (
              <View style={styles.modalErrorBox}>
                <AlertCircle size={14} color={Colors.danger} />
                <Text style={styles.modalErrorText}>{modalError}</Text>
              </View>
            ) : null}

            <View style={styles.modalBody}>
              {/* Role Selection */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Account Role</Text>
                <View style={styles.rolePickerRow}>
                  <TouchableOpacity
                    style={[styles.roleOption, newRole === 'USER' && styles.roleOptionActive]}
                    onPress={() => setNewRole('USER')}
                  >
                    <User size={14} color={newRole === 'USER' ? '#FFFFFF' : Colors.textMuted} />
                    <Text style={[styles.roleOptionText, newRole === 'USER' && styles.roleOptionTextActive]}>
                      Standard Member
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleOption, newRole === 'SUPER_ADMIN' && styles.roleOptionAdminActive]}
                    onPress={() => {
                      setNewRole('SUPER_ADMIN');
                      setNewQuota('999999');
                    }}
                  >
                    <ShieldCheck size={14} color={newRole === 'SUPER_ADMIN' ? '#FFFFFF' : Colors.textMuted} />
                    <Text style={[styles.roleOptionText, newRole === 'SUPER_ADMIN' && styles.roleOptionTextActive]}>
                      Super Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Sarah Jenkins"
                  placeholderTextColor={Colors.textDim}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Email Address</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="sarah@agency.com"
                  placeholderTextColor={Colors.textDim}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Initial Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.textDim}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              {/* Monthly Search Quota with Unlimited Option */}
              {newRole === 'USER' && (
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>Monthly Search Quota</Text>
                  
                  {/* Preset Pills */}
                  <View style={styles.presetQuotaRow}>
                    {QUOTA_PRESETS.map((preset) => {
                      const isUnlim = preset === 999999;
                      const isSelected = newQuota === String(preset);
                      return (
                        <TouchableOpacity
                          key={preset}
                          style={[styles.quotaPresetBtn, isSelected && styles.quotaPresetBtnActive]}
                          onPress={() => setNewQuota(String(preset))}
                        >
                          <Text style={[styles.quotaPresetText, isSelected && styles.quotaPresetTextActive]}>
                            {isUnlim ? 'Unlimited (∞)' : preset}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter custom limit or 999999 for unlimited"
                    placeholderTextColor={Colors.textDim}
                    value={newQuota === '999999' ? 'Unlimited' : newQuota}
                    onChangeText={(val) => setNewQuota(val.toLowerCase() === 'unlimited' ? '999999' : val)}
                    keyboardType="numeric"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateUser}
                disabled={createLoading}
              >
                {createLoading ? (
                  <ActivityIndicator color="#0B0F19" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {newRole === 'SUPER_ADMIN' ? 'Create Super Admin' : 'Create Member Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT QUOTA MODAL */}
      <Modal visible={quotaModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Search Quota</Text>
              <TouchableOpacity onPress={() => setQuotaModalVisible(false)}>
                <X size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubText}>
                Adjust search query allowance for {selectedUser?.name} ({selectedUser?.email})
              </Text>

              {/* Preset Pills */}
              <View style={styles.presetQuotaRow}>
                {QUOTA_PRESETS.map((preset) => {
                  const isUnlim = preset === 999999;
                  const isSelected = editQuotaValue === String(preset);
                  return (
                    <TouchableOpacity
                      key={preset}
                      style={[styles.quotaPresetBtn, isSelected && styles.quotaPresetBtnActive]}
                      onPress={() => setEditQuotaValue(String(preset))}
                    >
                      <Text style={[styles.quotaPresetText, isSelected && styles.quotaPresetTextActive]}>
                        {isUnlim ? 'Unlimited (∞)' : preset}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Search Quota Limit</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editQuotaValue === '999999' ? 'Unlimited' : editQuotaValue}
                  onChangeText={(val) => setEditQuotaValue(val.toLowerCase() === 'unlimited' ? '999999' : val)}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveQuota}>
                <Text style={styles.modalSubmitText}>Save Quota</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubText}>
                Set a new password for {selectedUser?.name} ({selectedUser?.email})
              </Text>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>New Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter at least 6 characters"
                  placeholderTextColor={Colors.textDim}
                  value={resetPasswordValue}
                  onChangeText={setResetPasswordValue}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveResetPassword}>
                <Text style={styles.modalSubmitText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createUserBtn: {
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
  createUserBtnText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800'
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  searchWrapper: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13
  },
  userCountLabel: {
    color: Colors.textMuted,
    fontSize: 13,
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
  usersList: {
    gap: 12
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12
  },
  userInfo: {
    flex: 1,
    minWidth: 200
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap'
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  clientBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  suspendedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  activeText: {
    color: Colors.success
  },
  suspendedText: {
    color: Colors.danger
  },
  emailText: {
    color: Colors.textSecondary,
    fontSize: 13
  },
  quotaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  quotaLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  quotaNumbers: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexWrap: 'wrap'
  },
  actionBtn: {
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
  actionBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  suspendBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  activateBtn: {
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  deleteBtn: {
    paddingHorizontal: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text
  },
  modalSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14
  },
  modalErrorText: {
    color: Colors.danger,
    fontSize: 12,
    flex: 1
  },
  modalBody: {
    gap: 12
  },
  modalInputGroup: {
    gap: 4
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 8,
    borderRadius: 8
  },
  roleOptionActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Colors.primary
  },
  roleOptionAdminActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: Colors.secondary
  },
  roleOptionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  presetQuotaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6
  },
  quotaPresetBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  quotaPresetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  quotaPresetText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  quotaPresetTextActive: {
    color: '#0B0F19',
    fontWeight: '800'
  },
  modalInput: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: Colors.text,
    fontSize: 13
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  modalSubmitText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800'
  }
});
