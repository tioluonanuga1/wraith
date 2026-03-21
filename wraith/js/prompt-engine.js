(function () {
  const pf = (window.PersonaForge = window.PersonaForge || {});
  const { g, chips, sl, setOut } = pf.helpers;

  function buildGeminiProse(
    genderWord,
    age,
    ethnicity,
    body,
    bone,
    skinTone,
    eyes,
    lips,
    skinDetails,
    hairColor,
    hairStyle,
    expression,
    pose,
    poseExtra,
    wardrobe,
    wardrobeDetail,
    setting,
    lighting,
    shot,
    extra,
    mode,
    realWords,
    dramaWords
  ) {
    const modePhrase =
      mode === 'game'
        ? 'a photorealistic Unreal Engine 5 AAA game character render of'
        : 'a photorealistic portrait photograph of';

    let prose = `${modePhrase} a ${age ? `${age.toLowerCase()} ` : ''}${genderWord}`;
    if (ethnicity) prose += ` of ${ethnicity} heritage`;
    prose += '.';
    if (body) prose += ` ${body}.`;
    if (bone || skinTone) {
      prose += ` The face features ${[
        bone ? bone.toLowerCase() : '',
        skinTone ? `${skinTone.toLowerCase()} skin` : '',
      ]
        .filter(Boolean)
        .join(', ')}.`;
    }
    if (eyes) prose += ` ${eyes} eyes`;
    if (lips) prose += `, ${lips} lips`;
    if (skinDetails.length) prose += `. Skin texture: ${skinDetails.slice(0, 3).join(', ')}.`;
    if (hairColor || hairStyle) prose += ` Hair: ${[hairColor, hairStyle].filter(Boolean).join(' ')}.`;
    if (expression) prose += ` Their expression conveys ${expression.toLowerCase()}.`;
    if (pose || poseExtra) prose += ` Pose: ${[pose, poseExtra].filter(Boolean).join(', ')}.`;
    if (wardrobe) prose += ` Wearing ${wardrobe.toLowerCase()}${wardrobeDetail ? `, ${wardrobeDetail}` : ''}.`;
    if (setting || lighting) prose += ` Environment: ${[setting, lighting].filter(Boolean).join(', ')}.`;
    if (extra) prose += ` ${extra}.`;
    prose += ` The image should feel ${dramaWords}, ${realWords}.`;
    return prose;
  }

  function forge() {
    const { state, collectScene, buildScenePrompts } = pf;
    const age = g('age');
    const ethnicity = g('ethnicity');
    const height = g('height');
    const bodyExtra = g('body-extra');
    const bone = g('bone');
    const eyes = g('eyes');
    const lips = g('lips');
    const skinTone = g('skin-tone');
    const skinDetails = chips('.chips .chip:not(.pose-group .chip):not(.body-card)');
    const hairStyle = g('hair-style');
    const hairColor = g('hair-color');
    const poseExtra = g('pose-extra');
    const wardrobe = g('wardrobe');
    const wardrobeDetail = g('wardrobe-detail');
    const setting = g('setting');
    const lighting = g('lighting');
    const shot = g('shot');
    const expression = g('expression');
    const extra = g('extra');

    const real = sl('s-real');
    const skin = sl('s-skin');
    const drama = sl('s-drama');

    if (!state.selectedBody && !age && !ethnicity) {
      alert('Select at least a body type or fill in basic identity fields first.');
      return;
    }

    const genderWord =
      state.gender === 'male' ? 'man' : state.gender === 'female' ? 'woman' : 'person';
    const modeTag =
      state.mode === 'game'
        ? 'Unreal Engine 5 game character render, AAA quality'
        : 'photorealistic DSLR photograph, shot on Sony A7R V';

    const core = [
      age ? `${age.toLowerCase()} ${genderWord}` : genderWord,
      ethnicity ? `${ethnicity} heritage` : '',
      height ? height.toLowerCase() : '',
      state.selectedBody,
      bodyExtra,
      bone ? bone.toLowerCase() : '',
      skinTone ? `${skinTone.toLowerCase()} skin` : '',
      eyes ? `${eyes} eyes` : '',
      lips ? `${lips} lips` : '',
      ...skinDetails,
      hairColor && hairStyle ? `${hairColor} ${hairStyle} hair` : hairStyle ? `${hairStyle} hair` : '',
      expression ? expression.toLowerCase() : '',
      state.selectedPose,
      poseExtra,
      wardrobe ? wardrobe.toLowerCase() : '',
      wardrobeDetail,
      setting ? `${setting.toLowerCase()} setting` : '',
      lighting ? lighting.toLowerCase() : '',
      shot ? shot.toLowerCase() : '',
      extra,
    ].filter(Boolean);

    const realWords =
      real >= 9
        ? 'ultra-detailed, 8K resolution, hyper-realistic textures, pores and imperfections visible'
        : real >= 7
        ? 'highly detailed, 4K, realistic textures'
        : 'detailed, high quality';
    const skinWords =
      skin >= 8
        ? 'subsurface skin scattering, translucent skin, individual hair strands, micro skin detail'
        : skin >= 5
        ? 'subsurface scattering, natural skin'
        : '';
    const dramaWords =
      drama >= 8
        ? 'cinematic composition, award-winning photography, dramatic lighting'
        : 'professional composition, well-lit';

    const nbPrompt = [
      ...core,
      modeTag,
      realWords,
      skinWords,
      dramaWords,
      'sharp focus on subject, bokeh background, masterful character design',
    ]
      .filter(Boolean)
      .join(', ');
    const nbNeg =
      'cartoon, anime, 2D illustration, plastic skin, airbrushed, deformed anatomy, extra fingers, bad hands, blurry, watermark, text, logo, low resolution, flat lighting, overexposed, stock photo, ugly, disfigured, mutated, cropped';

    const gemProse = buildGeminiProse(
      genderWord,
      age,
      ethnicity,
      state.selectedBody,
      bone,
      skinTone,
      eyes,
      lips,
      skinDetails,
      hairColor,
      hairStyle,
      expression,
      state.selectedPose,
      poseExtra,
      wardrobe,
      wardrobeDetail,
      setting,
      lighting,
      shot,
      extra,
      state.mode,
      realWords,
      dramaWords
    );

    const grokPrompt = [
      state.mode === 'game' ? 'GAME CHARACTER RENDER, UNREAL ENGINE 5' : 'PHOTOREALISTIC PORTRAIT',
      age ? `${age} ${genderWord.toUpperCase()}` : genderWord.toUpperCase(),
      ethnicity ? ethnicity.toUpperCase() : '',
      state.selectedBody,
      bone,
      skinTone,
      eyes ? `${eyes} eyes` : '',
      expression,
      state.selectedPose,
      poseExtra,
      wardrobe,
      wardrobeDetail,
      setting,
      lighting,
      shot,
      hairColor && hairStyle ? `${hairColor} ${hairStyle}` : '',
      extra,
      realWords,
      dramaWords,
      skinWords,
      'ultra-detailed character, professional quality',
      '--ar 2:3',
    ]
      .filter(Boolean)
      .join(', ');

    const gptMode =
      state.mode === 'game'
        ? 'a high-fidelity AAA game character render in Unreal Engine 5 style'
        : 'a photorealistic portrait photograph shot on a professional DSLR';
    let gptDesc = `Create ${gptMode} of a ${age ? `${age.toLowerCase()} ` : ''}${genderWord}`;
    if (ethnicity) gptDesc += ` of ${ethnicity} heritage`;
    gptDesc += '.';
    if (state.selectedBody) gptDesc += ` The character has ${state.selectedBody}.`;
    if (bone || skinTone || eyes) {
      gptDesc += ` Face: ${[
        bone,
        skinTone ? `${skinTone} skin` : '',
        eyes ? `${eyes} eyes` : '',
      ]
        .filter(Boolean)
        .join(', ')}.`;
    }
    if (expression) gptDesc += ` Expression: ${expression.toLowerCase()}.`;
    if (state.selectedPose || poseExtra) {
      gptDesc += ` Pose: ${[state.selectedPose, poseExtra].filter(Boolean).join(', ')}.`;
    }
    if (wardrobe) {
      gptDesc += ` Wearing: ${wardrobe.toLowerCase()}${wardrobeDetail ? `, ${wardrobeDetail}` : ''}.`;
    }
    if (setting || lighting) gptDesc += ` Scene: ${[setting, lighting].filter(Boolean).join(', ')}.`;
    if (extra) gptDesc += ` Additional: ${extra}.`;
    gptDesc += ` The image should be ${realWords}, ${dramaWords}. No watermarks, no text overlays.`;

    const pxPrompt = [
      state.mode === 'game'
        ? 'game character render, Unreal Engine 5, AAA quality'
        : 'photorealistic, shot on DSLR, RAW photo',
      ...core,
      realWords,
      dramaWords,
      skinWords,
      'masterful character design',
      'professional quality',
      'best quality, highly detailed',
    ]
      .filter(Boolean)
      .join(', ');

    setOut('nb-pos', nbPrompt);
    setOut('nb-neg', nbNeg);
    setOut('gemini-pos', gemProse);
    setOut('grok-pos', grokPrompt);
    setOut('gpt-pos', gptDesc);
    setOut('px-pos', pxPrompt);

    const scene = collectScene();
    const sceneResult = buildScenePrompts(core, scene, state.mode);
    if (sceneResult) {
      setOut('scene-pos', sceneResult.scenePos);
      setOut('scene-neg', sceneResult.sceneNeg);
      window.switchOut('scene');
      setTimeout(() => window.switchOut('nb'), 1800);
    }

    if (!pf.analyzePromptSet || !pf.renderPromptReport) {
      console.warn('[WRAITH] Prompt analysis layer is unavailable.');
      return;
    }

    const report = pf.analyzePromptSet({
      inputs: {
        age,
        ethnicity,
        selectedBody: state.selectedBody,
        poseExtra,
        selectedPose: state.selectedPose,
        wardrobe,
        wardrobeDetail,
        setting,
        lighting,
        scene,
      },
      prompts: {
        nbPos: nbPrompt,
        nbNeg,
        geminiPos: gemProse,
        grokPos: grokPrompt,
        gptPos: gptDesc,
        pxPos: pxPrompt,
        scenePos: sceneResult?.scenePos || '',
        sceneNeg: sceneResult?.sceneNeg || '',
      },
    });

    if (report) {
      pf.renderPromptReport(report);
    }
  }

  function doCopy(id, btn) {
    const el = document.getElementById(id);
    if (!el || el.classList.contains('ph')) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      btn.textContent = 'COPIED!';
      btn.classList.add('done');
      setTimeout(() => {
        btn.textContent = 'COPY';
        btn.classList.remove('done');
      }, 2000);
    });
  }

  function copyAll() {
    const ids = ['nb-pos', 'gemini-pos', 'grok-pos', 'gpt-pos', 'px-pos'];
    const labels = ['NANO BANANA', 'GEMINI', 'GROK', 'CHATGPT', 'PERPLEXITY'];
    let all = '';

    ids.forEach((id, index) => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('ph')) {
        all += `=== ${labels[index]} ===\n${el.textContent}\n\n`;
      }
    });

    if (!all) {
      alert('Forge a character first!');
      return;
    }

    navigator.clipboard.writeText(all).then(() => {
      const btn = document.querySelector('.copy-all');
      if (!btn) return;
      btn.textContent = 'ALL 5 COPIED';
      setTimeout(() => {
        btn.textContent = 'COPY ALL 5 PROMPTS';
      }, 3000);
    });
  }

  window.forge = forge;
  window.doCopy = doCopy;
  window.copyAll = copyAll;
})();

