import React from 'react';
import { View, StyleSheet } from 'react-native';

interface KitchenBackgroundProps {
  children?: React.ReactNode;
}

export const KitchenBackground: React.FC<KitchenBackgroundProps> = ({
  children,
}) => {
  // KitchenBackground now just renders children without the image
  // The background is handled by preview.html in the WebView
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
