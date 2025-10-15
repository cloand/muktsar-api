import React from 'react';
import { View, StyleSheet, Alert as RNAlert } from 'react-native';
import {
  Card,
  Chip,
  Text,
  Button,
  IconButton,
  Divider,
  useTheme,
} from 'react-native-paper';
import { formatBloodGroup } from '../utils/bloodGroupFormatter';
import ApiService from '../services/ApiService';

/**
 * DonorAlertComponent - Alert card specifically for donors
 * Shows "Accept" button only, no resolve functionality
 */
const DonorAlertComponent = ({ alert, user, onRefresh }) => {
  const theme = useTheme();

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

  const handleAcceptAlert = async () => {
    const donorId = user?.id;

    if (!donorId) {
      RNAlert.alert('Error', 'Unable to identify donor. Please log in again.');
      return;
    }

    RNAlert.alert(
      'Confirm Donation',
      `Are you ready to donate ${formatBloodGroup(alert.bloodGroup)} blood at ${alert.hospitalName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I\'m Ready',
          onPress: async () => {
            try {
              await ApiService.acceptAlert(alert.id, donorId);
              RNAlert.alert(
                'Thank You!',
                'The admin has been notified. You will be contacted soon.',
                [{ text: 'OK', onPress: onRefresh }]
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

  const urgencyColor = getUrgencyColor(alert.urgency);
  const isExpired = new Date(alert.expiresAt) < new Date();
  const isPastAlert = alert.status === 'RESOLVED' || alert.status === 'CANCELLED' || isExpired;

  return (
    <Card style={[styles.alertCard, { borderLeftColor: urgencyColor }]} elevation={2}>
      <Card.Content>
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <Text style={[styles.alertTitle, { color: theme.colors.onSurface }]}>
              {alert.title || 'Blood Needed'}
            </Text>
            <Text style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(alert.createdAt).toLocaleString()}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.bloodGroupChip, { backgroundColor: urgencyColor }]}
            textStyle={styles.chipText}
          >
            {formatBloodGroup(alert.bloodGroup)}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.alertDetails}>
          <View style={styles.detailRow}>
            <IconButton icon="hospital-building" size={20} style={styles.detailIcon} />
            <Text style={styles.detailText}>{alert.hospitalName}</Text>
          </View>

          {alert.hospitalAddress && (
            <View style={styles.detailRow}>
              <IconButton icon="map-marker" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>{alert.hospitalAddress}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <IconButton icon="message-text" size={20} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {alert.message || `${alert.unitsRequired || 1} units required`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <IconButton icon="alert-circle" size={20} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: urgencyColor, fontWeight: 'bold' }]}>
              Urgency: {alert.urgency}
            </Text>
          </View>

          {alert.contactPerson && (
            <View style={styles.detailRow}>
              <IconButton icon="account" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>Contact: {alert.contactPerson}</Text>
            </View>
          )}

          {alert.contactPhone && (
            <View style={styles.detailRow}>
              <IconButton icon="phone" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>{alert.contactPhone}</Text>
            </View>
          )}
        </View>

        {/* DONOR-SPECIFIC ACTIONS */}
        {!isPastAlert && (
          <Button
            mode="contained"
            onPress={handleAcceptAlert}
            style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
            icon="hand-heart"
          >
            I'm Ready to Donate
          </Button>
        )}

        {isPastAlert && (
          <Chip
            mode="outlined"
            style={styles.statusChip}
            textStyle={{ color: '#27ae60' }}
          >
            {alert.status === 'RESOLVED' ? 'Completed' : alert.status || 'Expired'}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 12,
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
    marginTop: 12,
  },
  statusChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});

export default DonorAlertComponent;
