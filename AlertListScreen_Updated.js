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
  Searchbar,
  useTheme,
  Appbar,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import ApiService from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import { commonStyles } from '../theme/theme';
import DonorAlertComponent from '../components/DonorAlertComponent';
import AdminAlertComponent from '../components/AdminAlertComponent';

/**
 * AlertListScreen - Updated Version
 * Shows alerts for both donors and admins with Current/Past tabs
 * - Donors: Can view and accept alerts
 * - Admins: Can view all alerts and navigate to details
 */
const AlertListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  // State
  const [alertSection, setAlertSection] = useState('current'); // 'current' or 'past'
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [alertSection]);

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

      let response;
      if (alertSection === 'current') {
        response = await ApiService.getCurrentAlerts();
      } else {
        response = await ApiService.getPastAlerts();
      }

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



  // Handle admin viewing alert details
  const handleViewDetails = (alert) => {
    navigation.navigate('AlertDetail', { alert });
  };

  // Render alert item for donors
  const renderDonorAlertItem = ({ item }) => (
    <DonorAlertComponent
      alert={item}
      user={user}
      onRefresh={fetchAlerts}
    />
  );

  // Render alert item for admins
  const renderAdminAlertItem = ({ item }) => (
    <AdminAlertComponent
      alert={item}
      onViewDetails={handleViewDetails}
    />
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading alerts...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
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

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={isAdmin ? 'Alert Management' : 'Emergency Alerts'}
          titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
        />
        <Appbar.Action icon="refresh" onPress={fetchAlerts} />
      </Appbar.Header>

      {/* Current/Past Tabs */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={alertSection}
          onValueChange={setAlertSection}
          buttons={[
            {
              value: 'current',
              label: 'Current',
              icon: 'bell-ring',
            },
            {
              value: 'past',
              label: 'Past',
              icon: 'history',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

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
          renderItem={isAdmin ? renderAdminAlertItem : renderDonorAlertItem}
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
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
});

export default AlertListScreen;

