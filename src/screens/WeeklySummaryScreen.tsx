import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BreakfastEntry, WeekStats } from '../types';
import { SpiceBottle } from '../components/SpiceBottle';
import { WeekStatsCard } from '../components/WeekStatsCard';
import { KitchenBackground } from '../components/KitchenBackground';
import {
  getWeekEntriesByDay,
  getWeekStats,
} from '../services/storage';
import { getWeekdayLabel, getStartOfWeek } from '../utils/dateUtils';
import { EntryDetailModal } from '../components/EntryDetailModal';

type WeeklySummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WeeklySummary'
>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WeeklySummaryScreen: React.FC = () => {
  const navigation = useNavigation<WeeklySummaryScreenNavigationProp>();
  const [weekStart, setWeekStart] = useState(getStartOfWeek());
  const [weekEntries, setWeekEntries] = useState<(BreakfastEntry | null)[]>(
    [null, null, null, null, null, null, null]
  );
  const [stats, setStats] = useState<WeekStats>({
    totalBreakfasts: 0,
    averageRating: 0,
    topRepeatedItems: [],
  });
  const [selectedEntry, setSelectedEntry] = useState<BreakfastEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeekData = async () => {
    try {
      const entries = await getWeekEntriesByDay(weekStart);
      const weekStats = await getWeekStats(weekStart);
      setWeekEntries(entries);
      setStats(weekStats);
    } catch (error) {
      console.error('Error loading week data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWeekData();
    }, [weekStart])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeekData();
    setRefreshing(false);
  };

  const handleBottlePress = (entry: BreakfastEntry | null, index: number) => {
    if (entry) {
      setSelectedEntry(entry);
      setModalVisible(true);
    } else {
      // Optionally navigate to add breakfast for this day
      navigation.navigate('Camera');
    }
  };

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setWeekStart(newWeekStart);
  };

  const handleToday = () => {
    setWeekStart(getStartOfWeek());
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const startStr = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KitchenBackground>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>⬅️ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Weekly Summary</Text>
            <Text style={styles.weekRange}>{formatWeekRange()}</Text>
          </View>

          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousWeek}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={handleToday}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextWeek}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>

          <WeekStatsCard stats={stats} />

          <View style={styles.bottlesContainer}>
            <Text style={styles.bottlesTitle}>This Week's Breakfasts</Text>
            <View style={styles.bottlesRow}>
              {weekEntries.map((entry, index) => (
                <SpiceBottle
                  key={index}
                  entry={entry}
                  weekdayLabel={getWeekdayLabel(index)}
                  onPress={() => handleBottlePress(entry, index)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <EntryDetailModal
          visible={modalVisible}
          entry={selectedEntry}
          onClose={() => {
            setModalVisible(false);
            setSelectedEntry(null);
          }}
          onUpdate={loadWeekData}
        />
      </KitchenBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 20,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  weekRange: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  bottlesContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bottlesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    paddingBottom: 20,
    // Position bottles on the counter area (top-down view)
    marginTop: SCREEN_HEIGHT * 0.15, // Adjust to align with counter
  },
});

