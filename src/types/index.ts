export interface BreakfastEntry {
  id: string;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD format
  photoUri?: string;
  rating: number; // 1-5
  notes?: string;
  primaryLabel?: string; // e.g., "eggs", "oatmeal", "chia seed pudding"
}

export interface WeekStats {
  totalBreakfasts: number;
  averageRating: number;
  topRepeatedItems: Array<{ label: string; count: number }>;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Rating: { photoUri?: string };
  WeeklySummary: undefined;
  EntryDetail: { entryId: string };
};

