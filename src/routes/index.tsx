import { createFileRoute, Link } from "@tanstack/react-router";
import { TesseractHero } from "@/components/landing/tesseract";
import { WaitlistForm } from "@/components/landing/waitlist";
import { DeltaMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const NAV = [
  { href: "#leap", label: "The Leap" },
  { href: "#mechanics", label: "Mechanics" },
  { href: "#editions", label: "Editions" },
];

const ROWS: [string, string, string][] = [
  ["Mating product", "binary (2 parents)", "ternary (3 parents)"],
  ["Space", "16×16×32", "16×16×32×8 subcells"],
  ["Rotation group", "octahedral, order 24", "tesseract, order 192"],
  ["Slab (clear unit)", "256 subcells", "2048 subcells (full x·y·w layer)"],
  ["Pocket shielding", "≥4 of 6 dirs", "≥6 of 8 dirs"],
  ["CRADLE overhang", "8 cells", "HYPERCRADLE: 26 cells (3×3×3 plate)"],
  ["REACTOR", "2³ cube, V=8", "2⁴ tesseract, V=16"],
  ["PLATE", "V=16", "V=64"],
  ["Post-lock verb", "Seam Slide", "Phase Slide (along w)"],
];

const MECHANICS = [
  {
    title: "Phase Slide",
    body: "The w-axis instance of the generalized Slide. A ½× piece dropped down a shaft in brane w₀ phases laterally into a hyperpocket in brane w₁ whose ceiling and phase-walls blocked direct vertical entry.",
  },
  {
    title: "Phase-locked hyperpockets",
    body: "Pockets open only along ±w (6 shielded of 8). Invisible to pure-3D play — reachable only by Phase Slide.",
  },
  {
    title: "Hyperdensity penalty",
    body: "Stacking only in the visible brane inflates local density but leaves hyperdensity low (w-extent is in the denominator), accelerating death. Only cross-brane nesting raises true hyperdensity.",
  },
  {
    title: "Triple-bag randomizer",
    body: "Independent shape, size, and phase bags — Thin / True / Hyper w-extent classes — so no two runs share the same dimensional rhythm.",
  },
];

const EDITIONS = [
  {
    name: "Early Access",
    price: "$19",
    tag: "First through the gate",
    items: ["Closed beta access", "Name in the launch credits", "Digital field-guide artbook"],
    featured: false,
  },
  {
    name: "Standard",
    price: "$39",
    tag: "The full fourth dimension",
    items: ["Full game on release", "Original soundtrack", "Interactive 4D brane viewer", "All Phase-Slide modes"],
    featured: true,
  },
  {
    name: "Collector's",
    price: "$79",
    tag: "For the dimension-curious",
    items: ["Everything in Standard", "Behind-the-scenes devlog", "Alternate hyper-skins", "Digital hypercube figurine"],
    featured: false,
  },
  {
    name: "Patron",
    price: "$199",
    tag: "Co-author the transdimension",
    items: ["Everything in Collector's", "Executive producer credit", "Design-input session", "Signed manifesto PDF"],
    featured: false,
  },
];

function Home() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2">
            <DeltaMark className="size-5" />
            <span className="font-display text-lg tracking-[0.18em]">
              NESTRIS <span className="text-accent">Δ</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-colors hover:text-fg">
                {n.label}
              </a>
            ))}
          </nav>
          <a href="#editions">
            <Button className="h-10 px-4">Pre-order</Button>
          </a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-accent)_12%,transparent),transparent_62%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-5 px-5 py-10 sm:gap-6 sm:py-16 lg:grid-cols-2 lg:py-24">
          <div className="stagger-in relative z-10">
            <p className="text-[11px] tracking-[0.32em] text-accent uppercase">Transdimensional puzzle</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tight sm:text-8xl">
              NESTRIS <span className="text-accent">Δ</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              The ternary mating product. Three tetrominoes, three perpendicular planes, one hidden
              fourth axis. The successor to NESTRIS 3D pushes the puzzle one dimension up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/play?academy=1">
                <Button>🎓 Spatial Academy</Button>
              </Link>
              <Link to="/play">
                <Button variant="outline">Play the prototype</Button>
              </Link>
              <a href="#editions">
                <Button variant="ghost">Pre-order editions</Button>
              </a>
            </div>
            <div className="mt-12 flex gap-8 text-sm">
              <Metric value="192" label="rotation group" />
              <Metric value="4D" label="state lattice" />
              <Metric value="3" label="mating parents" />
            </div>
          </div>
          <TesseractHero />
        </div>
      </section>

      <section id="leap" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <p className="text-[11px] tracking-[0.32em] text-subtle uppercase">The transdimensional leap</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">From binary to ternary mating</h2>
          <p className="mt-5 max-w-2xl text-muted">
            The 3D game mates two tetrominoes in perpendicular planes sharing the vertical axis.
            NESTRIS Δ mates three — opening a hidden fourth axis, w, in the unique minimal
            generalization: each added parent opens exactly one new spatial dimension.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <MathCard
              title="NESTRIS 3D"
              formula="𝟙_M(x,y,z) = 𝟙_A(x,z) · 𝟙_B(y,z)"
              note="binary · 2 parents"
            />
            <MathCard
              title="NESTRIS Δ"
              formula="𝟙_M(x,y,z,w) = 𝟙_A(x,z) · 𝟙_B(y,z) · 𝟙_C(w,z)"
              note="ternary · 3 parents · V(M) = Σ_z r_A·r_B·r_C"
              accent
            />
          </div>

          <p className="mt-10 max-w-2xl text-muted">
            The engine is a full 4D integer lattice — but the player sees and touches one 3D “brane”
            slice at a time, phasing between branes. True 4D state, 3D operational interface: that
            discriminating constraint is the whole game.
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <p className="text-[11px] tracking-[0.32em] text-subtle uppercase">How the ancestors escalate</p>
          <h2 className="mt-3 font-display text-4xl">3D → Δ, dimension by dimension</h2>
          <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-[11px] tracking-[0.18em] uppercase text-subtle">
                <tr>
                  <th className="px-4 py-3 font-medium">Concept</th>
                  <th className="px-4 py-3 font-medium">NESTRIS 3D</th>
                  <th className="px-4 py-3 font-medium text-accent">NESTRIS Δ</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([a, b, c]) => (
                  <tr key={a} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">{a}</td>
                    <td className="px-4 py-3 text-fg/80">{b}</td>
                    <td className="px-4 py-3 text-fg">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col gap-3 md:hidden">
            {ROWS.map(([a, b, c]) => (
              <div key={a} className="rounded-lg border border-border bg-surface p-4">
                <div className="text-[11px] tracking-[0.16em] text-subtle uppercase">{a}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] text-subtle">3D</div>
                    <div className="text-fg/80">{b}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-accent">Δ</div>
                    <div className="text-fg">{c}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mechanics" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <p className="text-[11px] tracking-[0.32em] text-subtle uppercase">New transdimensional mechanics</p>
          <h2 className="mt-3 font-display text-4xl">Play across the fourth axis</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {MECHANICS.map((m) => (
              <article key={m.title} className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-display text-2xl">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Callout k="HYPERCRADLE" v="26-cell overhang" />
            <Callout k="REACTOR" v="2⁴ tesseract · V=16" />
            <Callout k="PLATE" v="V=64" />
          </div>
        </div>
      </section>

      <section id="editions" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <p className="text-[11px] tracking-[0.32em] text-subtle uppercase">Editions</p>
          <h2 className="mt-3 font-display text-4xl">Claim your axis</h2>
          <p className="mt-4 max-w-xl text-muted">
            Pre-order funds the v0.2 census and the reference implementation. Every tier includes a
            place on the waitlist.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {EDITIONS.map((ed) => (
              <article
                key={ed.name}
                className={cn(
                  "relative flex flex-col rounded-xl border bg-surface p-5",
                  ed.featured ? "border-accent/50" : "border-border",
                )}
              >
                {ed.featured ? (
                  <span className="absolute -top-3 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] text-accent-fg uppercase">
                    Most chosen
                  </span>
                ) : null}
                <h3 className="font-display text-2xl">{ed.name}</h3>
                <div className="mt-1 font-display text-4xl tabular-nums">{ed.price}</div>
                <p className="mt-1 text-sm text-muted">{ed.tag}</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm text-fg/85">
                  {ed.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className="mt-6">
                  <Button variant={ed.featured ? "primary" : "outline"} className="w-full">
                    Reserve {ed.name}
                  </Button>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-12 lg:grid-cols-2 lg:gap-10 lg:py-20">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-subtle uppercase">Join the waitlist</p>
            <h2 className="mt-3 font-display text-4xl">Phase into the build</h2>
            <p className="mt-4 max-w-md text-muted">
              Reserve your edition. We open the gate in waves — early access ships with the v0.2
              census.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display tracking-[0.18em] text-muted">
            NESTRIS <span className="text-accent">Δ</span>
          </span>
          <span>A transdimensional mating puzzle · v0.1 spec</span>
        </div>
      </footer>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] tracking-[0.16em] text-subtle uppercase">{label}</div>
    </div>
  );
}

function MathCard({
  title,
  formula,
  note,
  accent,
}: {
  title: string;
  formula: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border bg-surface p-6", accent ? "border-accent/40" : "border-border")}>
      <div className={cn("text-[11px] tracking-[0.2em] uppercase", accent ? "text-accent" : "text-subtle")}>
        {title}
      </div>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm text-fg">{formula}</pre>
      <div className="mt-3 text-sm text-muted">{note}</div>
    </div>
  );
}

function Callout({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-4 py-3">
      <div className="text-[10px] tracking-[0.2em] text-subtle uppercase">{k}</div>
      <div className="mt-1 text-sm text-fg">{v}</div>
    </div>
  );
}
