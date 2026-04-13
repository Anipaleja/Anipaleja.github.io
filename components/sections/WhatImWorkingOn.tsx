"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
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

type GitHubCommitDetails = {
  stats?: {
    additions?: number;
    deletions?: number;
  };
};

type GitHubLanguages = Record<string, number>;

type RecentCommit = {
  sha: string;
  message: string;
  repoName: string;
  committedAt: string;
  url: string;
  additions?: number;
  deletions?: number;
};

type LanguageUsage = {
  name: string;
  bytes: number;
  percent: number;
};

type MediumPost = {
  title: string;
  link: string;
  date: string;
};

const USERNAME = "anipaleja";
const MAX_COMMITS = 4;
const REPO_SAMPLE_SIZE = 6;
const COMMITS_PER_REPO = 5;
const THEME_STORAGE_KEY = "ap-theme";
const EFFECT_STORAGE_KEY = "ap-grid-effect";
const CLICKS_STORAGE_KEY = "ap-click-count";
const CLICKS_COUNTER_KEY = "site_clicks";
const ACCENT_STORAGE_KEY = "ap-accent-color";
const GRAPH_COLOR_STORAGE_KEY = "ap-graph-color";
const MEDIUM_FEED_URL = "https://medium.com/feed/@anipaleja";
const LANGUAGE_COLORS = [
  "#2E86AB",
  "#F18F01",
  "#C73E1D",
  "#6A994E",
  "#7B2CBF",
  "#0B6E4F",
  "#E36414",
  "#3A86FF",
];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type ThemePreset = {
  id: "latte" | "frappe" | "macchiato" | "mocha";
  label: string;
  swatches: string[];
};

const themePresets: ThemePreset[] = [
  {
    id: "latte",
    label: "Blueprint",
    swatches: ["#f3f3ed", "#ffe56a", "#ff7a59", "#0059ff"],
  },
  {
    id: "frappe",
    label: "Lagoon",
    swatches: ["#f4f1e6", "#7dd2ff", "#58b38f", "#15416d"],
  },
  {
    id: "macchiato",
    label: "Sunset",
    swatches: ["#fff0df", "#ff8a5c", "#d1495b", "#293241"],
  },
  {
    id: "mocha",
    label: "Nebula",
    swatches: ["#171b2a", "#6fb4ff", "#ceb9ff", "#f4f5ff"],
  },
];

function getThemePreset(themeId: ThemePreset["id"]): ThemePreset {
  return themePresets.find((preset) => preset.id === themeId) ?? themePresets[0];
}

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

    const topCommits = deduplicated.slice(0, MAX_COMMITS);
    const withStats = await Promise.all(
      topCommits.map(async (commit) => {
        try {
          const detailsResponse = await fetch(
            `https://api.github.com/repos/${commit.repoName}/commits/${commit.sha}`,
            {
              headers: {
                Accept: "application/vnd.github+json",
              },
              cache: "no-store",
            },
          );

          if (!detailsResponse.ok) {
            return commit;
          }

          const details = (await detailsResponse.json()) as GitHubCommitDetails;

          return {
            ...commit,
            additions: details.stats?.additions,
            deletions: details.stats?.deletions,
          };
        } catch {
          return commit;
        }
      }),
    );

    return withStats;
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

async function getLanguageUsage(): Promise<LanguageUsage[]> {
  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated&direction=desc`,
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

    const languageMaps = await Promise.all(
      repos.map(async (repo) => {
        try {
          const response = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
            headers: {
              Accept: "application/vnd.github+json",
            },
            cache: "no-store",
          });

          if (!response.ok) {
            return {} as GitHubLanguages;
          }

          return (await response.json()) as GitHubLanguages;
        } catch {
          return {} as GitHubLanguages;
        }
      }),
    );

    const totals = new Map<string, number>();
    for (const languageMap of languageMaps) {
      for (const [language, bytes] of Object.entries(languageMap)) {
        totals.set(language, (totals.get(language) ?? 0) + bytes);
      }
    }

    const totalBytes = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
    if (totalBytes === 0) {
      return [];
    }

    return Array.from(totals.entries())
      .map(([name, bytes]) => ({
        name,
        bytes,
        percent: (bytes / totalBytes) * 100,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 8);
  } catch {
    return [];
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

function toClickCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

async function loadGlobalClickCount(): Promise<number> {
  if (!supabase) {
    return toClickCount(window.localStorage.getItem(CLICKS_STORAGE_KEY));
  }

  const { data, error } = await supabase
    .from("site_counters")
    .select("counter_value")
    .eq("counter_key", CLICKS_COUNTER_KEY)
    .maybeSingle();

  if (error || !data) {
    return toClickCount(window.localStorage.getItem(CLICKS_STORAGE_KEY));
  }

  return toClickCount(data.counter_value);
}

async function incrementGlobalClickCount(): Promise<number> {
  if (!supabase) {
    const nextCount = toClickCount(window.localStorage.getItem(CLICKS_STORAGE_KEY)) + 1;
    window.localStorage.setItem(CLICKS_STORAGE_KEY, String(nextCount));
    return nextCount;
  }

  const { data, error } = await supabase.rpc("increment_site_counter", {
    target_key: CLICKS_COUNTER_KEY,
  });

  if (error || typeof data !== "number") {
    const nextCount = toClickCount(window.localStorage.getItem(CLICKS_STORAGE_KEY)) + 1;
    window.localStorage.setItem(CLICKS_STORAGE_KEY, String(nextCount));
    return nextCount;
  }

  window.localStorage.setItem(CLICKS_STORAGE_KEY, String(data));
  return data;
}

export function WhatImWorkingOn() {
  const [recentCommits, setRecentCommits] = useState<RecentCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemePreset["id"]>("latte");
  const [gridEffectOn, setGridEffectOn] = useState(true);
  const [torontoTime, setTorontoTime] = useState("--:--:--");
  const [clickCount, setClickCount] = useState(0);
  const [accentColor, setAccentColor] = useState("#0059ff");
  const [graphColor, setGraphColor] = useState("#0059ff");
  const [accentDraft, setAccentDraft] = useState("#0059ff");
  const [graphDraft, setGraphDraft] = useState("#0059ff");
  const [mediumPosts, setMediumPosts] = useState<MediumPost[]>([]);
  const [isMediumLoading, setIsMediumLoading] = useState(true);
  const [languageUsage, setLanguageUsage] = useState<LanguageUsage[]>([]);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreset["id"] | null;
    const storedEffect = window.localStorage.getItem(EFFECT_STORAGE_KEY);
    const storedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    const storedGraphColor = window.localStorage.getItem(GRAPH_COLOR_STORAGE_KEY);

    const nextTheme: ThemePreset["id"] = themePresets.some((preset) => preset.id === storedTheme)
      ? (storedTheme as ThemePreset["id"])
      : "latte";
    const nextEffect = storedEffect === null ? true : storedEffect === "on";
    const defaultAccent = getThemePreset(nextTheme).swatches[3] ?? "#0059ff";
    const nextAccent = storedAccent && /^#[0-9A-Fa-f]{6}$/.test(storedAccent) ? storedAccent : defaultAccent;
    const nextGraphColor =
      storedGraphColor && /^#[0-9A-Fa-f]{6}$/.test(storedGraphColor) ? storedGraphColor : nextAccent;

    setTheme(nextTheme);
    setGridEffectOn(nextEffect);
    setAccentColor(nextAccent);
    setGraphColor(nextGraphColor);
    setAccentDraft(nextAccent);
    setGraphDraft(nextGraphColor);

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.setProperty("--accent", nextAccent);
    document.body.dataset.grid = nextEffect ? "on" : "off";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadClicks = async () => {
      const nextClicks = await loadGlobalClickCount();

      if (isMounted) {
        setClickCount(nextClicks);
      }
    };

    void loadClicks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLanguageUsage = async () => {
      const usage = await getLanguageUsage();

      if (!isMounted) {
        return;
      }

      setLanguageUsage(usage);
      setIsLanguageLoading(false);
    };

    void loadLanguageUsage();

    return () => {
      isMounted = false;
    };
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
    document.documentElement.style.setProperty("--accent", accentColor);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
    setAccentDraft(accentColor);
  }, [accentColor]);

  useEffect(() => {
    window.localStorage.setItem(GRAPH_COLOR_STORAGE_KEY, graphColor);
    setGraphDraft(graphColor);
  }, [graphColor]);

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
        <h2 className="mt-2 text-3xl italic sm:text-4xl md:text-5xl">Shipping in public, one commit at a time.</h2>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="warm-card p-5 md:p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Theme</p>
            <span className="text-xs text-[var(--muted)]">{theme}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  const defaultAccent = preset.swatches[3] ?? "#0059ff";
                  setTheme(preset.id);
                  setAccentColor(defaultAccent);
                  setGraphColor(defaultAccent);
                }}
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
          <div className="mt-4 grid gap-2 border-2 border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
              <span>Accent color</span>
              <span>{accentColor.toUpperCase()}</span>
            </div>
            <input
              type="color"
              value={accentColor}
              onChange={(event) => setAccentColor(event.target.value)}
              className="h-9 w-full cursor-pointer border-2 border-[var(--line)] bg-white"
              aria-label="Set accent color"
            />
            <div className="grid gap-1">
              <label htmlFor="accent-hex" className="text-xs font-semibold uppercase text-[var(--muted)]">
                Accent hex
              </label>
              <input
                id="accent-hex"
                type="text"
                value={accentDraft}
                onChange={(event) => setAccentDraft(event.target.value)}
                onBlur={() => {
                  if (isHexColor(accentDraft)) {
                    setAccentColor(accentDraft.toLowerCase());
                    return;
                  }

                  setAccentDraft(accentColor);
                }}
                placeholder="#0059ff"
                className="border-2 border-[var(--line)] bg-white px-2 py-1 text-sm font-semibold uppercase"
                aria-label="Accent color hex code"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const defaultAccent = getThemePreset(theme).swatches[3] ?? "#0059ff";
                setAccentColor(defaultAccent);
                setGraphColor(defaultAccent);
              }}
              className="border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-2 text-xs font-semibold uppercase"
            >
              Reset accent and graph to theme default
            </button>
          </div>

          <div className="mt-3 grid gap-2 border-2 border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
              <span>Contribution graph color</span>
              <span>{graphColor.toUpperCase()}</span>
            </div>
            <input
              type="color"
              value={graphColor}
              onChange={(event) => setGraphColor(event.target.value)}
              className="h-9 w-full cursor-pointer border-2 border-[var(--line)] bg-white"
              aria-label="Set contribution graph color"
            />
            <div className="grid gap-1">
              <label htmlFor="graph-hex" className="text-xs font-semibold uppercase text-[var(--muted)]">
                Graph hex
              </label>
              <input
                id="graph-hex"
                type="text"
                value={graphDraft}
                onChange={(event) => setGraphDraft(event.target.value)}
                onBlur={() => {
                  if (isHexColor(graphDraft)) {
                    setGraphColor(graphDraft.toLowerCase());
                    return;
                  }

                  setGraphDraft(graphColor);
                }}
                placeholder="#0059ff"
                className="border-2 border-[var(--line)] bg-white px-2 py-1 text-sm font-semibold uppercase"
                aria-label="Contribution graph color hex code"
              />
            </div>
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
          <p className="mt-3 text-4xl font-semibold leading-none text-[var(--text)] sm:text-5xl">
            {clickCount.toLocaleString()}
          </p>
          <button
            type="button"
            onClick={async () => {
              const nextCount = await incrementGlobalClickCount();
              setClickCount(nextCount);
            }}
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
                      <p className="text-sm font-semibold text-[var(--text)]">{cleanMessage(commit.message)}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")} • {commit.repoName} • {commit.sha.slice(0, 7)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        +{commit.additions ?? 0} / -{commit.deletions ?? 0}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[var(--muted)]">{formatCommitDate(commit.committedAt)}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-5 border-t-2 border-[var(--line)] pt-4">
            <p className="eyebrow">Language usage</p>
            {isLanguageLoading ? (
              <p className="mt-3 text-sm text-[var(--text)]">Loading language usage...</p>
            ) : languageUsage.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--text)]">Could not load language usage right now.</p>
            ) : (
              <>
                <div className="mt-3 h-4 overflow-hidden rounded border border-[var(--line)] bg-[#f7f7f2]">
                  <div className="flex h-full w-full">
                    {languageUsage.map((language, index) => (
                      <div
                        key={language.name}
                        title={`${language.name}: ${language.percent.toFixed(1)}%`}
                        style={{
                          width: `${language.percent}%`,
                          backgroundColor: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
                        }}
                      />
                    ))}
                  </div>
                </div>

                <ul className="mt-3 grid gap-1 text-xs text-[var(--text)] sm:grid-cols-2">
                  {languageUsage.map((language, index) => (
                    <li key={language.name} className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 border border-[var(--line)]"
                          style={{ backgroundColor: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length] }}
                        />
                        {language.name}
                      </span>
                      <span className="font-semibold">{language.percent.toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
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
            src={`https://ghchart.rshah.org/${graphColor.replace("#", "")}/${USERNAME}`}
            alt="GitHub contribution graph for anipaleja"
            className="h-auto min-w-[560px] max-w-none sm:min-w-[680px]"
            loading="lazy"
          />
        </div>
      </div>

    </section>
  );
}
