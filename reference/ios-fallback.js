// iOS Fallback Loading System
console.log('📱 iOS Fallback system loading...');

// Detect iOS devices more reliably
function isIOSDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints;
  
  return /iphone|ipad|ipod/.test(userAgent) || 
         (platform === 'macintel' && maxTouchPoints > 1) ||
         /iphone|ipad|ipod|ios/.test(platform);
}

// Utility: detect import map support (Safari <16 doesn't support import maps)
function supportsImportMaps() {
  try {
    return typeof HTMLScriptElement !== 'undefined' &&
           typeof HTMLScriptElement.supports === 'function' &&
           HTMLScriptElement.supports('importmap');
  } catch (_) {
    return false;
  }
}

// iOS-specific initialization
function initIOSFallback() {
  if (!isIOSDevice()) {
    console.log('📱 Not iOS device, skipping fallback');
    return;
  }
  
  console.log('📱 iOS device detected, initializing fallback...');
  const hasImportMaps = supportsImportMaps();
  console.log('📱 iOS: Import maps supported:', hasImportMaps);
  // Only enable fallback for older Safari (no import maps) or when explicitly forced via query param
  const params = new URLSearchParams(window.location.search);
  const forceFallback = params.has('ios') || params.get('fallback') === '1';
  if (hasImportMaps && !forceFallback) {
    console.log('📱 iOS: Modern Safari detected, skipping fallback bootstrap');
    return;
  }
  
  // For older Safari or forced fallback, wait a bit to allow main app to load first
  const fallbackDelay = forceFallback ? 500 : 6000;
  
  // Wait briefly for main app; then fallback if needed
  setTimeout(() => {
    // Check if main app loaded successfully
    if (typeof allData !== 'undefined' && allData && allData.length > 0) {
      console.log('📱 iOS: Main app loaded successfully, no fallback needed');
      return;
    }
    
    console.log('📱 iOS: Main app failed to load, using fallback...');
    showIOSSimplifiedUI();
  }, fallbackDelay);
  
  // Also force hide loader after 12 seconds as ultimate backup
  setTimeout(() => {
    console.log('📱 iOS: Force hiding loader after 10s (ultimate backup)');
    const loader = document.getElementById('custom-loader');
    const app = document.getElementById('app');
    
    if (loader && loader.style.display !== 'none') {
      loader.style.display = 'none';
      console.log('📱 iOS: Loader hidden (ultimate backup)');
    }
    
    if (app && app.style.visibility !== 'visible') {
      app.style.visibility = 'visible';
      console.log('📱 iOS: App shown (ultimate backup)');
    }
  }, 12000);
  
  // Only touch SW/cache when we are actually in fallback mode
  if (!hasImportMaps || forceFallback) {
    // Disable service worker on iOS (can cause issues)
    if ('serviceWorker' in navigator) {
      console.log('📱 iOS: Unregistering service workers...');
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('📱 iOS: Service worker unregistered');
        });
      });
    }
    
    // Disable cache on iOS
    if ('caches' in window) {
      console.log('📱 iOS: Clearing all caches...');
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          console.log('📱 iOS: Cache cleared:', cacheName);
        });
      });
    }
  }
}

// Simplified UI for iOS
function showIOSSimplifiedUI() {
  console.log('📱 iOS: Setting up simplified UI...');
  
  // Try to load data with simpler approach
  loadDataSimplified();
}

// Simplified data loading for iOS
async function loadDataSimplified() {
  console.log('📱 iOS: Starting simplified data loading...');
  
  try {
    const sheetId = '1lZMJ-4Qd0nDY-7Hl9iV-pJnZSTVzYiA-A3rDq_bC16U';
    const simpleURL = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    
    console.log('📱 iOS: Fetching data from:', simpleURL);
    
    let response = await fetch(simpleURL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📱 iOS: Data loaded, length:', csvText.length);
    
    if (csvText.length < 100) {
      throw new Error('Data too short, might be empty');
    }
    
    // Parse CSV simply
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('📱 iOS: Parsed', lines.length, 'lines with headers:', headers.length);
    
    // Parse data and set global allData variable
    const rows = lines.slice(1); // Skip header
    if (typeof window !== 'undefined') {
      window.allData = rows.map(row => {
        const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const obj = {};
        headers.forEach((header, index) => obj[header] = values[index]?.trim().replace(/"/g, '') || '');
        return obj;
      }).filter(item => item.Visible?.toLowerCase() !== 'false');
      
      console.log('📱 iOS: Global window.allData set with', window.allData.length, 'items');
      
      // Also try to set the direct allData variable if available
      if (typeof allData !== 'undefined') {
        allData = window.allData;
        console.log('📱 iOS: Direct allData variable also set');
      }
    }

    // Ensure welcome screen visible
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.style.display = 'flex';
    }
    // Render simplified mobile UI into existing mobile container
    renderIOSMobileUI(window.allData);
    
    // BARDZO WAŻNE: Sprawdź czy główna aplikacja już załadowała dane
    console.log('📱 iOS: Checking if main app has loaded data...');
    
    function waitForMainAppData() {
      // Sprawdź czy główna aplikacja już ma dane i kontenery
      const categoryContainer = document.getElementById('category-buttons-container');
      const pwaContainer = document.getElementById('pwa-category-buttons-container');
      const mainAppLoaded = window.allData && Array.isArray(window.allData) && window.allData.length > 0;
      
      if (mainAppLoaded && categoryContainer && pwaContainer) {
        console.log('📱 iOS: Main app data loaded, checking if UI is rendered...');
        
        // Sprawdź czy kontenery mają już zawartość (przyciski)
        const categoryButtonsRendered = categoryContainer.children.length > 0;
        const pwaButtonsRendered = pwaContainer.children.length > 0;
        
        if (categoryButtonsRendered && pwaButtonsRendered) {
          console.log('📱 iOS: Main app UI already rendered, no fallback needed');
          return; // Główna aplikacja już działa
        } else {
          console.log('📱 iOS: Main app data loaded but UI not rendered, using fallback rendering...');
          // Użyj danych z głównej aplikacji do renderowania prostego UI mobilnego
          renderIOSMobileUI(window.allData);
          return;
        }
      } else {
        console.log('📱 iOS: Main app not ready, checking again...', {
          mainAppLoaded,
          categoryContainer: !!categoryContainer,
          pwaContainer: !!pwaContainer
        });
        setTimeout(waitForMainAppData, 1000); // Sprawdź ponownie za sekundę
      }
    }
    
    // Start checking for main app data
    waitForMainAppData();
    
  } catch (error) {
    console.error('📱 iOS: Error loading data:', error);
    // Try local CSV fallback
    try {
      const localUrl = 'Baza Danych - Baza Danych.csv';
      console.log('📱 iOS: Trying local CSV fallback:', localUrl);
      const lr = await fetch(localUrl + '?t=' + Date.now(), { cache: 'no-store' });
      if (!lr.ok) throw new Error(`Local CSV HTTP ${lr.status}`);
      const csvText = await lr.text();
      if (csvText.length < 10) throw new Error('Local CSV too short');
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1);
      if (typeof window !== 'undefined') {
        window.allData = rows.map(row => {
          const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          const obj = {};
          headers.forEach((header, index) => obj[header] = values[index]?.trim().replace(/"/g, '') || '');
          return obj;
        }).filter(item => item.Visible?.toLowerCase() !== 'false');
      }
      renderIOSMobileUI(window.allData);
      return; // success path via local
    } catch (lf) {
      console.error('📱 iOS: Local CSV fallback failed:', lf);
    }
    
    // Show error with fallback options
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h2>⚠️ Problem z ładowaniem</h2>
          <p>Urządzenie: iOS (iPhone/iPad)</p>
          <p>Błąd: ${error.message}</p>
          
          <div style="margin: 20px 0;">
            <button onclick="tryAlternativeLoad()" style="padding: 10px 20px; margin: 10px; background: #007AFF; color: white; border: none; border-radius: 8px;">
              Spróbuj alternatywnego ładowania
            </button>
            
            <button onclick="openWebVersion()" style="padding: 10px 20px; margin: 10px; background: #34C759; color: white; border: none; border-radius: 8px;">
              Otwórz w Safari
            </button>
            
            <button onclick="installPWA()" style="padding: 10px 20px; margin: 10px; background: #FF9500; color: white; border: none; border-radius: 8px;">
              Zainstaluj jako aplikację
            </button>
          </div>
          
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            iOS może wymagać instalacji jako PWA lub otwarcia w Safari
          </p>
        </div>
      `;
      welcomeScreen.style.display = 'flex';
    }
  }
}

// Render a simple, self-contained mobile UI inside #mobile-ui-container
function renderIOSMobileUI(data) {
  try {
    const rightPanel = document.getElementById('mobile-right-panel');
    const mobileUI = document.getElementById('mobile-ui-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    if (rightPanel) {
      // Prefer the right-side split panel on mobile
      rightPanel.style.display = 'block';
      rightPanel.innerHTML = '';
    } else if (mobileUI) {
      // Fallback to overlay container
      mobileUI.innerHTML = '';
      mobileUI.style.display = 'block';
    } else {
      console.log('📱 iOS: No mobile panel available');
      return;
    }
    const loadingText = document.getElementById('mobile-loading-text');
    if (loadingText) loadingText.style.display = 'none';

  // Header title only (no extra button)
  const header = document.createElement('div');
  header.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:8px; margin:0 0 12px 0;';
  const title = document.createElement('h3');
  title.textContent = 'Wybierz krzesło:';
  title.style.cssText = 'margin:0; font-size:18px; color:#333;';
  header.appendChild(title);
  (rightPanel || mobileUI).appendChild(header);

    // Categories (include Promocje/Bestsellery like desktop)
    const catDiv = document.createElement('div');
    catDiv.style.cssText = 'margin:10px 0; display:flex; flex-wrap:wrap; gap:8px; justify-content:center;';
    (rightPanel || mobileUI).appendChild(catDiv);

    const categories = [...new Set((data||[])
      .filter(it => it.Kategoria && (it.Typ||'').toLowerCase() === 'model')
      .map(it => it.Kategoria)
    )];

    const pills = ['Wszystkie','Promocje','Bestsellery', ...categories];
    pills.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'category-button';
      btn.textContent = category;
      btn.onclick = () => {
        renderModels(category);
        Array.from(catDiv.children).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      catDiv.appendChild(btn);
    });

    // Models grid
  const modelsDiv = document.createElement('div');
    modelsDiv.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:12px; margin-top:12px;';
  (rightPanel || mobileUI).appendChild(modelsDiv);

    // Helpers for local mobile_icons fallback
    function normalizeName(name){
      try {
        return (name || '')
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^\w\s-]/g, '')
          .trim();
      } catch(_) { return (name||'').trim(); }
    }
    function candidateMobileIcons(name){
      const base = normalizeName(name);
      const variants = [base, base.replace(/\s+/g,' '), base.replace(/\s+/g,''), base.replace(/\s+/g,'-')];
      const withCase = new Set();
      variants.forEach(v=>{ withCase.add(v); withCase.add(v.toLowerCase()); withCase.add(v.toUpperCase()); });
      const exts = ['webp','png','jpg','jpeg'];
      const files = [];
      withCase.forEach(v=> exts.forEach(ext=> files.push(`mobile_icons/${v}.${ext}`)));
      return files;
    }
    function applyImgWithFallback(imgEl, model){
      const list = [];
      const primary = model.Obrazek || model.Img || model.Image;
      if (primary) list.push(primary);
      candidateMobileIcons(model.Nazwa || model.name || '').forEach(p=> list.push(p));
      list.push('icons/placeholder.svg');
      let idx = 0;
      function tryNext(){ if (idx >= list.length) return; imgEl.src = list[idx++]; }
      imgEl.onerror = () => tryNext();
      tryNext();
    }

    function renderModels(selectedCategory) {
      modelsDiv.innerHTML = '';
      let models = (data||[]).filter(it => (it.Typ||'').toLowerCase() === 'model');
      if (selectedCategory && selectedCategory !== 'Wszystkie') {
        if (selectedCategory === 'Promocje') {
          models = models.filter(m => (m.Promocja||'').toString().toLowerCase() !== 'false' && ((m.Procent||'0') !== '0'));
        } else if (selectedCategory === 'Bestsellery') {
          models = models.filter(m => ['true','tak','✔','TRUE'].includes((m.Bestseller||'').toString()));
        } else {
          models = models.filter(m => m.Kategoria === selectedCategory);
        }
      }
      models.forEach(model => {
        const card = document.createElement('button');
        card.className = 'thumbnail';
        card.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; background:#fff; border:1px solid #ddd; border-radius:10px; cursor:pointer;';
  const img = document.createElement('img');
  applyImgWithFallback(img, model);
        img.alt = model.Nazwa || '';
        img.style.cssText = 'width:72px; height:72px; object-fit:contain;';
        const label = document.createElement('div');
        label.textContent = model.Nazwa || '';
        label.style.cssText = 'font-size:13px; margin-top:6px; color:#333; text-align:center;';
        card.appendChild(img);
        card.appendChild(label);
        card.onclick = () => {
          try { localStorage.setItem('selectedChair', JSON.stringify(model)); } catch(_) {}
          window.mobileWelcomeDismissed = true;
          const hideWelcome = () => { if (welcomeScreen) welcomeScreen.style.display = 'none'; };
          const showApp = () => { const app = document.getElementById('app'); if (app) app.style.visibility = 'visible'; };
          const tryLoad = () => { if (window.viewer && typeof window.loadModel === 'function') { hideWelcome(); showApp(); window.loadModel(model); return true; } return false; };
          if (!tryLoad()) {
            let attempts = 0; const int = setInterval(()=>{ attempts++; if (tryLoad() || attempts>50) clearInterval(int); }, 100);
            setTimeout(()=>{ hideWelcome(); showApp(); }, 300);
          }
        };
        modelsDiv.appendChild(card);
      });
    }

    // Initial render
    renderModels();

    // Make sure app is visible and scroll to mobile UI
    const app = document.getElementById('app');
    if (app) app.style.visibility = 'visible';
    setTimeout(() => {
      const target = rightPanel || mobileUI;
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 200);

    console.log('📱 iOS: Simplified mobile UI rendered');
  } catch (e) {
    console.error('📱 iOS: Error rendering simplified UI:', e);
  }
}

// Alternative loading method
window.tryAlternativeLoad = function() {
  console.log('📱 iOS: Trying alternative load method...');
  window.location.href = window.location.href.split('?')[0] + '?ios=1&t=' + Date.now();
};

// Open in Safari
window.openWebVersion = function() {
  console.log('📱 iOS: Opening in Safari...');
  const url = window.location.href.split('?')[0];
  window.open(url, '_blank');
};

// Install PWA
window.installPWA = function() {
  console.log('📱 iOS: PWA install instructions...');
  alert('Aby zainstalować jako aplikację:\n\n1. Otwórz w Safari\n2. Naciśnij przycisk "Udostępnij" (kwadrat ze strzałką)\n3. Wybierz "Dodaj do ekranu początkowego"\n4. Potwierdź instalację');
};

// Show install instructions popup
window.showInstallInstructions = function() {
  console.log('📱 iOS: Showing install instructions...');
  
  // Try to trigger native install prompt first
  if (window.deferredInstallPrompt) {
    window.deferredInstallPrompt.prompt();
    window.deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('📱 User accepted the install prompt');
      } else {
        console.log('📱 User dismissed the install prompt');
        // Show manual instructions
        showManualInstallInstructions();
      }
      window.deferredInstallPrompt = null;
    });
  } else {
    // Show manual instructions
    showManualInstallInstructions();
  }
};

function showManualInstallInstructions() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 350px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="margin: 0 0 16px 0; color: #333;">📱 Instalacja aplikacji</h3>
      
      <div style="text-align: left; margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 8px 0; font-size: 14px;"><strong>1.</strong> Otwórz w Safari</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>2.</strong> Naciśnij przycisk "Udostępnij" ⬆️</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>3.</strong> Wybierz "Dodaj do ekranu początkowego"</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>4.</strong> Potwierdź instalację</p>
      </div>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #007AFF;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 8px;
      ">
        Rozumiem
      </button>
      
      <button onclick="tryAutoInstall()" style="
        background: #F5C842;
        color: #333;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 8px;
      ">
        Spróbuj automatycznie
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Continue to app function
window.continueToApp = function() {
  console.log('📱 iOS: Continuing to app...');
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
  
  // Show the main app
  const app = document.getElementById('app');
  if (app) {
    app.style.visibility = 'visible';
  }
  
  // Show sidebar and categories
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = 'flex';
    console.log('📱 iOS: Sidebar shown');
  }
  
  // Hide loader if still visible
  const loader = document.getElementById('custom-loader');
  if (loader) {
    loader.style.display = 'none';
  }
};

// Try auto install
window.tryAutoInstall = function() {
  console.log('📱 iOS: Attempting auto install...');
  
  // Close modal first
  const modal = document.querySelector('div[style*="position: fixed"]');
  if (modal) {
    modal.remove();
  }
  
  // Try various install methods
  if (window.BeforeInstallPromptEvent) {
    console.log('📱 iOS: Triggering BeforeInstallPromptEvent...');
    window.dispatchEvent(new Event('beforeinstallprompt'));
  }
  
  // Fallback: redirect to add to homescreen
  setTimeout(() => {
    alert('Dotknij przycisku Udostępnij (⬆️) w dolnej części Safari, a następnie "Dodaj do ekranu początkowego"');
  }, 500);
};

// iOS fallback functions for rendering UI when main app fails
function iosRenderCategoryButtons(data) {
  console.log('📱 iOS: Rendering category buttons fallback...');
  
  const container = document.getElementById('category-buttons-container');
  if (!container || !data) {
    console.log('📱 iOS: Category container or data not available');
    return;
  }
  
  // Find unique categories
  const categories = [...new Set(data
    .filter(item => item.Kategoria && item.Typ === 'model')
    .map(item => item.Kategoria)
  )];
  
  console.log('📱 iOS: Found categories:', categories);
  
  container.innerHTML = '';
  
  // Add "Wszystkie" button
  const allButton = document.createElement('button');
  allButton.className = 'category-btn active';
  allButton.textContent = 'Wszystkie';
  allButton.onclick = () => filterByCategory('all');
  container.appendChild(allButton);
  
  // Add category buttons
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-btn';
    button.textContent = category;
    button.onclick = () => filterByCategory(category);
    container.appendChild(button);
  });
  
  console.log('📱 iOS: Category buttons rendered');
}

function iosRenderPWACategoryButtons(data) {
  console.log('📱 iOS: Rendering PWA category buttons fallback...');
  
  const container = document.getElementById('pwa-category-buttons-container');
  if (!container || !data) {
    console.log('📱 iOS: PWA container or data not available');
    return;
  }
  
  // Find unique categories
  const categories = [...new Set(data
    .filter(item => item.Kategoria && item.Typ === 'model')
    .map(item => item.Kategoria)
  )];
  
  console.log('📱 iOS: Found PWA categories:', categories);
  
  container.innerHTML = '';
  
  // Add category buttons for PWA screen
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.className = 'pwa-category-btn';
    button.innerHTML = `
      <div class="category-icon">📦</div>
      <div class="category-text">${category}</div>
    `;
    button.onclick = () => {
      // Hide PWA success screen
      const pwaScreen = document.getElementById('pwa-success-screen');
      if (pwaScreen) {
        pwaScreen.style.display = 'none';
      }
      
      // Show main app and filter by category
      filterByCategory(category);
    };
    container.appendChild(button);
  });
  
  console.log('📱 iOS: PWA category buttons rendered');
}

// Simple filter function for iOS fallback
function filterByCategory(category) {
  console.log('📱 iOS: Filtering by category:', category);
  
  // This is a simplified version - you might need to adjust based on your main app's logic
  if (window.showScreen) {
    window.showScreen('models');
  }
  
  // Hide welcome and PWA screens
  const welcomeScreen = document.getElementById('welcome-screen');
  const pwaScreen = document.getElementById('pwa-success-screen');
  
  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (pwaScreen) pwaScreen.style.display = 'none';
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIOSFallback);
} else {
  initIOSFallback();
}

// Also try on window load
window.addEventListener('load', initIOSFallback);
