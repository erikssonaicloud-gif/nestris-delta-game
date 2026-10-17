import { useEffect, useRef, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { DeltaMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { HyperEngine, type GameState } from "@/game/engine3d";
import { AudioFX } from "@/game/audio";
import { GameHud3D } from "@/components/game/GameHud3D";
import { AcademyOverlay } from "@/components/game/AcademyOverlay";
import { TouchDeck } from "@/components/game/TouchDeck";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<HyperEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    linesCleared: 0,
    density: 0,
    densityState: "neutral",
    speedPerSec: "1.00",
    speedStatus: "Half-Speed (Level 1 Start)",
    isGameOver: false,
    activePiece: null,
    tutorialMode: false,
    tutorialStepIndex: 0,
    tutorialVerified: false,
    notification: null,
    l5ExampleIndex: 0,
  });
  const [muted, setMuted] = useState(AudioFX.muted);

  // Initialize 3D Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new HyperEngine(canvasRef.current, (s) => {
      setGameState(s);
    });
    engineRef.current = engine;

    const ro = new ResizeObserver(() => {
      engine.resize();
    });
    ro.observe(canvasRef.current);

    if (window.location.search.includes("academy")) {
      engine.startTutorial();
    }

    return () => {
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const toggleSound = useCallback(() => {
    const isMuted = AudioFX.toggleMute();
    setMuted(isMuted);
  }, []);

  const toggleAcademy = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (gameState.tutorialMode) {
      engine.exitTutorial();
    } else {
      engine.startTutorial();
    }
  }, [gameState.tutorialMode]);

  // Global Keyboard Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const engine = engineRef.current;
      if (!engine) return;

      if (gameState.isGameOver) {
        if (e.key === "Enter" || e.code === "Space") {
          engine.resetGame();
        }
        return;
      }

      const code = e.code;
      const prevent = new Set([
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp",
        "Space",
        "KeyA",
        "KeyD",
        "KeyW",
        "KeyS",
        "KeyQ",
        "KeyE",
        "KeyR",
        "KeyZ",
        "KeyX",
      ]);
      if (prevent.has(code)) e.preventDefault();

      switch (code) {
        case "ArrowLeft":
        case "KeyA":
          engine.movePiece(-1, 0, 0);
          break;
        case "ArrowRight":
        case "KeyD":
          engine.movePiece(1, 0, 0);
          break;
        case "ArrowUp":
        case "KeyW":
          engine.movePiece(0, 1, 0);
          break;
        case "ArrowDown":
        case "KeyS":
          engine.movePiece(0, -1, 0);
          break;
        case "Space":
          engine.hardDrop();
          break;
        case "KeyC":
          engine.softDrop();
          break;
        case "KeyR":
          engine.rotatePiece("x", 1);
          break;
        case "KeyQ":
          engine.rotatePiece("z", -1);
          break;
        case "KeyE":
          engine.rotatePiece("z", 1);
          break;
        case "KeyZ":
          engine.rotatePiece("y", -1);
          break;
        case "KeyX":
          engine.rotatePiece("y", 1);
          break;
        case "KeyH":
          toggleAcademy();
          break;
        case "KeyM":
          toggleSound();
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState.isGameOver, toggleAcademy, toggleSound]);

  const densityPct = Math.round(gameState.density * 100);

  return (
    <div className="game-shell min-h-dvh overflow-x-hidden bg-bg text-fg">
      {/* Top Header */}
      <header
        className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Landing</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative grid size-6 place-items-center">
              <span className="absolute size-6 rounded bg-accent/40 blur-[5px] opacity-60" />
              <DeltaMark className="relative size-3.5" />
            </span>
            <span className="font-display text-sm tracking-[0.2em]">
              NESTRIS <span className="text-accent">Δ</span>
              <span className="text-subtle text-xs hidden sm:inline"> · 4D Hyper-Well</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={gameState.tutorialMode ? "primary" : "outline"}
              onClick={toggleAcademy}
              className="h-8 px-2.5 text-xs"
            >
              <GraduationCap className="size-3.5 sm:mr-1" />
              <span className="hidden sm:inline">
                {gameState.tutorialMode ? "Academy Active" : "🎓 Academy"}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={toggleSound}
              className="size-8 p-0"
              title={muted ? "Unmute Sound" : "Mute Sound"}
            >
              {muted ? <VolumeX className="size-3.5 text-danger" /> : <Volume2 className="size-3.5 text-ok" />}
            </Button>

            <Button
              variant="outline"
              onClick={() => engineRef.current?.resetGame()}
              className="size-8 p-0"
              title="Reset Game"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="mx-auto max-w-6xl p-3 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        <div className="flex flex-col gap-3">
          {/* Mobile quick stats banner */}
          <div className="grid grid-cols-3 gap-2 lg:hidden">
            <div className="rounded-lg border border-border bg-surface-2/80 px-2.5 py-1.5">
              <div className="text-[9px] tracking-wider uppercase text-subtle">Score</div>
              <div className="text-sm font-display text-fg tabular-nums">
                {gameState.score.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/80 px-2.5 py-1.5">
              <div className="text-[9px] tracking-wider uppercase text-subtle">Level</div>
              <div className="text-sm font-mono text-fg tabular-nums">{gameState.level}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/80 px-2.5 py-1.5">
              <div className="text-[9px] tracking-wider uppercase text-subtle">Density</div>
              <div
                className={`text-sm font-mono tabular-nums ${
                  gameState.densityState === "pressure"
                    ? "text-danger"
                    : gameState.densityState === "breathing"
                    ? "text-ok"
                    : "text-accent"
                }`}
              >
                {densityPct}%
              </div>
            </div>
          </div>

          {/* 3D Viewport container */}
          <div className="relative aspect-[4/3] w-full min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] overflow-hidden rounded-2xl border border-border bg-[#06060c] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
            <canvas ref={canvasRef} className="h-full w-full block cursor-grab active:cursor-grabbing" />

            {/* In-game Notification Toast */}
            {gameState.notification && (
              <div className="pointer-events-none absolute bottom-4 inset-x-4 z-20 flex justify-center">
                <div className="max-w-md rounded-xl border border-accent/40 bg-surface/90 px-4 py-2 text-center text-xs font-medium text-accent shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md">
                  {gameState.notification}
                </div>
              </div>
            )}

            {/* Interactive Academy Overlay */}
            <AcademyOverlay
              engine={engineRef.current}
              state={gameState}
              onClose={() => engineRef.current?.exitTutorial()}
            />

            {/* Quick helper tag */}
            <div className="pointer-events-none absolute top-3 left-3 hidden rounded-md bg-surface-2/70 px-2 py-1 text-[10px] font-mono text-subtle backdrop-blur-sm sm:block">
              Drag to Orbit · Scroll to Zoom
            </div>
          </div>

          {/* Touch Deck for mobile and tactile steering */}
          <TouchDeck engine={engineRef.current} />

          <p className="hidden text-xs text-subtle sm:block leading-relaxed">
            <strong className="text-muted">Pro tip:</strong> Level 1 begins at half-speed tempo
            allowing spatial exploration. Rotate in 3 axes (<kbd className="text-fg">R</kbd> Pitch,{" "}
            <kbd className="text-fg">Q/E</kbd> Yaw, <kbd className="text-fg">Z/X</kbd> Roll) to nest
            nimble half-size pieces into host pockets and maximize density.
          </p>
        </div>

        {/* Desktop Sidebar HUD */}
        <div className="hidden lg:block">
          <GameHud3D
            engine={engineRef.current}
            state={gameState}
            onToggleAcademy={toggleAcademy}
          />
        </div>
      </main>

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
            <div className="font-display text-2xl text-danger">Hyper-well collapse</div>
            <p className="mt-2 text-xs text-muted">
              Spatial envelope reached maximum capacity.
            </p>
            <div className="my-4 rounded-xl border border-border bg-surface-2/60 p-3">
              <div className="text-[10px] uppercase tracking-wider text-subtle">Final Score</div>
              <div className="mt-0.5 font-display text-3xl font-medium text-fg tabular-nums">
                {gameState.score.toLocaleString()}
              </div>
            </div>
            <Button
              onClick={() => engineRef.current?.resetGame()}
              className="w-full"
            >
              Re-enter the Transdimension
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
