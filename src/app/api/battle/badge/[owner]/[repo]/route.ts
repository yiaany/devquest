import { getBattleDateId, getBattleProjects } from "@/lib/battle";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { owner: string; repo: string } },
) {
  const owner = params.owner.trim();
  const repo = params.repo.trim();
  const projectId = `${owner}/${repo}`.toLowerCase();

  const todayId = getBattleDateId();
  const projects = await getBattleProjects(todayId);
  const project = projects.find((p) => p.id === projectId);

  const votesCount = project ? project.votes.length : 0;

  // Render a high-quality SVG badge (Product Hunt style)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="54" viewBox="0 0 220 54">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#020202" />
    </linearGradient>
  </defs>
  <rect width="220" height="54" rx="16" fill="url(#bg-grad)" stroke="#27272a" stroke-width="1.5"/>
  
  <!-- Logo & Title -->
  <text x="16" y="22" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="bold" letter-spacing="1.2" text-transform="uppercase">DEVQUEST BATTLE</text>
  <text x="16" y="41" fill="#f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" letter-spacing="-0.03em">${repo}</text>
  
  <!-- Upvote Button Display -->
  <g transform="translate(142, 10)">
    <rect width="66" height="34" rx="10" fill="#00ff9c" fill-opacity="0.08" stroke="#00ff9c" stroke-width="1.5"/>
    <!-- Upward arrow icon -->
    <path d="M19 21 L23 15 L27 21" fill="none" stroke="#00ff9c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="35" y="22" fill="#00ff9c" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="start" alignment-baseline="middle">${votesCount}</text>
  </g>
</svg>
  `.trim();

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
