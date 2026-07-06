# DevQuest

Turn your GitHub profile into something actually worth looking at.

DevQuest generates clean, live-rendered cards from your real GitHub data. Pick from **33 card templates**, **10 art-style frames**, **9 color themes** and **30 ASCII arts**, drop the snippet in your profile README, and it updates automatically. No static images, no manual updates, no bullshit.

> Every image below is a live SVG rendered on demand from real GitHub data — not a screenshot. Refresh and the numbers are current.

## Gallery

**Profile Hero** &nbsp;·&nbsp; **Dev Receipt** &nbsp;·&nbsp; **Stat Grid**

<p>
  <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=profile-hero&theme=tokyonight&style=glass" width="49%" alt="Profile Hero card" />
  <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=receipt&theme=paper&style=minimal" width="49%" alt="Dev Receipt card" />
</p>

**Contribution Heatmap** &nbsp;·&nbsp; **Language Donut**

<p>
  <img src="https://devquest-mu.vercel.app/card/torvalds.svg?template=heatmap&theme=matrix&style=terminal" width="49%" alt="Contribution heatmap card" />
  <img src="https://devquest-mu.vercel.app/card/torvalds.svg?template=language-donut&theme=dracula&style=neobrutalism" width="49%" alt="Language donut card" />
</p>

**Rank Badge** &nbsp;·&nbsp; **Dev ID Card**

<p>
  <img src="https://devquest-mu.vercel.app/card/gaearon.svg?template=rank-badge&theme=synthwave&style=outrun" width="49%" alt="Rank badge card" />
  <img src="https://devquest-mu.vercel.app/card/gaearon.svg?template=id-card&theme=nord&style=blueprint" width="49%" alt="Dev ID card" />
</p>

**Guestbook** — the interactive one. Visitors sign your wall and it renders their real signatures.

<p>
  <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=guestbook&theme=gruvbox&style=sticker" width="49%" alt="Guestbook card" />
</p>

## Features

- **33 card templates** — profile heroes, stat grids, receipts, shields, rank badges, contribution heatmaps & gauges, streak flames, language donuts/ladders/crowns, repo showcases & scatter plots, dev ID cards, and more
- **Live interactivity** — a **Guestbook** card that renders real visitor signatures, plus a **Poll** card, backed by a public sign API
- **10 art-style frames** — terminal, neobrutalism, glass, pixel, minimal, outrun, blueprint, sketch, sticker, tape
- **9 color themes** — macos, matrix, cyberpunk, paper, dracula, nord, gruvbox, tokyonight, synthwave
- **30 ASCII arts** to pin on the side of your card
- Real-time data from GitHub, cached and auto-refreshing
- Custom accent colors, custom title bar, selectable stats
- One-click README embed + PNG export
- Works with private stats after GitHub login

## Card templates

All 33 templates, selectable via `?template=<id>`:

| Category | Templates |
| --- | --- |
| **Profile** | `terminal` · `neofetch` · `profile-hero` · `id-card` · `rank-badge` · `stat-grid` · `stat-spark` · `account-age` · `follower-ratio` · `shields` · `receipt` |
| **Activity** | `heatmap` · `wrapped` · `contribution-gauge` · `streak-flame` · `pr-badge` · `code-weather` · `mood-ring` |
| **Languages** | `language-donut` · `tech-stack` · `skill-bars` · `language-ladder` · `language-crown` · `polyglot` |
| **Repos** | `repo-stats` · `top-repos` · `repo-showcase` · `stars-per-repo` · `repo-scatter` |
| **Interactive / fun** | `guestbook` · `poll` · `quote` · `now-playing` |

Combine any template with a `theme`, `style`, `accent`, `ascii` and `title`:

```
https://devquest-mu.vercel.app/card/<username>.svg?template=profile-hero&theme=dracula&style=glass&accent=00ff9c
```

## The Guestbook (interactive)

The Guestbook card turns your profile into a wall visitors can sign.

1. Embed the guestbook card in your README:
   ```markdown
   ![Guestbook](https://devquest-mu.vercel.app/card/<your-username>.svg?template=guestbook)
   ```
2. Anyone can visit `https://devquest-mu.vercel.app/<your-username>/sign` and leave a signed message.
3. The card re-renders with the latest signatures — real interactivity, right inside a static README.

Backed by a public API:

```
GET  /api/guestbook/:owner   → list signatures (newest first)
POST /api/guestbook/:owner   → add one { name, message }
```

Messages are sanitized and length-capped; the list is a capped rolling window.

## How to use

1. Go to the [constructor](https://devquest-mu.vercel.app/build)
2. Enter your GitHub username (or log in with GitHub)
3. Pick a template, art style, theme, accent, and ASCII art
4. Copy the markdown snippet
5. Paste it into your profile README

Done.

## Local development

```bash
git clone https://github.com/yiaany/devquest.git
cd devquest
pnpm install
cp .env.example .env.local
# fill in the required variables
pnpm dev
```

## Environment variables

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
AUTH_SECRET=your_random_secret_string
GITHUB_TOKEN=your_personal_access_token   # optional, raises rate limit
NEXTAUTH_URL=http://localhost:3000
```

## Deployment

The easiest way is to deploy on Vercel:

```bash
npx vercel
```

Make sure to add all environment variables in the Vercel dashboard.

## License

CC BY-NC-SA 4.0 License (Attribution-NonCommercial-ShareAlike 4.0 International) — Free for personal use and modification. Commercial use, reselling, or hosting paid versions of this product is strictly prohibited.
