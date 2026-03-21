(function () {
  const pf = (window.PersonaForge = window.PersonaForge || {});

  function appendExtra(val) {
    const el = document.getElementById('extra');
    if (!el) return;
    const cur = el.value.trim();
    el.value = cur ? `${cur}, ${val}` : val;
    el.focus();
  }

  function collectScene() {
    const setting = document.getElementById('sc-setting')?.value || '';
    const time = document.getElementById('sc-time')?.value || '';
    const light = document.getElementById('sc-light')?.value || '';
    const tone = document.getElementById('sc-tone')?.value || '';
    const props = document.getElementById('sc-props')?.value || '';
    const camera = document.getElementById('sc-camera')?.value || '';
    const dof = document.getElementById('sc-dof')?.value || '';
    const grade = document.getElementById('sc-grade')?.value || '';
    const purpose = document.getElementById('sc-purpose')?.value || '';
    const atmoChips = Array.from(document.querySelectorAll('.chip[data-sc].on'))
      .map((chip) => chip.dataset.val)
      .filter(Boolean);

    return { setting, time, light, tone, props, camera, dof, grade, purpose, atmoChips };
  }

  function buildScenePrompts(charCore, sc, mode) {
    if (!sc.setting && !sc.time && !sc.light) return null;

    const envParts = [
      sc.setting,
      sc.time,
      sc.light,
      sc.tone ? `${sc.tone.toLowerCase()} mood` : '',
      ...sc.atmoChips,
      sc.props,
      sc.camera,
      sc.dof,
      sc.grade,
      sc.purpose,
    ].filter(Boolean);

    const modeTag =
      mode === 'game'
        ? 'Unreal Engine 5 AAA game render, cinematic'
        : 'photorealistic DSLR photograph, 8K, RAW';

    const scenePos = [
      modeTag,
      ...charCore,
      'placed within:',
      ...envParts,
      'masterful environmental storytelling',
      'award-winning cinematography',
      'ultra-detailed, sharp focus on subject',
      'perfect exposure and composition',
    ]
      .filter(Boolean)
      .join(', ');

    const sceneNeg =
      'cartoon, anime, CGI plastic, blurry, low resolution, deformed anatomy, bad hands, extra limbs, watermark, text, logo, flat lighting, overexposed, boring composition, stock photo, split image, collage, multiple scenes';

    return { scenePos, sceneNeg };
  }

  pf.collectScene = collectScene;
  pf.buildScenePrompts = buildScenePrompts;
  window.appendExtra = appendExtra;
})();
