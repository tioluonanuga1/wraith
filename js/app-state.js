(function () {
  const pf = (window.Wraith = window.Wraith || {});
  const state = (pf.state = pf.state || {
    gender: 'male',
    mode: 'game',
    selectedBody: '',
    selectedPose: '',
  });

  function g(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function chips(selector) {
    return Array.from(document.querySelectorAll(selector))
      .filter((chip) => chip.classList.contains('on'))
      .map((chip) => chip.dataset.val)
      .filter(Boolean);
  }

  function sl(id) {
    return parseInt(document.getElementById(id)?.value || '5', 10);
  }

  function setOut(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.remove('ph');
  }

  function gv(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function getChipVals(selector) {
    return Array.from(document.querySelectorAll(selector))
      .filter((chip) => chip.classList.contains('on'))
      .map((chip) => chip.dataset.val)
      .filter(Boolean);
  }

  function escHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );
  }

  function setGender(gender) {
    state.gender = gender;
    document.querySelectorAll('.gender-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelector(`.gender-btn.${gender}`)?.classList.add('active');
    document.getElementById('bodies-male').style.display = gender === 'male' ? 'grid' : 'none';
    document.getElementById('bodies-female').style.display = gender === 'female' ? 'grid' : 'none';
    document.getElementById('bodies-nonbinary').style.display = gender === 'nonbinary' ? 'grid' : 'none';
    state.selectedBody = '';
    document.querySelectorAll('.body-card.on').forEach((card) => card.classList.remove('on'));
  }

  function setMode(mode) {
    state.mode = mode;
    document.getElementById('modeGame')?.classList.toggle('active', mode === 'game');
    document.getElementById('modePhoto')?.classList.toggle('active', mode === 'photo');
  }

  function pickBody(el) {
    document.querySelectorAll('.body-card').forEach((card) => card.classList.remove('on'));
    el.classList.add('on');
    state.selectedBody = el.dataset.val || '';
  }

  function switchPoseTab(tab) {
    document.querySelectorAll('.pose-tab').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.pose-group').forEach((el) => el.classList.remove('show'));
    window.event?.target?.classList?.add('active');
    document.getElementById(`pose-${tab}`)?.classList.add('show');
    state.selectedPose = '';
    document.querySelectorAll('.pose-group .chip.on').forEach((chip) => chip.classList.remove('on'));
  }

  function pickPose(el) {
    document.querySelectorAll('.pose-group .chip').forEach((chip) => chip.classList.remove('on'));
    el.classList.add('on');
    state.selectedPose = el.dataset.val || '';
  }

  function sv(id, outId) {
    const output = document.getElementById(outId);
    const input = document.getElementById(id);
    if (output && input) output.textContent = input.value;
  }

  function switchOut(panel) {
    document.querySelectorAll('.otab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.opanel').forEach((tabPanel) => tabPanel.classList.remove('show'));
    document.querySelector(`.otab[data-p="${panel}"]`)?.classList.add('active');
    document.getElementById(`op-${panel}`)?.classList.add('show');
  }

  function initInteractiveChips() {
    document.querySelectorAll('.chips .chip:not(.pose-group .chip)').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('on'));
    });

    document.querySelectorAll('.chip[data-sc]').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('on'));
    });
  }

  pf.helpers = { g, chips, sl, setOut, gv, getChipVals, escHtml };
  pf.initInteractiveChips = initInteractiveChips;

  window.setGender = setGender;
  window.setMode = setMode;
  window.pickBody = pickBody;
  window.switchPoseTab = switchPoseTab;
  window.pickPose = pickPose;
  window.sv = sv;
  window.switchOut = switchOut;
})();
