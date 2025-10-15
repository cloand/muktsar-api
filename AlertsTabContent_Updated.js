import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import {
  Text,
  Title,
  Button,
  Card,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
  Divider,
  IconButton,
} from 'react-native-paper';
import { alertsAPI } from '../lib/api'; // Updated import
import { useAuth } from '../context/AuthContext';
import { formatBloodGroup } from '../utils/bloodGroupFormatter';

/**
 * AlertsTabContent Component
 * Displays alerts for both donors and admins with role-based UI
 * - Donors: Can view and accept alerts, shows "You volunteered for this" if already accepted
 * - Admins: Can view all alerts, see accepted donors, and manage alerts
 */
const AlertsTabContent = ({ user, navigation, theme }) => {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  // State
  const [alertSection, setAlertSection] = useState('current'); // 'current' or 'past'
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [pastAlerts, setPastAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load alerts on mount and when section changes
  useEffect(() => {
    loadAlerts();
  }, [alertSection]);

  // Load alerts from API
  const loadAlerts = async () => {
    try {
      setLoading(true);

      if (alertSection === 'current') {
        // Use different endpoint for donors to get acceptance status
        const response = isAdmin 
          ? await alertsAPI.getActive()
          : await alertsAPI.getActiveForDonor();
        setCurrentAlerts(response.data || []);
      } else {
        // For past alerts, use regular endpoint for now
        const response = await alertsAPI.getAll(); // You might want to create a getPast endpoint
        const pastAlertsData = (response.data || []).filter(alert => 
          alert.status === 'RESOLVED' || alert.status === 'CANCELLED'
        );
        setPastAlerts(pastAlertsData);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      RNAlert.alert('Error', 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh alerts
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  // Handle donor accepting an alert
  const handleAcceptAlert = async (alert) => {
    try {
      RNAlert.alert(
        'Confirm Donation',
        `Are you ready to donate ${formatBloodGroup(alert.bloodGroup)} blood at ${alert.hospitalName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, I\'m Ready',
            onPress: async () => {
              try {
                await alertsAPI.accept(alert.id);
                RNAlert.alert(
                  'Thank You!',
                  'The admin has been notified. You will be contacted soon.',
                  [{ text: 'OK', onPress: loadAlerts }]
                );
              } catch (error) {
                console.error('Error accepting alert:', error);
                RNAlert.alert('Error', 'Failed to accept alert. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleAcceptAlert:', error);
      RNAlert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  // Handle admin viewing alert details
  const handleViewAlertDetails = (alert) => {
    navigation.navigate('AlertDetail', { alert });
  };

  // Handle admin marking alert as complete
  const handleMarkComplete = async (alertId) => {
    try {
      RNAlert.alert(
        'Mark as Complete',
        'Mark this alert as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: async () => {
              try {
                await alertsAPI.markComplete(alertId);
                RNAlert.alert('Success', 'Alert marked as completed', [
                  { text: 'OK', onPress: loadAlerts },
                ]);
              } catch (error) {
                console.error('Error marking alert complete:', error);
                RNAlert.alert('Error', 'Failed to mark alert as complete.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleMarkComplete:', error);
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return '#e74c3c';
      case 'MEDIUM':
        return '#f39c12';
      case 'LOW':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  // Render alert card for donors
  const renderDonorAlertCard = ({ item }) => {
    const urgencyColor = getUrgencyColor(item.urgency);
    const isPast = alertSection === 'past';
    const hasAccepted = item.hasAccepted; // New property from backend

    return (
      <Card style={[styles.alertCard, { borderLeftColor: urgencyColor, borderLeftWidth: 4 }]}>
        <Card.Content>
          {/* Alert Header */}
          <View style={styles.alertHeader}>
            <View style={styles.alertTitleContainer}>
              <Text style={styles.alertTitle}>{item.title || 'Blood Needed'}</Text>
              <Text style={styles.alertTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={[styles.bloodGroupChip, { backgroundColor: urgencyColor }]}
              textStyle={styles.chipText}
            >
              {formatBloodGroup(item.bloodGroup)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Alert Details */}
          <View style={styles.alertDetails}>
            <View style={styles.detailRow}>
              <IconButton icon="hospital-building" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.hospitalName}</Text>
            </View>

            {item.hospitalAddress && (
              <View style={styles.detailRow}>
                <IconButton icon="map-marker" size={20} style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.hospitalAddress}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <IconButton icon="message-text" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {item.message || `${item.unitsRequired || 1} units required`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <IconButton icon="alert-circle" size={20} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: urgencyColor, fontWeight: 'bold' }]}>
                Urgency: {item.urgency}
              </Text>
            </View>
          </View>

          {/* Action Button or Status for Current Alerts */}
          {!isPast && (
            <>
              {hasAccepted ? (
                // Show "You volunteered for this" if already accepted
                <View style={styles.volunteeredContainer}>
                  <IconButton icon="check-circle" size={24} iconColor="#27ae60" />
                  <Text style={styles.volunteeredText}>You volunteered for this</Text>
                </View>
              ) : (
                // Show "I'm Ready to Donate" button if not accepted
                <Button
                  mode="contained"
                  onPress={() => handleAcceptAlert(item)}
                  style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
                  icon="hand-heart"
                >
                  I'm Ready to Donate
                </Button>
              )}
            </>
          )}

          {isPast && (
            <Chip
              mode="outlined"
              style={styles.statusChip}
              textStyle={{ color: '#27ae60' }}
            >
              {item.status || 'Completed'}
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Render alert card for admins
  const renderAdminAlertCard = ({ item }) => {
    const urgencyColor = getUrgencyColor(item.urgency);
    const isPast = alertSection === 'past';
    const acceptedCount = item.acceptedDonorsCount || 0;

    return (
      <Card
        style={[styles.alertCard, { borderLeftColor: urgencyColor, borderLeftWidth: 4 }]}
        onPress={() => handleViewAlertDetails(item)}
      >
        <Card.Content>
          {/* Alert Header */}
          <View style={styles.alertHeader}>
            <View style={styles.alertTitleContainer}>
              <Text style={styles.alertTitle}>{item.title || 'Blood Needed'}</Text>
              <Text style={styles.alertTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.chipContainer}>
              <Chip
                mode="flat"
                style={[styles.bloodGroupChip, { backgroundColor: urgencyColor }]}
                textStyle={styles.chipText}
              >
                {formatBloodGroup(item.bloodGroup)}
              </Chip>
              <Chip
                mode="outlined"
                style={styles.statusChip}
                textStyle={{ color: isPast ? '#27ae60' : '#f39c12' }}
              >
                {item.status || (isPast ? 'Completed' : 'Active')}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Alert Details */}
          <View style={styles.alertDetails}>
            <Text style={styles.hospitalName}>{item.hospitalName}</Text>
            <Text style={styles.alertMessage}>
              {item.message || `${item.unitsRequired || 1} units required`}
            </Text>

            {/* Accepted Donors Count */}
            <View style={styles.acceptedDonorsRow}>
              <IconButton icon="account-check" size={20} style={styles.detailIcon} />
              <Text style={styles.acceptedDonorsText}>
                {acceptedCount} donor{acceptedCount !== 1 ? 's' : ''} accepted
              </Text>
            </View>
          </View>

          {/* Admin Actions */}
          <View style={styles.adminActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleViewAlertDetails(item)}
              style={styles.actionButton}
              icon="eye"
            >
              View Details
            </Button>
            {!isPast && (
              <Button
                mode="contained"
                compact
                onPress={() => handleMarkComplete(item.id)}
                style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
                icon="check"
              >
                Mark Complete
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconButton icon="bell-off" size={64} iconColor="#ccc" />
      <Text style={styles.emptyText}>
        {alertSection === 'current' ? 'No current alerts' : 'No past alerts'}
      </Text>
      <Text style={styles.emptySubtext}>
        {alertSection === 'current'
          ? 'Emergency alerts will appear here'
          : 'Completed alerts will appear here'}
      </Text>
    </View>
  );

  const alerts = alertSection === 'current' ? currentAlerts : pastAlerts;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>
          {isAdmin ? 'Alert Management' : 'Emergency Alerts'}
        </Title>
        <Text style={styles.sectionSubtitle}>
          {isAdmin
            ? 'Manage blood donation alerts'
            : 'Help save lives by donating blood'}
        </Text>
      </View>

      {/* Current/Past Tabs */}
      <SegmentedButtons
        value={alertSection}
        onValueChange={setAlertSection}
        buttons={[
          {
            value: 'current',
            label: 'Current Alerts',
            icon: 'bell-ring',
          },
          {
            value: 'past',
            label: 'Past Alerts',
            icon: 'history',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Alerts List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={isAdmin ? renderAdminAlertCard : renderDonorAlertCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  chipContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bloodGroupChip: {
    height: 28,
  },
  statusChip: {
    height: 24,
  },
  chipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  alertDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  detailIcon: {
    margin: 0,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  acceptedDonorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    marginTop: 4,
  },
  acceptedDonorsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  acceptButton: {
    marginTop: 12,
  },
  // New styles for volunteered state
  volunteeredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  volunteeredText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginLeft: 8,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AlertsTabContent;
