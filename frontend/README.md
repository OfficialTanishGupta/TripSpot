# TripSpot — Frontend

React + Vite + Tailwind CSS v4. Cinematic, photo/video-driven UI with an
optional fingerprint sign-in and an AI Traveler Insight card wired to the ML
service.

## Run it

```bash
npm install
npm run dev
```

Every page works immediately with sample data, no backend required to look
around. A small amber "Sample data" pill shows wherever real data would
normally come from the backend/ML service.

## Adding a real India tourism video (optional)

The Gateway page's hero automatically plays a real video if one exists,
otherwise it falls back to an animated, slow-zooming photo carousel (which
already looks good on its own, so this step is optional polish).

1. Download a free, royalty-free India-related travel clip (10-20 sec loops
   work best) from either:
   - Pexels Videos: https://www.pexels.com/search/videos/india%20travel/ (free, no attribution required)
   - Coverr: https://coverr.co/search?q=india (free, no attribution required)
2. Save it as `public/hero-video.mp4` in this folder
3. Reload the app, the video takes over automatically, no code changes needed

## Photos

Destination photos currently come from Picsum (a free, no-key placeholder
photo service) seeded by destination name. They're real photographs, but not
verified pictures of these exact places. To use real, destination-specific
photography:
1. Get a free API key at https://www.pexels.com/api/
2. Swap the `photo()` helper in `src/data/sampleData.js` for a Pexels API call

## Design system

- Dark, cinematic theme, deliberately chosen since photo/video content reads
  much stronger against a dark background than a light one
- Space Grotesk headings, Inter body, IBM Plex Mono for numbers/times
- One accent color per section (violet/blue/emerald/amber/pink), consistent
  across sidebar icons, cards, and buttons on that page
- shadcn/ui-style components (src/components/ui/), plain Tailwind + a cn()
  class-merge helper, no external component library dependency
