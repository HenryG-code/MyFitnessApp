import type { MuscleGroupId } from "@/src/lib/performance/muscles";

export type BodyRegionPart = {
  kind: "sphere" | "capsule";
  position: readonly [number, number, number];
  scale?: readonly [number, number, number];
  radius?: number;
  length?: number;
  angle?: number;
  mirror?: boolean;
};

export type BodyRegionInstance = BodyRegionPart & {
  id: MuscleGroupId;
  key: string;
  position: [number, number, number];
  rotationZ: number;
  sign: 1 | -1;
};

/**
 * Anatomical regions for the bundled CC0 A-pose body. Coordinates are in the
 * model's Y-up, front-positive-Z space and drive both vertex tinting and hits.
 */
export const bodyRegionParts: Record<MuscleGroupId, readonly BodyRegionPart[]> = {
  traps: [
    {
      kind: "sphere",
      position: [0, 1.49, -0.065],
      scale: [0.15, 0.09, 0.065],
    },
    {
      kind: "sphere",
      position: [0.09, 1.43, -0.08],
      scale: [0.1, 0.13, 0.07],
      mirror: true,
    },
  ],
  shoulders: [
    {
      kind: "sphere",
      position: [0.215, 1.45, 0],
      scale: [0.105, 0.105, 0.1],
      mirror: true,
    },
  ],
  chest: [
    {
      kind: "sphere",
      position: [0.082, 1.355, 0.11],
      scale: [0.105, 0.085, 0.065],
      mirror: true,
    },
  ],
  back: [
    {
      kind: "sphere",
      position: [0.095, 1.33, -0.1],
      scale: [0.12, 0.2, 0.075],
      mirror: true,
    },
  ],
  biceps: [
    {
      kind: "capsule",
      position: [0.285, 1.3, 0],
      radius: 0.075,
      length: 0.22,
      angle: 0.5,
      mirror: true,
    },
  ],
  triceps: [
    {
      kind: "capsule",
      position: [0.285, 1.3, -0.1],
      radius: 0.075,
      length: 0.22,
      angle: 0.5,
      mirror: true,
    },
  ],
  forearms: [
    {
      kind: "capsule",
      position: [0.405, 1.075, 0.005],
      radius: 0.06,
      length: 0.24,
      angle: 0.34,
      mirror: true,
    },
  ],
  core: [
    {
      kind: "sphere",
      position: [0, 1.16, 0.1],
      scale: [0.105, 0.22, 0.06],
    },
    {
      kind: "sphere",
      position: [0.1, 1.15, 0.055],
      scale: [0.05, 0.17, 0.045],
      mirror: true,
    },
  ],
  glutes: [
    {
      kind: "sphere",
      position: [0.075, 0.86, -0.115],
      scale: [0.11, 0.13, 0.085],
      mirror: true,
    },
  ],
  quads: [
    {
      kind: "capsule",
      position: [0.09, 0.66, 0.065],
      radius: 0.086,
      length: 0.31,
      mirror: true,
    },
  ],
  hamstrings: [
    {
      kind: "capsule",
      position: [0.09, 0.66, -0.065],
      radius: 0.083,
      length: 0.3,
      mirror: true,
    },
  ],
  calves: [
    {
      kind: "sphere",
      position: [0.09, 0.31, -0.035],
      scale: [0.072, 0.16, 0.068],
      mirror: true,
    },
  ],
};

const muscleIds = Object.keys(bodyRegionParts) as MuscleGroupId[];

export const bodyRegionInstances: readonly BodyRegionInstance[] = muscleIds.flatMap(
  (id) =>
    bodyRegionParts[id].flatMap((part, partIndex) => {
      const signs: Array<1 | -1> = part.mirror ? [1, -1] : [1];

      return signs.map((sign) => ({
        ...part,
        id,
        key: `${id}-${partIndex}-${sign === 1 ? "right" : "left"}`,
        position: [
          part.position[0] * sign,
          part.position[1],
          part.position[2],
        ],
        rotationZ: (part.angle ?? 0) * sign,
        sign,
      }));
    }),
);

function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return progress * progress * (3 - 2 * progress);
}

function getPartDistance(
  x: number,
  y: number,
  z: number,
  part: BodyRegionInstance,
) {
  const dx = x - part.position[0];
  const dy = y - part.position[1];
  const dz = z - part.position[2];

  if (part.kind === "sphere") {
    const scale = part.scale ?? [0.05, 0.05, 0.05];
    return Math.sqrt(
      (dx / scale[0]) ** 2 +
        (dy / scale[1]) ** 2 +
        (dz / scale[2]) ** 2,
    );
  }

  const cosine = Math.cos(part.rotationZ);
  const sine = Math.sin(part.rotationZ);
  const localX = cosine * dx + sine * dy;
  const localY = -sine * dx + cosine * dy;
  const halfLength = (part.length ?? 0.1) / 2;
  const beyondSegment = Math.max(0, Math.abs(localY) - halfLength);
  const radius = part.radius ?? 0.05;

  return Math.sqrt(localX * localX + beyondSegment * beyondSegment + dz * dz) / radius;
}

export function getBodyRegionAtPoint(x: number, y: number, z: number) {
  let bestId: MuscleGroupId | null = null;
  let bestInfluence = 0;

  for (const part of bodyRegionInstances) {
    const distance = getPartDistance(x, y, z, part);
    const influence = 1 - smoothstep(0.58, 1.18, distance);

    if (influence > bestInfluence) {
      bestId = part.id;
      bestInfluence = influence;
    }
  }

  return { id: bestId, influence: bestInfluence };
}
