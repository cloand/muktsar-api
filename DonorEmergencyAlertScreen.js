import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import {
  ActivityIndicator,
  Text,
  Button,
  Searchbar,
  useTheme,
  Appbar,
  IconButton,
  Card,
  Chip,
  Divider,
} from 'react-native-paper';
import ApiService from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import { commonStyles } from '../theme/theme';
import { formatBloodGroup } from '../utils/bloodGroupFormatter';

/**
 * DonorEmergencyAlertScreen - Emergency alerts screen specifically for donors
 * Shows ONLY "Accept" buttons, NO resolve/cancel functionality
 */
const DonorEmergencyAlertScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  // State
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    // Filter alerts based on search query
    if (searchQuery.trim() === '') {
      setFilteredAlerts(alerts);
    } else {
      const filtered = alerts.filter(alert =>
        alert.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAlerts(filtered);
    }
  }, [searchQuery, alerts]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Get current/active alerts only for donors
      const response = await ApiService.getCurrentAlerts();
      const alertsData = response?.data || [];
      setAlerts(alertsData);
      setFilteredAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      RNAlert.alert('Error', 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  // DONOR-SPECIFIC: Handle accepting an alert
  const handleAcceptAlert = async (alert) => {
    const donorId = user?.id;

    if (!donorId) {
      RNAlert.alert('Error', 'Unable to identify donor. Please log in again.');
      return;
    }

    RNAlert.alert(
      'Confirm Donation',
      `Are you ready to donate ${formatBloodGroup(alert.bloodGroup)} blood at ${alert.hospitalName}?\n\nContact: ${alert.contactPerson || 'Hospital Staff'}\nPhone: ${alert.contactPhone || 'Will be provided'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I\'m Ready to Donate!',
          style: 'default',
          onPress: async () => {
            try {
              await ApiService.acceptAlert(alert.id, donorId);
              RNAlert.alert(
                'Thank You! 🙏',
                'Your response has been recorded. The hospital staff will contact you soon with further details.',
                [{ text: 'OK', onPress: fetchAlerts }]
              );
            } catch (error) {
              console.error('Error accepting alert:', error);
              RNAlert.alert('Error', 'Failed to accept alert. Please try again.');
            }
          },
        },
      ]
    );
  };

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

  // DONOR-SPECIFIC: Render alert item with ONLY accept functionality
  const renderDonorAlertItem = ({ item }) => {
    const urgencyColor = getUrgencyColor(item.urgency);
    const isExpired = new Date(item.expiresAt) < new Date();

    if (isExpired) return null; // Don't show expired alerts to donors

    return (
      <Card style={[styles.alertCard, { borderLeftColor: urgencyColor }]} elevation={2}>
        <Card.Content>
          <View style={styles.alertHeader}>
            <View style={styles.alertInfo}>
              <Text style={[styles.alertTitle, { color: theme.colors.onSurface }]}>
                🩸 {item.title || 'Blood Needed Urgently'}
              </Text>
              <Text style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}>
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
              <IconButton icon="water" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {item.unitsRequired || 1} unit{(item.unitsRequired || 1) > 1 ? 's' : ''} needed
              </Text>
            </View>

            <View style={styles.detailRow}>
              <IconButton icon="alert-circle" size={20} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: urgencyColor, fontWeight: 'bold' }]}>
                Urgency: {item.urgency}
              </Text>
            </View>

            {item.contactPerson && (
              <View style={styles.detailRow}>
                <IconButton icon="account" size={20} style={styles.detailIcon} />
                <Text style={styles.detailText}>Contact: {item.contactPerson}</Text>
              </View>
            )}

            {item.contactPhone && (
              <View style={styles.detailRow}>
                <IconButton icon="phone" size={20} style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.contactPhone}</Text>
              </View>
            )}

            {item.message && (
              <View style={styles.detailRow}>
                <IconButton icon="message-text" size={20} style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.message}</Text>
              </View>
            )}
          </View>

          {/* DONOR-SPECIFIC: ONLY Accept button, NO resolve/cancel */}
          <Button
            mode="contained"
            onPress={() => handleAcceptAlert(item)}
            style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
            icon="hand-heart"
            contentStyle={styles.buttonContent}
          >
            I'm Ready to Donate
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading emergency alerts...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <IconButton icon="heart-pulse" size={64} iconColor="#27ae60" />
      <Text style={styles.emptyText}>No Emergency Alerts</Text>
      <Text style={styles.emptySubtext}>
        Great news! There are no urgent blood requests at the moment.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Emergency Blood Alerts"
          titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
        />
        <Appbar.Action icon="refresh" onPress={fetchAlerts} />
      </Appbar.Header>

      {/* Search Bar */}
      <View style={[styles.searchContainer, commonStyles.paddingHorizontal.md]}>
        <Searchbar
          placeholder="Search alerts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Content */}
      {loading ? (
        renderLoading()
      ) : filteredAlerts.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filteredAlerts}
          renderItem={renderDonorAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 8,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  bloodGroupChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  alertDetails: {
    gap: 4,
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
    flex: 1,
  },
  acceptButton: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});

export default DonorEmergencyAlertScreen;
