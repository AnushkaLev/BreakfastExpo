import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BreakfastEntry } from '../types';

interface SpiceBottleProps {
  entry: BreakfastEntry | null;
  weekdayLabel: string;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTLE_WIDTH = ((SCREEN_WIDTH - 40) / 7 - 8) * 1.1; // 7 bottles with spacing, 10% wider
const BOTTLE_HEIGHT = 140 * 0.85; // 15% shorter than original (119)

export const SpiceBottle: React.FC<SpiceBottleProps> = ({
  entry,
  weekdayLabel,
  onPress,
}) => {
  const rating = entry?.rating || 0;
  const fillPercentage = rating > 0 ? 20 + (rating - 1) * 20 : 0;
  const fillHeight = (BOTTLE_HEIGHT * fillPercentage) / 100;
  
  // Generate color based on primary label or use default
  const getFillColor = (): string => {
    if (!entry?.primaryLabel) return '#E8D5C4';
    
    const label = entry.primaryLabel.toLowerCase();
    if (label.includes('egg')) return '#FFE5B4';
    if (label.includes('oatmeal') || label.includes('oats')) return '#F5E6D3';
    if (label.includes('chia')) return '#D4C4E8';
    if (label.includes('pancake') || label.includes('waffle')) return '#FFE5B4';
    if (label.includes('fruit')) return '#E8F5E8';
    if (label.includes('yogurt')) return '#E8F0FF';
    if (label.includes('chili') || label.includes('pepper')) return '#FFCDD2';
    if (label.includes('cinnamon') || label.includes('turmeric')) return '#FFE082';
    if (label.includes('curry')) return '#FFF9C4';
    
    // Hash-based color for other items
    let hash = 0;
    for (let i = 0; i < entry.primaryLabel.length; i++) {
      hash = entry.primaryLabel.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 40%, 85%)`;
  };

  const fillColor = getFillColor();
  const truncatedLabel = entry?.primaryLabel
    ? entry.primaryLabel.length > 12
      ? entry.primaryLabel.substring(0, 12) + '...'
      : entry.primaryLabel
    : '';

  const bottleWidth = BOTTLE_WIDTH * 0.9;
  const capWidth = bottleWidth * 0.75;
  const labelWidth = bottleWidth * 0.85;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cap */}
      <View style={[styles.cap, { width: capWidth }]}>
        <Svg width={capWidth} height={12} viewBox={`0 0 ${capWidth} 12`}>
          <Rect
            x="0"
            y="0"
            width={capWidth}
            height="12"
            rx="4"
            fill="#B0B0B0"
          />
          <Rect
            x="2"
            y="2"
            width={capWidth - 4}
            height="8"
            rx="3"
            fill="#D0D0D0"
          />
        </Svg>
      </View>
      
      {/* Bottle Body */}
      <View style={[styles.bottleBody, { width: bottleWidth, height: BOTTLE_HEIGHT }]}>
        <Svg width={bottleWidth} height={BOTTLE_HEIGHT} viewBox={`0 0 ${bottleWidth} ${BOTTLE_HEIGHT}`}>
          <Defs>
            <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity="1" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Glass Body */}
          <Rect
            x="0"
            y="0"
            width={bottleWidth}
            height={BOTTLE_HEIGHT}
            rx="8"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(200, 200, 200, 0.5)"
            strokeWidth="1"
          />
          
          {/* Fill Level (Spice Content) */}
          {rating > 0 && (
            <Rect
              x="2"
              y={BOTTLE_HEIGHT - fillHeight - 2}
              width={bottleWidth - 4}
              height={fillHeight}
              rx="6"
              fill={fillColor}
              opacity="0.8"
            />
          )}
          
          {/* Glass Highlight */}
          <Rect
            x="0"
            y="0"
            width={bottleWidth}
            height={BOTTLE_HEIGHT}
            rx="8"
            fill="url(#glassGradient)"
          />
        </Svg>
        
        {/* Label Card */}
        <View style={[styles.labelCard, { width: labelWidth }]}>
          {/* Weekday Label */}
          <Text style={styles.weekdayLabel}>{weekdayLabel}</Text>
          
          {/* Thumbnail or Placeholder */}
          {entry?.photoUri ? (
            <Image
              source={{ uri: entry.photoUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🍳</Text>
            </View>
          )}
          
          {/* Rating Stars */}
          {rating > 0 && (
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= rating && styles.starFilled,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
          )}
          
          {/* Food Label */}
          {truncatedLabel ? (
            <Text style={styles.foodLabel} numberOfLines={1}>
              {truncatedLabel.toUpperCase()}
            </Text>
          ) : entry ? null : (
            <Text style={styles.emptyLabel}>—</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BOTTLE_WIDTH,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cap: {
    height: 12,
    marginBottom: 2,
    alignItems: 'center',
  },
  bottleBody: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelCard: {
    position: 'absolute',
    top: 8,
    left: '7.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  placeholder: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  placeholderEmoji: {
    fontSize: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 3,
    gap: 2,
  },
  star: {
    fontSize: 9,
    color: '#DDD',
  },
  starFilled: {
    color: '#FFB800',
  },
  foodLabel: {
    fontSize: 8,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  emptyLabel: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
