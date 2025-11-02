/**
 * CSV to HTML converter with intelligent colspan and rowspan handling.
 * Designed for Form 16 and similar complex documents with merged cells.
 * JavaScript version for serverless deployment compatibility.
 */

function csvToHtmlWithSmartSpan(csvContent) {
  // Parse CSV content
  const lines = csvContent.trim().split('\n');
  const data = [];
  
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
    data.push(row);
  }
  
  if (data.length === 0) {
    return '<table></table>';
  }
  
  // Find maximum columns
  const maxCols = Math.max(...data.map(row => row.length));
  
  // Normalize all rows to have the same number of columns
  const normalizedData = data.map(row => [
    ...row,
    ...Array(maxCols - row.length).fill('')
  ]);
  
  const rows = normalizedData.length;
  const cols = maxCols;
  
  // Create tracking matrices
  const skip = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const rowspanValues = Array(rows).fill(null).map(() => Array(cols).fill(1));
  const colspanValues = Array(rows).fill(null).map(() => Array(cols).fill(1));
  
  // Calculate ROWSPAN (vertical merging for identical consecutive cells)
  for (let col = 0; col < cols; col++) {
    let row = 0;
    while (row < rows) {
      if (skip[row][col]) {
        row++;
        continue;
      }
      
      const cellValue = normalizedData[row][col].trim();
      
      // Only merge non-empty cells
      if (cellValue) {
        let spanCount = 1;
        for (let nextRow = row + 1; nextRow < rows; nextRow++) {
          if (normalizedData[nextRow][col].trim() === cellValue) {
            spanCount++;
            skip[nextRow][col] = true;
          } else {
            break;
          }
        }
        rowspanValues[row][col] = spanCount;
      }
      
      row++;
    }
  }
  
  // Reset skip matrix for colspan calculation
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      skip[i][j] = false;
    }
  }
  
  // Calculate COLSPAN (horizontal merging for empty cells following non-empty cells)
  for (let row = 0; row < rows; row++) {
    let col = 0;
    while (col < cols) {
      if (skip[row][col]) {
        col++;
        continue;
      }
      
      const cellValue = normalizedData[row][col].trim();
      
      // Count consecutive empty cells after a non-empty cell
      if (cellValue) {
        let spanCount = 1;
        for (let nextCol = col + 1; nextCol < cols; nextCol++) {
          if (normalizedData[row][nextCol].trim() === '') {
            spanCount++;
            skip[row][nextCol] = true;
          } else {
            break;
          }
        }
        colspanValues[row][col] = spanCount;
      }
      
      col++;
    }
  }
  
  // Generate HTML table
  const htmlOutput = [];
  htmlOutput.push('<!DOCTYPE html>');
  htmlOutput.push('<html>');
  htmlOutput.push('<head>');
  htmlOutput.push('<meta charset="UTF-8">');
  htmlOutput.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  htmlOutput.push('<style>');
  htmlOutput.push('body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }');
  htmlOutput.push('table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }');
  htmlOutput.push('td, th { border: 1px solid #999; padding: 8px; text-align: center; vertical-align: middle; }');
  htmlOutput.push('th { background-color: #f0f0f0; font-weight: bold; }');
  htmlOutput.push('td[contenteditable="true"]:focus { background-color: #fffef0; outline: 2px solid #2D6A4F; }');
  htmlOutput.push('</style>');
  htmlOutput.push('</head>');
  htmlOutput.push('<body>');
  htmlOutput.push('<table>');
  
  // Track which cells to skip during rendering
  const renderSkip = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  // Mark cells to skip based on rowspan
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rowspanValues[row][col] > 1) {
        for (let r = row + 1; r < row + rowspanValues[row][col]; r++) {
          if (r < rows) {
            renderSkip[r][col] = true;
          }
        }
      }
    }
  }
  
  // Mark cells to skip based on colspan
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (colspanValues[row][col] > 1) {
        for (let c = col + 1; c < col + colspanValues[row][col]; c++) {
          if (c < cols) {
            renderSkip[row][c] = true;
          }
        }
      }
    }
  }
  
  // Generate table rows
  for (let row = 0; row < rows; row++) {
    htmlOutput.push('  <tr>');
    
    for (let col = 0; col < cols; col++) {
      if (renderSkip[row][col]) {
        continue;
      }
      
      const cellValue = escapeHtml(normalizedData[row][col]);
      
      // Build cell attributes
      const attrs = [];
      if (rowspanValues[row][col] > 1) {
        attrs.push(`rowspan="${rowspanValues[row][col]}"`);
      }
      if (colspanValues[row][col] > 1) {
        attrs.push(`colspan="${colspanValues[row][col]}"`);
      }
      
      attrs.push('contenteditable="true"');
      attrs.push(`data-row="${row}"`);
      attrs.push(`data-col="${col}"`);
      
      const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
      
      // Use <th> for header-like cells (rows 0-3 typically)
      const tag = row < 4 ? 'th' : 'td';
      
      htmlOutput.push(`    <${tag}${attrsStr}>${cellValue}</${tag}>`);
    }
    
    htmlOutput.push('  </tr>');
  }
  
  htmlOutput.push('</table>');
  htmlOutput.push('<script>');
  htmlOutput.push('let editedData = ' + JSON.stringify(normalizedData) + ';');
  htmlOutput.push(`
const cells = document.querySelectorAll('td[contenteditable], th[contenteditable]');
cells.forEach(cell => {
  cell.addEventListener('blur', function() {
    const row = parseInt(this.dataset.row);
    const col = parseInt(this.dataset.col);
    const newValue = this.textContent;
    if (!editedData[row]) editedData[row] = [];
    editedData[row][col] = newValue;
  });
});

window.addEventListener('message', function(event) {
  try {
    const message = JSON.parse(event.data);
    if (message.type === 'GET_EDITED_DATA') {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'EDITED_DATA_READY',
          data: editedData
        }));
      }
    }
  } catch (error) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ERROR',
        message: error.message
      }));
    }
  }
});
`);
  htmlOutput.push('</script>');
  htmlOutput.push('</body>');
  htmlOutput.push('</html>');
  
  return htmlOutput.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = { csvToHtmlWithSmartSpan };
