// Google Sheets API Configuration
const GOOGLE_CLIENT_ID = '391147268144-8uge039vpbg229bhbqf3fvvb1n00iiub.apps.googleusercontent.com';
const SPREADSHEET_ID = '1d1FG7kFCWMD0eSn2v3e7dO-o7IlbdhopYFBy8D6sVF4';
const SHEET_NAME = 'Overview';
const DATA_RANGE = 'A3:G23'; // Columns A-G, Rows 3-23
const CHECKBOX_COLUMN_INDICES = [1, 2]; // Column B and C are checkboxes (0-indexed: B=1, C=2)

// API Scopes
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Application state
let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;
let accessToken = null;
let autoRefreshInterval = null;
let isUpdatingCheckbox = false;

// DOM Elements
const authSection = document.getElementById('authSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const contentSection = document.getElementById('contentSection');
const signInBtn = document.getElementById('signInBtn');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');
const dataTable = document.getElementById('dataTable');
const headerRow = document.getElementById('headerRow');
const dataBody = document.getElementById('dataBody');
const errorMessage = document.getElementById('errorMessage');
const lastUpdateTime = document.getElementById('lastUpdateTime');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Start waiting for Google APIs to load
    waitForGoogleAPIs();
});

// Setup event listeners
function setupEventListeners() {
    signInBtn.addEventListener('click', handleSignIn);
    refreshBtn.addEventListener('click', () => loadSheetData(true));
    retryBtn.addEventListener('click', () => {
        hideError();
        loadSheetData(true);
    });
}

// Wait for Google APIs to load (backup check)
function waitForGoogleAPIs() {
    // Check if both Google APIs are loaded
    if (typeof gapi !== 'undefined' && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        console.log('All APIs ready, initializing...');
        initializeGoogleAPI();
    } else {
        // Wait a bit and try again (max 10 seconds)
        if (typeof waitForGoogleAPIs.attempts === 'undefined') {
            waitForGoogleAPIs.attempts = 0;
        }
        waitForGoogleAPIs.attempts++;
        if (waitForGoogleAPIs.attempts < 100) {
            setTimeout(waitForGoogleAPIs, 100);
        } else {
            console.error('Google APIs failed to load', {
                gapi: typeof gapi,
                google: typeof google,
                googleAccounts: typeof google !== 'undefined' ? typeof google.accounts : 'undefined'
            });
            showError('Failed to load Google Sign-In. Please refresh the page.');
        }
    }
}

// Initialize Google API
function initializeGoogleAPI() {
    // Initialize Google Identity Services first
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        console.error('Google Identity Services not loaded');
        showError('Failed to load Google Sign-In. Please refresh the page.');
        return;
    }

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                if (response.error) {
                    showError('Authentication failed: ' + response.error);
                    return;
                }
                accessToken = response.access_token;
                initializeSheetsAPI();
            },
        });
        gisLoaded = true;
        console.log('Google Identity Services initialized');
    } catch (error) {
        console.error('Error initializing Google Identity Services:', error);
        showError('Failed to initialize Google Sign-In. Please refresh the page.');
        return;
    }

    // Load Google API client library
    if (typeof gapi === 'undefined') {
        console.error('Google API not loaded');
        showError('Failed to load Google API. Please refresh the page.');
        return;
    }

    gapi.load('client', () => {
        gapiLoaded = true;
        console.log('Google API client loaded');
        initializeOAuth();
    });
}

function initializeOAuth() {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    
    if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        accessToken = storedToken;
        initializeSheetsAPI();
    } else {
        showAuthSection();
    }
}

// Initialize Google Sheets API client
async function initializeSheetsAPI() {
    try {
        // Check if accessToken is set
        if (!accessToken) {
            console.error('No access token available');
            showAuthSection();
            return;
        }
        
        // Initialize the client first
        await gapi.client.init({
            // No API key needed for OAuth, but init is required
        });
        
        // Load the Google Sheets API v4
        await gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
        
        // Set the access token
        gapi.client.setToken({ access_token: accessToken });
        
        // Try to save to localStorage (may fail in some PWA contexts)
        try {
            localStorage.setItem('google_access_token', accessToken);
            // Store expiry (tokens typically last 1 hour)
            localStorage.setItem('google_token_expiry', (Date.now() + 3600000).toString());
        } catch (e) {
            console.warn('Could not save token to localStorage:', e);
            // Continue anyway - token is in memory
        }
        
        console.log('Google Sheets API loaded successfully');
        hideAuthSection();
        loadSheetData();
        startAutoRefresh();
    } catch (error) {
        console.error('Error initializing Sheets API:', error);
        console.error('Error details:', error.message, error.stack);
        showError('Failed to initialize Google Sheets API: ' + (error.message || 'Please refresh the page.'));
    }
}

// Handle sign in
function handleSignIn() {
    if (!tokenClient) {
        console.error('Token client not initialized');
        showError('Sign-in not ready. Please refresh the page.');
        return;
    }
    
    try {
        // For iOS/mobile, we might need to use a different approach
        // Try to request access token with explicit prompt
        tokenClient.requestAccessToken({ prompt: 'consent' });
        
        // Add a timeout to detect if popup was blocked
        setTimeout(() => {
            // Check if we got a token (this is a fallback check)
            const storedToken = localStorage.getItem('google_access_token');
            if (!storedToken && document.hidden === false) {
                // If no token after 2 seconds and page is visible, might be popup blocked
                console.warn('Sign-in might have been blocked. Try using Safari or ensure popups are allowed.');
            }
        }, 2000);
    } catch (error) {
        console.error('Error requesting access token:', error);
        showError('Failed to sign in: ' + (error.message || 'Please try again. On iOS, try using Safari instead of Chrome.'));
    }
}

// Load data from Google Sheet
async function loadSheetData(manualRefresh = false) {
    if (isUpdatingCheckbox && !manualRefresh) return; // Don't auto-refresh while updating
    
    hideError();
    showLoading();
    
    try {
        console.log('Loading sheet data...', { spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME, range: DATA_RANGE });
        
        // Try to get headers from row 1 first, then row 2
        let headers = [];
        
        // Try row 1
        try {
            const headerRange1 = `${SHEET_NAME}!A1:G1`;
            const headerResponse1 = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: headerRange1,
            });
            headers = headerResponse1.result.values?.[0] || [];
            console.log('Tried row 1 for headers:', headers);
        } catch (e) {
            console.log('Row 1 not available or empty');
        }
        
        // If row 1 is empty, try row 2
        if (headers.length === 0) {
            try {
                const headerRange2 = `${SHEET_NAME}!A2:G2`;
                const headerResponse2 = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: headerRange2,
                });
                headers = headerResponse2.result.values?.[0] || [];
                console.log('Tried row 2 for headers:', headers);
            } catch (e) {
                console.log('Row 2 not available or empty');
            }
        }
        
        // Get data range (Rows 3-23, Columns A-F)
        const fullRange = `${SHEET_NAME}!${DATA_RANGE}`;
        console.log('Fetching data from:', fullRange);
        
        // Get values (required)
        const dataResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: fullRange,
        });
        
        // Get formatting (optional - for background colors)
        let formatResponse = null;
        try {
            formatResponse = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
                ranges: [fullRange],
                fields: 'sheets(data(rowData(values(userEnteredFormat.backgroundColor))))',
            });
        } catch (err) {
            console.log('Could not fetch formatting (non-critical, continuing without colors):', err);
            formatResponse = null; // Continue without colors if formatting fails
        }
        
        console.log('Data response:', dataResponse);
        
        let values = dataResponse.result.values || [];
        
        // Normalize values array - ensure all rows have 7 columns (A-G), fill with empty strings
        values = values.map(row => {
            const normalizedRow = Array(7).fill('');
            if (row && Array.isArray(row)) {
                row.forEach((cell, index) => {
                    if (index < 7) {
                        normalizedRow[index] = cell !== undefined && cell !== null ? cell : '';
                    }
                });
            }
            return normalizedRow;
        });
        
        // Extract background colors from format response
        let cellColors = {};
        if (formatResponse && formatResponse.result && formatResponse.result.sheets && formatResponse.result.sheets[0]) {
            const sheetData = formatResponse.result.sheets[0].data;
            if (sheetData && sheetData[0] && sheetData[0].rowData) {
                sheetData[0].rowData.forEach((row, rowIndex) => {
                    if (row && row.values) {
                        row.values.forEach((cell, colIndex) => {
                            if (cell && cell.userEnteredFormat && cell.userEnteredFormat.backgroundColor) {
                                const bg = cell.userEnteredFormat.backgroundColor;
                                // Convert Google Sheets color format (0-1 RGB) to CSS rgb
                                // Handle both object format {red, green, blue} and number format
                                let r = 255, g = 255, b = 255;
                                
                                if (typeof bg.red === 'number') {
                                    r = Math.round(bg.red * 255);
                                }
                                if (typeof bg.green === 'number') {
                                    g = Math.round(bg.green * 255);
                                }
                                if (typeof bg.blue === 'number') {
                                    b = Math.round(bg.blue * 255);
                                }
                                
                                // Only apply color if it's not white (default)
                                if (r !== 255 || g !== 255 || b !== 255) {
                                    const colorKey = `${rowIndex}_${colIndex}`;
                                    cellColors[colorKey] = `rgb(${r}, ${g}, ${b})`;
                                }
                            }
                        });
                    }
                });
            }
        }
        
        // If headers are still empty and we have data, use first non-empty row as headers
        if (headers.length === 0 && values.length > 0) {
            // Find first non-empty row
            const firstRowWithData = values.find(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''));
            if (firstRowWithData && firstRowWithData.length > 0) {
                headers = firstRowWithData;
                // Remove that row from data (it's now used as header)
                values = values.filter(row => row !== firstRowWithData);
                console.log('Using first data row as headers:', headers);
            }
        }
        
        // Filter out completely empty rows from values (rows where all cells are empty)
        values = values.filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''));
        
        console.log('Headers loaded:', headers);
        console.log('Data loaded (filtered):', values);
        console.log('Cell colors loaded:', Object.keys(cellColors).length, 'colored cells');
        console.log('Number of rows:', values.length);
        
        if (headers.length === 0) {
            console.warn('No headers found, will use default column names');
        }
        if (values.length === 0) {
            console.warn('No data rows found in range A3:G23');
        }
        
        displayData(headers, values, cellColors);
        updateLastUpdateTime();
        
        if (manualRefresh) {
            refreshBtn.classList.add('loading');
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 500);
        }
    } catch (error) {
        console.error('Error loading sheet data:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            code: error.code,
            result: error.result
        });
        
        if (error.status === 401) {
            // Token expired, re-authenticate
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('google_token_expiry');
            showAuthSection();
            showError('Session expired. Please sign in again.');
        } else if (error.status === 403) {
            // Permission denied
            showError('Permission denied. Please make sure you have access to the Google Sheet.');
        } else if (error.code === 404 || error.status === 404) {
            // Sheet not found
            showError('Sheet not found. Please check the Sheet ID in settings.');
        } else {
            const errorMsg = error.message || error.result?.error?.message || 'Unknown error';
            showError(`Failed to load data: ${errorMsg}. Please check your connection and try again.`);
        }
    } finally {
        hideLoading();
    }
}

// Display data in table
function displayData(headers, values, cellColors = {}) {
    console.log('displayData called with:', { headers, values, headerCount: headers.length, valueCount: values.length, colorsCount: Object.keys(cellColors).length });
    
    // Clear existing content
    headerRow.innerHTML = '';
    dataBody.innerHTML = '';
    
    // Handle empty data case
    if (!headers || headers.length === 0) {
        console.warn('No headers to display');
        // Create default headers if none exist (A-G = 7 columns)
        for (let i = 0; i < 7; i++) {
            const th = document.createElement('th');
            th.textContent = `Column ${String.fromCharCode(65 + i)}`;
            headerRow.appendChild(th);
        }
    } else {
        // Create header row
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header || `Column ${String.fromCharCode(65 + index)}`; // A, B, C, etc.
            headerRow.appendChild(th);
        });
    }
    
    // Handle empty values
    if (!values || values.length === 0) {
        console.warn('No data rows to display');
        // Show a message row
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = headers.length || 7;
        td.textContent = 'No data found in the specified range (A3:G23)';
        td.style.textAlign = 'center';
        td.style.padding = '20px';
        td.style.color = 'var(--text-secondary)';
        tr.appendChild(td);
        dataBody.appendChild(tr);
        showContent();
        return;
    }
    
    // Create data rows
    values.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        // Ensure row has enough columns (pad with empty strings if needed) - now 7 columns (A-G)
        const normalizedRow = Array(7).fill('');
        if (row && Array.isArray(row)) {
            row.forEach((cell, index) => {
                if (index < 7) {
                    normalizedRow[index] = cell !== undefined && cell !== null ? cell : '';
                }
            });
        }
        
        headers.forEach((_, colIndex) => {
            const td = document.createElement('td');
            // Get cell value - use empty string if undefined/null/empty
            const cellValue = normalizedRow[colIndex] !== undefined && normalizedRow[colIndex] !== null 
                ? normalizedRow[colIndex] 
                : '';
            
            // Apply background color if available (rowIndex in data array, colIndex)
            // This will work for columns F (index 5) and G (index 6) as well as any other colored cells
            const colorKey = `${rowIndex}_${colIndex}`;
            if (cellColors[colorKey]) {
                td.style.backgroundColor = cellColors[colorKey];
            }
            
            // Check if this column is a checkbox column (B or C)
            if (CHECKBOX_COLUMN_INDICES.includes(colIndex)) {
                // Checkbox column (Column B or C)
                td.className = 'checkbox-cell';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'checkbox-input';
                checkbox.checked = cellValue === 'TRUE' || cellValue === 'true' || cellValue === true || cellValue === '1' || cellValue === 1;
                
                // Store row number (actual row in sheet = rowIndex + 3, since we start at row 3)
                // Store column letter (B=1, C=2)
                const sheetRow = rowIndex + 3;
                const columnLetter = String.fromCharCode(65 + colIndex); // A=65, B=66, C=67, etc.
                checkbox.dataset.row = sheetRow;
                checkbox.dataset.column = colIndex;
                checkbox.dataset.columnLetter = columnLetter;
                
                checkbox.addEventListener('change', (e) => {
                    updateCheckbox(sheetRow, e.target.checked, colIndex, columnLetter);
                });
                
                td.appendChild(checkbox);
            } else {
                // Read-only columns (A, D, E, F, G)
                td.className = 'read-only-cell';
                td.textContent = cellValue; // Empty string will display as empty (no content)
            }
            
            tr.appendChild(td);
        });
        
        dataBody.appendChild(tr);
    });
    
    showContent();
}

// Update checkbox value in Google Sheet
async function updateCheckbox(row, checked, columnIndex, columnLetter) {
    if (isUpdatingCheckbox) return;
    
    isUpdatingCheckbox = true;
    // Find the specific checkbox by row and column
    const checkbox = document.querySelector(`input[data-row="${row}"][data-column="${columnIndex}"]`);
    if (checkbox) checkbox.disabled = true;
    
    try {
        // columnLetter should be 'B' or 'C' (or any checkbox column)
        // We need to update cell {columnLetter}{row}
        const cellRange = `${SHEET_NAME}!${columnLetter}${row}`;
        const value = checked ? 'TRUE' : 'FALSE';
        
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellRange,
            valueInputOption: 'USER_ENTERED',
            values: [[value]],
        });
        
        console.log(`Updated checkbox at ${columnLetter}${row} to ${value}`);
        
        // Reload data after a short delay to reflect changes
        setTimeout(() => {
            loadSheetData(true);
            isUpdatingCheckbox = false;
        }, 500);
    } catch (error) {
        console.error('Error updating checkbox:', error);
        isUpdatingCheckbox = false;
        if (checkbox) checkbox.disabled = false;
        
        if (error.status === 401) {
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('google_token_expiry');
            showAuthSection();
            showError('Session expired. Please sign in again.');
        } else {
            showError(`Failed to update checkbox in column ${columnLetter}. Please try again.`);
            // Revert checkbox state
            if (checkbox) checkbox.checked = !checked;
        }
    }
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Clear existing interval if any
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Auto-refresh every 30 seconds
    autoRefreshInterval = setInterval(() => {
        loadSheetData(false);
    }, 30000); // 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    lastUpdateTime.textContent = `Last updated: ${timeString}`;
}

// UI State Management
function showAuthSection() {
    authSection.classList.remove('hidden');
    hideLoading();
    hideError();
    hideContent();
    stopAutoRefresh();
}

function hideAuthSection() {
    authSection.classList.add('hidden');
}

function showLoading() {
    loadingSection.classList.remove('hidden');
    hideError();
    hideContent();
}

function hideLoading() {
    loadingSection.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    hideLoading();
    hideContent();
    
    // Also log to console for debugging
    console.error('Error displayed to user:', message);
    
    // On mobile, also try to show in alert for visibility (can be removed later)
    if (window.innerWidth <= 768) {
        // Mobile device - errors might not be visible in console
        // Alert is temporary for debugging
        setTimeout(() => {
            if (errorSection && !errorSection.classList.contains('hidden')) {
                // Error still visible after 1 second, might help with debugging
                console.log('Error is visible to user');
            }
        }, 1000);
    }
}

function hideError() {
    errorSection.classList.add('hidden');
}

function showContent() {
    contentSection.classList.remove('hidden');
    hideLoading();
    hideError();
}

function hideContent() {
    contentSection.classList.add('hidden');
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

