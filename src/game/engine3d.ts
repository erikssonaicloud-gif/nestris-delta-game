import * as THREE from "three";
import { AudioFX } from "./audio";

export const WELL_W = 16;
export const WELL_D = 16;
export const WELL_H = 32;
export const SPAWN_Z = 31;

export type PieceTemplate = {
  name: string;
  color: number;
  cells: [number, number, number][];
};

export const LEGENDARIES: PieceTemplate[] = [
  {
    name: "MONOLITH", // I x I
    color: 0x00ffff,
    cells: [[0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3]],
  },
  {
    name: "REACTOR", // O x O
    color: 0xffaa00,
    cells: [
      [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
      [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
    ],
  },
  {
    name: "CRADLE", // T x T
    color: 0xff00ff,
    cells: [
      [1, 1, 0],
      [0, 0, 1], [1, 0, 1], [2, 0, 1],
      [0, 1, 1], [1, 1, 1], [2, 1, 1],
      [0, 2, 1], [1, 2, 1], [2, 2, 1],
    ],
  },
  {
    name: "HELIX", // S x Z
    color: 0x00ff77,
    cells: [
      [1, 0, 0], [2, 0, 0], [1, 1, 0], [2, 1, 0],
      [0, 1, 1], [1, 1, 1], [0, 2, 1], [1, 2, 1],
    ],
  },
  {
    name: "PLATE", // 4x4 flat plate
    color: 0xff3344,
    cells: (() => {
      const c: [number, number, number][] = [];
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          c.push([x, y, 0]);
        }
      }
      return c;
    })(),
  },
];

export type Voxel = { x: number; y: number; z: number };

export type ActivePiece = {
  template: string;
  color: number;
  voxels: Voxel[];
  pos: { x: number; y: number; z: number };
  sizeClass: "HALF" | "NORMAL" | "DOUBLE";
};

export type GameState = {
  score: number;
  level: number;
  linesCleared: number;
  density: number;
  densityState: "breathing" | "neutral" | "pressure";
  speedPerSec: string;
  speedStatus: string;
  isGameOver: boolean;
  activePiece: ActivePiece | null;
  tutorialMode: boolean;
  tutorialStepIndex: number;
  tutorialVerified: boolean;
  notification: string | null;
  l5ExampleIndex: number;
};

export type TutorialBadge = {
  id: string;
  label: string;
  check: () => boolean;
};

export type TutorialStep = {
  id: string;
  shortTitle: string;
  title: string;
  concept: string;
  task: string;
  badges: TutorialBadge[];
  setup: () => void;
  isDone: () => boolean;
};

export type L5Example = {
  name: string;
  shortLabel: string;
  task: string;
  hint: string;
  setupHost: () => void;
  pocketBounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  solution: {
    rotations: { axis: "x" | "y" | "z"; dir: number }[];
    targetX: number;
    targetY: number;
    explanation: string;
  };
};

export class HyperEngine {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  private wellData: (number | null)[][][] = [];
  private lockedMesh!: THREE.InstancedMesh;
  private lockedEdges!: THREE.InstancedMesh;
  private blockGeo!: THREE.BoxGeometry;
  private edgeGeo!: THREE.EdgesGeometry;
  private activePieceGroup = new THREE.Group();

  public state: GameState = {
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
  };

  private piecesPlacedInLevel = 0;
  private pauseGravity = false;
  private isDemonstratingSolution = false;

  public tutState = {
    orbitDelta: 0,
    zoomed: false,
    movedLeft: false,
    movedRight: false,
    movedFwd: false,
    movedBack: false,
    pitched: false,
    yawed: false,
    rolled: false,
    pocketUpward: false,
    nestCompleted: false,
    speedObserved: false,
  };

  public L5_EXAMPLES: L5Example[] = [
    {
      name: "Ex 1: Center Pocket (2×2×2 Cube)",
      shortLabel: "Center Pocket",
      task: "A Host CRADLE is anchored on the floor with an open 2×2×2 center pocket (X:7–8, Y:7–8). Steer the nimble Half-size Reactor (O ⊗ O) cube over the pocket, and press HARD DROP to seat it flush inside!",
      hint: "Move right (+X) and north (+Y) to align with X:7–8, Y:7–8, then press HARD DROP.",
      setupHost: () => {
        this.clearWellData();
        const hostColor = 0xff00ff;
        for (let x = 5; x <= 10; x++) {
          for (let y = 5; y <= 10; y++) {
            this.wellData[x][y][0] = hostColor;
            if (x <= 6 || x >= 9 || y <= 6 || y >= 9) {
              this.wellData[x][y][1] = hostColor;
              this.wellData[x][y][2] = hostColor;
            }
          }
        }
        this.updateLockedMeshes();
        this.updateDensity();
        this.pauseGravity = true;
        this.spawnPiece(LEGENDARIES[1], "HALF", { x: 5, y: 5, z: 12 });
      },
      pocketBounds: { minX: 7, maxX: 8, minY: 7, maxY: 8, minZ: 1, maxZ: 2 },
      solution: {
        rotations: [],
        targetX: 7,
        targetY: 7,
        explanation: "Aligned 2×2×2 Half-Reactor over center pocket (X:7-8, Y:7-8) and dropped flush into cavity.",
      },
    },
    {
      name: "Ex 2: Offset Pocket (West Pocket)",
      shortLabel: "Offset West Pocket",
      task: "The host pocket is offset to the West (X:5–6, Y:7–8). Steer the Half-Reactor left (-X) and north (+Y) directly over the cavity, then press HARD DROP!",
      hint: "Move left (-X) and north (+Y) to align with X:5–6, Y:7–8, then press HARD DROP.",
      setupHost: () => {
        this.clearWellData();
        const hostColor = 0x00d2ff;
        for (let x = 3; x <= 8; x++) {
          for (let y = 5; y <= 10; y++) {
            this.wellData[x][y][0] = hostColor;
            if (x <= 4 || x >= 7 || y <= 6 || y >= 9) {
              this.wellData[x][y][1] = hostColor;
              this.wellData[x][y][2] = hostColor;
            }
          }
        }
        this.updateLockedMeshes();
        this.updateDensity();
        this.pauseGravity = true;
        this.spawnPiece(LEGENDARIES[1], "HALF", { x: 8, y: 8, z: 12 });
      },
      pocketBounds: { minX: 5, maxX: 6, minY: 7, maxY: 8, minZ: 1, maxZ: 2 },
      solution: {
        rotations: [],
        targetX: 5,
        targetY: 7,
        explanation: "Steered west (-X) to X:5-6, Y:7-8 and dropped into the offset pocket.",
      },
    },
    {
      name: "Ex 3: Trench Mating (Pitched Monolith)",
      shortLabel: "Rotational Trench",
      task: "A host trench channel spans Y:6–9 at X:7 (Z:1). Press PITCH (R) to lay the Half-Monolith flat along the Y axis, align it over the trench, and press HARD DROP!",
      hint: "Press PITCH (R) to rotate flat along the Y axis, align with X:7 at Y:6–9, then HARD DROP.",
      setupHost: () => {
        this.clearWellData();
        const hostColor = 0xffaa00;
        for (let x = 5; x <= 9; x++) {
          for (let y = 4; y <= 11; y++) {
            this.wellData[x][y][0] = hostColor;
            if (x !== 7 || y < 6 || y > 9) {
              this.wellData[x][y][1] = hostColor;
              this.wellData[x][y][2] = hostColor;
            }
          }
        }
        this.updateLockedMeshes();
        this.updateDensity();
        this.pauseGravity = true;
        this.spawnPiece(LEGENDARIES[0], "HALF", { x: 7, y: 6, z: 12 });
      },
      pocketBounds: { minX: 7, maxX: 7, minY: 6, maxY: 9, minZ: 1, maxZ: 2 },
      solution: {
        rotations: [{ axis: "x", dir: 1 }],
        targetX: 7,
        targetY: 6,
        explanation: "Pitched Monolith 90° so it aligns along the Y axis trench at X:7, Y:6-9, then dropped flush.",
      },
    },
  ];

  public TUTORIAL_STEPS: TutorialStep[] = [
    {
      id: "camera",
      shortTitle: "L1: Camera Orbit",
      title: "Spatial Perspective & 3D Camera Orbit",
      concept: "In 3D multi-planar space, any single static 2D view is an optical illusion. Gaps appear filled when they are actually hollow dead volume behind blocks. You MUST navigate your viewpoint around the well to evaluate depth accurately.",
      task: "Drag across the screen (or mouse drag) to orbit the camera at least 45°, and pinch or roll scroll wheel to zoom.",
      badges: [
        { id: "badge-orbit", label: "Orbit (≥ 45°)", check: () => this.tutState.orbitDelta >= 0.78 },
        { id: "badge-zoom", label: "Zoom (Pinch/Wheel)", check: () => this.tutState.zoomed },
      ],
      setup: () => {
        this.tutState.orbitDelta = 0;
        this.tutState.zoomed = false;
        this.pauseGravity = true;
        this.clearWellData();
        this.updateLockedMeshes();
        this.spawnPiece(LEGENDARIES[0], "NORMAL", { x: 7, y: 7, z: 12 });
      },
      isDone: () => this.tutState.orbitDelta >= 0.78 && this.tutState.zoomed,
    },
    {
      id: "movement",
      shortTitle: "L2: Subcell Movement",
      title: "Subcell Lattice Navigation",
      concept: "The hyper-well is structured as a discrete subcell grid (16 × 16 × 32). Pieces translate horizontally across X (West/East) and Y (North/South) using the D-pad or keyboard keys.",
      task: "Drive the active piece in all 4 horizontal directions to prove command of planar translation.",
      badges: [
        { id: "badge-left", label: "◀ Left / A", check: () => this.tutState.movedLeft },
        { id: "badge-right", label: "▶ Right / D", check: () => this.tutState.movedRight },
        { id: "badge-fwd", label: "▲ North / W", check: () => this.tutState.movedFwd },
        { id: "badge-back", label: "▼ South / S", check: () => this.tutState.movedBack },
      ],
      setup: () => {
        this.tutState.movedLeft = this.tutState.movedRight = this.tutState.movedFwd = this.tutState.movedBack = false;
        this.pauseGravity = true;
        this.clearWellData();
        this.updateLockedMeshes();
        this.spawnPiece(LEGENDARIES[1], "NORMAL", { x: 7, y: 7, z: 14 });
      },
      isDone: () => this.tutState.movedLeft && this.tutState.movedRight && this.tutState.movedFwd && this.tutState.movedBack,
    },
    {
      id: "rotation",
      shortTitle: "L3: 3-Axis Rotation",
      title: "3-Axis Rotational Degrees of Freedom",
      concept: "2D Tetris has only 1 rotational plane (spinning in 2D). In 3D space, rigid solids rotate across three orthogonal axes: Pitch (X: R), Yaw (Z: Q), and Roll (Y: Z).",
      task: "Rotate the active piece across all 3 independent spatial axes (Pitch, Yaw, and Roll).",
      badges: [
        { id: "badge-pitch", label: "Pitch (X: R)", check: () => this.tutState.pitched },
        { id: "badge-yaw", label: "Yaw (Z: Q)", check: () => this.tutState.yawed },
        { id: "badge-roll", label: "Roll (Y: Z)", check: () => this.tutState.rolled },
      ],
      setup: () => {
        this.tutState.pitched = this.tutState.yawed = this.tutState.rolled = false;
        this.pauseGravity = true;
        this.clearWellData();
        this.updateLockedMeshes();
        this.spawnPiece(LEGENDARIES[3], "NORMAL", { x: 7, y: 7, z: 14 });
      },
      isDone: () => this.tutState.pitched && this.tutState.yawed && this.tutState.rolled,
    },
    {
      id: "pocket",
      shortTitle: "L4: Pocket Topography",
      title: "Mated Geometry & Pocket Topography",
      concept: "Pieces in NESTRIS Δ are Ternary Mating Products (A ⊗ B ⊗ C) of classic tetrominoes. The legendary CRADLE (T ⊗ T) is an intentional cup shape with an internal hollow pocket surrounded by rim walls—a receptor for guest pieces.",
      task: "Orient the CRADLE using Pitch and Roll buttons so that its open hollow pocket faces directly UPWARD towards the sky (+Z).",
      badges: [
        { id: "badge-pocket-up", label: "Receptor Cup UP (+Z)", check: () => this.tutState.pocketUpward },
      ],
      setup: () => {
        this.tutState.pocketUpward = false;
        this.pauseGravity = true;
        this.clearWellData();
        this.updateLockedMeshes();
        this.spawnPiece(LEGENDARIES[2], "NORMAL", { x: 6, y: 6, z: 12 });
        this.rotatePiece("x", 1);
      },
      isDone: () => {
        if (!this.state.activePiece) return false;
        let minZ = 999, maxZ = -999;
        this.state.activePiece.voxels.forEach((v) => {
          if (v.z < minZ) minZ = v.z;
          if (v.z > maxZ) maxZ = v.z;
        });
        const baseCount = this.state.activePiece.voxels.filter((v) => v.z === minZ).length;
        const topCount = this.state.activePiece.voxels.filter((v) => v.z === maxZ).length;
        this.tutState.pocketUpward = baseCount < topCount && maxZ - minZ >= 1;
        return this.tutState.pocketUpward;
      },
    },
    {
      id: "nesting",
      shortTitle: "L5: Hyperpocket Nesting",
      title: "Tactile Hyperpocket Nesting & Density",
      concept: '"Wasted volume is death." In 3D and 4D, empty voids ruin your Density score. When Density drops below 0.50, the system turns red. To survive, you must NEST nimble Half-size pieces into the hollow cavities of host pieces.',
      task: "A Host CRADLE is anchored on the floor. Steer the nimble Half-size piece over the center receptor pocket, and press HARD DROP to seat it flush inside!",
      badges: [
        { id: "badge-nest", label: "Seat in Pocket (DROP)", check: () => this.tutState.nestCompleted },
      ],
      setup: () => {
        this.tutState.nestCompleted = false;
        this.L5_EXAMPLES[this.state.l5ExampleIndex].setupHost();
      },
      isDone: () => this.tutState.nestCompleted,
    },
    {
      id: "acceleration",
      shortTitle: "L6: Live Acceleration",
      title: "Gentle Level 1 Pacing & Realtime Acceleration",
      concept: "Level 1 begins at half-speed (1.00 subcells/sec instead of 2.00) to grant you cognitive time to survey 3D coordinates. As pieces lock, the engine smoothly accelerates towards standard tempo.",
      task: "Take the controls in real-time gravity: Steer the active piece into a stable position, press HARD DROP to lock it, and watch the Drop Speed meter accelerate!",
      badges: [
        { id: "badge-drop-live", label: "Lock Piece (DROP)", check: () => this.tutState.speedObserved },
      ],
      setup: () => {
        this.tutState.speedObserved = false;
        this.pauseGravity = false;
        this.piecesPlacedInLevel = 0;
        this.state.level = 1;
        this.updateSpeedDisplay();
        this.spawnPiece();
      },
      isDone: () => this.tutState.speedObserved,
    },
  ];

  // Camera State
  private camTheta = Math.PI / 4;
  private camPhi = Math.PI / 4;
  private camRadius = WELL_W * 2.5;
  private camTarget = new THREE.Vector3(WELL_W / 2, WELL_D / 2, WELL_H / 3);
  private isDragging = false;
  private prevMouse = { x: 0, y: 0 };
  private touchStartDist = 0;

  // Animation Loop
  private animId: number | null = null;
  private lastTime = 0;
  private dropTimer = 0;
  private onStateChange?: (s: GameState) => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: (s: GameState) => void) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;
    this.initScene();
    this.initEvents();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06060c);

    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.up.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(30, 20, 60);
    this.scene.add(dirLight);

    // Well wireframe
    const wellGeo = new THREE.BoxGeometry(WELL_W, WELL_D, WELL_H);
    const wellEdges = new THREE.EdgesGeometry(wellGeo);
    const wellMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.6 });
    const wellMesh = new THREE.LineSegments(wellEdges, wellMat);
    wellMesh.position.set(WELL_W / 2, WELL_D / 2, WELL_H / 2);
    this.scene.add(wellMesh);

    // Floor grid
    const gridHelper = new THREE.GridHelper(WELL_W, WELL_W, 0x00ffff, 0x0f2942);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(WELL_W / 2, WELL_D / 2, 0);
    this.scene.add(gridHelper);

    this.clearWellData();

    const maxInstances = WELL_W * WELL_D * WELL_H;
    this.blockGeo = new THREE.BoxGeometry(1, 1, 1);
    const blockMat = new THREE.MeshPhysicalMaterial({
      color: 0x111625,
      metalness: 0.2,
      roughness: 0.2,
      transmission: 0.75,
      transparent: true,
      opacity: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    this.lockedMesh = new THREE.InstancedMesh(this.blockGeo, blockMat, maxInstances);
    this.lockedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.lockedMesh);

    this.edgeGeo = new THREE.EdgesGeometry(this.blockGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    this.lockedEdges = new THREE.InstancedMesh(new THREE.LineSegments(this.edgeGeo).geometry, edgeMat, maxInstances);
    this.lockedEdges.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.lockedEdges);

    this.scene.add(this.activePieceGroup);
    this.updateCamera();

    this.resetGame();
    this.lastTime = performance.now();
    this.startLoop();
  }

  private clearWellData() {
    this.wellData = [];
    for (let x = 0; x < WELL_W; x++) {
      this.wellData[x] = [];
      for (let y = 0; y < WELL_D; y++) {
        this.wellData[x][y] = new Array(WELL_H).fill(null);
      }
    }
  }

  public resize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private updateCamera() {
    this.camPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.camPhi));
    this.camera.position.x = this.camTarget.x + this.camRadius * Math.sin(this.camPhi) * Math.cos(this.camTheta);
    this.camera.position.y = this.camTarget.y + this.camRadius * Math.sin(this.camPhi) * Math.sin(this.camTheta);
    this.camera.position.z = this.camTarget.z + this.camRadius * Math.cos(this.camPhi);
    this.camera.lookAt(this.camTarget);
  }

  private emitState() {
    this.onStateChange?.({ ...this.state });
  }

  public showNotification(msg: string) {
    this.state.notification = msg;
    this.emitState();
    setTimeout(() => {
      if (this.state.notification === msg) {
        this.state.notification = null;
        this.emitState();
      }
    }, 3000);
  }

  public spawnPiece(
    forcedTemplate: PieceTemplate | null = null,
    forcedSizeClass: "HALF" | "NORMAL" | "DOUBLE" | null = null,
    forcedPos: { x: number; y: number; z: number } | null = null,
  ): boolean {
    const template = forcedTemplate || LEGENDARIES[Math.floor(Math.random() * LEGENDARIES.length)];
    const r = Math.random();
    const sizeClass = forcedSizeClass || (r > 0.75 ? "HALF" : "NORMAL");
    const voxels = this.generatePieceVoxels(template, sizeClass);

    this.state.activePiece = {
      template: template.name,
      color: template.color,
      voxels,
      pos: forcedPos ? { ...forcedPos } : { x: Math.floor(WELL_W / 2) - 2, y: Math.floor(WELL_D / 2) - 2, z: SPAWN_Z },
      sizeClass,
    };

    if (!forcedPos) {
      let maxZ = 0;
      this.state.activePiece.voxels.forEach((v) => {
        if (v.z > maxZ) maxZ = v.z;
      });
      this.state.activePiece.pos.z = SPAWN_Z - maxZ - 1;
    }

    if (this.checkCollision(this.state.activePiece.pos, this.state.activePiece.voxels)) {
      if (!this.state.tutorialMode) {
        this.triggerGameOver();
      }
      return false;
    }
    this.buildActivePieceMesh();
    this.emitState();
    return true;
  }

  private generatePieceVoxels(template: PieceTemplate, sizeClass: "HALF" | "NORMAL" | "DOUBLE") {
    const voxels: Voxel[] = [];
    const scale = sizeClass === "HALF" ? 1 : sizeClass === "DOUBLE" ? 4 : 2;
    template.cells.forEach((cell) => {
      const [cx, cy, cz] = cell;
      for (let i = 0; i < scale; i++) {
        for (let j = 0; j < scale; j++) {
          for (let k = 0; k < scale; k++) {
            voxels.push({
              x: cx * scale + i,
              y: cy * scale + j,
              z: cz * scale + k,
            });
          }
        }
      }
    });
    return voxels;
  }

  private buildActivePieceMesh() {
    while (this.activePieceGroup.children.length > 0) {
      this.activePieceGroup.remove(this.activePieceGroup.children[0]);
    }
    const active = this.state.activePiece;
    if (!active) return;

    const pMat = new THREE.MeshPhysicalMaterial({
      color: 0x050b14,
      emissive: active.color,
      emissiveIntensity: 0.35,
      transmission: 0.85,
      transparent: true,
      opacity: 0.92,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const pEdgeMat = new THREE.LineBasicMaterial({ color: active.color });

    active.voxels.forEach((v) => {
      const mesh = new THREE.Mesh(this.blockGeo, pMat);
      mesh.position.set(v.x + 0.5, v.y + 0.5, v.z + 0.5);
      const edges = new THREE.LineSegments(this.edgeGeo, pEdgeMat);
      mesh.add(edges);
      this.activePieceGroup.add(mesh);
    });

    this.updateActivePieceTransform();
  }

  private updateActivePieceTransform() {
    if (!this.state.activePiece) return;
    this.activePieceGroup.position.set(
      this.state.activePiece.pos.x,
      this.state.activePiece.pos.y,
      this.state.activePiece.pos.z,
    );
  }

  public checkCollision(pos: { x: number; y: number; z: number }, voxels: Voxel[]) {
    for (let i = 0; i < voxels.length; i++) {
      const vx = pos.x + voxels[i].x;
      const vy = pos.y + voxels[i].y;
      const vz = pos.z + voxels[i].z;

      if (vx < 0 || vx >= WELL_W || vy < 0 || vy >= WELL_D || vz < 0) return true;
      if (vz >= WELL_H) continue;
      if (this.wellData[vx][vy][vz] !== null) return true;
    }
    return false;
  }

  public movePiece(dx: number, dy: number, dz: number): boolean {
    const active = this.state.activePiece;
    if (!active || this.state.isGameOver) return false;
    const newPos = { x: active.pos.x + dx, y: active.pos.y + dy, z: active.pos.z + dz };
    if (!this.checkCollision(newPos, active.voxels)) {
      active.pos = newPos;
      this.updateActivePieceTransform();
      AudioFX.playKey();

      if (this.state.tutorialMode) {
        if (dx < 0) this.tutState.movedLeft = true;
        if (dx > 0) this.tutState.movedRight = true;
        if (dy > 0) this.tutState.movedFwd = true;
        if (dy < 0) this.tutState.movedBack = true;
        this.checkTutorialProgress();
      }
      this.emitState();
      return true;
    }
    return false;
  }

  public rotatePiece(axis: "x" | "y" | "z", direction: number): boolean {
    const active = this.state.activePiece;
    if (!active || this.state.isGameOver) return false;

    let minX = 999, maxX = -999, minY = 999, maxY = -999, minZ = 999, maxZ = -999;
    active.voxels.forEach((v) => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
      if (v.z < minZ) minZ = v.z;
      if (v.z > maxZ) maxZ = v.z;
    });
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;

    const newVoxels: Voxel[] = [];
    active.voxels.forEach((v) => {
      const tx = v.x - cx;
      const ty = v.y - cy;
      const tz = v.z - cz;

      let nx = tx, ny = ty, nz = tz;
      if (axis === "x") {
        nx = tx;
        ny = direction * tz;
        nz = -direction * ty;
      } else if (axis === "y") {
        nx = -direction * tz;
        ny = ty;
        nz = direction * tx;
      } else if (axis === "z") {
        nx = direction * ty;
        ny = -direction * tx;
        nz = tz;
      }

      newVoxels.push({
        x: Math.round(nx + cx),
        y: Math.round(ny + cy),
        z: Math.round(nz + cz),
      });
    });

    let minNx = 999, minNy = 999, minNz = 999;
    newVoxels.forEach((v) => {
      if (v.x < minNx) minNx = v.x;
      if (v.y < minNy) minNy = v.y;
      if (v.z < minNz) minNz = v.z;
    });

    const normalizedVoxels = newVoxels.map((v) => ({
      x: v.x - minNx,
      y: v.y - minNy,
      z: v.z - minNz,
    }));

    const proposedPos = {
      x: active.pos.x + minNx,
      y: active.pos.y + minNy,
      z: active.pos.z + minNz,
    };

    const kicks = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 2 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 1, z: 0 },
    ];

    for (const kick of kicks) {
      const kPos = { x: proposedPos.x + kick.x, y: proposedPos.y + kick.y, z: proposedPos.z + kick.z };
      if (!this.checkCollision(kPos, normalizedVoxels)) {
        active.voxels = normalizedVoxels;
        active.pos = kPos;
        this.buildActivePieceMesh();
        AudioFX.playRotate();

        if (this.state.tutorialMode) {
          if (axis === "x") this.tutState.pitched = true;
          if (axis === "z") this.tutState.yawed = true;
          if (axis === "y") this.tutState.rolled = true;
          this.checkTutorialProgress();
        }
        this.emitState();
        return true;
      }
    }
    return false;
  }

  public softDrop(): boolean {
    const moved = this.movePiece(0, 0, -1);
    if (moved) {
      this.state.score += 1;
      this.emitState();
    }
    return moved;
  }

  public hardDrop() {
    const active = this.state.activePiece;
    if (!active || this.state.isGameOver) return;
    while (this.movePiece(0, 0, -1)) {}
    this.lockPiece();
    AudioFX.playKey();
  }

  public lockPiece() {
    const active = this.state.activePiece;
    if (!active) return;
    let hitSpawnBuffer = false;

    active.voxels.forEach((v) => {
      const vx = active.pos.x + v.x;
      const vy = active.pos.y + v.y;
      const vz = active.pos.z + v.z;

      if (vz >= WELL_H) {
        hitSpawnBuffer = true;
        return;
      }
      this.wellData[vx][vy][vz] = active.color;
    });

    if (hitSpawnBuffer) {
      if (!this.state.tutorialMode) this.triggerGameOver();
      return;
    }

    this.state.score += active.voxels.length * 2;
    this.piecesPlacedInLevel++;

    this.checkSlabClears();
    this.updateLockedMeshes();
    this.updateDensity();
    this.updateSpeedDisplay();

    if (this.state.tutorialMode) {
      this.onTutorialPieceLocked();
    } else {
      this.spawnPiece();
    }

    this.emitState();
  }

  private checkSlabClears() {
    let slabsCleared = 0;
    for (let z = WELL_H - 1; z >= 0; z--) {
      let isFull = true;
      for (let x = 0; x < WELL_W; x++) {
        for (let y = 0; y < WELL_D; y++) {
          if (this.wellData[x][y][z] === null) {
            isFull = false;
            break;
          }
        }
        if (!isFull) break;
      }

      if (isFull) {
        slabsCleared++;
        for (let dropZ = z; dropZ < WELL_H - 1; dropZ++) {
          for (let x = 0; x < WELL_W; x++) {
            for (let y = 0; y < WELL_D; y++) {
              this.wellData[x][y][dropZ] = this.wellData[x][y][dropZ + 1];
            }
          }
        }
        for (let x = 0; x < WELL_W; x++) {
          for (let y = 0; y < WELL_D; y++) {
            this.wellData[x][y][WELL_H - 1] = null;
          }
        }
      }
    }

    if (slabsCleared > 0) {
      const multipliers = [0, 100, 300, 500, 800, 1200];
      const base = slabsCleared <= 5 ? multipliers[slabsCleared] : 1200 + (slabsCleared - 5) * 200;
      this.state.score += base * this.state.level;
      this.state.linesCleared += slabsCleared;
      const newLevel = Math.floor(this.state.linesCleared / 10) + 1;
      if (newLevel !== this.state.level) {
        this.state.level = newLevel;
        this.piecesPlacedInLevel = 0;
      }
      this.showNotification(`★ ${slabsCleared} HYPER-SLAB CLEARED (+${base * this.state.level}) ★`);
      AudioFX.playNestFanfare();
    }
  }

  private updateLockedMeshes() {
    let lockedCount = 0;
    const dummy = new THREE.Object3D();
    const colorObj = new THREE.Color();

    for (let z = 0; z < WELL_H; z++) {
      for (let x = 0; x < WELL_W; x++) {
        for (let y = 0; y < WELL_D; y++) {
          const colorHex = this.wellData[x][y][z];
          if (colorHex !== null) {
            dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
            dummy.updateMatrix();

            this.lockedMesh.setMatrixAt(lockedCount, dummy.matrix);
            this.lockedEdges.setMatrixAt(lockedCount, dummy.matrix);

            colorObj.setHex(colorHex);
            this.lockedEdges.setColorAt(lockedCount, colorObj);

            lockedCount++;
          }
        }
      }
    }

    this.lockedMesh.count = lockedCount;
    this.lockedEdges.count = lockedCount;
    this.lockedMesh.instanceMatrix.needsUpdate = true;
    this.lockedEdges.instanceMatrix.needsUpdate = true;
    if (this.lockedEdges.instanceColor) this.lockedEdges.instanceColor.needsUpdate = true;
  }

  private updateDensity() {
    let maxZ = -1;
    let occupied = 0;
    for (let z = 0; z < WELL_H; z++) {
      let rowOccupied = 0;
      for (let x = 0; x < WELL_W; x++) {
        for (let y = 0; y < WELL_D; y++) {
          if (this.wellData[x][y][z] !== null) {
            rowOccupied++;
          }
        }
      }
      if (rowOccupied > 0) {
        maxZ = z;
        occupied += rowOccupied;
      }
    }

    if (maxZ === -1) {
      this.state.density = 0;
      this.state.densityState = "neutral";
      return;
    }

    const totalVolume = WELL_W * WELL_D * (maxZ + 1);
    const density = occupied / totalVolume;
    this.state.density = density;

    if (density < 0.5) this.state.densityState = "pressure";
    else if (density >= 0.8) this.state.densityState = "breathing";
    else this.state.densityState = "neutral";
  }

  public getGravitySpeed(): number {
    let baseSpeed: number;
    if (this.state.level === 1) {
      const ramp = Math.min(1.0, this.piecesPlacedInLevel / 8);
      baseSpeed = 1.0 + ramp * 1.0;
    } else {
      baseSpeed = 2.0 * Math.pow(1.28, this.state.level - 1);
    }
    let msPerDrop = 1000 / baseSpeed;
    if (this.state.activePiece?.sizeClass === "HALF") msPerDrop *= 0.8;
    if (this.state.activePiece?.sizeClass === "DOUBLE") msPerDrop *= 1.25;
    return Math.max(50, msPerDrop);
  }

  private updateSpeedDisplay() {
    const ms = this.getGravitySpeed();
    const subcellsPerSec = (1000 / ms).toFixed(2);
    this.state.speedPerSec = `${subcellsPerSec}/s`;

    if (this.state.level === 1) {
      if (this.piecesPlacedInLevel === 0) {
        this.state.speedStatus = "Half-Speed (Level 1 Start)";
      } else if (this.piecesPlacedInLevel < 8) {
        this.state.speedStatus = `Accelerating (${this.piecesPlacedInLevel}/8 blocks)`;
      } else {
        this.state.speedStatus = "Standard Speed (Level 1 Ready)";
      }
    } else {
      this.state.speedStatus = `Exponential Level ${this.state.level}`;
    }
  }

  // --- ACADEMY / TUTORIAL STATE MACHINE ---
  public startTutorial() {
    this.state.tutorialMode = true;
    this.state.tutorialStepIndex = 0;
    this.state.tutorialVerified = false;
    this.loadTutorialStep(0);
  }

  public exitTutorial() {
    this.state.tutorialMode = false;
    this.state.tutorialVerified = false;
    this.resetGame();
  }

  public loadTutorialStep(idx: number) {
    this.state.tutorialStepIndex = idx;
    this.state.tutorialVerified = false;
    const step = this.TUTORIAL_STEPS[idx];
    step.setup();
    this.checkTutorialProgress();
    this.emitState();
  }

  public checkTutorialProgress() {
    if (!this.state.tutorialMode) return;
    const step = this.TUTORIAL_STEPS[this.state.tutorialStepIndex];

    if (step.isDone()) {
      if (!this.state.tutorialVerified) {
        this.state.tutorialVerified = true;
        AudioFX.playConfirm();
        this.showNotification("✓ CHECKPOINT VERIFIED!");
      }
    }
    this.emitState();
  }

  public advanceTutorialStep() {
    if (this.state.tutorialStepIndex + 1 < this.TUTORIAL_STEPS.length) {
      this.loadTutorialStep(this.state.tutorialStepIndex + 1);
    } else {
      this.completeTutorial();
    }
  }

  public restartTutorialStep() {
    if (this.isDemonstratingSolution) return;
    this.clearWellData();
    this.updateLockedMeshes();
    this.loadTutorialStep(this.state.tutorialStepIndex);
    this.showNotification("🔄 Lesson reset: fresh piece ready!");
    AudioFX.playKey();
  }

  public cycleTutorialExample() {
    if (!this.state.tutorialMode || this.state.tutorialStepIndex !== 4 || this.isDemonstratingSolution) return;
    this.state.l5ExampleIndex = (this.state.l5ExampleIndex + 1) % this.L5_EXAMPLES.length;
    this.tutState.nestCompleted = false;
    this.clearWellData();
    this.updateLockedMeshes();
    this.loadTutorialStep(4);
    const ex = this.L5_EXAMPLES[this.state.l5ExampleIndex];
    this.showNotification(`🎲 Loaded ${ex.name}: ${ex.hint}`);
    AudioFX.playKey();
  }

  public showTutorialSolution() {
    if (!this.state.tutorialMode || this.isDemonstratingSolution) return;

    if (this.state.tutorialStepIndex === 4) {
      const ex = this.L5_EXAMPLES[this.state.l5ExampleIndex];
      this.isDemonstratingSolution = true;
      this.showNotification(`💡 DEMO: Solving ${ex.name}...`);
      AudioFX.playKey();
      ex.setupHost();

      setTimeout(() => {
        if (!this.state.activePiece) {
          this.isDemonstratingSolution = false;
          return;
        }

        if (ex.solution.rotations && ex.solution.rotations.length > 0) {
          ex.solution.rotations.forEach((r) => this.rotatePiece(r.axis, r.dir));
        }

        const stepInterval = setInterval(() => {
          if (!this.state.activePiece) {
            clearInterval(stepInterval);
            this.isDemonstratingSolution = false;
            return;
          }
          let moved = false;
          if (this.state.activePiece.pos.x < ex.solution.targetX) {
            this.movePiece(1, 0, 0);
            moved = true;
          } else if (this.state.activePiece.pos.x > ex.solution.targetX) {
            this.movePiece(-1, 0, 0);
            moved = true;
          } else if (this.state.activePiece.pos.y < ex.solution.targetY) {
            this.movePiece(0, 1, 0);
            moved = true;
          } else if (this.state.activePiece.pos.y > ex.solution.targetY) {
            this.movePiece(0, -1, 0);
            moved = true;
          }

          if (!moved) {
            clearInterval(stepInterval);
            setTimeout(() => {
              this.hardDrop();
              this.isDemonstratingSolution = false;
              this.showNotification(`💡 Solution Demonstrated! ${ex.solution.explanation} Press "Reset" to try yourself!`);
            }, 300);
          }
        }, 140);
      }, 400);
    } else if (this.state.tutorialStepIndex === 3) {
      this.isDemonstratingSolution = true;
      this.showNotification("💡 Rotating Cradle so pocket faces UP (+Z)...");
      this.rotatePiece("x", 1);
      setTimeout(() => {
        this.tutState.pocketUpward = true;
        this.checkTutorialProgress();
        this.isDemonstratingSolution = false;
        this.showNotification("💡 Solution Demonstrated: Hollow receptor cup is pointing UP!");
      }, 200);
    } else if (this.state.tutorialStepIndex === 0) {
      this.isDemonstratingSolution = true;
      this.showNotification("💡 Demonstrating camera orbit and zoom...");
      let step = 0;
      const camInt = setInterval(() => {
        this.camTheta += 0.15;
        this.camPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.1, this.camPhi + 0.05));
        this.camRadius = 48;
        this.updateCamera();
        step++;
        if (step >= 8) {
          clearInterval(camInt);
          this.tutState.orbitDelta = 1.2;
          this.tutState.zoomed = true;
          this.checkTutorialProgress();
          this.isDemonstratingSolution = false;
          this.showNotification("💡 Camera orbit demonstrated!");
        }
      }, 60);
    } else if (this.state.tutorialStepIndex === 1) {
      this.isDemonstratingSolution = true;
      this.showNotification("💡 Demonstrating 4-way translation...");
      this.movePiece(-1, 0, 0);
      setTimeout(() => {
        this.movePiece(2, 0, 0);
        setTimeout(() => {
          this.movePiece(-1, 1, 0);
          setTimeout(() => {
            this.movePiece(0, -2, 0);
            setTimeout(() => {
              this.movePiece(0, 1, 0);
              this.tutState.movedLeft = this.tutState.movedRight = this.tutState.movedFwd = this.tutState.movedBack = true;
              this.checkTutorialProgress();
              this.isDemonstratingSolution = false;
              this.showNotification("💡 4-way subcell translation demonstrated!");
            }, 150);
          }, 150);
        }, 150);
      }, 150);
    } else if (this.state.tutorialStepIndex === 2) {
      this.isDemonstratingSolution = true;
      this.showNotification("💡 Demonstrating Pitch, Yaw, and Roll...");
      this.rotatePiece("x", 1);
      setTimeout(() => {
        this.rotatePiece("z", 1);
        setTimeout(() => {
          this.rotatePiece("y", 1);
          this.tutState.pitched = this.tutState.yawed = this.tutState.rolled = true;
          this.checkTutorialProgress();
          this.isDemonstratingSolution = false;
          this.showNotification("💡 3-axis rotation demonstrated!");
        }, 200);
      }, 200);
    } else if (this.state.tutorialStepIndex === 5) {
      this.isDemonstratingSolution = true;
      this.showNotification("💡 Locking piece to demonstrate acceleration...");
      this.hardDrop();
      this.tutState.speedObserved = true;
      this.checkTutorialProgress();
      this.isDemonstratingSolution = false;
    }
  }

  private completeTutorial() {
    this.state.tutorialMode = false;
    this.state.tutorialVerified = false;
    this.showNotification("🏆 ACADEMY GRADUATE: ALL SPATIAL CONCEPTS CERTIFIED!");
    AudioFX.playNestFanfare();
    this.resetGame();
  }

  private onTutorialPieceLocked() {
    if (!this.state.tutorialMode) return;
    const step = this.TUTORIAL_STEPS[this.state.tutorialStepIndex];
    if (step.isDone()) return;

    if (this.state.tutorialStepIndex === 4) {
      const ex = this.L5_EXAMPLES[this.state.l5ExampleIndex];
      let insidePocket = true;
      const active = this.state.activePiece;
      if (active) {
        active.voxels.forEach((v) => {
          const vx = active.pos.x + v.x;
          const vy = active.pos.y + v.y;
          const vz = active.pos.z + v.z;
          if (
            !(
              vx >= ex.pocketBounds.minX &&
              vx <= ex.pocketBounds.maxX &&
              vy >= ex.pocketBounds.minY &&
              vy <= ex.pocketBounds.maxY &&
              vz >= ex.pocketBounds.minZ &&
              vz <= ex.pocketBounds.maxZ
            )
          ) {
            insidePocket = false;
          }
        });
      }

      if (insidePocket) {
        this.tutState.nestCompleted = true;
        this.showNotification("★ HYPERPOCKET NEST DETECTED! DENSITY MAXIMUM (+500 BONUS) ★");
        AudioFX.playNestFanfare();
        this.checkTutorialProgress();
      } else {
        this.showNotification("⚠️ Missed pocket! Resetting guest piece in 1s...");
        AudioFX.playKey();
        setTimeout(() => {
          if (this.state.tutorialMode && this.state.tutorialStepIndex === 4 && !this.tutState.nestCompleted && !this.isDemonstratingSolution) {
            step.setup();
          }
        }, 800);
      }
    } else if (this.state.tutorialStepIndex === 5) {
      this.tutState.speedObserved = true;
      this.checkTutorialProgress();
      this.spawnPiece();
    } else {
      this.showNotification("⚠️ Piece locked! Respawning fresh block to complete lesson...");
      AudioFX.playKey();
      setTimeout(() => {
        if (this.state.tutorialMode && !step.isDone()) {
          this.clearWellData();
          this.updateLockedMeshes();
          if (this.state.tutorialStepIndex === 0) this.spawnPiece(LEGENDARIES[0], "NORMAL", { x: 7, y: 7, z: 12 });
          else if (this.state.tutorialStepIndex === 1) this.spawnPiece(LEGENDARIES[1], "NORMAL", { x: 7, y: 7, z: 14 });
          else if (this.state.tutorialStepIndex === 2) this.spawnPiece(LEGENDARIES[3], "NORMAL", { x: 7, y: 7, z: 14 });
          else if (this.state.tutorialStepIndex === 3) {
            this.spawnPiece(LEGENDARIES[2], "NORMAL", { x: 6, y: 6, z: 12 });
            this.rotatePiece("x", 1);
          }
        }
      }, 400);
    }
  }

  public triggerGameOver() {
    this.state.isGameOver = true;
    this.emitState();
  }

  public resetGame() {
    this.clearWellData();
    this.updateLockedMeshes();
    this.state.score = 0;
    this.state.level = 1;
    this.state.linesCleared = 0;
    this.piecesPlacedInLevel = 0;
    this.pauseGravity = false;
    this.state.isGameOver = false;
    this.updateSpeedDisplay();
    this.updateDensity();
    this.spawnPiece();
    this.emitState();
  }

  // --- INTERACTION & GESTURES ---
  private initEvents() {
    const el = this.canvas;

    const onMouseDown = (e: MouseEvent) => {
      AudioFX.init();
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouse.x;
      const deltaY = e.clientY - this.prevMouse.y;
      this.camTheta -= deltaX * 0.01;
      this.camPhi -= deltaY * 0.01;
      this.prevMouse = { x: e.clientX, y: e.clientY };
      this.updateCamera();

      if (this.state.tutorialMode && this.state.tutorialStepIndex === 0) {
        this.tutState.orbitDelta += Math.abs(deltaX * 0.01) + Math.abs(deltaY * 0.01);
        this.checkTutorialProgress();
      }
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      this.camRadius += e.deltaY * 0.05;
      this.camRadius = Math.max(10, Math.min(100, this.camRadius));
      this.updateCamera();

      if (this.state.tutorialMode && this.state.tutorialStepIndex === 0) {
        this.tutState.zoomed = true;
        this.checkTutorialProgress();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      AudioFX.init();
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.prevMouse.x;
        const deltaY = e.touches[0].clientY - this.prevMouse.y;
        this.camTheta -= deltaX * 0.012;
        this.camPhi -= deltaY * 0.012;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.updateCamera();

        if (this.state.tutorialMode && this.state.tutorialStepIndex === 0) {
          this.tutState.orbitDelta += Math.abs(deltaX * 0.012) + Math.abs(deltaY * 0.012);
          this.checkTutorialProgress();
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (this.touchStartDist > 0) {
          const pinchDelta = this.touchStartDist - dist;
          this.camRadius += pinchDelta * 0.08;
          this.camRadius = Math.max(10, Math.min(100, this.camRadius));
          this.updateCamera();
          this.touchStartDist = dist;

          if (this.state.tutorialMode && this.state.tutorialStepIndex === 0) {
            this.tutState.zoomed = true;
            this.checkTutorialProgress();
          }
        }
      }
    };

    const onTouchEnd = () => {
      this.isDragging = false;
      this.touchStartDist = 0;
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    this.cleanupListeners = () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }

  private cleanupListeners?: () => void;

  private startLoop() {
    const loop = (timestamp: number) => {
      const dt = timestamp - this.lastTime;
      this.lastTime = timestamp;

      if (!this.state.isGameOver && this.state.activePiece && !this.pauseGravity) {
        this.dropTimer += dt;
        const gravityDelay = this.getGravitySpeed();
        if (this.dropTimer > gravityDelay) {
          if (!this.movePiece(0, 0, -1)) {
            this.lockPiece();
          }
          this.dropTimer = 0;
        }
      }

      this.renderer.render(this.scene, this.camera);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.cleanupListeners?.();
    this.renderer.dispose();
  }
}
