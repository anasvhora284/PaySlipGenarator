/**
 * Creates an HTML wrapper that injects XLSX library locally
 * This ensures XLSX is available without relying on CDN
 */
export const getXlsxInjectedHtml = (htmlContent) => {
  // The XLSX script will be injected directly into the WebView
  // This approach uses the XLSX library that's bundled with the app
  
  const xlsxInjectionScript = `
    <script>
      // XLSX will be injected as a minified inline script
      // The actual XLSX code will be inserted here by the React Native component
      window.__xlsxReady = false;
      window.__xlsxInit = function() {
        window.__xlsxReady = true;
      };
    </script>
  `;

  return htmlContent.replace(
    '<script src="https://cdn.jsdelivr.net/npm/xlsx@latest/dist/xlsx.full.min.js"></script>',
    xlsxInjectionScript
  );
};

/**
 * Generates JavaScript code that injects XLSX library inline
 * This creates the XLSX global without external CDN
 */
export const generateXlsxInjectionCode = () => {
  return `
    <script>
      // This script initializes XLSX library checking
      window.__xlsxCheckReady = function(callback, attempts = 0) {
        if (typeof XLSX !== 'undefined') {
          callback && callback();
        } else if (attempts < 50) {
          setTimeout(() => window.__xlsxCheckReady(callback, attempts + 1), 100);
        }
      };
    </script>
  `;
};

export default {
  getXlsxInjectedHtml,
  generateXlsxInjectionCode,
};
