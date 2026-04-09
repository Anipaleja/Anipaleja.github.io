"use client";

import { useEffect, useRef, useState } from "react";

type Obstacle = {
  x: number;
  width: number;
  height: number;
  kind: "small" | "tall";
};

const GAME_WIDTH = 900;
const GAME_HEIGHT = 220;
const GROUND_Y = 175;
const GRAVITY = 0.85;
const JUMP_VELOCITY = -13;
const INITIAL_SPEED = 6;
const DINO_WIDTH = 42;
const DINO_HEIGHT = 44;

function drawDino(ctx: CanvasRenderingContext2D, x: number, y: number, legSwap: boolean) {
  ctx.fillStyle = "#3f3f3f";

  // body
  ctx.fillRect(x + 8, y + 12, 22, 20);
  // neck + head
  ctx.fillRect(x + 22, y + 4, 8, 12);
  ctx.fillRect(x + 26, y + 0, 14, 12);
  // tail
  ctx.fillRect(x + 2, y + 16, 10, 6);
  // arm
  ctx.fillRect(x + 20, y + 18, 8, 4);
  // eye
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 34, y + 4, 3, 3);

  // legs
  ctx.fillStyle = "#3f3f3f";
  if (legSwap) {
    ctx.fillRect(x + 10, y + 32, 8, 12);
    ctx.fillRect(x + 22, y + 32, 8, 8);
  } else {
    ctx.fillRect(x + 10, y + 32, 8, 8);
    ctx.fillRect(x + 22, y + 32, 8, 12);
  }
}

function drawCactus(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  const x = obstacle.x;
  const h = obstacle.height;
  const w = obstacle.width;
  const y = GROUND_Y - h;

  ctx.fillStyle = "#535353";
  ctx.fillRect(x, y, w, h);
  ctx.fillRect(x - 4, y + 10, 4, 10);
  ctx.fillRect(x + w, y + 16, 4, 10);

  if (obstacle.kind === "tall") {
    ctx.fillRect(x - 6, y + 22, 6, 8);
    ctx.fillRect(x + w, y + 28, 6, 8);
  }
}

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const dinoYRef = useRef(GROUND_Y - DINO_HEIGHT);
  const dinoVelocityRef = useRef(0);
  const isGroundedRef = useRef(true);
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const baseSpeedRef = useRef(INITIAL_SPEED);
  const spawnTimerRef = useRef(0);
  const isRunningRef = useRef(false);
  const trailOffsetRef = useRef(0);
  const speedMultiplierRef = useRef(1);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const resetGame = () => {
    obstaclesRef.current = [];
    dinoYRef.current = GROUND_Y - DINO_HEIGHT;
    dinoVelocityRef.current = 0;
    isGroundedRef.current = true;
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    baseSpeedRef.current = INITIAL_SPEED;
    spawnTimerRef.current = 0;
    trailOffsetRef.current = 0;
    setScore(0);
    setIsGameOver(false);
  };

  const jump = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      setIsGameOver(false);
    }

    if (isGroundedRef.current) {
      dinoVelocityRef.current = JUMP_VELOCITY;
      isGroundedRef.current = false;
    }
  };

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (isGameOver) {
          resetGame();
          isRunningRef.current = true;
          return;
        }

        jump();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return;
    }

    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // sky
      ctx.fillStyle = "#fdfdfd";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // cloud streaks
      ctx.fillStyle = "#d7d7d7";
      ctx.fillRect(130, 36, 48, 8);
      ctx.fillRect(138, 32, 32, 6);
      ctx.fillRect(580, 52, 62, 8);
      ctx.fillRect(596, 47, 30, 6);

      // ground line
      ctx.strokeStyle = "#4f4f4f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.stroke();

      // moving trail marks
      ctx.fillStyle = "#8a8a8a";
      for (let i = -1; i < 16; i += 1) {
        const baseX = i * 64 + (trailOffsetRef.current % 64);
        ctx.fillRect(baseX, GROUND_Y + 6, 22, 2);
      }

      // dino
      const dinoX = 65;
      const dinoY = dinoYRef.current;
      const legSwap = Math.floor(scoreRef.current / 8) % 2 === 0;
      drawDino(ctx, dinoX, dinoY, legSwap && isGroundedRef.current);

      // obstacles
      for (const obstacle of obstaclesRef.current) {
        drawCactus(ctx, obstacle);
      }

      // score
      ctx.fillStyle = "#3f3f3f";
      ctx.font = "700 18px monospace";
      const scoreText = String(scoreRef.current).padStart(5, "0");
      const bestText = String(bestScore).padStart(5, "0");
      ctx.fillText(`HI ${bestText}  ${scoreText}`, 670, 32);

      if (!isRunningRef.current) {
        ctx.fillStyle = "#4f4f4f";
        ctx.font = "700 16px monospace";
        ctx.fillText("PRESS SPACE OR TAP TO START", 250, 98);
      }

      if (isGameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.64)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = "#3f3f3f";
        ctx.font = "700 28px monospace";
        ctx.fillText("GAME OVER", 340, 96);
        ctx.font = "700 15px monospace";
        ctx.fillText("PRESS SPACE OR RESTART", 315, 128);
      }
    };

    const loop = () => {
      if (isRunningRef.current && !isGameOver) {
        dinoVelocityRef.current += GRAVITY;
        dinoYRef.current += dinoVelocityRef.current;

        if (dinoYRef.current >= GROUND_Y - DINO_HEIGHT) {
          dinoYRef.current = GROUND_Y - DINO_HEIGHT;
          dinoVelocityRef.current = 0;
          isGroundedRef.current = true;
        }

        trailOffsetRef.current -= speedRef.current;

        spawnTimerRef.current += 1;
        const spawnEvery = Math.max(52, 120 - Math.floor(scoreRef.current / 14));
        if (spawnTimerRef.current > spawnEvery) {
          spawnTimerRef.current = 0;
          const tall = Math.random() > 0.45;
          obstaclesRef.current.push({
            x: GAME_WIDTH + 10,
            width: tall ? 18 : 14,
            height: tall ? 42 : 30,
            kind: tall ? "tall" : "small",
          });
        }

        obstaclesRef.current = obstaclesRef.current
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - speedRef.current }))
          .filter((obstacle) => obstacle.x + obstacle.width > -5);

        const dinoRect = { x: 73, y: dinoYRef.current + 6, width: 26, height: 34 };
        const hit = obstaclesRef.current.some((obstacle) => {
          const obstacleRect = {
            x: obstacle.x,
            y: GROUND_Y - obstacle.height,
            width: obstacle.width + 2,
            height: obstacle.height,
          };

          return (
            dinoRect.x < obstacleRect.x + obstacleRect.width &&
            dinoRect.x + dinoRect.width > obstacleRect.x &&
            dinoRect.y < obstacleRect.y + obstacleRect.height &&
            dinoRect.y + dinoRect.height > obstacleRect.y
          );
        });

        if (hit) {
          setIsGameOver(true);
          isRunningRef.current = false;
          setBestScore((current) => Math.max(current, scoreRef.current));
        } else {
          scoreRef.current += 1;
          if (scoreRef.current % 4 === 0) {
            setScore(scoreRef.current);
          }
          const ramped = Math.min(13, INITIAL_SPEED + scoreRef.current * 0.0042);
          baseSpeedRef.current = ramped;
          speedRef.current = ramped * speedMultiplierRef.current;
        }
      }

      draw();
      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [bestScore, isGameOver]);

  return (
    <section id="dino-game" className="section-shell py-10 md:py-14">
      <div className="warm-card p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--line)] pb-3">
          <div>
            <p className="eyebrow">Mini Game</p>
            <h2 className="mt-1 text-3xl italic md:text-4xl">Chrome Dino Style Runner</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={jump}
              className="border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-sm font-semibold"
            >
              Jump
            </button>
            <button
              type="button"
              onClick={() => {
                resetGame();
                isRunningRef.current = true;
              }}
              className="border-2 border-[var(--line)] bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-[#f7f7f2]"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-2 border-[var(--line)] bg-[#f7f7f2] px-4 py-3">
          <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
            <span>Speed</span>
            <span>{speedMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2"
            step="0.1"
            value={speedMultiplier}
            onChange={(event) => {
              const next = Number.parseFloat(event.target.value);
              setSpeedMultiplier(next);
              speedRef.current = baseSpeedRef.current * next;
            }}
            className="w-full accent-[var(--accent)]"
            aria-label="Adjust game speed"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="min-w-[900px] border-2 border-[var(--line)] bg-[#fdfdfd]"
            onPointerDown={jump}
          />
        </div>
      </div>
    </section>
  );
}
