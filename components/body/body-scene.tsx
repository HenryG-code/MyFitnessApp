"use client";

import type {
  BodyIntelligence,
  MuscleGroupId,
  MuscleState,
} from "@/src/lib/performance/muscles";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

export type BodySceneView = "front" | "rear";

type Part = {
  kind: "sphere" | "capsule";
  pos: [number, number, number];
  scale?: [number, number, number];
  r?: number;
  len?: number;
  axis?: "x" | "y";
  mirror?: boolean;
};

// Matcap tints per state — concrete hexes (CSS variables can't reach WebGL).
const stateTints: Record<MuscleState, string> = {
  fresh: "#f2705a",
  recovering: "#e6c464",
  ready: "#7fd6b2",
  neglected: "#9aa0a8",
};

const neutralTint = "#c9cdd5";

/** Structural volumes that are not part of any selectable muscle group. */
const neutralParts: Part[] = [
  { kind: "sphere", pos: [0, 1.665, 0], scale: [0.098, 0.118, 0.104] }, // head
  { kind: "capsule", pos: [0, 1.56, 0], r: 0.041, len: 0.07, axis: "y" }, // neck
  { kind: "sphere", pos: [0, 1.34, 0], scale: [0.15, 0.19, 0.095] }, // ribcage
  { kind: "sphere", pos: [0, 1.14, 0], scale: [0.115, 0.12, 0.082] }, // waist
  { kind: "sphere", pos: [0, 1.0, 0], scale: [0.142, 0.105, 0.09] }, // pelvis
  { kind: "sphere", pos: [0.16, 1.462, 0], scale: [0.055, 0.055, 0.055], mirror: true }, // shoulder joint
  { kind: "capsule", pos: [0.35, 1.455, 0], r: 0.05, len: 0.2, axis: "x", mirror: true }, // upper arm
  { kind: "sphere", pos: [0.48, 1.45, 0], scale: [0.047, 0.047, 0.047], mirror: true }, // elbow
  { kind: "capsule", pos: [0.6, 1.448, 0], r: 0.037, len: 0.19, axis: "x", mirror: true }, // forearm bone
  { kind: "capsule", pos: [0.705, 1.446, 0], r: 0.027, len: 0.05, axis: "x", mirror: true }, // wrist
  { kind: "sphere", pos: [0.768, 1.444, 0.008], scale: [0.058, 0.03, 0.042], mirror: true }, // hand
  { kind: "sphere", pos: [0.09, 0.96, 0], scale: [0.066, 0.066, 0.066], mirror: true }, // hip joint
  { kind: "capsule", pos: [0.093, 0.6, 0.008], r: 0.056, len: 0.1, axis: "y", mirror: true }, // lower thigh
  { kind: "sphere", pos: [0.093, 0.52, 0.004], scale: [0.057, 0.06, 0.054], mirror: true }, // knee
  { kind: "capsule", pos: [0.093, 0.3, 0.004], r: 0.046, len: 0.26, axis: "y", mirror: true }, // shin
  { kind: "sphere", pos: [0.09, 0.4, 0.03], scale: [0.038, 0.085, 0.036], mirror: true }, // tibialis
  { kind: "sphere", pos: [0.093, 0.095, -0.005], scale: [0.034, 0.038, 0.036], mirror: true }, // ankle
  { kind: "sphere", pos: [0.093, 0.042, 0.05], scale: [0.048, 0.032, 0.1], mirror: true }, // foot
];

/** Selectable muscle volumes; these also serve as raycast/highlight hulls. */
const groupParts: Record<MuscleGroupId, Part[]> = {
  traps: [
    { kind: "sphere", pos: [0, 1.505, -0.035], scale: [0.105, 0.052, 0.06] },
    { kind: "sphere", pos: [0.088, 1.487, -0.025], scale: [0.068, 0.04, 0.052], mirror: true },
  ],
  shoulders: [
    { kind: "sphere", pos: [0.222, 1.465, 0], scale: [0.087, 0.082, 0.08], mirror: true },
  ],
  chest: [
    { kind: "sphere", pos: [0.055, 1.405, 0.07], scale: [0.06, 0.064, 0.052], mirror: true },
    { kind: "sphere", pos: [0.12, 1.398, 0.055], scale: [0.052, 0.057, 0.047], mirror: true },
  ],
  back: [
    { kind: "sphere", pos: [0.105, 1.37, -0.048], scale: [0.062, 0.075, 0.045], mirror: true },
    { kind: "sphere", pos: [0.085, 1.28, -0.052], scale: [0.055, 0.085, 0.042], mirror: true },
    { kind: "sphere", pos: [0.05, 1.19, -0.055], scale: [0.042, 0.07, 0.035], mirror: true },
  ],
  biceps: [
    { kind: "capsule", pos: [0.345, 1.46, 0.026], r: 0.049, len: 0.14, axis: "x", mirror: true },
  ],
  triceps: [
    { kind: "capsule", pos: [0.345, 1.442, -0.028], r: 0.049, len: 0.14, axis: "x", mirror: true },
  ],
  forearms: [
    { kind: "capsule", pos: [0.562, 1.45, 0.008], r: 0.048, len: 0.12, axis: "x", mirror: true },
  ],
  core: [
    { kind: "sphere", pos: [0, 1.19, 0.062], scale: [0.078, 0.15, 0.032] },
    { kind: "sphere", pos: [0.085, 1.16, 0.032], scale: [0.032, 0.09, 0.026], mirror: true },
  ],
  glutes: [
    { kind: "sphere", pos: [0.07, 0.96, -0.07], scale: [0.08, 0.09, 0.065], mirror: true },
  ],
  quads: [
    { kind: "capsule", pos: [0.095, 0.76, 0.022], r: 0.07, len: 0.24, axis: "y", mirror: true },
    { kind: "sphere", pos: [0.068, 0.62, 0.04], scale: [0.046, 0.08, 0.04], mirror: true },
  ],
  hamstrings: [
    { kind: "capsule", pos: [0.092, 0.75, -0.04], r: 0.06, len: 0.22, axis: "y", mirror: true },
  ],
  calves: [
    { kind: "sphere", pos: [0.096, 0.43, -0.026], scale: [0.056, 0.108, 0.052], mirror: true },
    { kind: "sphere", pos: [0.088, 0.33, -0.018], scale: [0.042, 0.09, 0.04], mirror: true },
  ],
};

type Ball = { pos: [number, number, number]; r: number };

/** Approximate a part's volume with a cluster of isotropic metaballs. */
function partToBalls(part: Part): Ball[] {
  const balls: Ball[] = [];

  const emit = (sign: 1 | -1) => {
    if (part.kind === "capsule") {
      const r = part.r ?? 0.05;
      const len = part.len ?? 0.1;
      const steps = Math.max(2, Math.ceil(len / (r * 0.7)) + 1);

      for (let index = 0; index < steps; index += 1) {
        const t = index / (steps - 1) - 0.5;
        const pos: [number, number, number] = [...part.pos];
        pos[part.axis === "x" ? 0 : 1] += t * len;
        pos[0] *= sign;
        balls.push({ pos, r });
      }
      return;
    }

    const [a, b, c] = part.scale ?? [0.05, 0.05, 0.05];
    const r = Math.min(a, b, c);
    const axes = [a, b, c];
    const counts = axes.map((axis) => Math.max(1, Math.round(axis / r)));

    for (let ix = 0; ix < counts[0]; ix += 1) {
      for (let iy = 0; iy < counts[1]; iy += 1) {
        for (let iz = 0; iz < counts[2]; iz += 1) {
          const offsets = [ix, iy, iz].map((index, axisIndex) => {
            const count = counts[axisIndex];
            if (count === 1) return 0;
            const extent = axes[axisIndex] - r;
            return (index / (count - 1) - 0.5) * 2 * extent * 0.72;
          });
          balls.push({
            pos: [
              (part.pos[0] + offsets[0]) * sign,
              part.pos[1] + offsets[1],
              part.pos[2] + offsets[2],
            ],
            r: r * 1.12,
          });
        }
      }
    }
  };

  emit(1);
  if (part.mirror) emit(-1);
  return balls;
}

/** Silver "studio ball" matcap generated on a canvas — no texture assets. */
function createMatcap() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size * 0.38, size * 0.34, size * 0.05,
      size * 0.5, size * 0.5, size * 0.62
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.18, "#e8eaee");
    gradient.addColorStop(0.45, "#a9adb6");
    gradient.addColorStop(0.72, "#5d616b");
    gradient.addColorStop(0.92, "#23262c");
    gradient.addColorStop(1, "#101216");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const FIELD_SCALE = 0.98;
const FIELD_CENTER_Y = 0.92;
const MC_RESOLUTION = 100;
const MC_SUBTRACT = 12;

type SceneControl = {
  targetYaw: number;
  lastInteraction: number;
  autoRotate: boolean;
};

function BodyFigure({
  intelligence,
  selected,
  hovered,
  controlRef,
  onPick,
  onHoverPick,
}: {
  intelligence: BodyIntelligence;
  selected: MuscleGroupId | null;
  hovered: MuscleGroupId | null;
  controlRef: React.RefObject<SceneControl>;
  onPick: (id: MuscleGroupId) => void;
  onHoverPick: (id: MuscleGroupId | null) => void;
}) {
  const figureRef = useRef<THREE.Group>(null);
  const matcap = useMemo(() => createMatcap(), []);

  const body = useMemo(() => {
    const material = new THREE.MeshMatcapMaterial({ matcap, vertexColors: true });
    const mc = new MarchingCubes(MC_RESOLUTION, material, false, true, 400000);
    mc.scale.setScalar(FIELD_SCALE);
    mc.position.set(0, FIELD_CENTER_Y, 0);
    mc.isolation = 60;
    mc.reset();

    const addBall = (ball: Ball, color: THREE.Color) => {
      const fx = ball.pos[0] / (2 * FIELD_SCALE) + 0.5;
      const fy = (ball.pos[1] - FIELD_CENTER_Y) / (2 * FIELD_SCALE) + 0.5;
      const fz = ball.pos[2] / (2 * FIELD_SCALE) + 0.5;
      const fieldRadius = ball.r / (2 * FIELD_SCALE);
      mc.addBall(fx, fy, fz, fieldRadius * fieldRadius * MC_SUBTRACT * 4, MC_SUBTRACT, color);
    };

    const neutral = new THREE.Color(neutralTint);
    neutralParts.forEach((part) => partToBalls(part).forEach((ball) => addBall(ball, neutral)));

    (Object.keys(groupParts) as MuscleGroupId[]).forEach((id) => {
      const color = new THREE.Color(stateTints[intelligence.groups[id].state]);
      groupParts[id].forEach((part) => partToBalls(part).forEach((ball) => addBall(ball, color)));
    });

    mc.update();
    return mc;
  }, [intelligence, matcap]);

  useEffect(() => {
    return () => {
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
    };
  }, [body]);

  useEffect(() => () => matcap.dispose(), [matcap]);

  useFrame((_, delta) => {
    const figure = figureRef.current;
    const state = controlRef.current;
    if (!figure || !state) return;

    if (state.autoRotate && performance.now() - state.lastInteraction > 4000) {
      state.targetYaw += delta * 0.25;
    }

    // Take the short way around when snapping between stored view angles.
    let difference = state.targetYaw - figure.rotation.y;
    difference = ((difference + Math.PI) % (Math.PI * 2)) - Math.PI;
    figure.rotation.y += difference * Math.min(1, delta * 6);
  });

  const hulls = useMemo(() => {
    const entries: Array<{
      key: string;
      id: MuscleGroupId;
      part: Part;
      sign: 1 | -1;
    }> = [];

    (Object.keys(groupParts) as MuscleGroupId[]).forEach((id) => {
      groupParts[id].forEach((part, index) => {
        entries.push({ key: `${id}-${index}-r`, id, part, sign: 1 });
        if (part.mirror) {
          entries.push({ key: `${id}-${index}-l`, id, part, sign: -1 });
        }
      });
    });

    return entries;
  }, []);

  return (
    <group ref={figureRef}>
      <primitive object={body} />
      {hulls.map(({ key, id, part, sign }) => {
        const active = selected === id || hovered === id;
        const tint = stateTints[intelligence.groups[id].state];
        const position: [number, number, number] = [
          part.pos[0] * sign,
          part.pos[1],
          part.pos[2],
        ];
        const rotation: [number, number, number] =
          part.kind === "capsule" && part.axis === "x" ? [0, 0, Math.PI / 2] : [0, 0, 0];

        return (
          <mesh
            key={key}
            position={position}
            rotation={rotation}
            scale={
              part.kind === "sphere"
                ? (part.scale ?? [0.05, 0.05, 0.05]).map((value) => value * 1.12) as [number, number, number]
                : [1.1, 1.1, 1.1]
            }
            onClick={(event) => {
              event.stopPropagation();
              onPick(id);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              onHoverPick(id);
            }}
            onPointerOut={() => onHoverPick(null)}
          >
            {part.kind === "sphere" ? (
              <sphereGeometry args={[1, 24, 18]} />
            ) : (
              <capsuleGeometry args={[part.r ?? 0.05, part.len ?? 0.1, 6, 16]} />
            )}
            <meshBasicMaterial
              transparent
              opacity={active ? (selected === id ? 0.34 : 0.2) : 0}
              color={selected === id ? "#ffffff" : tint}
              depthWrite={false}
            />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.42, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export function BodyScene({
  intelligence,
  view,
  selected,
  onSelect,
  onHover,
}: {
  intelligence: BodyIntelligence;
  view: BodySceneView;
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId) => void;
  onHover?: (id: MuscleGroupId | null) => void;
}) {
  const [hovered, setHovered] = useState<MuscleGroupId | null>(null);
  const controlRef = useRef<SceneControl>({
    targetYaw: 0,
    lastInteraction: 0,
    autoRotate: true,
  });
  const dragRef = useRef({ active: false, lastX: 0, distance: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    controlRef.current.autoRotate = !media.matches;
  }, []);

  useEffect(() => {
    controlRef.current.targetYaw = view === "front" ? 0 : Math.PI;
    controlRef.current.lastInteraction = performance.now();
  }, [view]);

  function markInteraction() {
    controlRef.current.lastInteraction = performance.now();
  }

  function handleHover(id: MuscleGroupId | null) {
    setHovered(id);
    onHover?.(id);
    document.body.style.cursor = id ? "pointer" : "";
  }

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div
      className="size-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(event) => {
        dragRef.current = { active: true, lastX: event.clientX, distance: 0 };
        markInteraction();
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const dx = event.clientX - drag.lastX;
        drag.lastX = event.clientX;
        drag.distance += Math.abs(dx);
        controlRef.current.targetYaw += dx * 0.011;
        markInteraction();
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
        markInteraction();
      }}
      onPointerCancel={() => {
        dragRef.current.active = false;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 33, position: [0, 1.12, 3.35], near: 0.1, far: 20 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.95, 0)}
      >
        <BodyFigure
          intelligence={intelligence}
          selected={selected}
          hovered={hovered}
          controlRef={controlRef}
          onPick={(id) => {
            // A horizontal drag should spin the body, not select a muscle.
            if (dragRef.current.distance > 8) return;
            onSelect(id);
          }}
          onHoverPick={handleHover}
        />
      </Canvas>
    </div>
  );
}
