(function () {
  let deferredInstallPrompt = null;

  function showUpdateToast() {
    const toast = document.getElementById('update-toast');
    if (toast) toast.style.display = 'block';
  }

  function triggerInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      console.log('[WRAITH] Install choice:', choice.outcome);
      deferredInstallPrompt = null;
      document.getElementById('install-banner').style.display = 'none';
    });
  }

  function dismissInstall() {
    document.getElementById('install-banner').style.display = 'none';
    localStorage.setItem('wraith-install-dismissed', '1');
  }

  function updateOnlineStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    banner.style.display = navigator.onLine ? 'none' : 'block';
  }

  function initPwa() {
    const isHttpLike = window.location.protocol === 'http:' || window.location.protocol === 'https:';

    if (!isHttpLike) {
      console.info('[WRAITH] PWA features are disabled during file:// preview. Use a local server to test install and offline support.');
      updateOnlineStatus();
      return;
    }
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
          console.log('[WRAITH] Service worker registered:', reg.scope);

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
                console.log('[WRAITH] Update available');
              }
            });
          });

          if (reg.waiting) showUpdateToast();
        } catch (err) {
          console.warn('[WRAITH] Service worker registration failed:', err);
        }
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (!localStorage.getItem('wraith-install-dismissed')) {
        document.getElementById('install-banner').style.display = 'flex';
        console.log('[WRAITH] Install prompt captured');
      }
    });

    window.addEventListener('appinstalled', () => {
      document.getElementById('install-banner').style.display = 'none';
      deferredInstallPrompt = null;
      console.log('[WRAITH] WRAITH bound to device');
    });

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    if (
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      document.documentElement.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 16px)');
      document.body.style.paddingBottom = 'calc(env(safe-area-inset-bottom, 0px) + 8px)';
      console.log('[WRAITH] Running in standalone / installed mode');
    }
  }

  window.triggerInstall = triggerInstall;
  window.dismissInstall = dismissInstall;

  window.Wraith = window.Wraith || {};
  window.Wraith.initPwa = initPwa;
})();