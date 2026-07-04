"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { STAT_KEYS, type StatKey } from "@/lib/card-params";
import { THEME_NAMES } from "@/cards/themes";

const STAT_LABELS: Record<StatKey, string> = {
  repos: "Public Repos",
  followers: "Followers",
  stars: "Total Stars",
  contributions: "Contributions (Year)",
  streak: "Current Streak",
  prs: "Merged Pull Requests",
};

const ASCII_NAMES = [
  "1. Octocat (Classic)",
  "2. Mascot (Dude)",
  "3. Git Branch Graph",
  "4. Coffee Cup",
  "5. Terminal Screen",
  "6. Database/Server Rack",
  "7. Keyboard Block",
  "8. Cloud Outline",
  "9. GitHub Star",
  "10. Code Brackets Tag",
];

export default function BuildPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 font-mono text-neutral-400 text-xs">
        loading...
      </div>
    }>
      <BuildPageContent />
    </Suspense>
  );
}

function BuildPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1) Initialize state from URL params if present, otherwise safe defaults.
  const [username, setUsername] = useState(() => {
    return searchParams.get("username") || "";
  });
  const [theme, setTheme] = useState(() => {
    return searchParams.get("theme") || "macos";
  });
  const [accent, setAccent] = useState(() => {
    return searchParams.get("accent") || "";
  });
  const [ascii, setAscii] = useState(() => {
    const val = parseInt(searchParams.get("ascii") ?? "1", 10);
    return isNaN(val) ? 1 : val;
  });
  const [animate, setAnimate] = useState(() => {
    const val = searchParams.get("animate");
    return val !== "false";
  });
  const [title, setTitle] = useState(() => {
    return searchParams.get("title") || "";
  });
  const [stats, setStats] = useState<StatKey[]>(() => {
    const raw = searchParams.get("stats");
    if (!raw) return ["repos", "followers", "stars", "contributions", "streak"];
    return raw.split(",").filter((k) => STAT_KEYS.includes(k as StatKey)) as StatKey[];
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // 2) Auto-fill username if session becomes active and username is empty
  useEffect(() => {
    if (status === "authenticated" && session?.user && !username) {
      const gitUser = (session.user as unknown as { username?: string }).username ?? session.user.name ?? "";
      if (gitUser) {
        setUsername(gitUser);
      }
    }
  }, [status, session, username]);

  // 3) Sync state changes to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (username) params.set("username", username);
    if (theme !== "macos") params.set("theme", theme);
    if (accent) params.set("accent", accent.replace("#", ""));
    if (ascii !== 1) params.set("ascii", String(ascii));
    if (!animate) params.set("animate", "false");
    if (title) params.set("title", title);

    // Only serialize stats if different from default set
    const defaultStats = ["repos", "followers", "stars", "contributions", "streak"];
    const isDefault =
      stats.length === defaultStats.length &&
      stats.every((s, i) => s === defaultStats[i]);
    if (!isDefault) {
      params.set("stats", stats.join(","));
    }

    const qs = params.toString();
    const target = qs ? `/build?${qs}` : "/build";
    router.replace(target);
  }, [username, theme, accent, ascii, animate, stats, title, router]);

  // 4) Compute card asset and download links
  const targetUser = username.trim() || "octocat";
  const cardUrlParams = new URLSearchParams();
  if (theme !== "macos") cardUrlParams.set("theme", theme);
  if (accent) cardUrlParams.set("accent", accent.replace("#", ""));
  if (ascii !== 1) cardUrlParams.set("ascii", String(ascii));
  if (!animate) cardUrlParams.set("animate", "false");
  if (title) cardUrlParams.set("title", title);
  cardUrlParams.set("stats", stats.join(","));

  // Всегда используем продакшен-домен для ссылок в markdown/html
  const baseUrl = "https://devquest-mu.vercel.app";
  const qs = cardUrlParams.toString();
  const cardUrl = `${baseUrl}/card/${targetUser}.svg${qs ? `?${qs}` : ""}`;
  const pngUrl = `${baseUrl}/card/${targetUser}/png${qs ? `?${qs}` : ""}`;

  const markdownSnippet = `![@${targetUser}'s GitHub Stats](${cardUrl})`;
  const htmlSnippet = `<img src="${cardUrl}" alt="@${targetUser}'s GitHub Stats" />`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleStatToggle = (key: StatKey) => {
    setStats((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleShareOnX = () => {
    const text = `Check out my GitHub profile card! Powered by @devquest.`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(baseUrl)}`;
    window.open(intent, "_blank");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-neutral-800 font-mono">
      {/* Background grid */}
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        strokeDasharray="4 4"
        className="opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-neutral-900 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            \ (^_^) / <span className="text-neutral-500">devquest</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            how to use / tutorial
          </button>

          {session && session.user ? (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-neutral-500">
                @{ (session.user as unknown as { username?: string }).username ?? session.user.name }
              </span>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-200"
            >
              connect github
            </button>
          )}
        </div>
      </header>

      {/* Workspace Grid */}
      <main className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[340px_1fr]">
        {/* Controls Column */}
        <section className="flex flex-col gap-6 rounded-xl border border-neutral-900 bg-neutral-950/80 p-6 shadow-xl">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Configuration
          </h2>

          {/* GitHub username field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. octocat"
              className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200 outline-none transition-colors focus:border-neutral-700"
            />
          </div>

          {/* Custom titlebar title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">Custom Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Theme Default"
              className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200 outline-none transition-colors focus:border-neutral-700"
            />
          </div>

          {/* Theme dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
            >
              {THEME_NAMES.map((name) => (
                <option key={name} value={name} className="bg-neutral-950">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker for accent */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">Custom Accent</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accent.startsWith("#") ? accent : `#${accent}` || "#00ff9c"}
                onChange={(e) => setAccent(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-neutral-800 bg-transparent"
              />
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="Theme Default"
                className="flex-1 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-200 outline-none focus:border-neutral-700"
              />
              {accent && (
                <button
                  onClick={() => setAccent("")}
                  className="text-xs text-neutral-500 hover:text-neutral-300"
                >
                  reset
                </button>
              )}
            </div>
          </div>

          {/* ASCII art index dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">ASCII Art</label>
            <select
              value={ascii}
              onChange={(e) => setAscii(parseInt(e.target.value, 10))}
              className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
            >
              {ASCII_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-neutral-950">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats selection checklist */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500 uppercase">Stats to show</label>
            <div className="flex flex-col gap-2 rounded-md border border-neutral-900 bg-neutral-950 p-3">
              {STAT_KEYS.map((key) => {
                const checked = stats.includes(key);
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between text-xs text-neutral-300 hover:text-neutral-100"
                  >
                    <span>{STAT_LABELS[key]}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleStatToggle(key)}
                      className="cursor-pointer rounded border-neutral-800 bg-neutral-900 text-neutral-100 focus:ring-0 focus:ring-offset-0"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Animation switch */}
          <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
            <span className="text-xs text-neutral-400 uppercase">Cursor Animation</span>
            <button
              onClick={() => setAnimate(!animate)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                animate ? "bg-neutral-100" : "bg-neutral-800"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-neutral-950 transition-transform ${
                  animate ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Preview Column */}
        <section className="flex flex-col gap-6">
          {/* Live Preview Container with BorderBeam */}
          <div className="relative overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950 p-1 shadow-2xl">
            <BorderBeam
              duration={8}
              colorFrom="#c9d1d9"
              colorTo={accent.startsWith("#") ? accent : accent ? `#${accent}` : "#00ff9c"}
              borderWidth={1}
            />
            <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-neutral-950 p-2 select-none">
              {/* Force image update by matching values directly */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardUrl}
                alt="DevQuest Stats Card"
                className="w-full max-w-2xl object-cover rounded-lg"
                width={800}
                height={300}
              />
            </div>
          </div>

          {/* Export Actions Panel */}
          <div className="flex flex-col gap-4 rounded-xl border border-neutral-900 bg-neutral-950/80 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
              Embed & Export
            </h3>

            {/* Markdown */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 uppercase">Markdown</span>
                <button
                  onClick={() => copyToClipboard(markdownSnippet, "md")}
                  className="text-xs text-neutral-300 hover:text-neutral-100"
                >
                  {copiedText === "md" ? "copied!" : "copy"}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={markdownSnippet}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="rounded-md border border-neutral-800 bg-neutral-900/30 px-3 py-1.5 font-mono text-xs text-neutral-400 outline-none"
              />
            </div>

            {/* HTML */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 uppercase">HTML</span>
                <button
                  onClick={() => copyToClipboard(htmlSnippet, "html")}
                  className="text-xs text-neutral-300 hover:text-neutral-100"
                >
                  {copiedText === "html" ? "copied!" : "copy"}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={htmlSnippet}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="rounded-md border border-neutral-800 bg-neutral-900/30 px-3 py-1.5 font-mono text-xs text-neutral-400 outline-none"
              />
            </div>

            {/* Actions list */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-900 pt-4">
              <a
                href={pngUrl}
                download={`${targetUser}-devquest.png`}
                className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              >
                Download PNG
              </a>
              <button
                onClick={handleShareOnX}
                className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              >
                Share on X
              </button>
              <button
                onClick={() => copyToClipboard(markdownSnippet, "github")}
                className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-950 transition-all hover:bg-neutral-200"
              >
                {copiedText === "github" ? "Copied to clipboard!" : "Copy to GitHub Profile"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Notion-style Modal Tutorial */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl font-mono text-neutral-300">
            {/* Close button */}
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-neutral-100 uppercase tracking-wide border-b border-neutral-900 pb-3 mb-4">
              How to Setup DevQuest Card
            </h3>

            <div className="flex flex-col gap-4 text-xs leading-relaxed">
              <div className="flex gap-3">
                <span className="text-neutral-600 font-bold">01</span>
                <div>
                  <strong className="text-neutral-200 block mb-1">Create your Special Profile Repository</strong>
                  <span>Create a public GitHub repository named EXACTLY matching your username (e.g. if your username is <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-400">yiaany</code>, name the repo <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-400">yiaany</code>). This special repo will host your profile README.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-neutral-600 font-bold">02</span>
                <div>
                  <strong className="text-neutral-200 block mb-1">Customize your Card</strong>
                  <span>Use the left panel controls in this constructor to choose your theme, accent color, and select which ASCII art fits your style.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-neutral-600 font-bold">03</span>
                <div>
                  <strong className="text-neutral-200 block mb-1">Copy code in One-Click</strong>
                  <span>Click the <strong className="text-neutral-100">{"\"Copy to GitHub Profile\""}</strong> button below the card preview. This copies the formatted markdown link directly to your clipboard.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-neutral-600 font-bold">04</span>
                <div>
                  <strong className="text-neutral-200 block mb-1">Paste into README.md</strong>
                  <span>Open the <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-400">README.md</code> file in your special profile repository on GitHub and paste the copied link. Save changes. Done!</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-neutral-900 pt-4">
              <button
                onClick={() => setShowTutorial(false)}
                className="rounded-md bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-neutral-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
