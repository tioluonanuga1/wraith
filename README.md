# ⬡ WRAITH — Character Summoning Engine

> **Every character, summoned in every platform.**

WRAITH is a free, offline-capable Progressive Web App that builds ultra-realistic AI character prompts and automatically optimises them for five platforms simultaneously — **Nano Banana, Gemini, Grok, ChatGPT, and Perplexity** — in a single summoning.

No more rewriting the same character description five different ways. No more guessing what syntax each model prefers. Build the character once. WRAITH handles the rest.

---

## ✦ Live Demo

🔗 **[wraith-app.netlify.app](https://wraith-app.netlify.app)**

---

## ✦ Features

### Dual Render Mode
Switch between two distinct output modes that change how every prompt is structured:

- **⬡ PHANTOM MODE** — Unreal Engine 5 / AAA game character render syntax. Built for game artists, concept designers, and anyone generating characters with a cinematic game aesthetic.
- **◎ MANIFEST MODE** — DSLR photorealistic syntax. Outputs read like a professional photography brief. Built for portrait generation, editorial looks, and realistic human references.

### Full Character Builder
Eight sections of granular character control:

| Section | What you control |
|---|---|
| Gender & Identity | Male / Female / Non-binary, age, ethnicity |
| Body Type | 20 body types across all genders — visual card selector |
| Face Architecture | Bone structure, eyes, lips, skin tone, skin detail chips |
| Hair | Style, colour, texture state — all with datalist suggestions |
| Pose & Body Language | 52 poses across 5 tabs — Neutral, Action, Editorial, Intimate, Couple |
| Wardrobe & State of Dress | Everyday to intimate — including fabric, undress states |
| Setting & Lighting | 12 settings, 9 lighting conditions |
| Quality & Expression | Shot type, expression energy, 3 quality sliders |

### 52-Pose Library
Poses are organised across five tabs, each with distinct purpose:

- **NEUTRAL** — 12 natural standing, sitting, and resting poses
- **ACTION** — 12 dynamic movement poses for game and hero shots
- **EDITORIAL** — 14 fashion, magazine, and power poses
- **INTIMATE** — 14 sensual, personal, and risqué poses
- **COUPLE / SCENE** — 10 two-character poses for scene generation

Every text input field includes a datalist of curated suggestions — type freely or pick from the dropdown.

### Five Platform Outputs — Each Tuned Differently

| Platform | Syntax Style |
|---|---|
| **Nano Banana** | Dense keyword chain + separate banishment (negative) prompt |
| **Gemini** | Natural descriptive prose written like a photography brief |
| **Grok / Aurora** | Punchy keyword-drama hybrid with `--ar 2:3` suffix |
| **ChatGPT (GPT-4o)** | Intent-first sentence structure, conversational and directive |
| **Perplexity (FLUX)** | Dense keyword chain with quality anchors and aesthetic references |

All five generate simultaneously on a single **SUMMON**. Switch between platform tabs or hit **BROADCAST TO ALL CHANNELS** to copy everything at once.

### The Rift — Scene Composer
Attach a full environment to your character. The Rift adds:

- 30+ setting options across Interior, Urban, Nature, and Post-Apocalyptic categories
- Time of day and weather conditions
- Lighting architecture — source, quality, color temperature
- Atmosphere detail chips (god rays, dust motes, neon reflections, falling ash, and more)
- Environmental storytelling props with datalist suggestions
- Camera angle and depth of field controls
- Film stock / color grade selector
- Scene narrative tone

The Rift generates a **composite prompt** that fuses your character with the environment — output in the SCENE tab alongside the five platform tabs.

### The Vault — Character Library
Your characters are saved locally, permanently, and work fully offline.

- **Bind** any character to The Vault with a custom name
- **Recall** instantly — the entire form state restores exactly as saved
- **Search** your vault by name, age, or body type
- **Duplicate** a summoning as a starting point for a variant
- **Export** individual characters or your entire vault as `.json`
- **Import** vault backups or share presets between devices
- **Dissolve** to delete

Storage uses **IndexedDB** with localStorage as a fallback. Your data never leaves your device.

### Progressive Web App
WRAITH is a fully compliant PWA:

- **Installable** on Android and iOS — add to home screen, launches fullscreen
- **Offline capable** — once loaded, works with no internet connection
- **Cache-first strategy** — served from cache instantly, updates silently in background
- **Update toast** — notifies you when a new version is ready to bind
- **Service Worker v1** — cache name `wraith-v1`, version `1.0.0-beta`

---

## ✦ Prompt Analysis Engine

After summoning, WRAITH scores each platform's output against its known prompt preferences. Scores are graded:

- **Strong** (85–100) — optimal for that platform
- **Solid** (70–84) — will produce good results
- **Needs tuning** (55–69) — actionable suggestions provided
- **Weak** (<55) — missing critical structural elements

Each score includes specific issues and suggestions tailored to the platform's model behaviour.

---

## ✦ Tech Stack

```
Frontend       Vanilla HTML / CSS / JavaScript — no framework, no build step
Fonts          Bebas Neue · Fraunces · JetBrains Mono (Google Fonts)
Storage        IndexedDB (primary) + localStorage (fallback)
PWA            Service Worker (cache-first) · Web App Manifest · install prompt
Architecture   Modular JS — 6 separate modules under /js/
Hosting        Static — deploy anywhere that serves HTTPS
```

### File Structure

```
wraith/
├── index.html              # App shell and all HTML
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker — cache and offline logic
├── css/
│   └── app.css             # All styles
├── js/
│   ├── main.js             # Entry point — initialises all modules
│   ├── app-state.js        # State management, gender/mode/body/pose logic
│   ├── prompt-engine.js    # Core forge function — builds all 5 platform prompts
│   ├── prompt-analysis.js  # Prompt scoring and suggestion engine
│   ├── scene-composer.js   # The Rift — environment prompt builder
│   ├── library.js          # The Vault — IndexedDB save/load/export/import
│   └── pwa.js              # Service worker registration, install prompt, offline detection
└── icons/
    └── icon-[72–512].png   # PWA icons — all sizes
```

---

## ✦ Deployment

### Recommended: GitHub + Netlify (free)

**Step 1 — Push to GitHub**
```bash
git init
git add .
git commit -m "initial: WRAITH v1.0.0-beta"
git remote add origin https://github.com/yourusername/wraith.git
git push -u origin main
```

**Step 2 — Deploy on Netlify**
1. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
2. Select your WRAITH repository
3. Leave build command blank — it's a static site
4. Set publish directory to `/` (root)
5. Click Deploy

Netlify auto-provisions HTTPS, which is required for the Service Worker and PWA install prompt to activate.

**Step 3 — Verify PWA on first load**
- Chrome DevTools → Application → Service Workers → confirm `wraith-v1` is registered
- Application → Manifest → confirm name `WRAITH` and icons load correctly
- On Android Chrome, visit the live URL — install prompt should appear within seconds
- On iOS Safari, use Share → Add to Home Screen

### Custom Domain
Buy a `.com` or `.app` domain (~$10/year on Namecheap), then add it in Netlify → Domain settings → Add custom domain. DNS propagates in under an hour.

### Other Static Hosts
WRAITH deploys identically on **Vercel**, **GitHub Pages**, **Cloudflare Pages**, or any host that serves HTTPS. No server, no database, no environment variables required.

---

## ✦ Local Development

No build tools required. Open directly in a browser:

```bash
# Clone the repo
git clone https://github.com/yourusername/wraith.git
cd wraith

# Serve locally (required for Service Worker to register)
npx serve .
# or
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

> **Note:** The Service Worker requires a server context — opening `index.html` directly as a file (`file://`) will load the app but the SW will not register and offline capability will not activate. Use any local server.

---

## ✦ Roadmap

| Phase | Status | Description |
|---|---|---|
| PWA Foundation | ✅ Complete | Offline, installable, service worker |
| The Vault | ✅ Complete | IndexedDB save/load, export/import |
| The Rift | ✅ Complete | Scene composer with environment integration |
| Prompt Analysis | ✅ Complete | Per-platform scoring and suggestions |
| Prompt History | 🔜 Planned | Every summoning logged, scrollable, re-exportable |
| Character Sheet Export | 🔜 Planned | One-tap PDF with character summary and all 5 prompts |
| Variant Forge | 🔜 Planned | Generate 3 slight variations of one character simultaneously |
| World Forge Integration | 🔜 Planned | Full environment builder merged with character pipeline |

---

## ✦ Contributing

WRAITH is currently a solo beta project. If you find a bug, have a feature suggestion, or want to contribute:

1. Open an issue describing the problem or idea
2. Fork the repository
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Commit your changes: `git commit -m "add: description of change"`
5. Push and open a pull request

---

## ✦ License

MIT License — free to use, modify, and distribute. Attribution appreciated.

---

## ✦ Author

Built by **Tiolu** — CS undergraduate, AI/ML enthusiast, and game design researcher.

> *WRAITH started as a single HTML file prompt builder and grew into a full PWA creative pipeline across three development phases. It is part of a broader mission to build tools at the intersection of AI, game design, and creative production.*

---

<div align="center">

**⬡ WRAITH**

*Every character, summoned in every platform.*

</div>
