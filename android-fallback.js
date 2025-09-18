// Android Fallback Loading System with Mobile UI
console.log('📱 Android Fallback system loading...');
// Make fallback opt-in via ?forceAndroidFallback=1 to avoid unintended overlays
try {
  var __q = new URLSearchParams(location.search);
  var __force = __q.get('forceAndroidFallback') === '1';
  // Expose flag globally so later code can honor it
  window.__forceAndroidFallback = __force;
  if (!__force) {
    console.log('📱 Android fallback disabled by default (opt-in only).');
    // Soft-disable by short-circuiting init calls
    window.openFullApp = function(){ window.location.href = 'index.html'; };
    // Do not initialize fallback UI automatically
    // Note: we no longer rely on throwing; downstream code must check the flag
  }
} catch(_) {}

// Detect Android devices more reliably
function isAndroidDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints;

  return /android/.test(userAgent) ||
         (platform.includes('linux') && maxTouchPoints > 1) ||
         /android/.test(platform);
}

// Utility: detect if main app loaded successfully
function isMainAppLoaded() {
  return typeof allData !== 'undefined' && allData && allData.length > 0;
}

// Simplified mobile UI for Android fallback
function showAndroidSimplifiedUI() {
  console.log('📱 Android: Showing simplified mobile UI fallback');

  // Hide main app elements if they exist
  const loader = document.getElementById('custom-loader');
  const app = document.getElementById('app');

  if (loader) loader.style.display = 'none';
  if (app) app.style.display = 'none';

  // Create simplified mobile UI
  const mobileUI = document.createElement('div');
  mobileUI.id = 'android-mobile-fallback';
  mobileUI.innerHTML = `
    <style>
      #android-mobile-fallback {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 9999;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      .fallback-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        text-align: center;
        position: sticky;
        top: 0;
        z-index: 1000;
      }
      .fallback-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .fallback-header p {
        margin: 10px 0 0 0;
        opacity: 0.9;
        font-size: 16px;
      }
      .fallback-content {
        padding: 20px;
      }
      .fallback-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      .fallback-card {
        background: white;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .fallback-card:hover { transform: scale(1.02); }
      .fallback-card img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      .fallback-card h3 {
        font-size: 14px;
        margin-bottom: 5px;
        color: #333;
      }
      .fallback-card p {
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
      }
      .fallback-btn {
        background: #007AFF;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        width: 100%;
        margin: 5px 0;
        text-decoration: none;
        display: inline-block;
        text-align: center;
      }
      .fallback-btn.secondary {
        background: #34C759;
      }
      .fallback-error {
        background: #ffebee;
        color: #c62828;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .fallback-loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }
    </style>

    <div class="fallback-header">
      <h1>🪑 Konfigurator</h1>
      <p>Mobile Configurator</p>
    </div>

    <div class="fallback-content">
      <div id="fallback-error" class="fallback-error" style="display: none;">
        ⚠️ Nie udało się załadować pełnej aplikacji
        <br><br>
        <button class="fallback-btn" onclick="location.reload()">🔄 Spróbuj ponownie</button>
      </div>

      <div id="fallback-loading" class="fallback-loading">
        <div>⏳ Ładowanie danych...</div>
      </div>

      <div id="fallback-products" class="fallback-grid" style="display: none;">
        <!-- Products will be loaded here -->
      </div>

      <div style="text-align: center;">
        <button class="fallback-btn" onclick="openFullApp()">🚀 Otwórz pełną aplikację</button>
        <button class="fallback-btn secondary" onclick="installPWA()">📱 Zainstaluj aplikację</button>
      </div>
    </div>
  `;

  document.body.appendChild(mobileUI);

  // Try to load simplified data
  loadSimplifiedData();
}

// Load simplified product data for fallback UI
async function loadSimplifiedData() {
  try {
    console.log('📱 Android: Loading simplified data for fallback');

    const sheetId = '1lZMJ-4Qd0nDY-7Hl9iV-pJnZSTVzYiA-A3rDq_bC16U';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Accept': 'text/csv,text/plain' }
    });

    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('📱 Android: CSV loaded, length:', csvText.length);

    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const products = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim().replace(/"/g, '') || '';
      });
      return obj;
    }).filter(item =>
      item.Visible?.toLowerCase() !== 'false' &&
      item.Typ?.toLowerCase() === 'model'
    ).slice(0, 12); // Limit to 12 products for mobile

    console.log('📱 Android: Parsed products:', products.length);

    // Show products
    displaySimplifiedProducts(products);

  } catch (error) {
    console.error('📱 Android: Error loading simplified data:', error);
    showFallbackError(`Nie udało się załadować danych: ${error.message}`);
  }
}

// Display simplified products in fallback UI
function displaySimplifiedProducts(products) {
  const container = document.getElementById('fallback-products');
  const loading = document.getElementById('fallback-loading');

  if (!container || !loading) return;

  loading.style.display = 'none';
  container.style.display = 'grid';

  container.innerHTML = products.map(product => `
    <div class="fallback-card" onclick="selectProduct('${product.ID || product.Nazwa}')">
      <img src="./chairs/${product.Model || 'Default'}.glb"
           alt="${product.Nazwa}"
           onerror="this.src='./icons/chair_icon.png'">
      <h3>${product.Nazwa || 'Krzesło'}</h3>
      <p>${product.Kategoria || 'Kategoria'}</p>
      <div style="font-weight: bold; color: #007AFF;">
        ${product.Cena ? product.Cena + ' zł' : 'Cena na zapytanie'}
      </div>
    </div>
  `).join('');
}

// Show error in fallback UI
function showFallbackError(message) {
  const errorDiv = document.getElementById('fallback-error');
  const loading = document.getElementById('fallback-loading');

  if (errorDiv) {
    errorDiv.innerHTML = `
      ⚠️ ${message}
      <br><br>
      <button class="fallback-btn" onclick="location.reload()">🔄 Spróbuj ponownie</button>
      <button class="fallback-btn secondary" onclick="openFullApp()">🚀 Otwórz pełną wersję</button>
    `;
    errorDiv.style.display = 'block';
  }

  if (loading) loading.style.display = 'none';
}

// Android-specific initialization
function initAndroidFallback() {
  // Respect global flag: run only when explicitly forced via query param
  if (!window.__forceAndroidFallback) {
    console.log('📱 Android fallback not forced — skipping initialization');
    return;
  }
  if (!isAndroidDevice()) {
    console.log('📱 Not Android device, skipping fallback');
    return;
  }

  console.log('📱 Android device detected, initializing fallback...');

  // Wait briefly for main app; then fallback if needed
  const fallbackDelay = 8000; // Longer delay for Android

  setTimeout(() => {
    // Check if main app loaded successfully
    if (isMainAppLoaded()) {
      console.log('📱 Android: Main app loaded successfully, no fallback needed');
      return;
    }

    console.log('📱 Android: Main app failed to load, using fallback...');
    showAndroidSimplifiedUI();
  }, fallbackDelay);

  // Also force hide loader after 15 seconds as ultimate backup
  setTimeout(() => {
    console.log('📱 Android: Force hiding loader after 15s (ultimate backup)');
    const loader = document.getElementById('custom-loader');
    const app = document.getElementById('app');

    if (loader && loader.style.display !== 'none') {
      loader.style.display = 'none';
      console.log('📱 Android: Loader hidden (ultimate backup)');
    }

    if (app && app.style.visibility !== 'visible') {
      app.style.visibility = 'visible';
      console.log('📱 Android: App shown (ultimate backup)');
    }
  }, 15000);

  // Clear caches on Android (can help with loading issues)
  if ('caches' in window) {
    console.log('📱 Android: Clearing caches...');
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log('📱 Android: Cache cleared:', cacheName);
      });
    });
  }
}

// Global functions for fallback UI
window.openFullApp = function() {
  console.log('📱 Android: Opening full app...');
  window.location.href = 'index.html';
};

window.installPWA = function() {
  console.log('📱 Android: Attempting PWA install...');
  if ('serviceWorker' in navigator && 'showInstallPrompt' in window) {
    window.showInstallPrompt();
  } else {
    alert('Instalacja PWA nie jest dostępna w tej przeglądarce');
  }
};

window.selectProduct = function(productId) {
  console.log('📱 Android: Selected product:', productId);
  // Could implement product selection logic here
  alert(`Wybrano produkt: ${productId}\n\nOtwórz pełną aplikację, aby zobaczyć szczegóły.`);
};

// Initialize Android fallback when DOM is ready
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAndroidFallback);
  } else {
    initAndroidFallback();
  }
} catch(_) { /* noop when disabled */ }