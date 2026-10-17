import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HyperEngine } from "@/game/engine3d";

interface TouchDeckProps {
  engine: HyperEngine | null;
}

export function TouchDeck({ engine }: TouchDeckProps) {
  if (!engine) return null;

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/80 p-2.5 backdrop-blur-md sm:gap-3 sm:p-3 select-none">
      {/* Pan D-pad */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-[9px] font-mono uppercase tracking-wider text-subtle mb-1">
          Translate
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div />
          <Button
            variant="pad"
            onClick={() => engine.movePiece(0, 1, 0)}
            className="size-10 p-0 rounded-lg text-fg"
            title="North (+Y)"
          >
            <ArrowUp className="size-4" />
          </Button>
          <div />

          <Button
            variant="pad"
            onClick={() => engine.movePiece(-1, 0, 0)}
            className="size-10 p-0 rounded-lg text-fg"
            title="West (-X)"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="grid place-items-center size-10 text-[9px] font-mono text-subtle">
            X·Y
          </div>
          <Button
            variant="pad"
            onClick={() => engine.movePiece(1, 0, 0)}
            className="size-10 p-0 rounded-lg text-fg"
            title="East (+X)"
          >
            <ArrowRight className="size-4" />
          </Button>

          <div />
          <Button
            variant="pad"
            onClick={() => engine.movePiece(0, -1, 0)}
            className="size-10 p-0 rounded-lg text-fg"
            title="South (-Y)"
          >
            <ArrowDown className="size-4" />
          </Button>
          <div />
        </div>
      </div>

      {/* Rotation Deck */}
      <div className="flex flex-col items-center justify-center border-x border-border/60 px-1">
        <div className="text-[9px] font-mono uppercase tracking-wider text-subtle mb-1">
          3-Axis Rotate
        </div>
        <div className="flex flex-col gap-1 w-full max-w-[110px]">
          <Button
            variant="pad"
            onClick={() => engine.rotatePiece("x", 1)}
            className="h-8 px-2 text-[11px] justify-between text-fg"
            title="Pitch around X"
          >
            <span className="font-mono text-accent">Pitch</span>
            <RotateCw className="size-3 text-subtle" />
          </Button>

          <Button
            variant="pad"
            onClick={() => engine.rotatePiece("z", 1)}
            className="h-8 px-2 text-[11px] justify-between text-fg"
            title="Yaw around Z"
          >
            <span className="font-mono text-accent">Yaw</span>
            <RotateCw className="size-3 text-subtle" />
          </Button>

          <Button
            variant="pad"
            onClick={() => engine.rotatePiece("y", 1)}
            className="h-8 px-2 text-[11px] justify-between text-fg"
            title="Roll around Y"
          >
            <span className="font-mono text-accent">Roll</span>
            <RotateCw className="size-3 text-subtle" />
          </Button>
        </div>
      </div>

      {/* Drop Deck */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-[9px] font-mono uppercase tracking-wider text-subtle mb-1">
          Gravity
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[110px]">
          <Button
            variant="pad"
            onClick={() => engine.softDrop()}
            className="h-11 text-xs font-mono justify-center text-fg"
            title="Soft Drop"
          >
            <ArrowDown className="size-3.5 mr-1" />
            Soft
          </Button>

          <Button
            variant="primary"
            onClick={() => engine.hardDrop()}
            className="h-11 text-xs font-mono justify-center font-bold"
            title="Hard Drop"
          >
            <Zap className="size-3.5 mr-1 fill-current" />
            Drop
          </Button>
        </div>
      </div>
    </div>
  );
}
