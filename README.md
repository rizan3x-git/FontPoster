# FontForge Studio

A responsive, static font preview and PNG export website. Designed to deploy directly to Netlify with no server or database required.

## Features
- Choose from 24 curated Google Fonts, including horror, gothic, bold, futuristic, elegant, and handwritten styles.
- Import your own TTF, OTF, WOFF, or WOFF2 font files directly from your device.
- Live text preview with text/background colors, solid/gradient/transparent backgrounds, size, letter spacing, and effects.
- Export a 1200 × 675 PNG.
- Responsive desktop and mobile layout.
- No API keys, backend, or build step required.

## Deploy to Netlify
1. Extract `font-style-studio.zip` on your computer.
2. Open https://app.netlify.com/drop
3. Drag the extracted `font-style-studio` folder (the folder containing `index.html`) onto the Netlify Drop page. If Netlify asks for a repository instead, create a new site and use **Add new site → Deploy manually**.
4. Wait for deployment, then open the generated Netlify URL.

Alternatively, push these files to a GitHub repository and import that repository in Netlify. Build command can be left empty; publish directory is `.`.

## Notes
- Google Fonts are loaded over the internet. If offline, the browser will use fallback fonts.
- Imported fonts stay in the current browser session only; they are not uploaded or saved permanently. Import them again after refreshing the page.
- PNG generation happens in the visitor's browser; text and design are not uploaded to a server.
- This is a static front-end website, so no login or database is needed.
