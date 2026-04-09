"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type ScoreEntry = {
  name: string;
  score: number;
  createdAt: string;
};

type LeaderboardRow = {
  name: string;
  score: number;
  created_at: string;
};

const LEADERBOARD_KEY = "personal-site-dino-leaderboard";
const MAX_ENTRIES = 10;
const TABLE_NAME = "dino_leaderboard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function sortLeaderboard(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}

function readFallbackLeaderboard(): ScoreEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ScoreEntry[];
    return sortLeaderboard(
      parsed.filter(
        (entry) => entry && typeof entry.name === "string" && typeof entry.score === "number",
      ),
    ).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function saveFallbackLeaderboard(entries: ScoreEntry[]) {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function toScoreEntry(row: LeaderboardRow): ScoreEntry {
  return {
    name: row.name,
    score: row.score,
    createdAt: row.created_at,
  };
}

async function loadLeaderboardFromSupabase(): Promise<ScoreEntry[]> {
  if (!supabase) {
    return readFallbackLeaderboard();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(MAX_ENTRIES);

  if (error || !data) {
    return readFallbackLeaderboard();
  }

  return (data as LeaderboardRow[]).map(toScoreEntry);
}

async function saveScoreToSupabase(entry: ScoreEntry) {
  if (!supabase) {
    const fallbackEntries = sortLeaderboard([entry, ...readFallbackLeaderboard()]).slice(
      0,
      MAX_ENTRIES,
    );
    saveFallbackLeaderboard(fallbackEntries);
    return fallbackEntries;
  }

  const { error } = await supabase.from(TABLE_NAME).insert({
    name: entry.name,
    score: entry.score,
    created_at: entry.createdAt,
  });

  if (error) {
    const fallbackEntries = sortLeaderboard([entry, ...readFallbackLeaderboard()]).slice(
      0,
      MAX_ENTRIES,
    );
    saveFallbackLeaderboard(fallbackEntries);
    return fallbackEntries;
  }

  return loadLeaderboardFromSupabase();
}

export function DinoGame() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    void loadLeaderboardFromSupabase().then(setLeaderboard);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const payload = event.data as { type?: string; score?: number } | undefined;
      if (payload?.type !== "trex-game-over" || typeof payload.score !== "number") {
        return;
      }

      setPendingScore(payload.score);
      setPlayerName("");
      setIsPromptOpen(true);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const submitScore = async () => {
    if (pendingScore === null) {
      return;
    }

    const name = playerName.trim() || "Anonymous";
    const updatedLeaderboard = await saveScoreToSupabase({
      name,
      score: pendingScore,
      createdAt: new Date().toISOString(),
    });

    setLeaderboard(updatedLeaderboard);
    setIsPromptOpen(false);
    setPendingScore(null);
    setPlayerName("");
  };

  return (
    <section id="dino-game" className="section-shell py-10 md:py-14">
      <div className="warm-card p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Chromium Runner - Click and press space to start
            </p>
            <div className="mt-3 overflow-hidden rounded border-2 border-[var(--line)] bg-[#f7f7f2]">
              <iframe
                src="/trex/index.html"
                title="T-Rex game"
                className="h-[190px] w-full md:h-[210px]"
                loading="lazy"
              />
            </div>
          </div>

          <aside className="border-2 border-[var(--line)] bg-[#f7f7f2] p-4">
            <p className="eyebrow">Leaderboard</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Top scores from everyone visiting the site.
            </p>
            <div className="mt-4 space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No scores yet. Be the first one.</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={`${entry.name}-${entry.createdAt}`}
                    className="flex items-center justify-between border-b border-[var(--line)]/20 pb-2 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="font-semibold">
                      {index + 1}. {entry.name}
                    </span>
                    <span>{entry.score}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      {isPromptOpen && pendingScore !== null ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border-4 border-[var(--line)] bg-[#f7f7f2] p-5 shadow-[10px_10px_0_0_#111111]">
            <p className="eyebrow">Game Over</p>
            <h2 className="mt-2 text-3xl">New score: {pendingScore}</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Enter your name to save it on the leaderboard.
            </p>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submitScore();
              }}
            >
              <input
                autoFocus
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Your name"
                className="border-2 border-[var(--line)] bg-white px-3 py-2 text-base outline-none"
                maxLength={24}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="border-2 border-[var(--line)] bg-[var(--accent)] px-4 py-2 font-semibold text-[#f7f7f2]"
                >
                  Save score
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPromptOpen(false);
                    setPendingScore(null);
                    setPlayerName("");
                  }}
                  className="border-2 border-[var(--line)] bg-[#f7f7f2] px-4 py-2 font-semibold"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
