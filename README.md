# Orbital Atlas — Cursor → GitHub → Vercel

Portable export of version 6, prepared 31 October 2026. This contains the editable application, ten original playbook PDFs, forty source illustrations, the ORI guide, three mission scenarios, and the orbital laboratory.

## 1. Open in Cursor

Unzip the download. Open the **orbital-atlas** folder in Cursor — the folder containing this README, `package.json` and `vercel.json`.

Use Node.js 22 or newer. In Cursor’s terminal:

```bash
npm ci
npm run dev
```

Open **http://localhost:3000**. If the port is occupied, use `npm run dev -- --port 3001`. Stop with Ctrl+C. Refresh the browser after editing files; this server does not provide hot reload.

The site uses ES modules and loads JSON, so opening `dist/index.html` directly as a file will not work reliably. There are no npm dependencies or API keys to configure. Google Fonts is an optional external stylesheet; system fonts provide a fallback.

## 2. Validate

```bash
npm run build
```

This checks the local assets, JavaScript syntax, static hosting configuration, portable server handler, and mission regressions. The scenario checks traverse 263 complete paths. `npm test` runs just the regression tests.

**`dist/` contains the editable source. Do not delete it.** The build validates these files; no transpiler regenerates them.

## 3. Push to GitHub

Create an empty GitHub repository called `orbital-atlas`. Do not initialize it with a README. From the project folder, run the commands below, replacing `YOUR_USERNAME` with your GitHub username:

```bash
git init -b main
git add .
git commit -m "Initial Orbital Atlas v6 import"
git remote add origin https://github.com/YOUR_USERNAME/orbital-atlas.git
git push -u origin main
```

Authenticate through Git’s normal credential flow. The included GitHub Actions workflow validates subsequent pushes and pull requests. Keep `dist/` committed. No Git LFS is needed for the included files.

## 4. Import into Vercel

Import the GitHub repository into a new Vercel project. The included `vercel.json` declares:

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Root directory | Repository root (`./`) |
| Install command | `npm ci --ignore-scripts --no-audit --no-fund` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None required |

Deploy the project. The root directory must contain `package.json`; do not select `dist` as the project root. Routes use URL fragments, such as `/#mission` and `/#lab`, so no SPA catch-all rewrite is required.

The original ChatGPT Site’s private sign-in gate is hosting infrastructure and is not included in this static export. Configure the new deployment’s audience separately. Local progress is tied to each browser and origin: a new Vercel domain starts with a fresh flight log. Export your existing flight log from the current app if you want a reference copy; this package contains no personal saved progress.

## 5. Ask Cursor to work on the project

Suggested first prompt:

> Read README.md and docs/IMPLEMENTATION-NOTES.md. Run npm run build, explain the architecture, and help me deploy this existing static app to Vercel. Preserve the content, source assets, mission state compatibility, keyboard controls and software-rendering fallback.

The included `.cursor/rules/orbital-atlas.mdc` supplies the project conventions.

## Project map

| Location | Purpose |
| --- | --- |
| `dist/index.html`, `dist/app.js` | Entry point, page routes and browser-local learning progress |
| `dist/curriculum.json` | Ten playbook modules |
| `dist/mission-engine.js` | Immutable mission state and decision rules |
| `dist/mission-scenarios.js` | Three authored scenario variants |
| `dist/mission-ui.js`, `mission-scene.js` | Flight controls, ORI coaching and 3D mission presentation |
| `dist/lab.js`, `software-lab.js`, `space-visuals.js` | Hardware/software laboratory and shared spacecraft geometry |
| `dist/assets/`, `dist/playbooks/` | Images, textures, character artwork and source PDFs |
| `design/` | Original generated spacecraft material atlas |
| `tests/`, `scripts/` | Regression checks, validation and local server |
| `docs/IMPLEMENTATION-NOTES.md` | Model boundaries and development validation history |
| `licenses/`, `THIRD-PARTY-NOTICES.md` | Bundled component and asset attribution |

ORI provides scripted, contextual coaching and optional device speech. This export does not connect to an LLM or voice API. The orbital scenes are educational models, not operational flight tools. Hardware-accelerated graphics, physical-device performance and a full screen-reader audit were not validated during export. The original app files are unchanged from the published version; packaging adds development and deployment support.

## Deployment references

- [Vercel build settings](https://vercel.com/docs/builds/configure-a-build)
- [Vercel JSON configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [GitHub: adding locally hosted code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
