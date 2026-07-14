"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { CARDS, CARD_CATEGORIES, CATEGORY_LABELS, type CardCategory } from "@/cards/registry";
import { THEME_NAMES } from "@/cards/themes";
import { type ArtStyle } from "@/cards/styles/frame";
import { STAT_KEYS, type StatKey } from "@/lib/card-params";
import type { BattleProject } from "@/lib/battle";

const BASE_URL = "https://devquest-mu.vercel.app";

const ART_STYLE_LABELS: Record<ArtStyle, string> = {
  terminal: "Terminal Window",
  neobrutalism: "Neobrutalism",
  glass: "Glassmorphism",
  pixel: "Pixel / Retro",
  minimal: "Minimal",
  outrun: "Outrun / Synthwave",
  blueprint: "Blueprint Grid",
  sketch: "Hand-drawn Sketch",
  sticker: "Die-cut Sticker",
  tape: "Taped Scrapbook",
  hologram: "Hologram HUD",
  newspaper: "Vintage Newspaper",
  arcade: "Arcade Cabinet",
  polaroid: "Polaroid Photo",
  circuit: "Circuit Board",
};

const STAT_LABELS: Record<StatKey, string> = {
  repos: "Public repos",
  followers: "Followers",
  stars: "Total stars",
  contributions: "Contributions",
  streak: "Current streak",
  prs: "Merged PRs",
};

const ASCII_NAMES = [
  "Octocat",
  "Mascot",
  "Git Branch",
  "Coffee Cup",
  "Terminal",
  "Database",
  "Keyboard",
  "Cloud",
  "GitHub Star",
  "Code Tag",
];

const GALLERY_PRESETS = [
  { user: "torvalds", theme: "matrix", accent: "00ff9c" },
  { user: "octocat", theme: "paper", accent: "0f172a" },
  { user: "gaearon", theme: "synthwave", accent: "ff3df2" },
  { user: "yyx990803", theme: "dracula", accent: "bd93f9" },
  { user: "sindresorhus", theme: "nord", accent: "88c0d0" },
  { user: "addyosmani", theme: "gruvbox", accent: "fabd2f" },
];

type TabId = "all" | CardCategory;
type OpenMenu = "template" | "style" | "theme" | null;
type Mode = "templates" | "battle";

function buildQuery(params: {
  template: string;
  style: ArtStyle;
  theme: string;
  accent: string;
  title: string;
  ascii: number;
  animate: boolean;
  stats: StatKey[];
  includeStats?: boolean;
  includeAscii?: boolean;
}) {
  const search = new URLSearchParams();
  if (params.template !== "terminal") search.set("template", params.template);
  if (params.style !== "terminal") search.set("style", params.style);
  if (params.theme !== "macos") search.set("theme", params.theme);
  if (params.accent) search.set("accent", params.accent.replace("#", ""));
  if (params.title) search.set("title", params.title);
  if (params.includeAscii && params.ascii !== 1) search.set("ascii", String(params.ascii));
  if (!params.animate) search.set("animate", "false");
  if (params.includeStats) search.set("stats", params.stats.join(","));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export default function Home() {
  const { data: session } = useSession();
  const sessionUser = session?.user as unknown as { username?: string; name?: string } | undefined;
  const loggedInUser = sessionUser?.username ?? sessionUser?.name ?? "";

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("templates");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [selectedId, setSelectedId] = useState(CARDS[0].id);
  const [username, setUsername] = useState("octocat");
  const [style, setStyle] = useState<ArtStyle>(CARDS[0].defaultArtStyle);
  const [theme, setTheme] = useState("macos");
  const [accent, setAccent] = useState("");
  const [title, setTitle] = useState("");
  const [ascii, setAscii] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [stats, setStats] = useState<StatKey[]>([
    "repos",
    "followers",
    "stars",
    "contributions",
    "streak",
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  // Daily Battle States
  const [battleLoading, setBattleLoading] = useState(true);
  const [todayProjects, setTodayProjects] = useState<BattleProject[]>([]);
  const [yesterdayProjects, setYesterdayProjects] = useState<BattleProject[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);

  // Form Fields
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [prodName, setProdName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [alternativeLinksRaw, setAlternativeLinksRaw] = useState("");
  const [license, setLicense] = useState("");
  const [uploadedThumbnail, setUploadedThumbnail] = useState("");
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState("");
  const [makersRaw, setMakersRaw] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises).then((base64s) => {
        setUploadedScreenshots((prev) => [...prev, ...base64s]);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setUploadedScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Selected Battle Project Details
  const [selectedProject, setSelectedProject] = useState<BattleProject | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loggedInUser) setUsername(loggedInUser);
  }, [loggedInUser]);

  // Load Battle Data
  const loadBattleData = async () => {
    try {
      setBattleLoading(true);
      const res = await fetch("/api/battle");
      if (res.ok) {
        const data = await res.json();
        setTodayProjects(data.todayProjects ?? []);
        setYesterdayProjects(data.yesterdayProjects ?? []);
      }
    } catch (e) {
      console.error("Failed to load battle data:", e);
    } finally {
      setBattleLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadBattleData();
    }
  }, [mounted]);

  // Time left timer (resets daily at 07:00 UTC)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setUTCHours(7, 0, 0, 0);
      if (now.getUTCHours() >= 7) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 1);
      }
      const diffMs = nextReset.getTime() - now.getTime();
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / (1000 * 60)) % 60;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedCard = CARDS.find((card) => card.id === selectedId) ?? CARDS[0];
  const availableStyles = selectedCard.artStyles;

  useEffect(() => {
    if (!availableStyles.includes(style)) setStyle(selectedCard.defaultArtStyle);
  }, [availableStyles, selectedCard.defaultArtStyle, style]);

  const filteredCards = useMemo(() => {
    const term = query.trim().toLowerCase();
    return CARDS.filter((card) => {
      const matchesTab = activeTab === "all" || card.category === activeTab;
      const searchable = `${card.name} ${card.description} ${CATEGORY_LABELS[card.category]}`.toLowerCase();
      return matchesTab && (!term || searchable.includes(term));
    });
  }, [activeTab, query]);

  const targetUser = username.trim() || loggedInUser || "octocat";
  const cardQuery = buildQuery({
    template: selectedCard.id,
    style,
    theme,
    accent,
    title,
    ascii,
    animate,
    stats,
    includeAscii: selectedCard.controls.ascii,
    includeStats: selectedCard.controls.stats,
  });
  const liveSvgUrl = `/card/${targetUser}.svg${cardQuery}`;
  const fullLiveSvgUrl = `${BASE_URL}/card/${targetUser}.svg${cardQuery}`;
  const pngUrl = `${BASE_URL}/card/${targetUser}/png${cardQuery}`;
  const signUrl = `${BASE_URL}/${targetUser}/sign`;
  const markdown = selectedCard.interactive
    ? `[![@${targetUser}'s DevQuest ${selectedCard.name}](${fullLiveSvgUrl})](${signUrl})`
    : `![@${targetUser}'s DevQuest ${selectedCard.name}](${fullLiveSvgUrl})`;
  const html = selectedCard.interactive
    ? `<a href="${signUrl}"><img src="${fullLiveSvgUrl}" alt="@${targetUser}'s DevQuest ${selectedCard.name}" /></a>`
    : `<img src="${fullLiveSvgUrl}" alt="@${targetUser}'s DevQuest ${selectedCard.name}" />`;

  function openCard(cardId: string) {
    const card = CARDS.find((item) => item.id === cardId) ?? CARDS[0];
    setSelectedId(card.id);
    setStyle(card.defaultArtStyle);
    setTitle("");
    setOpenMenu(null);
    setIsPanelOpen(true);
  }

  function previewTemplate(cardId: string) {
    const card = CARDS.find((item) => item.id === cardId) ?? CARDS[0];
    setSelectedId(card.id);
    if (!card.artStyles.includes(style)) setStyle(card.defaultArtStyle);
  }

  function chooseTemplate(cardId: string) {
    previewTemplate(cardId);
    setOpenMenu(null);
  }

  function chooseStyle(item: ArtStyle) {
    setStyle(item);
    setOpenMenu(null);
  }

  function chooseTheme(item: string) {
    setTheme(item);
    setOpenMenu(null);
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  }

  function shareOnX() {
    const text = `I made a live GitHub profile card with DevQuest: ${selectedCard.name}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullLiveSvgUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function toggleStat(stat: StatKey) {
    setStats((current) => {
      if (current.includes(stat)) return current.length === 1 ? current : current.filter((item) => item !== stat);
      return [...current, stat];
    });
  }

  // Handle Battle Actions
  const handleVote = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loggedInUser) {
      signIn("github");
      return;
    }

    try {
      const res = await fetch("/api/battle/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTodayProjects((prev) =>
          prev
            .map((p) => {
              if (p.id === projectId.toLowerCase()) {
                const votes = data.hasVoted
                  ? [...p.votes, loggedInUser]
                  : p.votes.filter((v) => v.toLowerCase() !== loggedInUser.toLowerCase());
                return { ...p, votes };
              }
              return p;
            })
            .sort((a, b) => b.votes.length - a.votes.length)
        );

        if (selectedProject?.id === projectId.toLowerCase()) {
          setSelectedProject((p) => {
            if (!p) return null;
            const votes = data.hasVoted
              ? [...p.votes, loggedInUser]
              : p.votes.filter((v) => v.toLowerCase() !== loggedInUser.toLowerCase());
            return { ...p, votes };
          });
        }
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) {
      signIn("github");
      return;
    }

    setSubmittingProject(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Form parsing
    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const alternativeLinks = alternativeLinksRaw
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    const makers = makersRaw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner,
          repoName,
          name: prodName,
          tagline,
          description,
          keywords,
          alternativeLinks,
          license: license || "-",
          thumbnail: uploadedThumbnail,
          screenshots: uploadedScreenshots,
          videoLink,
          makers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        setRepoOwner("");
        setRepoName("");
        setProdName("");
        setTagline("");
        setDescription("");
        setKeywordsRaw("");
        setAlternativeLinksRaw("");
        setLicense("");
        setUploadedThumbnail("");
        setUploadedScreenshots([]);
        setVideoLink("");
        setMakersRaw("");
        loadBattleData();
      } else {
        setSubmitError(data.error ?? "Failed to submit project.");
      }
    } catch {
      setSubmitError("Failed to connect to server.");
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !selectedProject || !commentText.trim()) return;

    setCommenting(true);
    try {
      const res = await fetch("/api/battle/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          text: commentText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newComment = data.comment;
        setSelectedProject((p) => {
          if (!p) return null;
          return { ...p, comments: [...p.comments, newComment] };
        });
        setTodayProjects((prev) =>
          prev.map((p) => {
            if (p.id === selectedProject.id) {
              return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
          })
        );
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommenting(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "Trending" },
    ...CARD_CATEGORIES.map((category) => ({ id: category, label: CATEGORY_LABELS[category] })),
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-zinc-50 selection:bg-zinc-700">
      <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-[#050505]/90 backdrop-blur-xl">
        <div className="flex h-20 min-w-0 items-center justify-between px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex h-12 min-w-0 items-center gap-3 text-zinc-50">
            <Link
              aria-label="DevQuest"
              href="/"
              className="flex shrink-0 items-center gap-2 font-mono text-lg font-bold tracking-tight transition-opacity hover:opacity-70"
            >
              <span>\ (^_^) /</span>
              <span className="text-zinc-500">devquest</span>
            </Link>
            <span className="w-2.5 shrink-0 text-zinc-600" aria-hidden="true">/</span>
            <Link href="/" className="w-[76px] shrink-0 text-sm text-zinc-500 transition-opacity hover:opacity-70">
              Gallery
            </Link>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setMode(mode === "templates" ? "battle" : "templates")}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold text-emerald-400 transition-all hover:bg-zinc-800 hover:text-emerald-300"
            >
              {mode === "templates" ? "Daily Battle ⚔️" : "Templates Gallery 🎨"}
            </button>
            {session?.user ? (
              <>
                <span className="hidden max-w-[180px] truncate text-zinc-500 md:inline">@{loggedInUser}</span>
                <button onClick={() => signOut()} className="rounded-full border border-zinc-800 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-900">
                  Sign out
                </button>
              </>
            ) : (
              <button onClick={() => signIn("github")} className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-200 transition-colors hover:bg-zinc-900">
                GitHub auth
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        {mode === "templates" ? (
          <>
            <section className="mx-auto flex max-w-[980px] flex-col items-center px-4 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
              <div className="flex h-7 w-[51px] items-center justify-center rounded-full border border-zinc-800 px-3 py-1">
                <span className="text-center text-xs text-zinc-500">Beta</span>
              </div>
              <h1 className="mt-6 w-full max-w-[780px] text-balance text-[44px] font-normal leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-[64px] sm:leading-[0.98]">
                <span className="sm:hidden">High-quality profile card templates for developers</span>
                <span className="hidden sm:block">High-quality profile card<br />templates for developers</span>
              </h1>
              <p className="mt-6 max-w-[580px] text-base leading-6 text-zinc-500">
                Browse live GitHub card templates, open any style, customize theme, accent, stats and frame, then copy Markdown, download PNG, or share it on X.
              </p>

              <div className="mx-auto mt-10 w-full max-w-[640px]">
                <div className="flex h-[60px] items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 py-[7px] pl-4 pr-[7px] sm:pl-5">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search card templates"
                    className="h-full min-w-0 flex-1 bg-transparent text-left text-base text-zinc-200 outline-none placeholder:text-zinc-600"
                  />
                  <button className="inline-flex h-11 min-w-[92px] shrink-0 items-center justify-center rounded-lg bg-zinc-50 px-5 text-sm font-medium text-zinc-950 opacity-90 transition-opacity hover:opacity-100">
                    Search
                  </button>
                </div>
                <nav aria-label="Featured card resources" className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm leading-6 text-zinc-500">
                  <button onClick={() => setActiveTab("profile")} className="transition-colors hover:text-zinc-100">Profile cards</button>
                  <button onClick={() => setActiveTab("interactive")} className="transition-colors hover:text-zinc-100">Guestbook cards</button>
                  <button onClick={() => setQuery("language")} className="transition-colors hover:text-zinc-100">Language widgets</button>
                </nav>
              </div>
            </section>

            <section className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      data-active={activeTab === tab.id ? "" : undefined}
                      onClick={() => setActiveTab(tab.id)}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#050505] px-4 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-900/70 hover:text-zinc-100 data-active:bg-zinc-900 data-active:font-semibold data-active:text-zinc-50"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-zinc-600">{filteredCards.length} templates</p>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-3 xl:gap-x-8">
                {filteredCards.map((card, index) => {
                  const preset = GALLERY_PRESETS[index % GALLERY_PRESETS.length];
                  const previewStyle = card.defaultArtStyle;
                  const previewQuery = buildQuery({
                    template: card.id,
                    style: previewStyle,
                    theme: preset.theme,
                    accent: preset.accent,
                    title: "",
                    ascii: 1,
                    animate: false,
                    stats,
                    includeAscii: false,
                    includeStats: card.controls.stats,
                  });
                  return (
                    <article key={card.id} className="group/card relative rounded-[32px]">
                      <div
                        onClick={() => openCard(card.id)}
                        className="block w-full cursor-pointer rounded-[32px] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700/70"
                      >
                        <div className="overflow-hidden rounded-[32px] bg-zinc-900 p-8 transition-colors duration-200 group-hover/card:bg-zinc-800/80 sm:p-10 xl:p-12">
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950 transition-transform duration-300 group-hover/card:scale-[1.02]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/card/${preset.user}.svg${previewQuery}`}
                              alt={`${card.name} preview`}
                              className="h-full w-full object-contain p-2"
                              loading="lazy"
                              width={800}
                              height={300}
                            />
                          </div>
                          <div className="min-w-0 pb-1 pt-6">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <h3 className="truncate text-xl font-semibold leading-7 tracking-[-0.02em] text-zinc-50">{card.name}</h3>
                              <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-500">
                                {CATEGORY_LABELS[card.category]}
                              </span>
                            </div>
                            <p className="truncate text-sm font-medium text-zinc-500">{card.description}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          /* Daily Battle Mode (Product Hunt Style) */
          <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-50 sm:text-5xl">
                Daily Battle ⚔️
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-zinc-500">
                Submit your GitHub repository, gather upvotes, discuss, and battle to become the #1 Daily Repository.
              </p>
              <div className="mt-6 inline-flex flex-col gap-2 items-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 font-mono text-sm text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Next battle starts in:</span>
                  <span className="font-bold text-emerald-400">{timeLeft}</span>
                </div>
                <div className="text-xs text-amber-400 mt-1 font-mono">
                  🚨 To submit, you must star our repository:{" "}
                  <a
                    href="https://github.com/yiaany/devquest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-amber-300 hover:text-amber-200"
                  >
                    github.com/yiaany/devquest
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* Left Column: Battle Projects */}
              <section className="space-y-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-400">Today&apos;s Contenders</h2>

                {battleLoading ? (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/20">
                    <span className="text-zinc-600 animate-pulse">Loading battle projects...</span>
                  </div>
                ) : todayProjects.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center">
                    <p className="text-zinc-500">No repositories submitted for today&apos;s battle yet.</p>
                    <p className="text-xs text-zinc-600 mt-1">Be the first to submit using the form on the right!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayProjects.map((project, index) => {
                      const hasVoted = loggedInUser && project.votes.some((v) => v.toLowerCase() === loggedInUser.toLowerCase());
                      return (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/30"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="font-mono text-zinc-600 font-bold w-6 text-center">#{index + 1}</span>
                            <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={project.thumbnail || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=120"}
                                alt={project.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <h3 className="truncate font-semibold text-zinc-50 text-base">{project.name}</h3>
                                <span className="text-[10px] text-zinc-500 font-mono">@{project.submittedBy}</span>
                              </div>
                              <p className="truncate text-xs text-zinc-400 mt-0.5">{project.tagline}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-mono">
                                  Lic: {project.license}
                                </span>
                                {project.keywords.slice(0, 3).map((kw) => (
                                  <span key={kw} className="rounded-full bg-zinc-900/40 border border-zinc-850 px-2 py-0.5 text-[9px] text-zinc-500">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={(e) => handleVote(project.id, e)}
                              className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 transition-all ${
                                hasVoted
                                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                  : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-50"
                              }`}
                            >
                              <span className="text-xs">▲</span>
                              <span className="font-bold text-sm mt-0.5">{project.votes.length}</span>
                            </button>
                            <div className="text-center px-2 py-1 text-xs text-zinc-600 border border-transparent rounded-lg hover:border-zinc-850">
                              💬 {project.comments.length}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Right Column: Submit Form & Yesterday Winners */}
              <aside className="space-y-6">
                {/* Submit Form */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Launch Project 📝</h3>
                  <p className="text-xs text-zinc-500 mt-1">Submit your repo to the battle. Star check required.</p>

                  <form onSubmit={handleSubmitProject} className="mt-5 space-y-4">
                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      GitHub Owner
                      <input
                        required
                        value={repoOwner}
                        onChange={(e) => setRepoOwner(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="facebook"
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      GitHub Repo Name
                      <input
                        required
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="react"
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Product Name
                      <input
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="Notion"
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Tagline ({60 - tagline.length} left)
                      <input
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="Note app for developers"
                        maxLength={60}
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Description ({260 - description.length} left)
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600 resize-none"
                        placeholder="A full description detailing features and benefits."
                        maxLength={260}
                        rows={3}
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Keywords (up to 3, comma separated)
                      <input
                        value={keywordsRaw}
                        onChange={(e) => setKeywordsRaw(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="Productivity, AI, Developer Tools"
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Alternative Links (comma separated)
                      <input
                        value={alternativeLinksRaw}
                        onChange={(e) => setAlternativeLinksRaw(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="https://play.google.com/store"
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      License
                      <input
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="MIT (or leave empty for '-')"
                      />
                    </label>

                    <div>
                      <span className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Thumbnail / Logo (GIF/PNG/JPG)</span>
                      <div className="mt-2 flex items-center gap-3">
                        <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-850 bg-zinc-900/40 px-4 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadedThumbnail ? (
                          <div className="flex items-center gap-2">
                            <div className="size-11 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={uploadedThumbnail} alt="preview" className="h-full w-full object-cover" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setUploadedThumbnail("")}
                              className="text-xs text-red-400 hover:text-red-350 font-mono"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">No file chosen</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Screenshots (minimum 2)</span>
                      <div className="mt-2 space-y-3">
                        <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-850 bg-zinc-900/40 px-4 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors">
                          Upload Screenshot
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleScreenshotsUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadedScreenshots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {uploadedScreenshots.map((s, idx) => (
                              <div key={idx} className="relative size-14 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={s} alt="screenshot" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeScreenshot(idx)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-400 font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">No screenshots uploaded</span>
                        )}
                      </div>
                    </div>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      YouTube Video Link (Optional)
                      <input
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </label>

                    <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                      Makers / Co-authors (comma separated usernames)
                      <input
                        value={makersRaw}
                        onChange={(e) => setMakersRaw(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                        placeholder="octocat, torvalds"
                      />
                    </label>

                    {submitError && (
                      <p className="text-xs text-red-400 font-medium leading-relaxed">{submitError}</p>
                    )}
                    {submitSuccess && (
                      <p className="text-xs text-emerald-400 font-medium">Successfully submitted to battle! 🎉</p>
                    )}

                    <button
                      type="submit"
                      disabled={submittingProject}
                      className="w-full rounded-full bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85 disabled:opacity-50"
                    >
                      {submittingProject ? "Submitting..." : "Submit to Battle"}
                    </button>
                  </form>
                </div>

                {/* Yesterday's Winners */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Yesterday&apos;s Winners 🏆</h3>
                  <div className="mt-4 space-y-3">
                    {yesterdayProjects.length === 0 ? (
                      <p className="text-xs text-zinc-600 font-medium py-2">No winners from yesterday.</p>
                    ) : (
                      yesterdayProjects.slice(0, 3).map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                          <div className="min-w-0">
                            <span className="text-xs mr-1">
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                            </span>
                            <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                            <p className="text-[10px] text-zinc-600 truncate">{p.repoOwner}/{p.repoName}</p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            ▲ {p.votes.length}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Templates Customizer Modal */}
      {isPanelOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-6">
          <div className="mx-auto grid max-w-6xl gap-4 rounded-[32px] border border-zinc-800 bg-[#050505] p-4 shadow-2xl lg:grid-cols-[1fr_360px] lg:p-6">
            <section className="overflow-hidden rounded-[28px] bg-zinc-900 p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">{CATEGORY_LABELS[selectedCard.category]}</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-5xl">{selectedCard.name}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{selectedCard.description}</p>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800">
                  Close
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-700 bg-zinc-950 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={liveSvgUrl} alt={`${selectedCard.name} live preview`} className="w-full rounded-xl object-contain" width={800} height={300} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href={pngUrl} download={`${targetUser}-devquest.png`} className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-80">
                  Download PNG
                </a>
                <button onClick={shareOnX} className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800">
                  Share on X
                </button>
              </div>
            </section>

            <aside className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Customize</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Template</p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === "template" ? null : "template")}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-left text-sm text-zinc-100 outline-none transition-colors hover:border-zinc-600"
                    >
                      <span>{selectedCard.name}</span>
                      <span className="text-zinc-600">⌄</span>
                    </button>
                    {openMenu === "template" ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#050505] p-2 shadow-2xl">
                        {CARD_CATEGORIES.map((category) => (
                          <div key={category}>
                            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
                              {CATEGORY_LABELS[category]}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {CARDS.filter((card) => card.category === category).map((card) => (
                                <button
                                  key={card.id}
                                  type="button"
                                  onMouseEnter={() => previewTemplate(card.id)}
                                  onFocus={() => previewTemplate(card.id)}
                                  onClick={() => chooseTemplate(card.id)}
                                  data-active={selectedCard.id === card.id ? "" : undefined}
                                  className="rounded-xl px-2 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50 data-active:bg-zinc-900 data-active:text-zinc-50"
                                >
                                  {card.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  GitHub username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600" placeholder="octocat" />
                </label>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Art style</p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === "style" ? null : "style")}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-left text-sm text-zinc-100 outline-none transition-colors hover:border-zinc-600"
                    >
                      <span>{ART_STYLE_LABELS[style]}</span>
                      <span className="text-zinc-600">⌄</span>
                    </button>
                    {openMenu === "style" ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-60 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#050505] p-2 shadow-2xl">
                        {availableStyles.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onMouseEnter={() => setStyle(item)}
                            onFocus={() => setStyle(item)}
                            onClick={() => chooseStyle(item)}
                            data-active={style === item ? "" : undefined}
                            className="block w-full rounded-xl px-2 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50 data-active:bg-zinc-900 data-active:text-zinc-50"
                          >
                            {ART_STYLE_LABELS[item]}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Theme</p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === "theme" ? null : "theme")}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-left text-sm text-zinc-100 outline-none transition-colors hover:border-zinc-600"
                    >
                      <span>{theme}</span>
                      <span className="text-zinc-600">⌄</span>
                    </button>
                    {openMenu === "theme" ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-60 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#050505] p-2 shadow-2xl">
                        {THEME_NAMES.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onMouseEnter={() => setTheme(item)}
                            onFocus={() => setTheme(item)}
                            onClick={() => chooseTheme(item)}
                            data-active={theme === item ? "" : undefined}
                            className="block w-full rounded-xl px-2 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50 data-active:bg-zinc-900 data-active:text-zinc-50"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {selectedCard.controls.title ? (
                  <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                    Custom title
                    <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600" placeholder="devquest" maxLength={20} />
                  </label>
                ) : null}

                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Accent
                  <div className="mt-2 flex gap-2">
                    <input type="color" value={accent ? (accent.startsWith("#") ? accent : `#${accent}`) : "#00ff9c"} onChange={(event) => setAccent(event.target.value)} className="h-10 w-12 rounded-xl border border-zinc-800 bg-[#050505]" />
                    <input value={accent} onChange={(event) => setAccent(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600" placeholder="theme default" />
                  </div>
                </label>

                {selectedCard.controls.ascii ? (
                  <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                    ASCII art
                    <select value={ascii} onChange={(event) => setAscii(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600">
                      {ASCII_NAMES.map((item, index) => <option key={item} value={index + 1}>{item}</option>)}
                    </select>
                  </label>
                ) : null}

                {selectedCard.controls.stats ? (
                  <div className="rounded-2xl border border-zinc-800 bg-[#050505] p-3">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Stats</p>
                    <div className="space-y-2">
                      {STAT_KEYS.map((stat) => (
                        <label key={stat} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-zinc-300">
                          <span>{STAT_LABELS[stat]}</span>
                          <input type="checkbox" checked={stats.includes(stat)} onChange={() => toggleStat(stat)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button onClick={() => setAnimate(!animate)} className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-[#050505] px-3 py-3 text-sm text-zinc-300">
                  Cursor animation
                  <span className={`h-5 w-9 rounded-full p-1 transition-colors ${animate ? "bg-zinc-100" : "bg-zinc-800"}`}>
                    <span className={`block size-3 rounded-full transition-transform ${animate ? "translate-x-4 bg-zinc-950" : "bg-zinc-500"}`} />
                  </span>
                </button>
              </div>

              <div className="mt-6 space-y-3 border-t border-zinc-800 pt-5">
                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Markdown
                  <input
                    readOnly
                    value={markdown}
                    onClick={(event) => event.currentTarget.select()}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 font-mono text-xs normal-case tracking-normal text-zinc-400 outline-none"
                  />
                </label>

                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  HTML
                  <input
                    readOnly
                    value={html}
                    onClick={(event) => event.currentTarget.select()}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 font-mono text-xs normal-case tracking-normal text-zinc-400 outline-none"
                  />
                </label>

                <button onClick={() => copy(markdown, "md")} className="w-full rounded-full bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-80">
                  {copied === "md" ? "Markdown copied" : "Copy Markdown"}
                </button>
                <button onClick={() => copy(html, "html")} className="w-full rounded-full border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800">
                  {copied === "html" ? "HTML copied" : "Copy HTML"}
                </button>
                <button onClick={() => copy(markdown, "github")} className="w-full rounded-full border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800">
                  {copied === "github" ? "Copied to clipboard" : "Copy to GitHub Profile"}
                </button>
                {!session?.user ? (
                  <button onClick={() => signIn("github")} className="w-full rounded-full border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800">
                    Connect GitHub
                  </button>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {/* Battle Project Details Modal */}
      {selectedProject ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-6">
          <div className="mx-auto max-w-4xl rounded-[32px] border border-zinc-800 bg-[#050505] p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProject.thumbnail || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=120"}
                    alt={selectedProject.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-zinc-50">
                      {selectedProject.name}
                    </h2>
                    <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400 font-mono">
                      License: {selectedProject.license}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    Submitted by @{selectedProject.submittedBy} (Hunter) · {selectedProject.repoOwner}/{selectedProject.repoName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selectedProject.keywords.map((kw) => (
                <span key={kw} className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {kw}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_240px]">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tagline</h4>
                  <p className="mt-2 text-base text-zinc-100 font-semibold">{selectedProject.tagline}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{selectedProject.description}</p>
                </div>

                {/* Screenshots Gallery */}
                {selectedProject.screenshots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Screenshots</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedProject.screenshots.map((s, i) => (
                        <div key={i} className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s} alt={`screenshot ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Video Section */}
                {selectedProject.videoLink && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Video Demonstration</h4>
                    <a
                      href={selectedProject.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      Play video on YouTube ↗️
                    </a>
                  </div>
                )}
              </div>

              <aside className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-650">Makers</h4>
                  <div className="mt-3 space-y-2">
                    {selectedProject.makers.map((maker) => (
                      <a
                        key={maker}
                        href={`https://github.com/${maker}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-[#050505] p-2 hover:border-zinc-800"
                      >
                        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
                          {maker[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-zinc-300">@{maker}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {selectedProject.alternativeLinks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-650">Additional Links</h4>
                    <div className="mt-2 space-y-2">
                      {selectedProject.alternativeLinks.map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-zinc-500 truncate hover:text-zinc-300 hover:underline"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <a
                href={selectedProject.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85"
              >
                Launch Product 🌐
              </a>
              <a
                href={`https://github.com/${selectedProject.repoOwner}/${selectedProject.repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-900"
              >
                GitHub Code 🐙
              </a>
              <button
                onClick={(e) => handleVote(selectedProject.id, e)}
                className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors ${
                  loggedInUser && selectedProject.votes.some((v) => v.toLowerCase() === loggedInUser.toLowerCase())
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                ▲ Upvote ({selectedProject.votes.length})
              </button>
            </div>

            {/* Badge integration block */}
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h3 className="text-sm font-semibold tracking-wider text-zinc-200">Daily Battle Badge</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Show your upvotes on GitHub by inserting this live SVG badge into your repository README.
              </p>
              
              <div className="mt-4 rounded-xl border border-zinc-800 bg-[#050505] p-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/battle/badge/${selectedProject.repoOwner}/${selectedProject.repoName}`}
                  alt="Daily Battle Badge"
                  className="object-contain"
                />
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Badge Markdown Code
                  <input
                    readOnly
                    value={`[![DevQuest Daily Battle](${BASE_URL}/api/battle/badge/${selectedProject.repoOwner}/${selectedProject.repoName})](${BASE_URL})`}
                    onClick={(event) => event.currentTarget.select()}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 font-mono text-xs text-zinc-400 outline-none"
                  />
                </label>
                <button
                  onClick={() =>
                    copy(
                      `[![DevQuest Daily Battle](${BASE_URL}/api/battle/badge/${selectedProject.repoOwner}/${selectedProject.repoName})](${BASE_URL})`,
                      "badge-md"
                    )
                  }
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-850"
                >
                  {copied === "badge-md" ? "Copied!" : "Copy Badge Markdown"}
                </button>
              </div>
            </div>

            {/* Discussion / Comments Section */}
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-bold text-zinc-200">Discussion ({selectedProject.comments.length})</h3>

              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="mt-4">
                {loggedInUser ? (
                  <div className="flex gap-3">
                    <input
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ask a question or leave feedback..."
                      className="flex-1 rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                      maxLength={300}
                    />
                    <button
                      type="submit"
                      disabled={commenting || !commentText.trim()}
                      className="rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85 disabled:opacity-50"
                    >
                      {commenting ? "Posting..." : "Comment"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => signIn("github")}
                    className="w-full text-center text-xs text-zinc-500 py-3 border border-dashed border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                  >
                    Sign in via GitHub to join the discussion.
                  </button>
                )}
              </form>

              {/* Comments List */}
              <div className="mt-6 space-y-3">
                {selectedProject.comments.length === 0 ? (
                  <p className="text-xs text-zinc-600 py-2">No comments yet. Start the conversation!</p>
                ) : (
                  selectedProject.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 rounded-xl border border-zinc-900 bg-zinc-950/20 p-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-300 text-xs">
                        {comment.author[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-200">@{comment.author}</span>
                          <span className="text-[9px] text-zinc-650">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
