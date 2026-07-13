import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const assetPath = path.join(
  process.cwd(),
  "public",
  "models",
  "body",
  "logfit-anatomical-human.glb",
);

function readAsset() {
  const data = fs.readFileSync(assetPath);
  const jsonChunkLength = data.readUInt32LE(12);
  const jsonChunkType = data.readUInt32LE(16);
  const json = JSON.parse(
    data.subarray(20, 20 + jsonChunkLength).toString("utf8").trim(),
  ) as {
    accessors?: Array<{ count?: number }>;
    buffers?: Array<{ uri?: string }>;
    extensionsRequired?: string[];
    meshes?: Array<{
      name?: string;
      primitives?: Array<{ indices?: number }>;
    }>;
    nodes?: Array<{ name?: string; extras?: Record<string, unknown> }>;
  };

  return { data, json, jsonChunkType };
}

describe("bundled anatomical human model", () => {
  it("is a compact, self-contained glTF 2.0 binary", () => {
    const { data, json, jsonChunkType } = readAsset();

    expect(data.subarray(0, 4).toString("ascii")).toBe("glTF");
    expect(data.readUInt32LE(4)).toBe(2);
    expect(data.readUInt32LE(8)).toBe(data.length);
    expect(jsonChunkType).toBe(0x4e4f534a);
    expect(data.length).toBeLessThan(500_000);
    expect(json.buffers?.every((buffer) => !buffer.uri)).toBe(true);
  });

  it("keeps the named body mesh and the required Meshopt decoder contract", () => {
    const { json } = readAsset();
    const names = [
      ...(json.meshes ?? []).map((mesh) => mesh.name),
      ...(json.nodes ?? []).map((node) => node.name),
    ];

    expect(names).toContain("BASE_BODY");
    expect(json.extensionsRequired).toContain("EXT_meshopt_compression");
  });

  it("preserves enough geometry for a defined face, hands, and musculature", () => {
    const { json } = readAsset();
    const triangleCount = (json.meshes ?? []).reduce(
      (meshTotal, mesh) =>
        meshTotal +
        (mesh.primitives ?? []).reduce((primitiveTotal, primitive) => {
          if (primitive.indices === undefined) return primitiveTotal;
          const indexCount = json.accessors?.[primitive.indices]?.count ?? 0;
          return primitiveTotal + indexCount / 3;
        }, 0),
      0,
    );

    expect(triangleCount).toBeGreaterThan(50_000);
    expect(triangleCount).toBeLessThan(80_000);
  });

  it("retains public-domain provenance in the asset metadata", () => {
    const { json } = readAsset();
    const metadata = JSON.stringify(json.nodes?.map((node) => node.extras));

    expect(metadata).toContain("CC0-1.0");
    expect(metadata).toContain("Blender Human Base Meshes - Body Male Realistic");
  });
});
