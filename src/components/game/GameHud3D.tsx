import { GraduationCap, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameState, HyperEngine } from "@/game/engine3d";
import { AudioFX } from "@/game/audio";
import { useState } from "react";

interface GameHud3DProps {
  engine: HyperEngine | null;
  state: GameState;
  onToggleAcademy: () => void;
}

export function GameHud3D({ engine, state, onToggleAcademy }: GameHud3DProps) {
  const [muted, setMuted] = useState(AudioFX.muted);

  const toggleSound = () => {
    const isMuted = AudioFX.toggleMute();
    setMuted(isMuted);
  };

  const densityPct = Math.min(100, Math.round(state.density * 100));

  const densityColor =
    state.densityState === "pressure"
      ? "text-danger"
      : state.densityState === "breathing"
      ? "text-ok"
      : "text-accent";

  const densityBarColor =
    state.densityState === "pressure"
      ? "bg-danger"
      : state.densityState === "breathing"
      ? "bg-ok"
      : "bg-accent";

  return (
    <aside className="flex flex-col gap-3">
      {/* Primary score card */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase text-subtle font-mono">
            Transdimensional Score
          </span>
          <span className="text-[10px] tracking-wider uppercase text-accent font-mono">
            L{state.level}
          </span>
        </div>
        <div className="mt-1 font-display text-3xl font-medium tracking-tight text-fg tabular-nums">
          {state.score.toLocaleString()}
        </div>

        {/* Lines & Speed */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/80 pt-3 text-xs">
          <div>
            <div className="text-[9px] tracking-wider uppercase text-subtle">Slabs Cleared</div>
            <div className="mt-0.5 font-mono text-fg tabular-nums">{state.linesCleared}</div>
          </div>
          <div>
            <div className="text-[9px] tracking-wider uppercase text-subtle">Drop Speed</div>
            <div className="mt-0.5 font-mono text-fg tabular-nums">{state.speedPerSec}</div>
          </div>
        </div>

        <div className="mt-2 text-[10px] text-muted truncate" title={state.speedStatus}>
          {state.speedStatus}
        </div>
      </div>

      {/* Hyperdensity Gauge */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] tracking-[0.2em] uppercase text-subtle font-mono">
            Hyperdensity
          </span>
          <span className={`font-mono text-sm font-semibold tabular-nums ${densityColor}`}>
            {densityPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border">
          <div
            className={`h-full transition-all duration-300 ${densityBarColor}`}
            style={{ width: `${densityPct}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-subtle">
          <span>Target: ≥ 50%</span>
          <span className={state.densityState === "pressure" ? "text-danger font-medium" : "text-muted"}>
            {state.densityState === "pressure"
              ? "CRITICAL VOID PENALTY"
              : state.densityState === "breathing"
              ? "MAXIMAL NEST BONUS"
              : "STABLE WELL"}
          </span>
        </div>
      </div>

      {/* Active 4D Piece */}
      {state.activePiece && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] tracking-[0.2em] uppercase text-subtle font-mono">
            Active Spatial Entity
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="size-3 rounded-full shadow-[0_0_8px_currentColor]"
              style={{
                backgroundColor: `#${state.activePiece.color.toString(16).padStart(6, "0")}`,
                color: `#${state.activePiece.color.toString(16).padStart(6, "0")}`,
              }}
            />
            <span className="font-display text-base font-medium text-fg">
              {state.activePiece.template}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>Size Class: <strong className="text-fg">{state.activePiece.sizeClass}</strong></span>
            <span>{state.activePiece.voxels.length} Subcells</span>
          </div>
        </div>
      )}

      {/* Controls & Mode actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant={state.tutorialMode ? "primary" : "outline"}
          onClick={onToggleAcademy}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="size-4" />
            <span>Interactive Academy</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider font-mono">
            {state.tutorialMode ? `L${state.tutorialStepIndex + 1}/6` : "Enter"}
          </span>
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={toggleSound}
            className="w-full justify-center text-xs"
          >
            {muted ? <VolumeX className="size-3.5 mr-1.5 text-danger" /> : <Volume2 className="size-3.5 mr-1.5 text-ok" />}
            {muted ? "Muted" : "Sound On"}
          </Button>

          <Button
            variant="outline"
            onClick={() => engine?.resetGame()}
            className="w-full justify-center text-xs"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset Well
          </Button>
        </div>
      </div>

      {/* Controls Reference */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-3 text-[11px] leading-relaxed text-subtle">
        <div className="font-medium text-fg mb-1">Spatial Keymap:</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div><kbd className="text-fg">W/A/S/D</kbd> or <kbd className="text-fg">Arrows</kbd>: Pan</div>
          <div><kbd className="text-fg">Space</kbd>: Hard Drop</div>
          <div><kbd className="text-fg">R</kbd>: Pitch (X)</div>
          <div><kbd className="text-fg">Q / E</kbd>: Yaw (Z)</div>
          <div><kbd className="text-fg">Z / X</kbd>: Roll (Y)</div>
          <div><kbd className="text-fg">Drag</kbd>: Orbit Camera</div>
        </div>
      </div>
    </aside>
  );
}
