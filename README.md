<p align="center">
  <a href="https://devquest-mu.vercel.app">
    <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=profile-hero&theme=tokyonight&style=glass" width="720" alt="DevQuest live GitHub profile card" />
  </a>
</p>

# DevQuest

> A live GitHub profile-card gallery, constructor, and Product Hunt-style daily repository battle.

DevQuest turns GitHub data into polished SVG profile cards and now also lets developers launch repositories into a daily Product Hunt-style ranking. Browse templates, customize cards inline, download PNGs, share to X, collect guestbook signatures, and submit repositories to **Daily Battle** with upvotes, comments, media, makers, and README badges.

## What's New

- **Refero-style gallery redesign** with sticky header, hero search, category pills and large visual cards.
- **Inline template customizer** directly inside the gallery modal: template, art style, theme, title, accent, ASCII, stats, PNG download, X share, Markdown and HTML embeds.
- **Working template search** over all registered cards.
- **Daily Battle**: Product Hunt-style daily repository leaderboard.
- **GitHub star gate**: users must sign in with GitHub and star `yiaany/devquest` before submitting a project.
- **Local media uploads**: thumbnail/logo and screenshots are uploaded directly from desktop or phone and stored as base64 data URLs.
- **Daily reset** at `12:00` Yekaterinburg time (`07:00 UTC`) with yesterday's winners.
- **Upvotes and comments** for submitted repositories.
- **Live SVG battle badge** for README embeds showing current upvotes.
- Fixed layout polish for `Main Language` and `Contribution Gauge` card templates.

## Gallery

Every image below is rendered live from GitHub data.

<p>
  <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=profile-hero&theme=tokyonight&style=glass" width="49%" alt="Profile Hero card" />
  <img src="https://devquest-mu.vercel.app/card/octocat.svg?template=receipt&theme=paper&style=minimal" width="49%" alt="Dev Receipt card" />
</p>

<p>
  <img src="https://devquest-mu.vercel.app/card/torvalds.svg?template=heatmap&theme=matrix&style=terminal" width="49%" alt="Contribution heatmap card" />
  <img src="https://devquest-mu.vercel.app/card/torvalds.svg?template=language-crown&theme=dracula&style=glass" width="49%" alt="Main language card" />
</p>

<p>
  <img src="https://devquest-mu.vercel.app/card/gaearon.svg?template=contribution-gauge&theme=gruvbox&style=glass" width="49%" alt="Contribution gauge card" />
  <img src="https://devquest-mu.vercel.app/card/gaearon.svg?template=rank-badge&theme=synthwave&style=outrun" width="49%" alt="Rank badge card" />
</p>

## Features

- **33 card templates** across profile, stack, vibe, repository and interactive categories.
- **15 art-style frames**: terminal, neobrutalism, glass, pixel, minimal, outrun, blueprint, sketch, sticker, tape, hologram, newspaper, arcade, polaroid, circuit.
- **19 themes**: macos, matrix, cyberpunk, paper, dracula, nord, gruvbox, tokyonight, synthwave, catppuccin, monokai, solarized, everforest, rosepine, oceanic, amber, vaporwave, githublight, coffee.
- **40 ASCII arts** for terminal-style templates.
- **Inline constructor** in the gallery modal.
- **Markdown, HTML, PNG export and X sharing**.
- **GitHub OAuth** via NextAuth.
- **Guestbook card** with live signatures and owner moderation.
- **Daily Battle** with submissions, votes, comments, media gallery, makers, licenses and yesterday's winners.

## Card Templates

All cards are selected via `?template=<id>`.

| Category | Templates |
| --- | --- |
| **Profile** | `terminal` · `neofetch` · `heatmap` · `wrapped` · `id-card` · `rank-badge` · `profile-hero` · `stat-grid` · `stat-spark` · `receipt` · `shields` · `account-age` · `follower-ratio` · `contribution-gauge` · `streak-flame` · `pr-badge` |
| **Stack** | `language-donut` · `tech-stack` · `skill-bars` · `language-ladder` · `language-crown` · `polyglot` |
| **Vibe** | `code-weather` · `mood-ring` · `quote` · `now-playing` |
| **Repository** | `top-repos` · `stars-per-repo` · `repo-scatter` |
| **Interactive** | `guestbook` · `poll` |

Example:

```md
![DevQuest Card](https://devquest-mu.vercel.app/card/octocat.svg?template=profile-hero&theme=dracula&style=glass&accent=00ff9c)
```

## Daily Battle

Daily Battle is a Product Hunt-style ranking for GitHub repositories.

### Submission Rules

- You must sign in with GitHub.
- You must star [`yiaany/devquest`](https://github.com/yiaany/devquest).
- One submitted repository per GitHub user per battle day.
- The submitted project must be a real GitHub repository.
- The primary link is always computed as the GitHub repository URL.
- Battle day starts at `12:00` Yekaterinburg time (`07:00 UTC`) and lasts 24 hours.

### Product Hunt-style Fields

- **Name**: clean product name.
- **Tagline**: up to 60 characters.
- **Description**: up to 260 characters.
- **Keywords**: up to 3 comma-separated tags.
- **Alternative links**: optional extra URLs.
- **License**: project license or `-` when absent.
- **Thumbnail**: uploaded locally from desktop/phone.
- **Screenshots**: minimum 2 uploaded images.
- **Video link**: optional YouTube URL.
- **Makers**: comma-separated GitHub usernames.

### Daily Battle API

```txt
GET  /api/battle                         -> current + previous battle
POST /api/battle                         -> submit repository, GitHub auth + star required
POST /api/battle/vote                    -> toggle upvote
POST /api/battle/comment                 -> add comment
GET  /api/battle/badge/:owner/:repo      -> live SVG upvote badge
```

### README Badge

Submitted projects can embed a live badge in their README:

```md
[![DevQuest Daily Battle](https://devquest-mu.vercel.app/api/battle/badge/yiaany/devquest)](https://devquest-mu.vercel.app)
```

## Guestbook

The Guestbook card turns a README into a living wall.

```md
[![Guestbook](https://devquest-mu.vercel.app/card/<your-username>.svg?template=guestbook)](https://devquest-mu.vercel.app/<your-username>/sign)
```

API:

```txt
GET    /api/guestbook/:owner
POST   /api/guestbook/:owner
DELETE /api/guestbook/:owner?at=<ts>
DELETE /api/guestbook/:owner?all=1
```

## Local Development

```bash
git clone https://github.com/yiaany/devquest.git
cd devquest
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
AUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Optional but recommended for higher GitHub API rate limits.
GITHUB_TOKEN=your_personal_access_token

# Durable Daily Battle + Guestbook storage.
# Without Redis/KV, data falls back to in-memory storage and is not durable.
KV_REST_API_URL=your_upstash_rest_url
KV_REST_API_TOKEN=your_upstash_rest_token

# Alternative Upstash env names are also supported.
UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
```

## Deployment

Deploy on Vercel:

```bash
npx vercel --prod
```

Required production settings:

- Add all environment variables above in Vercel.
- Set `NEXTAUTH_URL` to the production URL.
- Configure GitHub OAuth callback URL.
- Configure Upstash/Vercel KV for durable Daily Battle and Guestbook data.

## Release Notes

### v0.2.0

- Added redesigned gallery landing page.
- Added inline template customizer modal.
- Added Daily Battle Product Hunt-style repository ranking.
- Added GitHub star gate for submissions.
- Added local media uploads for thumbnails and screenshots.
- Added comments, upvotes, yesterday winners and battle reset timer.
- Added live SVG battle badges.
- Fixed Main Language and Contribution Gauge card layouts.

## License

CC BY-NC-SA 4.0 License (Attribution-NonCommercial-ShareAlike 4.0 International). Free for personal use and modification. Commercial use, reselling, or hosting paid versions is prohibited.
