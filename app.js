// Guest data storage
let guestData = new Map();
let meetMatchByNfcId = new Map(); // nfcId -> otherNfcId (symmetric)

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadCSVData();
    
    // Check if we're on admin page
    const isAdminPage = window.location.pathname.includes('admin.html');
    const isFindPage = window.location.pathname.includes('find.html');
    
    if (isAdminPage) {
        // Admin page: show all features
        setupNFCScanning();
        setupTestMode();
    } else if (isFindPage) {
        // Public directory page
        setupFindSomeonePage();
    } else {
        // Guest page: only handle URL parameters (from NFC tags)
        checkURLParameters();
        
        // If no NFC tag, ensure blue CTA style is applied
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('nfc') && !urlParams.get('test')) {
            showInitialWelcome();
        }
    }
});

function setupFindSomeonePage() {
    const searchInput = document.getElementById('guest-search');
    const tableBody = document.getElementById('guest-table-body');
    const emptyState = document.getElementById('guest-directory-empty');

    if (!searchInput || !tableBody || !emptyState) return;

    const guests = Array.from(guestData.entries())
        .filter(([nfcId, g]) => g && g.name && g.table)
        .map(([nfcId, g]) => ({ 
            nfcId: nfcId,
            name: String(g.name).trim(), 
            table: String(g.table).trim() 
        }))
        .sort((a, b) => {
            // Extract last name (last word) from each name
            const aLastName = a.name.split(' ').pop() || '';
            const bLastName = b.name.split(' ').pop() || '';
            // Sort by last name, then by full name if last names are the same
            const lastNameCompare = aLastName.localeCompare(bLastName, undefined, { sensitivity: 'base' });
            return lastNameCompare !== 0 ? lastNameCompare : a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });

    function render(filterText = '') {
        const q = filterText.trim().toLowerCase();
        const filtered = q
            ? guests.filter(g => g.name.toLowerCase().includes(q))
            : guests;

        tableBody.innerHTML = '';

        for (const g of filtered) {
            const tr = document.createElement('tr');

            const nameTd = document.createElement('td');
            const nameLink = document.createElement('a');
            nameLink.href = `index.html?nfc=${g.nfcId}`;
            nameLink.textContent = g.name;
            nameLink.style.textDecoration = 'none';
            nameLink.style.color = 'inherit';
            nameLink.addEventListener('mouseenter', () => {
                nameLink.style.textDecoration = 'underline';
            });
            nameLink.addEventListener('mouseleave', () => {
                nameLink.style.textDecoration = 'none';
            });
            nameTd.appendChild(nameLink);

            const tableTd = document.createElement('td');
            tableTd.className = 'text-end fw-light';
            tableTd.textContent = g.table;

            tr.appendChild(nameTd);
            tr.appendChild(tableTd);
            tableBody.appendChild(tr);
        }

        emptyState.classList.toggle('hidden', filtered.length !== 0);
    }

    render('');
    searchInput.addEventListener('input', (e) => {
        render(e.target.value || '');
    });
}

function buildMeetMatches(explicitMeetByNfcId = new Map()) {
    meetMatchByNfcId = new Map();

    // Apply explicit matches from CSV (and enforce symmetry)
    explicitMeetByNfcId.forEach((otherId, id) => {
        if (!otherId || otherId === id) return;
        if (!guestData.has(id) || !guestData.has(otherId)) return;
        meetMatchByNfcId.set(id, otherId);
        if (!meetMatchByNfcId.has(otherId)) {
            meetMatchByNfcId.set(otherId, id);
        }
    });
}

function hideMeetSuggestion() {
    const meetSection = document.getElementById('meet-someone-section');
    if (meetSection) meetSection.classList.add('hidden');
}

function showMeetSuggestionForGuest(nfcId) {
    const meetSection = document.getElementById('meet-someone-section');
    const meetNameEl = document.getElementById('meet-guest-name');
    const meetTableEl = document.getElementById('meet-table-number');
    if (!meetSection || !meetNameEl || !meetTableEl) return; // only exists on index.html

    const otherId = meetMatchByNfcId.get(nfcId);
    if (!otherId) {
        meetSection.classList.add('hidden');
        return;
    }

    const otherGuest = guestData.get(otherId);
    if (!otherGuest) {
        meetSection.classList.add('hidden');
        return;
    }

    meetNameEl.textContent = otherGuest.name;
    meetTableEl.textContent = otherGuest.table;
    meetSection.classList.remove('hidden');
}

// Setup test mode (called after CSV is loaded)
function setupTestMode() {
    const testSelect = document.getElementById('test-select');
    const testButton = document.getElementById('test-button');
    
    // Check if elements exist (only on admin page)
    if (!testSelect || !testButton) {
        return;
    }
    
    // Clear existing options except the first one
    while (testSelect.children.length > 1) {
        testSelect.removeChild(testSelect.lastChild);
    }
    
    // Populate dropdown with all guests
    guestData.forEach((guest, nfcId) => {
        const option = document.createElement('option');
        option.value = nfcId;
        option.textContent = `${guest.name} (${nfcId})`;
        testSelect.appendChild(option);
    });
    
    // Handle test button click
    testButton.addEventListener('click', () => {
        const selectedNfcId = testSelect.value;
        if (selectedNfcId) {
            simulateNFCTap(selectedNfcId);
        }
    });
}

// Load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('guests.csv');
        const csvText = await response.text();
        parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV:', error);
        updateStatus('Error loading CSV file. Please ensure guests.csv exists.', 'error');
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Find column indices
    const nfcIdIndex = headers.findIndex(h => h.toLowerCase().includes('nfc') || h.toLowerCase().includes('id'));
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const tableIndex = headers.findIndex(h => h.toLowerCase().includes('table'));
    const meetIndex = headers.findIndex(h => h.toLowerCase().includes('person') && h.toLowerCase().includes('meet'));

    if (nfcIdIndex === -1 || nameIndex === -1 || tableIndex === -1) {
        throw new Error('CSV must contain columns for NFC ID, Name, and Table');
    }

    const explicitMeetRawByNfcId = new Map(); // optional from CSV

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
            const nfcId = values[nfcIdIndex];
            const name = values[nameIndex];
            const table = values[tableIndex];
            
            if (nfcId && name && table) {
                guestData.set(nfcId, { name, table });
                if (meetIndex !== -1 && values[meetIndex]) {
                    explicitMeetRawByNfcId.set(nfcId, values[meetIndex]);
                }
            }
        }
    }

    // Resolve explicit meet values (can be NFC ID or guest name) to NFC IDs
    const nameToId = new Map();
    guestData.forEach((guest, id) => {
        nameToId.set(String(guest.name).trim().toLowerCase(), id);
    });

    const explicitMeetByNfcId = new Map();
    explicitMeetRawByNfcId.forEach((raw, id) => {
        const v = String(raw).trim();
        if (!v) return;
        if (guestData.has(v)) {
            explicitMeetByNfcId.set(id, v);
            return;
        }
        const byName = nameToId.get(v.toLowerCase());
        if (byName) explicitMeetByNfcId.set(id, byName);
    });

    // Only enable the "meet" feature if the CSV includes the column
    if (meetIndex !== -1 && explicitMeetByNfcId.size > 0) {
        buildMeetMatches(explicitMeetByNfcId);
    } else {
        meetMatchByNfcId = new Map();
    }
}

// Setup NFC scanning
function setupNFCScanning() {
    const scanButton = document.getElementById('scan-button');
    const discoverButton = document.getElementById('discover-button');
    
    // Check if elements exist (only on admin page)
    if (!scanButton || !discoverButton) {
        return;
    }
    
    // Check if Web NFC is supported (optional feature for Android)
    if (!('NDEFReader' in window)) {
        // URL-based NFC tags work on both iPhone and Android
        // Web NFC is just a bonus feature for Android users
        scanButton.disabled = true;
        if (discoverButton) discoverButton.disabled = true;
        return;
    }

    scanButton.addEventListener('click', async () => {
        await scanNFC(false);
    });

    if (discoverButton) {
        discoverButton.addEventListener('click', async () => {
            await scanNFC(true);
        });
    }
}

// Scan NFC tag
async function scanNFC(discoverMode = false) {
    try {
        updateStatus(discoverMode ? 'Discovering NFC ID... Tap a sticker to see its ID' : 'Scanning for NFC sticker...', 'info');
        hideGuestInfo();
        hideError();
        hideNfcIdDisplay();

        const ndef = new NDEFReader();
        
        await ndef.scan();
        
        ndef.addEventListener('reading', ({ message, serialNumber }) => {
            if (discoverMode) {
                handleNfcIdDiscovery(serialNumber, message);
            } else {
                handleNFCTag(serialNumber, message);
            }
        });

        ndef.addEventListener('readingerror', (error) => {
            console.error('NFC reading error:', error);
            updateStatus('Error reading NFC tag. Please try again.', 'error');
        });

    } catch (error) {
        console.error('NFC scan error:', error);
        if (error.name === 'NotAllowedError') {
            updateStatus('NFC permission denied. Please allow NFC access.', 'error');
        } else if (error.name === 'NotSupportedError') {
            updateStatus('NFC is not supported on this device.', 'error');
        } else {
            updateStatus('Error scanning NFC: ' + error.message, 'error');
        }
    }
}

// Handle NFC tag data
function handleNFCTag(serialNumber, message) {
    console.log('NFC Tag detected:', serialNumber);
    
    // Try to find guest by NFC ID (serial number)
    const guest = guestData.get(serialNumber);
    
    if (guest) {
        displayGuestInfo(serialNumber, guest.name, guest.table);
    } else {
        showError(`No guest found for NFC ID: ${serialNumber}`);
        updateStatus('Guest not found in database.', 'error');
    }
}

// Display guest information
function displayGuestInfo(nfcId, name, table) {
    document.getElementById('guest-name').textContent = name;
    document.getElementById('table-number').textContent = table;
    
    // Set welcome message with guest name (outside the card)
    const welcomeText = `Welcome to our wedding, ${name}! We are so glad to be able to celebrate with you!<br><span class="signature">Love, Natalia & Casey</span>`;
    const welcomeTextEl = document.getElementById('welcome-text');
    const welcomeMessageDiv = document.getElementById('welcome-message');
    if (welcomeTextEl && welcomeMessageDiv) {
        welcomeTextEl.innerHTML = welcomeText;
        welcomeMessageDiv.classList.remove('hidden');
    }
    
    // Show home button and debug button
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
        homeButton.classList.remove('hidden');
    }
    const debugButton = document.getElementById('debug-button');
    if (debugButton) {
        debugButton.classList.remove('hidden');
    }
    
    // Hide initial welcome message
    hideInitialWelcome();
    
    document.getElementById('guest-info').classList.remove('hidden');

    // Personal page suggestion (only exists on index.html)
    showMeetSuggestionForGuest(nfcId);
}

// Hide guest information
function hideGuestInfo() {
    document.getElementById('guest-info').classList.add('hidden');
    hideMeetSuggestion();
}

// Update status message
function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return; // Status element might not exist on guest page
    
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    
    // Map types to Bootstrap alert classes
    const alertClasses = {
        'info': 'alert alert-info',
        'success': 'alert alert-success',
        'error': 'alert alert-danger'
    };
    
    statusEl.className = alertClasses[type] || 'alert alert-info';
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.className = 'alert alert-danger';
    errorEl.classList.remove('hidden');
}

// Hide error message
function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

// Simulate NFC tap
function simulateNFCTap(nfcId) {
    console.log('Simulating NFC tap for:', nfcId);
    handleNFCTag(nfcId, null);
}

// Handle NFC ID discovery
function handleNfcIdDiscovery(serialNumber, message) {
    console.log('NFC Tag ID discovered:', serialNumber);
    
    // Display the NFC ID
    const nfcIdDisplay = document.getElementById('nfc-id-display');
    const nfcIdValue = document.getElementById('detected-nfc-id');
    const copyButton = document.getElementById('copy-nfc-id');
    
    nfcIdValue.textContent = serialNumber;
    nfcIdDisplay.classList.remove('hidden');
    
    // Setup copy button
    copyButton.onclick = () => {
        navigator.clipboard.writeText(serialNumber).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy ID';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };
    
    updateStatus(`NFC ID discovered: ${serialNumber}`, 'success');
    
    // Also check if this ID exists in the database
    const guest = guestData.get(serialNumber);
    if (guest) {
        displayGuestInfo(serialNumber, guest.name, guest.table);
    } else {
        showError(`This NFC ID is not in your CSV file. Add it to guests.csv with the guest's information.`);
    }
}

// Hide NFC ID display
function hideNfcIdDisplay() {
    document.getElementById('nfc-id-display').classList.add('hidden');
}

// Check URL parameters for test mode and NFC tags (works on both iPhone and Android)
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const testNfcId = urlParams.get('test');
    const nfcId = urlParams.get('nfc'); // For URL-based NFC tags (works on both iPhone and Android)
    
    // Handle URL-based NFC tags (primary method - works on both platforms)
    if (nfcId) {
        // Hide initial welcome message
        hideInitialWelcome();
        
        // Set the dropdown to this value (if on admin page)
        const testSelect = document.getElementById('test-select');
        if (testSelect) {
            testSelect.value = nfcId;
        }
        
        // Display guest info after a short delay to ensure data is loaded
        setTimeout(() => {
            handleNFCTag(nfcId, null);
        }, 100);
        return;
    }
    
    // Handle test mode (admin page only)
    if (testNfcId) {
        // Hide initial welcome message
        hideInitialWelcome();
        
        // Set the dropdown to this value
        const testSelect = document.getElementById('test-select');
        if (testSelect) {
            testSelect.value = testNfcId;
        }
        
        // Simulate the tap after a short delay to ensure data is loaded
        setTimeout(() => {
            simulateNFCTap(testNfcId);
        }, 100);
        return;
    }
    
    // No NFC tag passed - show initial welcome message
    showInitialWelcome();
}

// Show initial welcome message
function showInitialWelcome() {
    const initialWelcome = document.getElementById('initial-welcome');
    const mainCard = document.getElementById('main-card');
    if (initialWelcome) {
        initialWelcome.classList.remove('hidden');
        if (mainCard) {
            mainCard.classList.add('cta-blue');
        }
    }
}

// Hide initial welcome message
function hideInitialWelcome() {
    const initialWelcome = document.getElementById('initial-welcome');
    const mainCard = document.getElementById('main-card');
    if (initialWelcome) {
        initialWelcome.classList.add('hidden');
        if (mainCard) {
            mainCard.classList.remove('cta-blue');
        }
    }
}

