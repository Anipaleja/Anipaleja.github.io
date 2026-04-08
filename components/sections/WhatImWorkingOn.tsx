"use client";

import { useEffect, useState } from "react";

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

const USERNAME = "anipaleja";
const MAX_COMMITS = 15;
const REPO_SAMPLE_SIZE = 8;
const COMMITS_PER_REPO = 4;

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

export function WhatImWorkingOn() {
  const [recentCommits, setRecentCommits] = useState<RecentCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="warm-card p-5 md:p-7">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-3">
            <p className="eyebrow">15 Most Recent Commits</p>
            <a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline decoration-2 underline-offset-4"
            >
              View profile
            </a>
          </div>

          {isLoading ? (
            <p className="mt-4 text-[var(--text)]">Loading recent commits...</p>
          ) : recentCommits.length === 0 ? (
            <p className="mt-4 text-[var(--text)]">Could not load recent commits right now.</p>
          ) : (
            <ol className="mt-4 grid gap-3">
              {recentCommits.map((commit, index) => (
                <li key={commit.sha}>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border-2 border-[var(--line)] bg-[var(--bg)] px-4 py-3 transition hover:-translate-y-0.5 hover:translate-x-0.5"
                  >
                    <p className="eyebrow text-xs text-[var(--muted)]">
                      {String(index + 1).padStart(2, "0")} • {commit.repoName} • {formatCommitDate(commit.committedAt)}
                    </p>
                    <p className="mt-1 text-[var(--text)]">{cleanMessage(commit.message)}</p>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="warm-card p-5 md:p-7">
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
      </div>
    </section>
  );
}
