# LinkSnap

Turn any link into a polished, story-ready card. Paste a URL into LinkSnap and it instantly detects the platform, parses the metadata, and renders a shareable card sized for Instagram / WhatsApp / Facebook stories. Every card is fully customizable before you share it.

Built with Expo (React Native), `expo-router`, and NativeWind.

## Features

- **Automatic link detection** — paste any URL and LinkSnap picks the right template, populating title, image, author, price, rating, and other platform-specific details from public metadata, oEmbed, JSON-LD, and keyless APIs.
- **20 story templates** — editorial, spotlight, tweet, YouTube, clip, reddit post, music, repo, commerce, stream, LinkedIn, Indeed, restaurant, Pinterest, app, stay, game, book, and launch cards.
- **Full editor**:
  - Switch templates and pick a scene background (image, solid color, eyedropper, or custom HSV color).
  - Edit card details — author, headline, price, cuisine, ratings, and more — per template.
  - Blur and vignette controls for the background.
- **Share targets** — send the rendered card to Instagram, WhatsApp, Facebook, or the system share sheet (a photo is cached automatically on device).

## Supported link types

Paste any of these links and the app auto-selects the matching template (every template is also reachable from the Presets panel and fully editable):

- **Social**: X/Twitter posts, Reddit posts, Pinterest pins
- **Video**: YouTube (video / Short / Live / Premiere), Twitch (live / clip / VOD / channel), TikTok clips
- **Music**: Spotify (track / album / playlist / artist / show / episode)
- **Code**: GitHub repositories
- **Commerce**: Amazon, Flipkart, Meesho, AliExpress, eBay, Etsy
- **Jobs**: LinkedIn posts, Indeed listings
- **Food**: Zomato & Swiggy restaurant pages
- **Apps**: App Store & Google Play listings
- **Travel**: Airbnb and similar stay listings
- **Games**: Steam store pages
- **Books**: Goodreads, Google Books, Open Library, and Amazon Kindle / book pages (`/dp/`, `/gp/product/`, `/kindle/` — physical Amazon products stay on the commerce template)
- **Launch**: Product Hunt launches
- Everything else falls back to a generic editorial card.

Metadata is fetched without server code: direct fetch plus an `r.jina.ai` reader proxy fallback, with keyless public APIs for App Store (iTunes Lookup) and Steam, and JSON-LD parsing for eBay, Indeed, restaurants, and Goodreads.

## Tech stack

- Expo SDK 57, React Native 0.86, React 19
- `expo-router` (file-based routing, typed routes)
- NativeWind + Tailwind CSS for styling
- `lucide-react-native` icons
- `react-native-view-shot` for rendering shareable images

## Getting started

Prerequisites: Node.js 20+ and the Expo CLI.

```bash
npm install
npx expo start
```

In the Metro output you can open the app in a development build, an emulator/simulator, or Expo Go. `w` opens the web version in your browser.

Scripts:

```bash
npm run web        # start Expo for the web
npm run android    # build + run on Android
npm run ios        # build + run on iOS
npm run lint       # ESLint via expo lint
```

## Project structure

```
src/app/            # expo-router screens (index = entry, result = card studio)
src/components/     # shared UI, the card template library, skeletons
src/lib/            # link preview parsing, sharing, history, palettes
```

- `src/lib/link-preview.ts` — URL sniffing, HTML/OG/JSON-LD/oEmbed/API parsing, per-platform fallbacks, and the `LinkPreview` model.
- `src/components/link-card-view.tsx` — the 20 card templates and the scene/background renderer.
- `src/app/result.tsx` — the card studio: preview, editor panel, and share flow.

## Configuration

Optional values live in the `extra` section of `app.json`:

- `ytWorkerUrl` — a self-hosted worker URL that returns YouTube oEmbed/`related` metadata. Leave empty to parse page HTML instead.
- `fbAppId` — Facebook App ID (used by the `react-native-share` install intent). Required only for Facebook sharing.

## Notes

- Card details entered in the editor are sent along with the shared caption.
- Sharing requires device photo/library permissions; a preview photo is saved automatically on iOS before sharing.