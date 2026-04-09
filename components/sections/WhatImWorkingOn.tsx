"use client";

import { useEffect, useState } from "react";
import { blogPosts, personal, socialLinks } from "@/lib/content";

type GitHubRepo = {
  name: string;
  full_name: string;
  default_branch: string;
  pushed_at: string;
  html_url: string;
  fork: boolean;
};

type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: {
      date?: string;
    };
  };
};

type RecentCommit = {
  sha: string;
  message: string;
  repoName: string;
  committedAt: string;
  url: string;
};

type MediumPost = {
  title: string;
  link: string;
  date: string;
};

const USERNAME = "anipaleja";
const MAX_COMMITS = 15;
const REPO_SAMPLE_SIZE = 6;
const COMMITS_PER_REPO = 5;
const THEME_STORAGE_KEY = "ap-theme";
const EFFECT_STORAGE_KEY = "ap-grid-effect";
const CLICKS_STORAGE_KEY = "ap-click-count";
const MEDIUM_FEED_URL = "https://medium.com/feed/@anipaleja";

type ThemePreset = {
  id: "latte" | "frappe" | "macchiato" | "mocha";
  label: string;
  swatches: string[];
};

const themePresets: ThemePreset[] = [
  {
    id: "latte",
    label: "Latte",
    swatches: ["#f3f3ed", "#ffe56a", "#ff7a59", "#0059ff"],
  },
  {
    id: "frappe",
    label: "Frappe",
    swatches: ["#f4f1e6", "#7dd2ff", "#58b38f", "#15416d"],
  },
  {
    id: "macchiato",
    label: "Macchiato",
    swatches: ["#fff0df", "#ff8a5c", "#d1495b", "#293241"],
  },
  {
    id: "mocha",
    label: "Mocha",
    swatches: ["#171b2a", "#6fb4ff", "#ceb9ff", "#f4f5ff"],
  },
];

async function getRecentCommits(): Promise<RecentCommit[]> {
  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      },
    );

    if (!reposResponse.ok) {
      return [];
    }

    const repos = ((await reposResponse.json()) as GitHubRepo[])
      .filter((repo) => !repo.fork)
      .slice(0, REPO_SAMPLE_SIZE);

    const commitPages = await Promise.all(
      repos.map(async (repo) => {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=${COMMITS_PER_REPO}&sha=${repo.default_branch}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
            },
            cache: "no-store",
          },
        );

        if (!commitsResponse.ok) {
          return [] as RecentCommit[];
        }

        const commits = (await commitsResponse.json()) as GitHubCommit[];

        return commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          repoName: repo.full_name,
          committedAt: commit.commit.author?.date ?? repo.pushed_at,
          url: commit.html_url,
        }));
      }),
    );

    const commits = commitPages
      .flat()
      .sort((left, right) => Date.parse(right.committedAt) - Date.parse(left.committedAt));

    const seen = new Set<string>();
    const deduplicated = commits.filter((commit) => {
      if (seen.has(commit.sha)) {
        return false;
      }

      seen.add(commit.sha);
      return true;
    });

    return deduplicated.slice(0, MAX_COMMITS);
  } catch {
    try {
      const response = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=100`, {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return [];
      }

      const events = (await response.json()) as Array<{
        type: string;
        repo: {
          name: string;
        };
        created_at: string;
        payload?: {
          commits?: Array<{
            sha: string;
            message: string;
          }>;
        };
      }>;
      const pushEvents = events.filter((event) => event.type === "PushEvent");

      const commits = pushEvents.flatMap((event) =>
        (event.payload?.commits ?? []).map((commit) => ({
          sha: commit.sha,
          message: commit.message,
          repoName: event.repo.name,
          committedAt: event.created_at,
          url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
        })),
      );

      const seen = new Set<string>();
      const deduplicated = commits.filter((commit) => {
        if (seen.has(commit.sha)) {
          return false;
        }

        seen.add(commit.sha);
        return true;
      });

      return deduplicated.slice(0, MAX_COMMITS);
    } catch {
      return [];
    }
  }
}

function formatCommitDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function cleanMessage(message: string): string {
  const firstLine = message.split("\n")[0] ?? message;
  return firstLine.trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function formatTimeInToronto(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function WhatImWorkingOn() {
  const [recentCommits, setRecentCommits] = useState<RecentCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemePreset["id"]>("latte");
  const [gridEffectOn, setGridEffectOn] = useState(true);
  const [torontoTime, setTorontoTime] = useState("--:--:--");
  const [clickCount, setClickCount] = useState(0);
  const [mediumPosts, setMediumPosts] = useState<MediumPost[]>([]);
  const [isMediumLoading, setIsMediumLoading] = useState(true);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreset["id"] | null;
    const storedEffect = window.localStorage.getItem(EFFECT_STORAGE_KEY);
    const storedClicks = window.localStorage.getItem(CLICKS_STORAGE_KEY);

    const nextTheme: ThemePreset["id"] = themePresets.some((preset) => preset.id === storedTheme)
      ? (storedTheme as ThemePreset["id"])
      : "latte";
    const nextEffect = storedEffect === null ? true : storedEffect === "on";
    const nextClicks = Number.parseInt(storedClicks ?? "0", 10);

    setTheme(nextTheme);
    setGridEffectOn(nextEffect);
    setClickCount(Number.isNaN(nextClicks) ? 0 : nextClicks);

    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.grid = nextEffect ? "on" : "off";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMediumPosts = async () => {
      try {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Medium feed request failed");
        }

        const payload = (await response.json()) as {
          items?: Array<{
            title: string;
            link: string;
            pubDate: string;
          }>;
        };

        const posts = (payload.items ?? []).map((item) => ({
          title: stripHtml(item.title),
          link: item.link,
          date: formatCommitDate(item.pubDate),
        }));

        if (!isMounted) {
          return;
        }

        setMediumPosts(posts);
      } catch {
        if (!isMounted) {
          return;
        }

        setMediumPosts(
          blogPosts.map((post) => ({
            title: post.title,
            link: post.link,
            date: post.date,
          })),
        );
      } finally {
        if (isMounted) {
          setIsMediumLoading(false);
        }
      }
    };

    void loadMediumPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.body.dataset.grid = gridEffectOn ? "on" : "off";
    window.localStorage.setItem(EFFECT_STORAGE_KEY, gridEffectOn ? "on" : "off");
  }, [gridEffectOn]);

  useEffect(() => {
    window.localStorage.setItem(CLICKS_STORAGE_KEY, String(clickCount));
  }, [clickCount]);

  useEffect(() => {
    setTorontoTime(formatTimeInToronto(new Date()));
    const interval = window.setInterval(() => {
      setTorontoTime(formatTimeInToronto(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCommits = async () => {
      const commits = await getRecentCommits();
      if (!isMounted) {
        return;
      }

      setRecentCommits(commits);
      setIsLoading(false);
    };

    void loadCommits();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="working-on" className="section-shell py-10 md:py-16">
      <div className="md:ml-16">
        <p className="eyebrow">What I&apos;m Working On</p>
        <h2 className="mt-2 text-4xl italic md:text-5xl">Shipping in public, one commit at a time.</h2>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="warm-card p-5 md:p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Theme</p>
            <span className="text-xs text-[var(--muted)]">{theme}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id)}
                className={`border-2 px-3 py-2 text-left text-sm font-semibold transition ${
                  theme === preset.id
                    ? "border-[var(--line)] bg-[var(--surface)] text-[var(--text)]"
                    : "border-[var(--line)]/50 bg-[#f7f7f2] text-[var(--muted)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {themePresets
              .find((preset) => preset.id === theme)
              ?.swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-6 w-6 border-2 border-[var(--line)]"
                  style={{ backgroundColor: swatch }}
                />
              ))}
          </div>
          <button
            type="button"
            onClick={() => setGridEffectOn((value) => !value)}
            className="mt-4 border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-2 text-sm font-semibold"
          >
            Background effect: {gridEffectOn ? "on" : "off"}
          </button>
        </div>

        <div className="warm-card p-5 md:p-6 lg:col-span-1">
          <p className="eyebrow">Let&apos;s Connect</p>
          <p className="mt-3 text-lg text-[var(--text)]">Always open to interesting projects and conversations.</p>
          <a
            href="#contact"
            className="mt-5 inline-block border-[3px] border-[var(--line)] bg-[var(--accent)] px-5 py-2 text-sm font-semibold uppercase text-[#f7f7f2] shadow-[4px_4px_0_0_#111111] transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            Book a chat
          </a>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.slice(0, 4).map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-[var(--line)] bg-[#f7f7f2] px-2 py-1 text-xs font-semibold"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="warm-card p-5 md:p-6 lg:col-span-1">
          <p className="eyebrow">Currently Based In</p>
          <div className="mt-3 border-2 border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-sm uppercase tracking-wider text-[var(--muted)]">Toronto, ON</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{torontoTime}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{personal.location}</p>
          </div>
        </div>

        <div className="warm-card p-5 md:p-6 lg:col-span-1">
          <p className="eyebrow">Click Counter</p>
          <p className="mt-3 text-5xl font-semibold leading-none text-[var(--text)]">{clickCount.toLocaleString()}</p>
          <button
            type="button"
            onClick={() => setClickCount((value) => value + 1)}
            className="mt-5 border-[3px] border-[var(--line)] bg-[var(--surface-alt)] px-6 py-3 text-sm font-semibold uppercase text-[#f7f7f2] shadow-[4px_4px_0_0_#111111] transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            Click me
          </button>
          <p className="mt-4 text-sm text-[var(--muted)]">You&apos;ve clicked {clickCount} times.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="warm-card p-5 md:p-7">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-3">
            <p className="eyebrow">Recent Commits</p>
            <a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline decoration-2 underline-offset-4"
            >
              View on GitHub
            </a>
          </div>

          {isLoading ? (
            <p className="mt-4 text-[var(--text)]">Loading recent commits...</p>
          ) : recentCommits.length === 0 ? (
            <p className="mt-4 text-[var(--text)]">Could not load recent commits right now.</p>
          ) : (
            <ol className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
              {recentCommits.map((commit, index) => (
                <li key={commit.sha}>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2 transition hover:-translate-y-0.5 hover:translate-x-0.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">{cleanMessage(commit.message)}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")} • {commit.repoName}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[var(--muted)]">{formatCommitDate(commit.committedAt)}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="warm-card p-5 md:p-7">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-3">
            <p className="eyebrow">Latest Posts</p>
            <a
              href="https://medium.com/@anipaleja"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline decoration-2 underline-offset-4"
            >
              Open Medium
            </a>
          </div>
          {isMediumLoading ? (
            <p className="mt-4 text-[var(--text)]">Loading Medium posts...</p>
          ) : (
            <ul className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
              {mediumPosts.map((post) => (
              <li key={post.title}>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2 transition hover:-translate-y-0.5 hover:translate-x-0.5"
                >
                  <span className="min-w-0 text-sm font-semibold leading-tight text-[var(--text)]">{post.title}</span>
                  <span className="whitespace-nowrap text-xs text-[var(--muted)]">{post.date}</span>
                </a>
              </li>
            ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 warm-card p-5 md:p-6">
        <div className="border-b-2 border-[var(--line)] pb-3">
          <p className="eyebrow">Contribution Graph</p>
        </div>
        <div className="mt-4 overflow-x-auto rounded border-2 border-[var(--line)] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/0059ff/${USERNAME}`}
            alt="GitHub contribution graph for anipaleja"
            className="h-auto min-w-[680px] max-w-none"
            loading="lazy"
          />
        </div>
      </div>

    </section>
  );
}
