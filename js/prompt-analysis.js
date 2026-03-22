(function () {
  const pf = (window.Wraith = window.Wraith || {});

  function scoreFromDeductions(start, deductions) {
    return Math.max(0, Math.min(100, start - deductions.reduce((sum, item) => sum + item, 0)));
  }

  function summarizeScore(score) {
    if (score >= 85) return 'Strong';
    if (score >= 70) return 'Solid';
    if (score >= 55) return 'Needs tuning';
    return 'Weak';
  }

  function wordCount(text) {
    return String(text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  function commaCount(text) {
    return (text.match(/,/g) || []).length;
  }

  function sentenceCount(text) {
    return (text.match(/[.!?]/g) || []).length;
  }

  function analyzePlatform(name, prompt, context) {
    const issues = [];
    const suggestions = [];
    const deductions = [];
    const words = wordCount(prompt);
    const commas = commaCount(prompt);
    const sentences = sentenceCount(prompt);

    if (!prompt || /Awaiting summoning signal|Fill in character details|Banishment list/i.test(prompt)) {
      return {
        name,
        score: 0,
        status: 'Missing',
        issues: ['This prompt has not been generated yet.'],
        suggestions: ['Summon the character first before evaluating this output.'],
      };
    }

    if (words < 20) {
      issues.push('Prompt is too short to give the model enough structure.');
      suggestions.push('Add stronger face, wardrobe, environment, and lighting detail.');
      deductions.push(18);
    }

    if (name === 'Gemini') {
      if (commas > 18) {
        issues.push('This reads a bit too much like a keyword chain for Gemini.');
        suggestions.push('Rewrite as smoother prose with fewer commas and more sentence flow.');
        deductions.push(12);
      }
      if (sentences < 3) {
        suggestions.push('Add one more sentence about mood, composition, or environment.');
        deductions.push(8);
      }
    }

    if (name === 'ChatGPT') {
      if (sentences < 4) {
        issues.push('This could be more directive and conversational for ChatGPT image prompting.');
        suggestions.push('Break the instructions into a few clearer sentences.');
        deductions.push(10);
      }
    }

    if (name === 'Grok' || name === 'Perplexity' || name === 'Nano Banana') {
      if (commas < 8) {
        issues.push('This is a little sparse for a dense visual keyword style.');
        suggestions.push('Add more concrete descriptors for lighting, texture, and composition.');
        deductions.push(10);
      }
    }

    if (name === 'Nano Banana' && !context.nbNeg) {
      issues.push('Negative prompt is missing.');
      suggestions.push('Keep the negative prompt paired with the positive prompt for cleaner results.');
      deductions.push(12);
    }

    if (!context.hasWardrobe) {
      suggestions.push('Adding wardrobe detail would improve visual specificity.');
      deductions.push(6);
    }

    if (!context.hasSetting) {
      suggestions.push('Adding setting or lighting detail would make the composition more controllable.');
      deductions.push(6);
    }

    if (!context.hasPose) {
      suggestions.push('A stronger pose or body-language cue would improve character clarity.');
      deductions.push(6);
    }

    const score = scoreFromDeductions(96, deductions);

    return {
      name,
      score,
      status: summarizeScore(score),
      issues: issues.slice(0, 2),
      suggestions: suggestions.slice(0, 2),
    };
  }

  function buildContext(data) {
    return {
      nbNeg: data.prompts.nbNeg,
      hasWardrobe: Boolean(data.inputs.wardrobe || data.inputs.wardrobeDetail),
      hasSetting: Boolean(data.inputs.setting || data.inputs.lighting || data.inputs.scene?.setting),
      hasPose: Boolean(data.inputs.selectedPose || data.inputs.poseExtra),
    };
  }

  function analyzePromptSet(data) {
    const context = buildContext(data);
    const platforms = [
      analyzePlatform('Nano Banana', data.prompts.nbPos, context),
      analyzePlatform('Gemini', data.prompts.geminiPos, context),
      analyzePlatform('Grok', data.prompts.grokPos, context),
      analyzePlatform('ChatGPT', data.prompts.gptPos, context),
      analyzePlatform('Perplexity', data.prompts.pxPos, context),
    ];

    const overall = Math.round(platforms.reduce((sum, item) => sum + item.score, 0) / platforms.length);
    const topPriority =
      platforms
        .flatMap((platform) =>
          platform.suggestions.map((suggestion) => ({
            score: platform.score,
            platform: platform.name,
            suggestion,
          }))
        )
        .sort((a, b) => a.score - b.score)[0] || null;

    return {
      overall,
      status: summarizeScore(overall),
      summary:
        overall >= 85
          ? 'These prompts are in a strong range. The best gains now come from model-specific polish.'
          : overall >= 70
          ? 'The prompt set is solid, but a few targeted improvements would raise consistency across models.'
          : 'The prompt set needs more structure before it will perform consistently across models.',
      topPriority,
      platforms,
    };
  }

  function renderPromptReport(report) {
    const card = document.getElementById('qa-card');
    const score = document.getElementById('qa-score');
    const status = document.getElementById('qa-status');
    const summary = document.getElementById('qa-summary');
    const next = document.getElementById('qa-next');
    const grid = document.getElementById('qa-grid');

    if (!card || !score || !status || !summary || !next || !grid) return;

    card.classList.add('ready');
    score.textContent = `${report.overall}`;
    status.textContent = report.status.toUpperCase();
    summary.textContent = report.summary;
    next.textContent = report.topPriority
      ? `${report.topPriority.platform}: ${report.topPriority.suggestion}`
      : 'Generate prompts to get tailored optimization guidance.';

    grid.innerHTML = '';
    report.platforms.forEach((platform) => {
      const item = document.createElement('div');
      item.className = 'qa-item';
      item.innerHTML = `
        <div class="qa-item-top">
          <span class="qa-item-name">${platform.name}</span>
          <span class="qa-item-score">${platform.score}</span>
        </div>
        <div class="qa-item-status">${platform.status}</div>
        <div class="qa-item-note">${platform.issues[0] || platform.suggestions[0] || 'No immediate issues detected.'}</div>
      `;
      grid.appendChild(item);
    });
  }

  pf.analyzePromptSet = analyzePromptSet;
  pf.renderPromptReport = renderPromptReport;
})();
