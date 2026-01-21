import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreakfastEntry } from '../types';
import { formatDateKey } from '../utils/dateUtils';

const STORAGE_KEY = '@breakfast_entries';

export const saveBreakfastEntry = async (entry: BreakfastEntry): Promise<void> => {
  try {
    const entries = await getAllBreakfastEntries();
    const updatedEntries = [...entries, entry];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error saving breakfast entry:', error);
    throw error;
  }
};

export const getAllBreakfastEntries = async (): Promise<BreakfastEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting breakfast entries:', error);
    return [];
  }
};

export const getBreakfastEntryById = async (id: string): Promise<BreakfastEntry | null> => {
  try {
    const entries = await getAllBreakfastEntries();
    return entries.find(entry => entry.id === id) || null;
  } catch (error) {
    console.error('Error getting breakfast entry:', error);
    return null;
  }
};

export const updateBreakfastEntry = async (updatedEntry: BreakfastEntry): Promise<void> => {
  try {
    const entries = await getAllBreakfastEntries();
    const index = entries.findIndex(entry => entry.id === updatedEntry.id);
    if (index !== -1) {
      entries[index] = updatedEntry;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating breakfast entry:', error);
    throw error;
  }
};

export const deleteBreakfastEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getAllBreakfastEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error('Error deleting breakfast entry:', error);
    throw error;
  }
};

export const getEntriesForWeek = async (weekStart: Date): Promise<BreakfastEntry[]> => {
  try {
    const entries = await getAllBreakfastEntries();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekStart && entryDate < weekEnd;
    });
  } catch (error) {
    console.error('Error getting week entries:', error);
    return [];
  }
};

export const getLatestEntryForDate = async (dateKey: string): Promise<BreakfastEntry | null> => {
  try {
    const entries = await getAllBreakfastEntries();
    const dayEntries = entries
      .filter(entry => entry.dateKey === dateKey)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return dayEntries.length > 0 ? dayEntries[0] : null;
  } catch (error) {
    console.error('Error getting latest entry for date:', error);
    return null;
  }
};

export const getWeekEntriesByDay = async (weekStart: Date): Promise<(BreakfastEntry | null)[]> => {
  try {
    const weekEntries = await getEntriesForWeek(weekStart);
    const weekSlots: (BreakfastEntry | null)[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = formatDateKey(currentDate);
      
      const dayEntries = weekEntries
        .filter(entry => entry.dateKey === dateKey)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      weekSlots[i] = dayEntries.length > 0 ? dayEntries[0] : null;
    }
    
    return weekSlots;
  } catch (error) {
    console.error('Error getting week entries by day:', error);
    return [null, null, null, null, null, null, null];
  }
};

export const getWeekStats = async (weekStart: Date): Promise<{
  totalBreakfasts: number;
  averageRating: number;
  topRepeatedItems: Array<{ label: string; count: number }>;
}> => {
  try {
    const entries = await getEntriesForWeek(weekStart);
    const totalBreakfasts = entries.length;
    
    const averageRating = totalBreakfasts > 0
      ? entries.reduce((sum, entry) => sum + entry.rating, 0) / totalBreakfasts
      : 0;
    
    const labelCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.primaryLabel) {
        labelCounts[entry.primaryLabel] = (labelCounts[entry.primaryLabel] || 0) + 1;
      }
    });
    
    const topRepeatedItems = Object.entries(labelCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalBreakfasts,
      averageRating,
      topRepeatedItems,
    };
  } catch (error) {
    console.error('Error getting week stats:', error);
    return {
      totalBreakfasts: 0,
      averageRating: 0,
      topRepeatedItems: [],
    };
  }
};

