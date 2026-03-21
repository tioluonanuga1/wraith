(function () {
  const pf = (window.PersonaForge = window.PersonaForge || {});
  const { gv, getChipVals, escHtml } = pf.helpers;

  const LIB_KEY = 'wraith-character-vault';
  const LEGACY_BACKUP_KEY = 'wraith-vault-backup';
  const DB_NAME = 'wraith-db';
  const DB_VERSION = 1;
  const STORE_NAME = 'summonings';

  let currentSummoningId = null;
  let dbPromise = null;
  let storageMode = 'idb';

  function collectState() {
    const { state } = pf;
    return {
      gender: state.gender,
      mode: state.mode,
      age: gv('age'),
      ethnicity: gv('ethnicity'),
      height: gv('height'),
      bodyExtra: gv('body-extra'),
      selectedBody: state.selectedBody,
      bone: gv('bone'),
      eyes: gv('eyes'),
      lips: gv('lips'),
      skinTone: gv('skin-tone'),
      skinChips: getChipVals('.chips .chip:not(.pose-group .chip):not(.body-card)'),
      hairStyle: gv('hair-style'),
      hairColor: gv('hair-color'),
      hairChips: getChipVals('.chips .chip:not(.pose-group .chip):not(.body-card)'),
      selectedPose: state.selectedPose,
      poseExtra: gv('pose-extra'),
      wardrobe: gv('wardrobe'),
      wardrobeDetail: gv('wardrobe-detail'),
      setting: gv('setting'),
      lighting: gv('lighting'),
      shot: gv('shot'),
      expression: gv('expression'),
      sReal: document.getElementById('s-real')?.value || '9',
      sSkin: document.getElementById('s-skin')?.value || '8',
      sDrama: document.getElementById('s-drama')?.value || '7',
      extra: gv('extra'),
      activeChips: getChipVals('.chip.on'),
      scSetting: gv('sc-setting'),
      scTime: gv('sc-time'),
      scLight: gv('sc-light'),
      scTone: gv('sc-tone'),
      scProps: gv('sc-props'),
      scCamera: gv('sc-camera'),
      scDof: gv('sc-dof'),
      scGrade: gv('sc-grade'),
      scPurpose: gv('sc-purpose'),
      scAtmoChips: Array.from(document.querySelectorAll('.chip[data-sc].on'))
        .map((chip) => chip.dataset.val)
        .filter(Boolean),
      prompts: {
        nbPos: document.getElementById('nb-pos')?.textContent || '',
        nbNeg: document.getElementById('nb-neg')?.textContent || '',
        geminiPos: document.getElementById('gemini-pos')?.textContent || '',
        grokPos: document.getElementById('grok-pos')?.textContent || '',
        gptPos: document.getElementById('gpt-pos')?.textContent || '',
        pxPos: document.getElementById('px-pos')?.textContent || '',
        scenePos: document.getElementById('scene-pos')?.textContent || '',
        sceneNeg: document.getElementById('scene-neg')?.textContent || '',
      },
    };
  }

  function applyState(state) {
    if (state.gender) window.setGender(state.gender);
    if (state.mode) window.setMode(state.mode);

    const fieldMap = {
      age: 'age',
      ethnicity: 'ethnicity',
      height: 'height',
      bodyExtra: 'body-extra',
      bone: 'bone',
      eyes: 'eyes',
      lips: 'lips',
      skinTone: 'skin-tone',
      hairStyle: 'hair-style',
      hairColor: 'hair-color',
      poseExtra: 'pose-extra',
      wardrobe: 'wardrobe',
      wardrobeDetail: 'wardrobe-detail',
      setting: 'setting',
      lighting: 'lighting',
      shot: 'shot',
      expression: 'expression',
      extra: 'extra',
    };

    Object.entries(fieldMap).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el && state[key] !== undefined) el.value = state[key];
    });

    if (state.sReal) {
      const el = document.getElementById('s-real');
      if (el) {
        el.value = state.sReal;
        document.getElementById('sv-real').textContent = state.sReal;
      }
    }
    if (state.sSkin) {
      const el = document.getElementById('s-skin');
      if (el) {
        el.value = state.sSkin;
        document.getElementById('sv-skin').textContent = state.sSkin;
      }
    }
    if (state.sDrama) {
      const el = document.getElementById('s-drama');
      if (el) {
        el.value = state.sDrama;
        document.getElementById('sv-drama').textContent = state.sDrama;
      }
    }

    if (state.selectedBody) {
      document.querySelectorAll('.body-card').forEach((card) => {
        card.classList.toggle('on', card.dataset.val === state.selectedBody);
      });
      pf.state.selectedBody = state.selectedBody;
    }

    if (state.selectedPose) {
      document.querySelectorAll('.pose-group .chip').forEach((chip) => {
        if (chip.dataset.val === state.selectedPose) {
          chip.classList.add('on');
          const group = chip.closest('.pose-group');
          if (group) {
            const tabId = group.id.replace('pose-', '');
            document.querySelectorAll('.pose-tab').forEach((tab) => tab.classList.remove('active'));
            document.querySelectorAll('.pose-group').forEach((item) => item.classList.remove('show'));
            const tabEl = Array.from(document.querySelectorAll('.pose-tab')).find((tab) =>
              tab.getAttribute('onclick')?.includes(tabId)
            );
            if (tabEl) tabEl.classList.add('active');
            group.classList.add('show');
          }
        } else {
          chip.classList.remove('on');
        }
      });
      pf.state.selectedPose = state.selectedPose;
    }

    if (state.activeChips?.length) {
      document
        .querySelectorAll('.chip:not(.pose-group .chip):not(.body-card):not(.gender-btn):not(.mode-btn)')
        .forEach((chip) => {
          chip.classList.toggle('on', state.activeChips.includes(chip.dataset.val));
        });
    }

    const scFields = {
      scSetting: 'sc-setting',
      scTime: 'sc-time',
      scLight: 'sc-light',
      scTone: 'sc-tone',
      scProps: 'sc-props',
      scCamera: 'sc-camera',
      scDof: 'sc-dof',
      scGrade: 'sc-grade',
      scPurpose: 'sc-purpose',
    };

    Object.entries(scFields).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el && state[key] !== undefined) el.value = state[key];
    });

    if (state.scAtmoChips?.length) {
      document.querySelectorAll('.chip[data-sc]').forEach((chip) => {
        chip.classList.toggle('on', state.scAtmoChips.includes(chip.dataset.val));
      });
    }

    const promptMap = {
      nbPos: 'nb-pos',
      nbNeg: 'nb-neg',
      geminiPos: 'gemini-pos',
      grokPos: 'grok-pos',
      gptPos: 'gpt-pos',
      pxPos: 'px-pos',
      scenePos: 'scene-pos',
      sceneNeg: 'scene-neg',
    };

    if (state.prompts) {
      Object.entries(promptMap).forEach(([key, id]) => {
        const val = state.prompts[key];
        if (!val) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = val;
        el.classList.remove('ph');
      });
    }
  }

  function openDb() {
    if (!('indexedDB' in window)) {
      storageMode = 'localStorage';
      return Promise.reject(new Error('IndexedDB unavailable'));
    }
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        storageMode = 'localStorage';
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return dbPromise;
  }

  async function withStore(mode, handler) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = handler(store);

      let result;
      if (request) {
        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
      }

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });
  }

  function loadLegacyVault() {
    try {
      return JSON.parse(localStorage.getItem(LIB_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveLegacyVault(summonings) {
    localStorage.setItem(LIB_KEY, JSON.stringify(summonings));
  }

  async function loadVault() {
    if (storageMode === 'localStorage') return loadLegacyVault();
    try {
      const summonings = (await withStore('readonly', (store) => store.getAll())) || [];
      return summonings.sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());
    } catch (error) {
      console.warn('[WRAITH] IndexedDB read failed, falling back to localStorage.', error);
      storageMode = 'localStorage';
      return loadLegacyVault();
    }
  }

  async function saveVault(summonings) {
    if (storageMode === 'localStorage') {
      saveLegacyVault(summonings);
      updateLibCount(summonings.length);
      return;
    }

    try {
      await withStore('readwrite', (store) => {
        store.clear();
        summonings.forEach((summoning) => store.put(summoning));
        return null;
      });
      updateLibCount(summonings.length);
    } catch (error) {
      console.warn('[WRAITH] IndexedDB write failed, falling back to localStorage.', error);
      storageMode = 'localStorage';
      saveLegacyVault(summonings);
      updateLibCount(summonings.length);
    }
  }

  async function migrateLegacyVaultIfNeeded() {
    if (storageMode === 'localStorage') return;

    const legacy = loadLegacyVault();
    if (!legacy.length) return;

    const existing = await withStore('readonly', (store) => store.count());
    if (existing > 0) return;

    await withStore('readwrite', (store) => {
      legacy.forEach((summoning) => store.put(summoning));
      return null;
    });

    localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(legacy));
    localStorage.removeItem(LIB_KEY);
  }

  function updateLibCount(n) {
    const el = document.getElementById('lib-count');
    if (el) el.textContent = n;
  }

  function showFlash() {
    const el = document.getElementById('save-flash');
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }

  async function saveSummoning() {
    const nameInput = document.getElementById('summoning-name');
    const name = nameInput?.value?.trim();
    if (!name) {
      nameInput?.focus();
      nameInput?.setAttribute('placeholder', 'Enter a name to bind this summoning!');
      setTimeout(() => nameInput?.setAttribute('placeholder', 'Name this character...'), 2000);
      return;
    }

    const summonings = await loadVault();
    const state = collectState();

    const summoning = {
      id: `${Date.now()}`,
      name,
      gender: state.gender || 'unknown',
      mode: state.mode || 'game',
      age: state.age || '',
      body: state.selectedBody ? state.selectedBody.split(',')[0] : '',
      savedAt: new Date().toISOString(),
      state,
    };

    summonings.unshift(summoning);
    await saveVault(summonings);
    nameInput.value = '';
    currentSummoningId = summoning.id;
    await renderVault();
    showFlash();
  }

  async function deleteSummoning(id, event) {
    event.stopPropagation();
    const summonings = (await loadVault()).filter((summoning) => summoning.id !== id);
    await saveVault(summonings);
    if (currentSummoningId === id) currentSummoningId = null;
    await renderVault();
  }

  async function loadSummoning(id) {
    const summoning = (await loadVault()).find((item) => item.id === id);
    if (!summoning) return;
    applyState(summoning.state);
    currentSummoningId = id;
    await renderVault();
    closeVault();

    const btn = document.querySelector('.gen-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '⬡ RECALLED';
    btn.style.background = 'linear-gradient(135deg, #34d399, #059669)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1800);
  }

  async function duplicateSummoning(id, event) {
    event.stopPropagation();
    const summonings = await loadVault();
    const original = summonings.find((summoning) => summoning.id === id);
    if (!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = `${Date.now()}`;
    copy.name = `${original.name} (copy)`;
    copy.savedAt = new Date().toISOString();
    summonings.unshift(copy);
    await saveVault(summonings);
    await renderVault();
  }

  async function exportSummoning(id, event) {
    event.stopPropagation();
    const summoning = (await loadVault()).find((item) => item.id === id);
    if (!summoning) return;
    const blob = new Blob([JSON.stringify(summoning, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${summoning.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_wraith.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function exportAllSummonings() {
    const summonings = await loadVault();
    if (!summonings.length) return;
    const blob = new Blob([JSON.stringify(summonings, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wraith_vault_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importSummonings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const toImport = Array.isArray(data) ? data : [data];
          const existing = await loadVault();
          const seen = new Set(existing.map((summoning) => summoning.id));
          const merged = [...toImport.filter((summoning) => !seen.has(summoning.id)), ...existing];
          await saveVault(merged);
          await renderVault();
          showFlash();
        } catch {
          alert('Invalid summoning file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function clearVault() {
    if (!confirm('Delete all saved characters? This cannot be undone.')) return;
    await saveVault([]);
    currentSummoningId = null;
    await renderVault();
  }

  function relTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  async function renderVault() {
    const list = document.getElementById('lib-list');
    const empty = document.getElementById('lib-empty');
    const counter = document.getElementById('lib-footer-count');
    const searchVal = (document.getElementById('lib-search')?.value || '').toLowerCase();

    const summonings = await loadVault();
    const filtered = summonings.filter(
      (summoning) =>
        !searchVal ||
        summoning.name.toLowerCase().includes(searchVal) ||
        (summoning.age || '').toLowerCase().includes(searchVal) ||
        (summoning.body || '').toLowerCase().includes(searchVal)
    );

    updateLibCount(summonings.length);
    if (counter) counter.textContent = `${summonings.length} BOUND${summonings.length !== 1 ? 'S' : ''}`;

    Array.from(list.querySelectorAll('.lib-card')).forEach((card) => card.remove());

    if (!filtered.length) {
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    filtered.forEach((summoning) => {
      const card = document.createElement('div');
      card.className = `lib-card${summoning.id === currentSummoningId ? ' active-summoning' : ''}`;
      card.onclick = () => loadSummoning(summoning.id);

      const gClass =
        summoning.gender === 'male' ? 'gender-m' : summoning.gender === 'female' ? 'gender-f' : 'gender-nb';
      const mClass = summoning.mode === 'game' ? 'mode-game' : 'mode-photo';
      const gLabel = summoning.gender === 'male' ? 'MALE' : summoning.gender === 'female' ? 'FEMALE' : 'NB';
      const mLabel = summoning.mode === 'game' ? 'GAME' : 'PHOTO';

      card.innerHTML = `
      <div class="lib-card-top">
        <div class="lib-card-name">${escHtml(summoning.name)}</div>
        <div class="lib-card-actions">
          <button class="lib-card-btn" onclick="duplicateSummoning('${summoning.id}',event)" title="Duplicate">DUP</button>
          <button class="lib-card-btn" onclick="exportSummoning('${summoning.id}',event)" title="Export JSON">EXP</button>
          <button class="lib-card-btn del" onclick="deleteSummoning('${summoning.id}',event)" title="Delete">X</button>
        </div>
      </div>
      <div class="lib-card-meta">
        <span class="lib-tag ${gClass}">${gLabel}</span>
        <span class="lib-tag ${mClass}">${mLabel}</span>
        ${summoning.age ? `<span class="lib-tag">${escHtml(summoning.age)}</span>` : ''}
      </div>
      <div class="lib-card-time">${relTime(summoning.savedAt)}</div>
    `;

      list.appendChild(card);
    });
  }

  function openVault() {
    document.getElementById('lib-drawer')?.classList.add('open');
    document.getElementById('lib-overlay')?.classList.add('open');
    renderVault();
    setTimeout(() => document.getElementById('summoning-name')?.focus(), 350);
  }

  function closeVault() {
    document.getElementById('lib-drawer')?.classList.remove('open');
    document.getElementById('lib-overlay')?.classList.remove('open');
  }

  function updateLibFooterButtons() {
    const footer = document.querySelector('.lib-footer');
    if (!footer || document.getElementById('lib-export-all-btn')) return;

    const exportBtn = document.createElement('button');
    exportBtn.className = 'lib-clear-btn';
    exportBtn.id = 'lib-export-all-btn';
    exportBtn.textContent = 'EXPORT ALL';
    exportBtn.style.marginRight = '4px';
    exportBtn.onclick = exportAllSummonings;
    footer.insertBefore(exportBtn, footer.querySelector('.lib-clear-btn'));

    const importBtn = document.createElement('button');
    importBtn.className = 'lib-clear-btn';
    importBtn.id = 'lib-import-btn';
    importBtn.textContent = 'IMPORT';
    importBtn.style.marginRight = '4px';
    importBtn.onclick = importSummonings;
    footer.insertBefore(importBtn, footer.querySelector('#lib-export-all-btn'));
  }

  async function initVault() {
    try {
      await openDb();
      await migrateLegacyVaultIfNeeded();
    } catch (error) {
      console.warn('[WRAITH] IndexedDB unavailable, using localStorage fallback.', error);
      storageMode = 'localStorage';
    }

    const summonings = await loadVault();
    updateLibCount(summonings.length);
    updateLibFooterButtons();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeVault();
    });
  }

  window.saveSummoning = saveSummoning;
  window.clearVault = clearVault;
  window.deleteSummoning = deleteSummoning;
  window.loadSummoning = loadSummoning;
  window.duplicateSummoning = duplicateSummoning;
  window.exportSummoning = exportSummoning;
  window.exportAllSummonings = exportAllSummonings;
  window.importSummonings = importSummonings;
  window.openVault = openVault;
  window.closeVault = closeVault;
  window.renderVault = renderVault;

  pf.vault = { initVault, loadVault };
})();
