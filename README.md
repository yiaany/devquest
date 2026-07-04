# DevQuest

Turn your GitHub profile into something actually worth looking at.

DevQuest generates a clean, terminal-style card from your real GitHub data. Drop it in your profile README and it updates automatically. No static images, no manual updates, no bullshit.

## What it looks like

![DevQuest Card](https://devquest-mu.vercel.app/card/octocat.svg?ascii=2)

## Features

- Real-time data from GitHub
- 10 different ASCII art styles
- Multiple color themes
- Custom accent colors
- Clean, minimal design
- One-click embed for your README
- PNG export
- Works with private stats after GitHub login

## How to use

1. Go to the [constructor](https://devquest-mu.vercel.app/build)
2. Enter your GitHub username (or log in with GitHub)
3. Customize the card
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
