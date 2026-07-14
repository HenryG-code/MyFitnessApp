"use client";

import {
  bodyRegionInstances,
  getBodyRegionAtPoint,
} from "@/src/lib/performance/body-model-contract";
import type {
  BodyIntelligence,
  MuscleGroupId,
  MuscleState,
} from "@/src/lib/performance/muscles";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type BodySceneView = "front" | "rear";

const BODY_MODEL_URL = "/models/body/logfit-anatomical-human.glb";

// Concrete colors are required because CSS variables are not available in WebGL.
const stateTints: Record<MuscleState, string> = {
  fresh: "#f2705a",
  recovering: "#e6c464",
  ready: "#7fd6b2",
  neglected: "#9aa0a8",
};

const neutralTint = new THREE.Color("#aeb4c0");

class BodySceneErrorBoundary extends Component<
  { children: ReactNode; onUnavailable?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onUnavailable?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function WebGLFallback({ onUnavailable }: { onUnavailable: () => void }) {
  useEffect(() => {
    onUnavailable();
  }, [onUnavailable]);

  return null;
}

function disposeSceneResources(scene: THREE.Object3D) {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

type SceneControl = {
  targetYaw: number;
  lastInteraction: number;
  autoRotate: boolean;
  reducedMotion: boolean;
};

type PreparedBody = {
  bodyMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  colorAttribute: THREE.BufferAttribute;
  influences: Float32Array;
  muscleIds: Array<MuscleGroupId | null>;
  scene: THREE.Group;
};

function prepareBodyModel(source: THREE.Group): PreparedBody {
  const scene = source.clone(true);
  let bodyMesh: PreparedBody["bodyMesh"] | null = null;

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.geometry = object.geometry.clone();

    const isBody =
      object.name === "BASE_BODY" ||
      object.geometry.name === "BASE_BODY_GEOMETRY";

    if (isBody) {
      const material = new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        vertexColors: true,
        roughness: 0.38,
        metalness: 0.015,
        clearcoat: 0.14,
        clearcoatRoughness: 0.38,
      });
      object.material = material;
      bodyMesh = object as PreparedBody["bodyMesh"];
      return;
    }

    object.material = new THREE.MeshPhysicalMaterial({
      color: "#181b22",
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
    });
  });

  const resolvedBodyMesh = bodyMesh as PreparedBody["bodyMesh"] | null;

  if (!resolvedBodyMesh) {
    throw new Error("The anatomical body asset is missing BASE_BODY.");
  }

  scene.updateMatrixWorld(true);
  const position = resolvedBodyMesh.geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  const muscleIds: Array<MuscleGroupId | null> = new Array(position.count);
  const influences = new Float32Array(position.count);
  const point = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    point
      .fromBufferAttribute(position, index)
      .applyMatrix4(resolvedBodyMesh.matrixWorld);
    const region = getBodyRegionAtPoint(point.x, point.y, point.z);
    muscleIds[index] = region.id;
    influences[index] = region.influence;
    colorAttribute.setXYZ(index, neutralTint.r, neutralTint.g, neutralTint.b);
  }

  resolvedBodyMesh.geometry.setAttribute("color", colorAttribute);

  return {
    bodyMesh: resolvedBodyMesh,
    colorAttribute,
    influences,
    muscleIds,
    scene,
  };
}

function BodyFigure({
  intelligence,
  model,
  selected,
  hovered,
  controlRef,
  onPick,
  onHoverPick,
}: {
  intelligence: BodyIntelligence;
  model: THREE.Group;
  selected: MuscleGroupId | null;
  hovered: MuscleGroupId | null;
  controlRef: React.RefObject<SceneControl>;
  onPick: (id: MuscleGroupId) => void;
  onHoverPick: (id: MuscleGroupId | null) => void;
}) {
  const figureRef = useRef<THREE.Group>(null);
  const prepared = useMemo(() => prepareBodyModel(model), [model]);

  useEffect(() => {
    const displayColor = new THREE.Color();
    const stateColor = new THREE.Color();
    const white = new THREE.Color("#ffffff");

    for (let index = 0; index < prepared.muscleIds.length; index += 1) {
      const id = prepared.muscleIds[index];
      const influence = prepared.influences[index];

      if (!id || influence <= 0) {
        prepared.colorAttribute.setXYZ(
          index,
          neutralTint.r,
          neutralTint.g,
          neutralTint.b,
        );
        continue;
      }

      stateColor.set(stateTints[intelligence.groups[id].state]);
      let tintStrength = 0.74;

      if (id === selected) {
        stateColor.lerp(white, 0.24);
        tintStrength = 0.92;
      } else if (id === hovered) {
        stateColor.lerp(white, 0.12);
        tintStrength = 0.84;
      }

      displayColor
        .copy(neutralTint)
        .lerp(stateColor, influence * tintStrength);
      prepared.colorAttribute.setXYZ(
        index,
        displayColor.r,
        displayColor.g,
        displayColor.b,
      );
    }

    // three.js interop: vertex colors are mutated in place so the mesh is not
    // rebuilt on every hover/selection change.
    // eslint-disable-next-line react-hooks/immutability
    prepared.colorAttribute.needsUpdate = true;
  }, [hovered, intelligence, prepared, selected]);

  useEffect(() => {
    return () => disposeSceneResources(prepared.scene);
  }, [prepared]);

  useFrame((_, delta) => {
    const figure = figureRef.current;
    const state = controlRef.current;
    if (!figure || !state) return;

    if (state.reducedMotion) {
      figure.rotation.y = state.targetYaw;
      return;
    }

    if (state.autoRotate && performance.now() - state.lastInteraction > 4000) {
      state.targetYaw += delta * 0.25;
    }

    let difference = state.targetYaw - figure.rotation.y;
    difference = ((difference + Math.PI) % (Math.PI * 2)) - Math.PI;
    figure.rotation.y += difference * Math.min(1, delta * 6);
  });

  return (
    <group ref={figureRef}>
      <primitive object={prepared.scene} />

      {bodyRegionInstances.map((part) => {
        const rotation: [number, number, number] = [0, 0, part.rotationZ];
        const scale: [number, number, number] =
          part.kind === "sphere"
            ? [
                (part.scale?.[0] ?? 0.05) * 1.12,
                (part.scale?.[1] ?? 0.05) * 1.12,
                (part.scale?.[2] ?? 0.05) * 1.2,
              ]
            : [1.18, 1.18, 1.18];

        return (
          <mesh
            key={part.key}
            position={part.position}
            rotation={rotation}
            scale={scale}
            onClick={(event) => {
              event.stopPropagation();
              onPick(part.id);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              onHoverPick(part.id);
            }}
            onPointerOut={() => onHoverPick(null)}
          >
            {part.kind === "sphere" ? (
              <sphereGeometry args={[1, 12, 8]} />
            ) : (
              <capsuleGeometry
                args={[part.radius ?? 0.05, part.length ?? 0.1, 4, 8]}
              />
            )}
            <meshBasicMaterial visible={false} />
          </mesh>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.34, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.42} />
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
  onUnavailable,
  viewRevision = 0,
}: {
  intelligence: BodyIntelligence;
  view: BodySceneView;
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId) => void;
  onHover?: (id: MuscleGroupId | null) => void;
  onUnavailable?: () => void;
  viewRevision?: number;
}) {
  const [hovered, setHovered] = useState<MuscleGroupId | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const unavailableRef = useRef(onUnavailable);
  const notifyUnavailable = useCallback(
    () => unavailableRef.current?.(),
    [],
  );
  const controlRef = useRef<SceneControl>({
    targetYaw: view === "front" ? 0 : Math.PI,
    lastInteraction: 0,
    autoRotate: true,
    reducedMotion: false,
  });
  const dragRef = useRef({ active: false, lastX: 0, distance: 0 });

  useEffect(() => {
    unavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    let isMounted = true;
    let loadedScene: THREE.Group | null = null;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      BODY_MODEL_URL,
      (gltf) => {
        if (!isMounted) {
          disposeSceneResources(gltf.scene);
          return;
        }
        const hasBody = gltf.scene.getObjectByName("BASE_BODY") !== undefined;
        if (!hasBody) {
          disposeSceneResources(gltf.scene);
          unavailableRef.current?.();
          return;
        }
        loadedScene = gltf.scene;
        setModel(gltf.scene);
        invalidateRef.current?.();
      },
      undefined,
      () => {
        if (isMounted) unavailableRef.current?.();
      },
    );

    return () => {
      isMounted = false;
      if (loadedScene) disposeSceneResources(loadedScene);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      controlRef.current.autoRotate = !media.matches;
      controlRef.current.reducedMotion = media.matches;
      setReducedMotion(media.matches);
      invalidateRef.current?.();
    };
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry?.isIntersecting ?? true),
      { rootMargin: "160px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (isIntersecting && isDocumentVisible) invalidateRef.current?.();
  }, [isDocumentVisible, isIntersecting]);

  useEffect(() => {
    controlRef.current.targetYaw = view === "front" ? 0 : Math.PI;
    controlRef.current.lastInteraction = performance.now();
    invalidateRef.current?.();
  }, [view, viewRevision]);

  function markInteraction() {
    controlRef.current.lastInteraction = performance.now();
    invalidateRef.current?.();
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
      ref={containerRef}
      className="relative size-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(event) => {
        dragRef.current = { active: true, lastX: event.clientX, distance: 0 };
        markInteraction();
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const distance = event.clientX - drag.lastX;
        drag.lastX = event.clientX;
        drag.distance += Math.abs(distance);
        controlRef.current.targetYaw += distance * 0.011;
        markInteraction();
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
        markInteraction();
      }}
      onPointerCancel={() => {
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
    >
      <BodySceneErrorBoundary onUnavailable={notifyUnavailable}>
        <Canvas
          dpr={[1, 2]}
          frameloop={
            model && isIntersecting && isDocumentVisible && !reducedMotion
              ? "always"
              : "demand"
          }
          fallback={<WebGLFallback onUnavailable={notifyUnavailable} />}
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 32, position: [0, 0.92, 3.35], near: 0.1, far: 20 }}
          onCreated={({ camera, gl, invalidate }) => {
            invalidateRef.current = invalidate;
            camera.lookAt(0, 0.92, 0);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
            gl.domElement.addEventListener(
              "webglcontextlost",
              (event) => {
                event.preventDefault();
                notifyUnavailable();
              },
              { once: true },
            );
          }}
        >
          <hemisphereLight args={["#eef3ff", "#151821", 0.82]} />
          <directionalLight
            color="#fff0e8"
            intensity={3.4}
            position={[2.8, 3.6, 4]}
          />
          <directionalLight
            color="#c5d6ff"
            intensity={2.5}
            position={[-3, 2.7, -3.5]}
          />

          <BodySceneErrorBoundary onUnavailable={notifyUnavailable}>
            {model ? (
              <BodyFigure
                intelligence={intelligence}
                model={model}
                selected={selected}
                hovered={hovered}
                controlRef={controlRef}
                onPick={(id) => {
                  if (dragRef.current.distance > 8) return;
                  onSelect(id);
                }}
                onHoverPick={handleHover}
              />
            ) : null}
          </BodySceneErrorBoundary>
        </Canvas>
      </BodySceneErrorBoundary>

      {!model ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span className="rounded-full border border-white/[0.08] bg-black/40 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted backdrop-blur">
            Loading anatomical model
          </span>
        </div>
      ) : null}
    </div>
  );
}
