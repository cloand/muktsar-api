import React from 'react';
import { View, StyleSheet } from 'react-native';
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

/**
 * AdminAlertComponent - Alert card specifically for admins
 * Shows "View Details" button and resolve functionality
 */
const AdminAlertComponent = ({ alert, onViewDetails }) => {
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

  const urgencyColor = getUrgencyColor(alert.urgency);
  const isExpired = new Date(alert.expiresAt) < new Date();
  const isPastAlert = alert.status === 'RESOLVED' || alert.status === 'CANCELLED' || isExpired;
  const acceptedCount = alert.acceptedDonorsCount || 0;

  return (
    <Card 
      style={[styles.alertCard, { borderLeftColor: urgencyColor }]} 
      elevation={2}
      onPress={() => onViewDetails(alert)}
    >
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
          <View style={styles.alertChips}>
            <Chip
              mode="flat"
              style={[styles.bloodGroupChip, { backgroundColor: urgencyColor }]}
              textStyle={styles.chipText}
            >
              {formatBloodGroup(alert.bloodGroup)}
            </Chip>
            <Chip
              mode="outlined"
              style={styles.statusChip}
              textStyle={{ color: isPastAlert ? '#27ae60' : '#f39c12' }}
            >
              {alert.status || (isPastAlert ? 'Completed' : 'Active')}
            </Chip>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.alertDetails}>
          <Text style={styles.hospitalName}>{alert.hospitalName}</Text>
          <Text style={styles.alertMessage}>
            {alert.message || `${alert.unitsRequired || 1} units required`}
          </Text>

          <View style={styles.acceptedDonorsRow}>
            <IconButton icon="account-check" size={20} style={styles.detailIcon} />
            <Text style={styles.acceptedDonorsText}>
              {acceptedCount} donor{acceptedCount !== 1 ? 's' : ''} accepted
            </Text>
          </View>

          {alert.urgency && (
            <View style={styles.detailRow}>
              <IconButton icon="alert-circle" size={20} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: urgencyColor, fontWeight: 'bold' }]}>
                Urgency: {alert.urgency}
              </Text>
            </View>
          )}

          {alert.hospitalAddress && (
            <View style={styles.detailRow}>
              <IconButton icon="map-marker" size={20} style={styles.detailIcon} />
              <Text style={styles.detailText}>{alert.hospitalAddress}</Text>
            </View>
          )}

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

        {/* ADMIN-SPECIFIC ACTIONS */}
        <Button
          mode="outlined"
          onPress={() => onViewDetails(alert)}
          style={styles.viewDetailsButton}
          icon="eye"
        >
          View Details & Manage
        </Button>
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
  alertChips: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bloodGroupChip: {
    height: 24,
  },
  statusChip: {
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
  viewDetailsButton: {
    marginTop: 12,
  },
});

export default AdminAlertComponent;
