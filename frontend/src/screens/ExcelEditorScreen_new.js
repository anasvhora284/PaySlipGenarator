import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import ScreenHeader from '../components/common/ScreenHeader';
import ReactNativeBlobUtil from 'react-native-blob-util';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import XLSX from 'xlsx';
import {colors} from '../styles/common';

// SIMPLE TEST HTML
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test</title>
  <style>
    body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
    .toolbar { padding: 12px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; }
    .toolbar button { padding: 8px 16px; margin-right: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .container { padding: 20px; }
    .test-box { padding: 20px; background: #e8f5e9; border-radius: 8px; margin: 10px 0; }
    h1 { color: #333; margin: 0 0 10px 0; }
    p { margin: 5px 0; color: #666; font-size: 14px; }
    .error { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="goBack()">← Back</button>
    <button onclick="zoomOut()">−</button>
    <span id="zoom">100%</span>
    <button onclick="zoomIn()">+</button>
    <button onclick="sendData()">Send</button>
  </div>
  <div class="container">
    <h1>✓ WebView Test Page</h1>
    <div class="test-box">
      <p><strong>Status:</strong> HTML and JavaScript are working!</p>
      <p><strong>Device:</strong> <span id="device">Detecting...</span></p>
      <p><strong>User Agent:</strong> <span id="ua">...</span></p>
    </div>
    <div id="data-table"></div>
    <div id="error-log"></div>
  </div>

  <script>
    console.log('✓ Script started');
    window.zoomLevel = 1;
    
    document.getElementById('ua').textContent = navigator.userAgent.substring(0, 50) + '...';
    document.getElementById('device').textContent = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile Device' : 'Unknown';
    
    function addLog(msg, type = 'info') {
      const logDiv = document.getElementById('error-log');
      const logEntry = document.createElement('div');
      logEntry.className = type === 'error' ? 'error' : 'test-box';
      logEntry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
      logDiv.appendChild(logEntry);
      console.log(msg);
    }
    
    addLog('Test page initialized');
    
    function goBack() { 
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'back'}));
      }
    }
    
    function zoomIn() {
      window.zoomLevel = Math.min(window.zoomLevel + 0.2, 2);
      document.querySelector('.container').style.transform = 'scale(' + window.zoomLevel + ')';
      document.getElementById('zoom').textContent = Math.round(window.zoomLevel * 100) + '%';
    }
    
    function zoomOut() {
      window.zoomLevel = Math.max(window.zoomLevel - 0.2, 0.5);
      document.querySelector('.container').style.transform = 'scale(' + window.zoomLevel + ')';
      document.getElementById('zoom').textContent = Math.round(window.zoomLevel * 100) + '%';
    }
    
    function sendData() {
      addLog('Send clicked - preparing to send data...');
      const testData = [['Name', 'Value'], ['Test1', 'Data1'], ['Test2', 'Data2']];
      const csv = testData.map(row => row.join(',')).join('\\n');
      
      if (window.ReactNativeWebView) {
        addLog('Sending message to React Native');
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'data',
          data: testData,
          csv: csv
        }));
      } else {
        addLog('ERROR: React Native WebView not available!', 'error');
      }
    }
    
    // Monitor postMessage
    window.addEventListener('message', function(e) {
      try {
        addLog('Message received: ' + e.data.substring(0, 100));
        const msg = JSON.parse(e.data);
        if (msg.type === 'init') {
          addLog('Init message received with data', 'success');
        }
      } catch (err) {
        addLog('Error parsing message: ' + err.message, 'error');
      }
    });
    
    // Send ready signal
    if (window.ReactNativeWebView) {
      addLog('Sending ready signal');
      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ready'}));
    } else {
      addLog('ERROR: React Native WebView not detected!', 'error');
    }
    
    // Show that we got here
    addLog('✓ All initialization complete');
  </script>
</body>
</html>
`;

const parseCSV = csvContent => {
  const lines = csvContent.trim().split('\n');
  const rows = [];
  for (const line of lines) {
    const row = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
};

const parseExcelFile = async filePath => {
  const fileData = await ReactNativeBlobUtil.fs.readFile(filePath, 'base64');
  const workbook = XLSX.read(fileData, {type: 'base64'});
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
  const rows = parseCSV(csvData);
  const merges = worksheet['!merges'] || [];
  const mergeMap = {};

  merges.forEach(merge => {
    if (merge?.s?.r === undefined || merge?.e?.r === undefined) {
      return;
    }
    const {r: sr, c: sc} = merge.s;
    const {r: er, c: ec} = merge.e;
    const colSpan = ec - sc + 1;
    const rowSpan = er - sr + 1;

    for (let r = sr; r <= er; r++) {
      for (let c = sc; c <= ec; c++) {
        mergeMap[`${r}-${c}`] = {isStart: r === sr && c === sc, colSpan, rowSpan, sr, sc};
      }
    }
  });

  return {rows, mergeMap};
};

const ExcelEditorScreen = ({route, navigation}) => {
  const {filePath, employeeId, employeeName, financialYear} = route.params || {};
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState(null);
  const [merges, setMerges] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (!filePath) {
      Alert.alert('Error', 'File path not provided');
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        const exists = await ReactNativeBlobUtil.fs.exists(filePath);
        if (!exists) {
          throw new Error('File not found');
        }
        const {rows, mergeMap} = await parseExcelFile(filePath);
        if (!rows?.length) {
          throw new Error('No data found');
        }
        setData(rows);
        setMerges(mergeMap);
        setLoading(false);
      } catch (e) {
        Alert.alert('Error', e.message);
        navigation.goBack();
      }
    })();
  }, [filePath, navigation]);

  const handleWebViewMessage = useCallback(async event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'ready') {
        if (webViewRef.current && data) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'init',
            data: data,
            merges: merges,
          }));
        }
      } else if (msg.type === 'back') {
        navigation.goBack();
      } else if (msg.type === 'data') {
        try {
          setSending(true);
          // eslint-disable-next-line no-undef
          const b64 = btoa(unescape(encodeURIComponent(msg.csv)));
          const res = await axios.post(
            `${BASE_URL}/api/form16/send-email/${employeeId}`,
            {
              financialYear,
              fileData: b64,
              fileName: `Form16_${employeeName}_${financialYear}.xlsx`,
            },
          );
          if (res.data.success) {
            Alert.alert('Success', 'Form-16 sent!');
            navigation.goBack();
          } else {
            Alert.alert('Error', res.data.message);
          }
        } catch (e) {
          Alert.alert('Error', e.message);
        } finally {
          setSending(false);
        }
      }
    } catch (e) {
      console.error('Error handling WebView message:', e);
    }
  }, [data, merges, navigation, employeeId, employeeName, financialYear]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Excel Editor" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const handleWebViewError = (syntheticEvent) => {
    const {nativeEvent} = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    Alert.alert('WebView Error', `Failed to load: ${nativeEvent.description}`);
  };

  const handleWebViewLoadEnd = () => {
    console.log('✓ WebView loaded successfully');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Form-16" />
      {sending && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{
          uri: `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
        }}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onLoadEnd={handleWebViewLoadEnd}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default ExcelEditorScreen;
