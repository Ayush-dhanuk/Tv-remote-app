import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Vibration, SafeAreaView } from 'react-native';

export default function App() {
  const [tvIp, setTvIp] = useState('192.168.1.');
  const [status, setStatus] = useState('Disconnected');

  // Function to send commands to the Android TV box over local network
  const sendCommand = async (action) => {
    Vibration.vibrate(40); // Small haptic feedback on click
    if (!tvIp) {
      setStatus('Enter TV IP first');
      return;
    }

    try {
      setStatus(`Sending ${action}...`);
      // Assuming a lightweight receiver script or standard ADB/HTTP port listener on the TV
      const response = await fetch(`http://${tvIp}:7676/remote?action=${action}`, {
        method: 'GET',
        timeout: 2000,
      });
      
      if (response.ok) {
        setStatus(`Sent: ${action}`);
      } else {
        setStatus('Command failed');
      }
    } catch (error) {
      setStatus('Connection Error (Check IP)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & IP Config */}
      <View style={styles.header}>
        <Text style={styles.title}>Android TV Remote</Text>
        <View style={styles.ipContainer}>
          <TextInput
            style={styles.input}
            placeholder="TV IP Address (e.g. 192.168.1.50)"
            placeholderTextColor="#888"
            value={tvIp}
            onChangeText={setTvIp}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.statusText}>Status: {status}</Text>
      </View>

      {/* Media & Power Bar */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => sendCommand('POWER')}>
          <Text style={styles.buttonText}>⏻</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => sendCommand('HOME')}>
          <Text style={styles.buttonText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => sendCommand('BACK')}>
          <Text style={styles.buttonText}>↩</Text>
        </TouchableOpacity>
      </View>

      {/* D-Pad Navigation */}
      <View style={styles.dpadContainer}>
        <TouchableOpacity style={styles.dpadUp} onPress={() => sendCommand('UP')}>
          <Text style={styles.buttonText}>▲</Text>
        </TouchableOpacity>
        
        <View style={styles.dpadMiddleRow}>
          <TouchableOpacity style={styles.dpadLeft} onPress={() => sendCommand('LEFT')}>
            <Text style={styles.buttonText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dpadOk} onPress={() => sendCommand('OK')}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dpadRight} onPress={() => sendCommand('RIGHT')}>
            <Text style={styles.buttonText}>▶</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dpadDown} onPress={() => sendCommand('DOWN')}>
          <Text style={styles.buttonText}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Volume Controls */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => sendCommand('VOL_DOWN')}>
          <Text style={styles.buttonText}>Vol -</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => sendCommand('MUTE')}>
          <Text style={styles.buttonText}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => sendCommand('VOL_UP')}>
          <Text style={styles.buttonText}>Vol +</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  header: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ipContainer: {
    width: '100%',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  statusText: {
    color: '#00e676',
    fontSize: 13,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallButton: {
    minWidth: 70,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  okText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dpadContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 10,
  },
  dpadUp: {
    position: 'absolute',
    top: 10,
    padding: 15,
  },
  dpadDown: {
    position: 'absolute',
    bottom: 10,
    padding: 15,
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dpadLeft: {
    padding: 15,
  },
  dpadRight: {
    padding: 15,
  },
  dpadOk: {
    backgroundColor: '#2e2e2e',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
});
          
