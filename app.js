// Google Sheets API Configuration
const GOOGLE_CLIENT_ID = '391147268144-8uge039vpbg229bhbqf3fvvb1n00iiub.apps.googleusercontent.com';
const SPREADSHEET_ID = '1d1FG7kFCWMD0eSn2v3e7dO-o7IlbdhopYFBy8D6sVF4';
const SHEET_NAME = 'Overview';
const DATA_RANGE = 'A3:F23'; // Columns A-F, Rows 3-23
const CHECKBOX_COLUMN_INDEX = 1; // Column B (0-indexed)

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
        // Initialize the client first
        await gapi.client.init({
            // No API key needed for OAuth, but init is required
        });
        
        // Load the Google Sheets API v4
        await gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
        
        // Set the access token
        gapi.client.setToken({ access_token: accessToken });
        localStorage.setItem('google_access_token', accessToken);
        // Store expiry (tokens typically last 1 hour)
        localStorage.setItem('google_token_expiry', (Date.now() + 3600000).toString());
        
        console.log('Google Sheets API loaded successfully');
        hideAuthSection();
        loadSheetData();
        startAutoRefresh();
    } catch (error) {
        console.error('Error initializing Sheets API:', error);
        showError('Failed to initialize Google Sheets API. Please refresh the page.');
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
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
        console.error('Error requesting access token:', error);
        showError('Failed to sign in. Please try again.');
    }
}

// Load data from Google Sheet
async function loadSheetData(manualRefresh = false) {
    if (isUpdatingCheckbox && !manualRefresh) return; // Don't auto-refresh while updating
    
    hideError();
    showLoading();
    
    try {
        console.log('Loading sheet data...', { spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME, range: DATA_RANGE });
        
        // Get the full range with headers
        // First, get headers (Row 2, Columns A-F)
        const headerRange = `${SHEET_NAME}!A2:F2`;
        console.log('Fetching headers from:', headerRange);
        const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: headerRange,
        });
        console.log('Header response:', headerResponse);
        
        // Get data range (Rows 3-23, Columns A-F)
        const fullRange = `${SHEET_NAME}!${DATA_RANGE}`;
        console.log('Fetching data from:', fullRange);
        const dataResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: fullRange,
        });
        console.log('Data response:', dataResponse);
        
        const headers = headerResponse.result.values?.[0] || [];
        const values = dataResponse.result.values || [];
        
        console.log('Headers loaded:', headers);
        console.log('Data loaded:', values);
        console.log('Number of rows:', values.length);
        
        if (headers.length === 0) {
            console.warn('No headers found in row 2');
        }
        if (values.length === 0) {
            console.warn('No data rows found in range A3:F23');
        }
        
        displayData(headers, values);
        updateLastUpdateTime();
        
        if (manualRefresh) {
            refreshBtn.classList.add('loading');
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 500);
        }
    } catch (error) {
        console.error('Error loading sheet data:', error);
        if (error.status === 401) {
            // Token expired, re-authenticate
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('google_token_expiry');
            showAuthSection();
            showError('Session expired. Please sign in again.');
        } else {
            showError('Failed to load data. Please check your connection and try again.');
        }
    } finally {
        hideLoading();
    }
}

// Display data in table
function displayData(headers, values) {
    console.log('displayData called with:', { headers, values, headerCount: headers.length, valueCount: values.length });
    
    // Clear existing content
    headerRow.innerHTML = '';
    dataBody.innerHTML = '';
    
    // Handle empty data case
    if (!headers || headers.length === 0) {
        console.warn('No headers to display');
        // Create default headers if none exist
        for (let i = 0; i < 6; i++) {
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
        td.colSpan = headers.length || 6;
        td.textContent = 'No data found in the specified range (A3:F23)';
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
        
        headers.forEach((_, colIndex) => {
            const td = document.createElement('td');
            const cellValue = row[colIndex] || '';
            
            if (colIndex === CHECKBOX_COLUMN_INDEX) {
                // Checkbox column (Column B)
                td.className = 'checkbox-cell';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'checkbox-input';
                checkbox.checked = cellValue === 'TRUE' || cellValue === 'true' || cellValue === true || cellValue === '1';
                
                // Store row number (actual row in sheet = rowIndex + 3, since we start at row 3)
                const sheetRow = rowIndex + 3;
                checkbox.dataset.row = sheetRow;
                
                checkbox.addEventListener('change', (e) => {
                    updateCheckbox(sheetRow, e.target.checked);
                });
                
                td.appendChild(checkbox);
            } else {
                // Read-only columns
                td.className = 'read-only-cell';
                td.textContent = cellValue;
            }
            
            tr.appendChild(td);
        });
        
        dataBody.appendChild(tr);
    });
    
    showContent();
}

// Update checkbox value in Google Sheet
async function updateCheckbox(row, checked) {
    if (isUpdatingCheckbox) return;
    
    isUpdatingCheckbox = true;
    const checkbox = document.querySelector(`input[data-row="${row}"]`);
    if (checkbox) checkbox.disabled = true;
    
    try {
        // Column B is column index 1 (0-indexed)
        // We need to update cell B{row}
        const cellRange = `${SHEET_NAME}!B${row}`;
        const value = checked ? 'TRUE' : 'FALSE';
        
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellRange,
            valueInputOption: 'USER_ENTERED',
            values: [[value]],
        });
        
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
            showError('Failed to update checkbox. Please try again.');
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

