import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_CONNECTED_KEY = '@last_connected_tv';

export default function App() {
  const [activeIp, setActiveIp] = useState(null);
  const [status, setStatus] = useState('Initializing...');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [showPickerModal, setShowPickerModal] = useState(false);

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem(LAST_CONNECTED_KEY);
      if (savedIp) {
        setStatus(`Auto-connecting to ${savedIp}...`);
        const alive = await verifyDevice(savedIp);
        if (alive) {
          setActiveIp(savedIp);
          setStatus(`Connected to ${savedIp}`);
          return;
        }
      }
    } catch (e) {
      console.log('Error reading storage', e);
    }
    // If no saved IP or saved IP unreachable, start scan
    scanLocalNetwork();
  };

  const verifyDevice = async (ip) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`http://${ip}:7676/remote?action=PING`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      return res.ok || res.status === 404; // Alive on port 7676
    } catch (e) {
      return false;
    }
  };

    const scanLocalNetwork = async () => {
    setIsScanning(true);
    setStatus('Scanning local Wi-Fi for TV...');
    setDiscoveredDevices([]);

    // Scans standard subnet ranges
    const subnets = ['192.168.1', '192.168.0', '192.168.29', '10.0.0'];
    const found = [];

    for (const baseSubnet of subnets) {
      const checks = Array.from({ length: 30 }, (_, i) => i + 100).map(async (host) => {
        const targetIp = `${baseSubnet}.${host}`;
        const isUp = await verifyDevice(targetIp);
        if (isUp) {
          found.push({ ip: targetIp, name: `Android TV (${targetIp})` });
        }
      });
      await Promise.all(checks);
    }

    setIsScanning(false);
    if (found.length > 0) {
      setDiscoveredDevices(found);
      setShowPickerModal(true);
      setStatus('Found devices! Select one.');
    } else {
      setStatus('No TV found. Try plugging in a USB mouse.');
    }
  };
  

    await Promise.all(checks);

    setIsScanning(false);
    if (found.length > 0) {
      setDiscoveredDevices(found);
      setShowPickerModal(true);
      setStatus('Found devices! Select one.');
    } else {
      setStatus('No TV found automatically');
    }
  };

  const selectDevice = async (ip) => {
    setActiveIp(ip);
    setShowPickerModal(false);
    setStatus(`Connected: ${ip}`);
    try {
      await AsyncStorage.setItem(LAST_CONNECTED_KEY, ip);
    } catch (e) {
      console.log('Error saving TV IP', e);
    }
  };

  const sendCommand = async (action) => {
    Vibration.vibrate(30);
    if (!activeIp) {
      setStatus('No TV connected. Scan first!');
      return;
    }

    try {
      setStatus(`Sending ${action}...`);
      const response = await fetch(`http://${activeIp}:7676/remote?action=${action}`, {
        method: 'GET',
      });
      if (response.ok) {
        setStatus(`Sent: ${action}`);
      } else {
        setStatus(`Action ${action} sent`);
      }
    } catch (error) {
      setStatus('Signal dropped (Check Wi-Fi)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerInfo}>
          <Text style={styles.appTitle}>PLASMA REMOTE</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: activeIp ? '#00E676' : '#FF5252' },
              ]}
            />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.scanButton} onPress={scanLocalNetwork}>
          {isScanning ? (
            <ActivityIndicator color="#6C5CE7" size="small" />
          ) : (
            <Text style={styles.scanButtonText}>📡 SCAN</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Power & Utility Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.glowButton, styles.powerBtn]}
          onPress={() => sendCommand('POWER')}>
          <Text style={styles.powerIcon}>⏻</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.glowButton, styles.navPill]}
          onPress={() => sendCommand('HOME')}>
          <Text style={styles.pillText}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.glowButton, styles.navPill]}
          onPress={() => sendCommand('BACK')}>
          <Text style={styles.pillText}>BACK</Text>
        </TouchableOpacity>
      </View>

      {/* Modern D-Pad Controller */}
      <View style={styles.dpadOuterRing}>
        <TouchableOpacity style={styles.dpadUp} onPress={() => sendCommand('UP')}>
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>

        <View style={styles.dpadMidRow}>
          <TouchableOpacity style={styles.dpadSide} onPress={() => sendCommand('LEFT')}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dpadCenterOk} onPress={() => sendCommand('OK')}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dpadSide} onPress={() => sendCommand('RIGHT')}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dpadDown} onPress={() => sendCommand('DOWN')}>
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Volume Bar */}
      <View style={styles.volumeBar}>
        <TouchableOpacity style={styles.volBtn} onPress={() => sendCommand('VOL_DOWN')}>
          <Text style={styles.volText}>- VOL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.volBtn, styles.muteBtn]} onPress={() => sendCommand('MUTE')}>
          <Text style={styles.volText}>MUTE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.volBtn} onPress={() => sendCommand('VOL_UP')}>
          <Text style={styles.volText}>+ VOL</Text>
        </TouchableOpacity>
      </View>

      {/* TV Selection Modal */}
      <Modal visible={showPickerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect to TV</Text>
            <FlatList
              data={discoveredDevices}
              keyExtractor={(item) => item.ip}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceOption}
                  onPress={() => selectDevice(item.ip)}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.connectLabel}>Tap to pair ➔</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowPickerModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C10',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 25,
  },
  headerCard: {
    width: '90%',
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#21262D',
    borderWidth: 1,
  },
  headerInfo: { flex: 1 },
  appTitle: {
    color: '#A5D6A7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#8B949E', fontSize: 12, fontWeight: '600' },
  scanButton: {
    backgroundColor: '#21262D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  scanButtonText: { color: '#C9D1D9', fontSize: 12, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    width: '85%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glowButton: {
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#FF5252',
  },
  powerIcon: { color: '#FF5252', fontSize: 24, fontWeight: 'bold' },
  navPill: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  pillText: { color: '#58A6FF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  dpadOuterRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#161B22',
    borderColor: '#21262D',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadUp: { position: 'absolute', top: 15, padding: 15 },
  dpadDown: { position: 'absolute', bottom: 15, padding: 15 },
  dpadMidRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dpadSide: { padding: 15 },
  arrowText: { color: '#C9D1D9', fontSize: 20 },
  dpadCenterOk: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#21262D',
    borderColor: '#58A6FF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: { color: '#58A6FF', fontSize: 18, fontWeight: '900' },
  volumeBar: {
    flexDirection: 'row',
    backgroundColor: '#161B22',
    borderRadius: 25,
    padding: 6,
    width: '85%',
    justifyContent: 'space-between',
    borderColor: '#21262D',
    borderWidth: 1,
  },
  volBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  muteBtn: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#21262D' },
  volText: { color: '#8B949E', fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 20,
    borderColor: '#30363D',
    borderWidth: 1,
  },
  modalTitle: { color: '#F0F6FC', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  deviceOption: {
    padding: 15,
    backgroundColor: '#21262D',
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceName: { color: '#58A6FF', fontWeight: '700' },
  connectLabel: { color: '#8B949E', fontSize: 12 },
  closeBtn: { marginTop: 15, alignItems: 'center' },
  closeBtnText: { color: '#FF5252', fontWeight: '700' },
});
    
