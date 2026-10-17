import { useState } from "react";
import { Check, ChevronDown, ChevronUp, RotateCcw, Sparkles, X, GraduationCap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HyperEngine, GameState } from "@/game/engine3d";

interface AcademyOverlayProps {
  engine: HyperEngine | null;
  state: GameState;
  onClose: () => void;
}

export function AcademyOverlay({ engine, state, onClose }: AcademyOverlayProps) {
  const [minimized, setMinimized] = useState(false);

  if (!state.tutorialMode || !engine) return null;

  const currentStep = engine.TUTORIAL_STEPS[state.tutorialStepIndex];
  if (!currentStep) return null;

  const stepIndex = state.tutorialStepIndex;
  const totalSteps = engine.TUTORIAL_STEPS.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const isLesson5 = stepIndex === 4;

  if (minimized) {
    return (
      <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 w-full max-w-lg px-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-surface/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent">
              <GraduationCap className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-wider uppercase text-accent font-semibold">
                  Lesson {stepIndex + 1}/{totalSteps}
                </span>
                {state.tutorialVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-ok/20 px-1.5 py-0.2 text-[9px] font-medium text-ok">
                    <Check className="size-2.5" /> Done
                  </span>
                )}
              </div>
              <div className="truncate text-xs font-medium text-fg">{currentStep.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {state.tutorialVerified && (
              <Button
                variant="primary"
                onClick={() => engine.advanceTutorialStep()}
                className="h-7 px-2.5 text-xs py-0"
              >
                {isLastStep ? "Graduate" : "Next →"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setMinimized(false)}
              className="h-7 w-7 p-0"
              title="Expand Academy Card"
            >
              <ChevronDown className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-3 top-3 z-20 mx-auto max-w-xl sm:top-5">
      <div className="rounded-2xl border border-accent/30 bg-surface/95 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-5">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-accent/20 text-accent">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">
                NESTRIS Δ ACADEMY · LESSON 0{stepIndex + 1}/0{totalSteps}
              </div>
              <h2 className="font-display text-lg font-medium leading-none text-fg sm:text-xl">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-fg"
              title="Minimize to banner"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-fg"
              title="Exit Academy"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Concept */}
        <div className="mt-3 text-xs leading-relaxed text-muted sm:text-[13px]">
          {currentStep.concept}
        </div>

        {/* Objective Task */}
        <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-accent">
            Directive
          </div>
          <div className="mt-0.5 text-xs font-medium text-fg sm:text-[13px]">
            {currentStep.task}
          </div>
        </div>

        {/* Badges / Checkpoints */}
        <div className="mt-3 flex flex-wrap gap-2">
          {currentStep.badges.map((b) => {
            const isPassed = b.check();
            return (
              <div
                key={b.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  isPassed
                    ? "border-ok/40 bg-ok/10 text-ok font-medium shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                    : "border-border bg-surface-2 text-subtle"
                }`}
              >
                <span
                  className={`grid size-3.5 place-items-center rounded-full text-[10px] ${
                    isPassed ? "bg-ok text-bg" : "bg-white/10 text-subtle"
                  }`}
                >
                  {isPassed ? <Check className="size-2.5 stroke-[3]" /> : "○"}
                </span>
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>

        {/* Lesson 5 specific hint and controls */}
        {isLesson5 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => engine.cycleTutorialExample()}
              className="h-8 text-xs px-2.5"
            >
              🎲 Cycle Example ({state.l5ExampleIndex + 1}/3)
            </Button>
            <Button
              variant="outline"
              onClick={() => engine.showTutorialSolution()}
              className="h-8 text-xs px-2.5 text-accent hover:text-accent-strong"
            >
              <Sparkles className="size-3 mr-1" />
              Auto-Solve Demo
            </Button>
          </div>
        )}

        {/* Lesson 1-4 solution demonstration for convenience */}
        {!isLesson5 && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
            <Button
              variant="ghost"
              onClick={() => engine.showTutorialSolution()}
              className="h-7 text-xs px-2 text-subtle hover:text-accent"
            >
              <Sparkles className="size-3 mr-1" />
              Demonstrate Checkpoint
            </Button>

            <Button
              variant="ghost"
              onClick={() => engine.restartTutorialStep()}
              className="h-7 text-xs px-2 text-subtle hover:text-fg"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset Step
            </Button>
          </div>
        )}

        {/* Bottom step switcher & action */}
        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {engine.TUTORIAL_STEPS.map((s, idx) => {
              const active = idx === stepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => engine.loadTutorialStep(idx)}
                  className={`grid size-6 place-items-center rounded-md text-[11px] font-mono transition-all ${
                    active
                      ? "bg-accent text-accent-fg font-bold shadow-[0_0_12px_rgba(125,211,252,0.4)]"
                      : "bg-surface-2 text-subtle hover:bg-white/10 hover:text-fg"
                  }`}
                  title={s.title}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2">
            {state.tutorialVerified ? (
              <Button
                variant="primary"
                onClick={() => engine.advanceTutorialStep()}
                className="h-9 px-4 text-xs font-semibold animate-pulse"
              >
                {isLastStep ? "Graduate & Play!" : "Next Lesson →"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setMinimized(true)}
                className="h-9 px-3 text-xs"
              >
                Practice in Well ↓
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
