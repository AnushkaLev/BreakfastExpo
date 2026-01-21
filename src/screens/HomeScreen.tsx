import React, { useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const HomeScreen: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Serve the HTML file via a local HTTP server
  // The Python HTTP server should be running on port 8083
  // Use your computer's local IP address so the phone can access it
  const htmlUri = 'http://192.168.1.83:8083/preview.html';

  // Handle image library picker
  const handleImageLibrary = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        sendMessageToWebView({
          type: 'libraryError',
          error: 'Photo library permission denied. Please allow photo library access in device settings.',
        });
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.9,
        allowsEditing: false,
        aspect: [1, 1], // Square aspect ratio
        base64: true, // Request base64 data directly
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Use base64 directly from the result if available, otherwise fallback to FileSystem
        if (asset.base64) {
          // Use base64 directly from expo-image-picker
          sendMessageToWebView({
            type: 'libraryImage',
            imageDataUrl: `data:image/jpeg;base64,${asset.base64}`,
          });
        } else {
          // Fallback: read from file using FileSystem with string encoding
          try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any, // Use string directly instead of EncodingType enum
            });
            sendMessageToWebView({
              type: 'libraryImage',
              imageDataUrl: `data:image/jpeg;base64,${base64}`,
            });
          } catch (e) {
            console.error('Error converting image:', e);
            sendMessageToWebView({
              type: 'libraryError',
              error: 'Failed to process image: ' + (e instanceof Error ? e.message : 'Unknown error'),
            });
          }
        }
      }
    } catch (error) {
      console.error('Image library error:', error);
      sendMessageToWebView({
        type: 'libraryError',
        error: 'Failed to pick image: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  };

  // Handle native camera capture
  const handleNativeCamera = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        sendMessageToWebView({
          type: 'cameraError',
          error: 'Camera permission denied. Please allow camera access in device settings.',
        });
        return;
      }

      // Launch camera
      // Use string 'images' - MediaType enum may not be available at runtime in some cases
      // Set base64: true to get base64 data directly from expo-image-picker (simpler than FileSystem)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.9,
        allowsEditing: false,
        aspect: [1, 1], // Square aspect ratio
        base64: true, // Request base64 data directly
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Use base64 directly from the result if available, otherwise fallback to FileSystem
        if (asset.base64) {
          // Use base64 directly from expo-image-picker
          sendMessageToWebView({
            type: 'cameraImage',
            imageDataUrl: `data:image/jpeg;base64,${asset.base64}`,
          });
        } else {
          // Fallback: read from file using FileSystem with string encoding
          try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any, // Use string directly instead of EncodingType enum
            });
            sendMessageToWebView({
              type: 'cameraImage',
              imageDataUrl: `data:image/jpeg;base64,${base64}`,
            });
          } catch (e) {
            console.error('Error converting image:', e);
            sendMessageToWebView({
              type: 'cameraError',
              error: 'Failed to process image: ' + (e instanceof Error ? e.message : 'Unknown error'),
            });
          }
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      sendMessageToWebView({
        type: 'cameraError',
        error: 'Failed to capture photo: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  };

  // Send message to WebView
  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current) {
      if (message.type === 'cameraImage' && message.imageDataUrl) {
        // Inject JavaScript to call the handler directly
        webViewRef.current.injectJavaScript(`
          if (window.handleNativeCameraImage) {
            window.handleNativeCameraImage(${JSON.stringify(message.imageDataUrl)});
          }
          true;
        `);
      } else if (message.type === 'cameraError') {
        webViewRef.current.injectJavaScript(`
          if (window.handleCameraError) {
            window.handleCameraError(${JSON.stringify(message.error || 'Camera error occurred.')});
          }
          true;
        `);
      } else if (message.type === 'libraryImage' && message.imageDataUrl) {
        // Inject JavaScript to call the library image handler
        // Check if modal is open - if so, use modal handler, otherwise use main screen handler
        webViewRef.current.injectJavaScript(`
          (function() {
            const modal = document.getElementById('addPastModal');
            if (modal && modal.style.display !== 'none') {
              // Modal is open - use modal handler
              if (window.handleLibraryImage) {
                window.handleLibraryImage(${JSON.stringify(message.imageDataUrl)});
              }
            } else {
              // Main screen - use main screen handler
              if (typeof handleLibraryImageForMain === 'function') {
                handleLibraryImageForMain(${JSON.stringify(message.imageDataUrl)});
              } else if (window.handleLibraryImageForMain) {
                window.handleLibraryImageForMain(${JSON.stringify(message.imageDataUrl)});
              }
            }
          })();
          true;
        `);
      } else if (message.type === 'libraryError') {
        webViewRef.current.injectJavaScript(`
          alert(${JSON.stringify(message.error || 'Image library error occurred.')});
          true;
        `);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading preview</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <Text style={styles.errorHint}>
            Make sure the HTTP server is running on port 8083
          </Text>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFB800" />
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: htmlUri }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            originWhitelist={['*']}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            allowsFullscreenVideo={false}
            onLoadEnd={() => setLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              setError(nativeEvent.description || 'Failed to load preview');
              setLoading(false);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
              setError(`HTTP ${nativeEvent.statusCode}: ${nativeEvent.description || 'Failed to load'}`);
              setLoading(false);
            }}
            onMessage={(event) => {
              // Handle messages from WebView
              try {
                const data = event.nativeEvent.data;
                const message = JSON.parse(data);
                console.log('WebView message:', message);
                
                if (message.type === 'requestNativeCamera') {
                  // WebView is requesting native camera
                  handleNativeCamera();
                } else if (message.type === 'requestImageLibrary') {
                  // WebView is requesting image library picker
                  handleImageLibrary();
                }
              } catch (e) {
                console.log('WebView message (non-JSON):', event.nativeEvent.data);
              }
            }}
            injectedJavaScript={`
              // React Native WebView automatically injects window.ReactNativeWebView
              // Set up message listener for messages from React Native
              (function() {
                window.addEventListener('message', function(event) {
                  try {
                    const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    if (message.type === 'cameraImage' && message.imageDataUrl) {
                      if (window.handleNativeCameraImage) {
                        window.handleNativeCameraImage(message.imageDataUrl);
                      }
                    } else if (message.type === 'cameraError') {
                      if (window.handleCameraError) {
                        window.handleCameraError(message.error);
                      }
                    }
                  } catch (e) {
                    console.error('Error handling message:', e);
                  }
                });
              })();
              true; // Required for injected JavaScript
            `}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbf6ef',
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbf6ef',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

