import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Linking, AppState } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/config';
import { Button } from '../../components/Button';
import { api } from '../../api/client';

export function QRScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Activate camera when screen is focused, deactivate when leaving
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      setScanned(false);
      setProcessing(false);

      // Also handle app going to background/foreground
      const sub = AppState.addEventListener('change', (state) => {
        setCameraActive(state === 'active');
      });

      return () => {
        setCameraActive(false);
        sub.remove();
      };
    }, [])
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is needed to scan QR codes</Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          style={{ marginTop: SPACING.md }}
        />
        <Button
          title="Open Settings"
          onPress={() => Linking.openSettings()}
          variant="outline"
          style={{ marginTop: SPACING.sm }}
        />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      // QR code contains URL like myglowpass.com/checkin?token=XXX
      let token = data;
      if (data.includes('token=')) {
        try {
          const url = new URL(data);
          token = url.searchParams.get('token') || data;
        } catch {
          // Not a valid URL, use raw data
        }
      }

      const result = await api.post<{ message: string; memberName?: string }>(
        `/api/events/${token}/checkin`,
        { token }
      );

      Alert.alert(
        'Check-In Successful',
        result.memberName
          ? `${result.memberName} has been checked in!`
          : result.message || 'Member checked in successfully',
        [
          {
            text: 'Scan Another',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      Alert.alert('Check-In Failed', message, [
        {
          text: 'Try Again',
          onPress: () => {
            setScanned(false);
            setProcessing(false);
          },
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {cameraActive ? (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.hint}>
              {processing ? 'Processing...' : 'Point camera at QR code'}
            </Text>
          </View>
        </CameraView>
      ) : (
        <View style={styles.container}>
          <Text style={styles.message}>Camera paused</Text>
        </View>
      )}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const SCAN_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderColor: COLORS.primary,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderColor: COLORS.primary,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderColor: COLORS.primary,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderColor: COLORS.primary,
  },
  hint: {
    color: '#FFF',
    fontSize: 16,
    marginTop: SPACING.lg,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
  },
});
