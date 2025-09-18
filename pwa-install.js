// PWA Install Handler
let deferredPrompt;

// Check if app is already installed
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Show install prompt for supported browsers
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  showWelcomeInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', (e) => {
  console.log('PWA: App installed successfully');
  hideWelcomeInstallButton();
  // Przełącz treść na komunikat sukcesu
  switchToInstalledContent();
});

// Function to switch to PWA success screen
function switchToInstalledContent() {
  console.log('PWA: switchToInstalledContent called');
  
  // Sprawdź orientację - PWA success screen tylko w poziomiej orientacji
  const isLandscape = window.innerWidth > window.innerHeight;
  if (!isLandscape) {
    console.log('PWA: Portrait orientation detected, not showing PWA success screen');
    // W orientacji pionowej nie pokazuj PWA success screen
    return;
  }
  
  // Ukryj welcome screen
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
    console.log('PWA: Welcome screen hidden');
  }
  
  // Legacy PWA success screen removed; directly continue to app
  console.log('PWA: Success screen disabled — continuing to app UI');
  if (typeof window.showScreen === 'function') {
    window.showScreen('models');
  }
  const app = document.getElementById('app');
  if (app) app.style.display = 'block';
}

// Show install button in welcome screen
function showWelcomeInstallButton() {
  console.log('PWA: Showing install button');
  
  const container = document.getElementById('pwa-install-container');
  const button = document.getElementById('welcome-install-btn');
  
  // Sprawdź czy to mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  const appInstalled = isAppInstalled();
  console.log('PWA: Install button check - isMobile:', isMobile, 'isAppInstalled:', appInstalled);
  
  if (container && button && !appInstalled && isMobile) {
    container.style.display = 'block';
    button.addEventListener('click', installPWA);
    console.log('PWA: Install button displayed');
    
    // Animate button
    setTimeout(() => {
      button.style.animation = 'pulse 2s infinite';
    }, 1000);
  } else {
    console.log('PWA: Install button NOT displayed - container:', !!container, 'button:', !!button, 'conditions met:', !appInstalled && isMobile);
  }
}

// Hide install button in welcome screen
function hideWelcomeInstallButton() {
  const container = document.getElementById('pwa-install-container');
  if (container) {
    container.style.display = 'none';
  }
}

// Install PWA
async function installPWA() {
  if (!deferredPrompt) {
    // Manual instructions for iOS
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      showIOSInstallInstructions();
      return;
    }
    
    // For other browsers without prompt
    showManualInstallInstructions();
    return;
  }
  
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA: User accepted install');
    } else {
      console.log('PWA: User declined install');
    }
    
    deferredPrompt = null;
    hideWelcomeInstallButton();
  } catch (error) {
    console.error('PWA: Install error:', error);
  }
}

// iOS install instructions
function showIOSInstallInstructions() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 350px;
      text-align: center;
      position: relative;
    ">
      <button onclick="this.parentElement.parentElement.remove()" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      ">×</button>
      
      <h2 style="margin-bottom: 20px; color: #F5C842;">📱 Instalacja na iOS</h2>
      
      <div style="text-align: left; line-height: 1.6;">
        <p><strong>1.</strong> Naciśnij przycisk "Udostępnij" <span style="font-size: 20px;">⬆️</span></p>
        <p><strong>2.</strong> Przewiń w dół</p>
        <p><strong>3.</strong> Wybierz "Dodaj do ekranu początkowego"</p>
        <p><strong>4.</strong> Potwierdź nazwę i naciśnij "Dodaj"</p>
      </div>
      
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Aplikacja pojawi się na ekranie głównym jako ikona!
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Manual install instructions
function showManualInstallInstructions() {
  alert('Aby zainstalować aplikację:\n\n• Chrome: Menu → Zainstaluj aplikację\n• Edge: Menu → Aplikacje → Zainstaluj tę witrynę jako aplikację\n• Firefox: Menu → Zainstaluj\n\nLub dodaj stronę do zakładek dla szybkiego dostępu.');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Sprawdź czy to mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check if app is already installed and switch content accordingly
  if (isAppInstalled() && isMobile) {
    switchToInstalledContent();
    
    // Sprawdź czy to pierwsze uruchomienie po instalacji
    if (!localStorage.getItem('pwa-first-run-shown')) {
      setTimeout(() => {
        showFirstRunThanks();
        localStorage.setItem('pwa-first-run-shown', 'true');
      }, 1000); // Opóźnienie żeby PWA success screen się załadował
    }
  }
  
  // Obsługa zmiany orientacji dla PWA
  function handleOrientationChange() {
    if (isAppInstalled() && isMobile) {
      const isLandscape = window.innerWidth > window.innerHeight;
      const pwaBScreen = document.getElementById('pwa-success-screen');
      
      if (isLandscape) {
        // W orientacji poziomej pokaż PWA success screen
        if (pwaBScreen && pwaBScreen.style.display === 'none') {
          switchToInstalledContent();
        }
      } else {
        // W orientacji pionowej ukryj PWA success screen
        if (pwaBScreen && pwaBScreen.style.display !== 'none') {
          pwaBScreen.style.display = 'none';
          console.log('PWA: Success screen hidden due to portrait orientation');
        }
      }
    }
  }
  
  // Dodaj listenery orientacji
  window.addEventListener('orientationchange', () => {
    setTimeout(handleOrientationChange, 100);
  });
  window.addEventListener('resize', handleOrientationChange);
  
  // Show install button after 3 seconds if not installed and on mobile
  // TYMCZASOWO WYŁĄCZONE - nie uruchamiaj timera instalacji
  // setTimeout(() => {
  //   if (!isAppInstalled() && isMobile) {
  //     // For browsers that don't fire beforeinstallprompt (like iOS Safari)
  //     if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  //       showWelcomeInstallButton();
  //     }
  //   }
  // }, 3000);
  
  // Hide button if already installed or on desktop
  if (isAppInstalled() || !isMobile) {
    console.log('PWA: App is already installed or on desktop');
    hideWelcomeInstallButton();
  }
  
  // Dodaj obsługę przycisku "Kontynuuj" na welcome screen
  const welcomeContinueBtn = document.getElementById('welcome-continue-btn');
  if (welcomeContinueBtn) {
    welcomeContinueBtn.addEventListener('click', () => {
      // Ukryj welcome screen
      const welcomeScreen = document.getElementById('welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
      }
      
      console.log('PWA: User continued from welcome screen without installing');
    });
  }
  
  // Dodaj obsługę przycisku "Przejdź do konfiguratora" w PWA success screen
  const pwaContinueBtn = document.getElementById('pwa-success-continue-btn');
  if (pwaContinueBtn) {
    pwaContinueBtn.addEventListener('click', () => {
      // Ukryj PWA success screen overlay
      const pwaBScreen = document.getElementById('pwa-success-screen');
      if (pwaBScreen) {
        pwaBScreen.classList.remove('show');
        pwaBScreen.style.display = 'none';
      }
      
      // Główna aplikacja już jest widoczna w tle, tylko ukryj overlay
      // Nie ma potrzeby pokazywania niczego dodatkowo
      
      console.log('PWA: User continued from success screen to main app');
    });
  }
});

// Export functions for global use
window.installPWA = installPWA;
window.showWelcomeInstallButton = showWelcomeInstallButton;
window.hideWelcomeInstallButton = hideWelcomeInstallButton;
window.switchToInstalledContent = switchToInstalledContent;
window.isAppInstalled = isAppInstalled;

// Check installation state on page load
document.addEventListener('DOMContentLoaded', () => {
  // Delay check to ensure DOM is fully loaded
  setTimeout(() => {
    if (isAppInstalled()) {
      console.log('PWA: App is installed, switching to installed content');
      switchToInstalledContent();
    }
  }, 200);
});

// Also check when the page becomes visible (in case of navigation)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAppInstalled()) {
    switchToInstalledContent();
  }
});

// Show first run thanks popup
function showFirstRunThanks() {
  console.log('PWA: Showing first run thanks popup');
  
  // Sprawdź orientację - komunikat tylko w poziomiej orientacji
  const isLandscape = window.innerWidth > window.innerHeight;
  if (!isLandscape) {
    console.log('PWA: Portrait orientation detected, not showing thanks popup');
    return;
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
      position: relative;
      animation: slideUp 0.4s ease;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <div style="
        background: linear-gradient(135deg, #F5C842, #E5B432);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
      ">
        🎉
      </div>
      
      <h2 style="margin-bottom: 15px; color: #333; font-size: 24px; font-weight: 700;">
        Dziękujemy za zainstalowanie aplikacji!
      </h2>
      
      <p style="margin-bottom: 25px; color: #666; font-size: 16px; line-height: 1.5;">
        Aplikacja <strong>Fajne Krzesła</strong> została pomyślnie zainstalowana na Twoim urządzeniu. 
        Teraz możesz korzystać z konfiguratora w trybie offline!
      </p>
      
      <div style="
        background: rgba(245, 200, 66, 0.1);
        border-radius: 12px;
        padding: 15px;
        margin: 20px 0;
        border-left: 4px solid #F5C842;
      ">
        <p style="margin: 0; font-size: 14px; color: #333;">
          💡 <strong>Wskazówka:</strong> Znajdziesz aplikację na ekranie głównym jako "Fajne Krzesła App"
        </p>
      </div>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: linear-gradient(135deg, #F5C842, #E5B432);
        color: #333;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(245, 200, 66, 0.4);
        transition: all 0.3s ease;
        margin-top: 10px;
      ">
        Rozpocznij konfigurację!
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto close after 8 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    }
  }, 8000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);
