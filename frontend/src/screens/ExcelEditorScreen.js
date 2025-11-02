import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import ScreenHeader from '../components/common/ScreenHeader';
import axios from 'axios';
import {BASE_URL} from '../utils/api';
import {colors} from '../styles/common';

// HANDSONTABLE - Step 1: Blank spreadsheet
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form-16 Editor</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable@14.3.0/dist/handsontable.full.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; overflow: hidden; height: 100vh; }
    .toolbar { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 10px 15px; 
      background: #f5f5f5; 
      border-bottom: 1px solid #e0e0e0; 
      height: 50px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      transition: transform 0.3s ease;
    }
    .toolbar.hidden {
      transform: translateY(-100%);
    }
    .toolbar button { 
      padding: 8px 16px; 
      margin: 0 4px; 
      background: #2e7d32; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer; 
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .toolbar button:active { 
      background: #1b5e20;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .toolbar button.back { 
      background: #666; 
    }
    .toolbar button.back:active { 
      background: #444; 
    }
    .toolbar button.send {
      background: #00897b;
    }
    .toolbar button.send:active {
      background: #00695c;
    }
    #spreadsheet-wrapper { 
      height: 100vh;
      padding-top: 50px;
      overflow: auto;
      background: #fff;
      position: relative;
    }
    #spreadsheet { 
      height: 100%; 
      width: 100%;
      min-height: 100%;
      position: relative;
      background: #fff;
    }
    .handsontable {
      background: #fff;
    }
    .ht_master {
      background: #fff;
    }
  </style>
</head>
<body>
  <div class="toolbar" id="toolbar">
    <button class="back" onclick="goBack()">← Back</button>
    <div>
      <button onclick="zoomOut()">−</button>
      <span id="zoom" style="min-width: 50px; text-align: center;">100%</span>
      <button onclick="zoomIn()">+</button>
    </div>
    <button class="send" onclick="sendData()">Send</button>
  </div>
  <div id="spreadsheet-wrapper">
    <div id="spreadsheet"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/handsontable@14.3.0/dist/handsontable.full.min.js"></script>
  <script>
    let hot = null;
    let currentZoom = 1;
    let lastScrollTop = 0;
    let toolbar = null;
    
    // Initialize Handsontable with data
    function initWithData(data) {
      try {
        if (hot) {
          hot.destroy();
          hot = null;
        }
        
        const container = document.getElementById('spreadsheet');
        if (!container) return;
        
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        
        const numCols = data[0] ? data[0].length : 10;
        
        // Convert XLSX merge format to Handsontable format
        const mergeCells = [];
        if (window.INITIAL_MERGES && window.INITIAL_MERGES.length > 0) {
          window.INITIAL_MERGES.forEach(function(merge) {
            mergeCells.push({
              row: merge.s.r,
              col: merge.s.c,
              rowspan: merge.e.r - merge.s.r + 1,
              colspan: merge.e.c - merge.s.c + 1
            });
          });
        }
        
        const config = {
          data: data,
          colHeaders: true,
          rowHeaders: true,
          contextMenu: true,
          copyPaste: true,
          outsideClickDeselects: false,
          licenseKey: 'non-commercial-and-evaluation',
          minRows: 1,
          minCols: numCols,
          colWidths: 150,
          manualColumnResize: true,
          manualRowResize: true,
          autoWrapRow: true,
          autoWrapCol: true,
          mergeCells: mergeCells.length > 0 ? mergeCells : false,
          className: 'htCenter htMiddle',
          cell: []
        };
        
        hot = new Handsontable(container, config);
      } catch (e) {
        console.error('Error initializing Handsontable:', e);
      }
    }
    
    // Wait for Handsontable library to load
    function ensureHandsontableReady() {
      if (typeof Handsontable === 'undefined') {
        setTimeout(ensureHandsontableReady, 500);
      }
    }
    
    ensureHandsontableReady();
    
    // Auto-hide toolbar on scroll
    toolbar = document.getElementById('toolbar');
    const wrapper = document.getElementById('spreadsheet-wrapper');
    
    wrapper.addEventListener('scroll', function() {
      const scrollTop = wrapper.scrollTop;
      
      // Notify React Native about scroll
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'scroll',
          scrollTop: scrollTop,
          scrollingDown: scrollTop > lastScrollTop
        }));
      }
      
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        toolbar.classList.add('hidden');
      } else if (scrollTop < lastScrollTop) {
        toolbar.classList.remove('hidden');
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
    
    function goBack() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'back'}));
      }
    }
    
    function zoomIn() {
      if (!hot) return;
      currentZoom = Math.min(currentZoom + 0.1, 2);
      document.getElementById('zoom').textContent = Math.round(currentZoom * 100) + '%';
      
      const baseColWidth = 150;
      const baseRowHeight = 23;
      hot.updateSettings({
        colWidths: baseColWidth * currentZoom,
        rowHeights: baseRowHeight * currentZoom
      });
      hot.render();
    }
    
    function zoomOut() {
      if (!hot) return;
      currentZoom = Math.max(currentZoom - 0.1, 0.5);
      document.getElementById('zoom').textContent = Math.round(currentZoom * 100) + '%';
      
      const baseColWidth = 150;
      const baseRowHeight = 23;
      hot.updateSettings({
        colWidths: baseColWidth * currentZoom,
        rowHeights: baseRowHeight * currentZoom
      });
      hot.render();
    }
    
    function sendData() {
      if (!hot) return;
      
      const data = hot.getData();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'data',
          data: data,
          merges: window.INITIAL_MERGES || []
        }));
      }
    }
    
    function convertToCSV(data) {
      return data.map(function(row) {
        return row.map(function(cell) {
          const escaped = String(cell || '').replace(/"/g, '""');
          if (escaped.indexOf(',') >= 0 || escaped.indexOf('\\n') >= 0) {
            return '"' + escaped + '"';
          }
          return escaped;
        }).join(',');
      }).join('\\n');
    }
    
    // Listen for data from React Native
    window.addEventListener('message', function(event) {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'init') {
          if (msg.data && msg.data.length > 0) {
            if (typeof Handsontable === 'undefined') {
              console.error('Handsontable library not available');
              return;
            }
            initWithData(msg.data);
          }
        }
      } catch (e) {
        console.error('Error handling message:', e);
      }
    });
    
    if (window.INITIAL_DATA && window.INITIAL_DATA.length > 0) {
      function initWhenReady() {
        if (typeof Handsontable === 'undefined') {
          setTimeout(initWhenReady, 100);
        } else {
          initWithData(window.INITIAL_DATA);
        }
      }
      initWhenReady();
    }
    
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ready'}));
    }
  </script>
</body>
</html>
`;


const ExcelEditorScreen = ({route, navigation}) => {
  const {employeeId, financialYear} = route.params || {};
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState(null);
  const [htmlWithData, setHtmlWithData] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (!employeeId) {
      Alert.alert('Error', 'Employee ID not provided');
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/form16/${employeeId}/${financialYear}`);
        
        if (response.data && response.data.data) {
          const fetchedData = response.data.data;
          const fetchedMerges = response.data.merges || [];

          setData(fetchedData);

          const dataScript = `
            <script>
              window.INITIAL_DATA = ${JSON.stringify(fetchedData)};
              window.INITIAL_MERGES = ${JSON.stringify(fetchedMerges)};
            </script>
          `;
          
          const htmlWithInjectedData = htmlContent.replace(
            '<script src="https://cdn.jsdelivr.net/npm/handsontable',
            dataScript + '<script src="https://cdn.jsdelivr.net/npm/handsontable'
          );
          
          setHtmlWithData(htmlWithInjectedData);
        } else {
          throw new Error('No data received from API');
        }
        
        setLoading(false);
       } catch (e) {
         console.error('Error fetching data:', e.message);
         Alert.alert('Error', 'Failed to fetch Form-16 data: ' + e.message);
         setLoading(false);
       }
    })();
  }, [employeeId, financialYear, navigation]);

  const handleWebViewMessage = useCallback(async event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'scroll') {
        if (msg.scrollingDown && msg.scrollTop > 50) {
          setHeaderVisible(false);
        } else if (!msg.scrollingDown) {
          setHeaderVisible(true);
        }
      } else if (msg.type === 'ready') {
        if (webViewRef.current && data) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'init',
            data: data,
          }));
        }
      } else if (msg.type === 'back') {
        navigation.goBack();
      } else if (msg.type === 'data') {
        try {
          setSending(true);
          
          const payload = {
            financialYear,
            data: msg.data,
            merges: msg.merges || [],
          };
          
          const res = await axios.post(
            `${BASE_URL}/api/form16/send-email/${employeeId}`,
            payload
          );
          
          if (res.data.success) {
            Alert.alert('Success', 'Form-16 updated and sent successfully!');
            navigation.goBack();
          } else {
            Alert.alert('Error', res.data.message);
          }
        } catch (e) {
          console.error('Error sending email:', e);
          Alert.alert('Error', e.message);
        } finally {
          setSending(false);
        }
      }
    } catch (e) {
      console.error('Error handling WebView message:', e);
    }
  }, [data, navigation, employeeId, financialYear]);

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

  if (!htmlWithData) {
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

  return (
    <View style={styles.container}>
      {headerVisible && <ScreenHeader title="Edit Form-16" />}
      {sending && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{
          uri: `data:text/html;charset=utf-8,${encodeURIComponent(htmlWithData)}`,
        }}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={true}
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
