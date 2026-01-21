import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeekStats } from '../types';

interface WeekStatsCardProps {
  stats: WeekStats;
}

export const WeekStatsCard: React.FC<WeekStatsCardProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalBreakfasts}</Text>
          <Text style={styles.statLabel}>Breakfasts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>
      
      {stats.topRepeatedItems.length > 0 && (
        <View style={styles.topItemsContainer}>
          <Text style={styles.topItemsTitle}>Most Eaten:</Text>
          <View style={styles.topItemsRow}>
            {stats.topRepeatedItems.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.topItem}>
                <Text style={styles.topItemLabel}>{item.label}</Text>
                <Text style={styles.topItemCount}>×{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  topItemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  topItemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  topItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  topItemCount: {
    fontSize: 11,
    color: '#999',
  },
});

