"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-neutral-800">
      {/* Notion Grid backdrop */}
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        strokeDasharray="4 4"
        className="opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
      />

      {/* Navigation Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-neutral-900 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-tight">
            \ (^_^) / <span className="text-neutral-500">devquest</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 font-mono text-sm">
          <Link
            href="/build"
            className="hidden text-neutral-400 transition-colors hover:text-neutral-200 sm:inline-block"
          >
            build card
          </Link>
          {session && session.user ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-neutral-500 sm:inline-block">
                @{ (session.user as unknown as { username?: string }).username ?? session.user.name }
              </span>
              <Link
                href="/build"
                className="rounded-md bg-neutral-100 px-3 py-1.5 font-medium text-neutral-950 transition-all hover:bg-neutral-200"
              >
                constructor
              </Link>
              <button
                onClick={() => signOut()}
                className="text-neutral-500 hover:text-neutral-300"
              >
                sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 font-medium text-neutral-200 transition-all hover:bg-neutral-800 hover:text-neutral-100"
            >
              sign in via github
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center sm:py-32">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 font-mono text-xs text-neutral-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00ff9c]" />
            33 templates · 10 art styles · 9 themes · live guestbook
          </div>
          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Turn your GitHub stats into a profile card worth showing off.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-neutral-400 sm:text-lg">
            33 live-rendered card templates for your profile README — from terminal stats and contribution heatmaps to an interactive guestbook visitors can actually sign. No server setup, no static image lag.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/build"
              className="rounded-lg bg-neutral-100 px-6 py-3 font-mono font-medium text-neutral-950 transition-all hover:bg-neutral-200"
            >
              build yours now
            </Link>
            <button
              onClick={() => signIn("github")}
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-6 py-3 font-mono text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-200"
            >
              login with github
            </button>
          </div>
        </div>

        {/* Visual Preview container with Magic UI BorderBeam */}
        <div className="relative mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950 p-1 shadow-2xl">
          <BorderBeam duration={6} colorFrom="#c9d1d9" colorTo="#00ff9c" borderWidth={1} />
          {/* Card SVG embed wrapper */}
          <div className="overflow-hidden rounded-lg bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/card/octocat.svg?template=profile-hero&theme=tokyonight&style=glass"
              alt="DevQuest Card Preview"
              className="w-full object-cover"
              width={800}
              height={300}
            />
          </div>
        </div>
      </section>

      {/* Live gallery */}
      <section className="relative z-10 border-t border-neutral-900 bg-neutral-950/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-mono text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            live gallery
          </h2>
          <h3 className="mx-auto mt-4 max-w-xl text-center text-2xl font-bold sm:text-3xl">
            Every card renders live from real data.
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-neutral-400">
            These aren&apos;t screenshots — each one is an SVG generated on demand. Mix any template with a theme, art-style frame, and accent color.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "/card/torvalds.svg?template=heatmap&theme=matrix&style=terminal", label: "Contribution Heatmap" },
              { src: "/card/octocat.svg?template=receipt&theme=paper&style=minimal", label: "Dev Receipt" },
              { src: "/card/gaearon.svg?template=rank-badge&theme=synthwave&style=outrun", label: "Rank Badge" },
              { src: "/card/octocat.svg?template=language-donut&theme=dracula&style=neobrutalism", label: "Language Donut" },
              { src: "/card/gaearon.svg?template=id-card&theme=nord&style=blueprint", label: "Dev ID Card" },
              { src: "/card/octocat.svg?template=guestbook&theme=gruvbox&style=sticker", label: "Guestbook" },
            ].map((card) => (
              <div
                key={card.label}
                className="group overflow-hidden rounded-lg border border-neutral-900 bg-neutral-950 p-2 transition-colors hover:border-neutral-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.src}
                  alt={`${card.label} card preview`}
                  className="w-full rounded object-cover"
                  width={400}
                  height={200}
                  loading="lazy"
                />
                <p className="mt-2 px-1 pb-1 font-mono text-xs text-neutral-500">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center font-mono text-xs text-neutral-600">
            + 27 more templates in the{" "}
            <Link href="/build" className="text-neutral-400 underline underline-offset-4 hover:text-neutral-200">
              constructor
            </Link>
          </p>
        </div>
      </section>

      {/* Interactive guestbook highlight */}
      <section className="relative z-10 border-t border-neutral-900 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 sm:grid-cols-2">
          <div>
            <h2 className="font-mono text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              interactive
            </h2>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
              A README that people can actually sign.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
              The Guestbook card turns a static README into a living wall. Visitors leave a signed message, and the card re-renders with their real signatures. Backed by a public sign API — sanitized, length-capped, and cached.
            </p>
            <div className="mt-6 rounded-lg border border-neutral-900 bg-neutral-950 p-4 font-mono text-xs text-neutral-500">
              <span className="text-neutral-600">visit to sign →</span>{" "}
              <span className="text-neutral-300">/your-username/sign</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-900 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/card/octocat.svg?template=guestbook&theme=gruvbox&style=sticker"
              alt="Interactive guestbook card"
              className="w-full rounded object-cover"
              width={400}
              height={200}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-neutral-900 bg-neutral-950/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-mono text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            process
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "OAuth Connect",
                desc: "Authorize using your GitHub profile. Safe, read-only scope.",
              },
              {
                step: "02",
                title: "Pick & Customize",
                desc: "Choose from 33 templates, 10 art styles, and 9 themes. Set your accent, ASCII art, and which stats to show.",
              },
              {
                step: "03",
                title: "README Embed",
                desc: "Paste the generated markdown link into the README.md of your special repository named exactly matching your GitHub username.",
              },
            ].map((item) => (
              <div key={item.step} className="border border-neutral-900 bg-neutral-950 p-6 rounded-lg font-mono">
                <span className="text-sm text-neutral-600 font-bold">{item.step}</span>
                <h3 className="mt-4 text-base font-bold text-neutral-200">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience / Who it is for */}
      <section className="relative z-10 border-t border-neutral-900 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-mono text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            audience
          </h2>
          <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
            Designed for engineers who care about detail.
          </h3>
          <p className="mt-4 text-neutral-400 leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
            Whether you want a clean stat card for job applications, an aesthetic ASCII window to show your stack, or an interactive guestbook to make your profile stand out — DevQuest keeps it minimal and fully customizable.
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-neutral-900 px-6 py-8 text-center font-mono text-xs text-neutral-600">
          <p>© 2026 DevQuest. CC BY-NC-SA 4.0. Open-source on GitHub.</p>
      </footer>
    </div>
  );
}
