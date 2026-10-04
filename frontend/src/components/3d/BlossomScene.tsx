import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, useTexture } from "@react-three/drei";
import tree1 from "@/assets/tree1.png";
import tree2 from "@/assets/tree2.png";
import tree3 from "@/assets/tree3.png";
import groundImg from "@/assets/grass_real.jpg";
import roadImg from "@/assets/road_real.jpg";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/* ─── deterministic RNG ─────────────────────────────── */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type TreeSpec = { pos: THREE.Vector3; scale: number; texIdx: number };

/* ─── Forest: ONE pair of trees per ~6 units of road ── */
function Forest() {
  const texs = useTexture([tree1, tree2, tree3]);
  texs.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
  });

  const trees = useMemo<TreeSpec[]>(() => {
    const r = rng(77);
    const list: TreeSpec[] = [];
    // Road z: 10 → -75. One pair every ~6 units = ~14 pairs visible
    for (let i = 0; i < 14; i++) {
      const z = 7 - i * 6.0 + (r() - 0.5) * 1.2;
      const texIdx = i % 3;
      // Left side
      list.push({
        pos: new THREE.Vector3(-(4.2 + r() * 2.8), 0, z),
        scale: 0.9 + r() * 0.5,
        texIdx,
      });
      // Right side (different variety)
      list.push({
        pos: new THREE.Vector3(4.2 + r() * 2.8, 0, z + (r() - 0.5) * 1.5),
        scale: 0.9 + r() * 0.5,
        texIdx: (texIdx + 1) % 3,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {trees.map((t, i) => {
        const texture = texs[t.texIdx];
        if (!texture) return null;
        const h = 10 * t.scale;
        const w = h * 0.94;
        return (
          <Billboard key={i} position={[t.pos.x, h * 0.5, t.pos.z]} lockX lockZ>
            <mesh>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial
                map={texture}
                alphaTest={0.07}
                transparent={true}
                side={THREE.DoubleSide}
                roughness={0.88}
                metalness={0.0}
                depthWrite={true}
              />
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
}

/* ─── Background treeline for depth ─────────────────── */
function BackgroundTrees() {
  const texs = useTexture([tree1, tree2, tree3]);
  texs.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; });

  const trees = useMemo<TreeSpec[]>(() => {
    const r = rng(55);
    const list: TreeSpec[] = [];
    for (let i = 0; i < 24; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      list.push({
        pos: new THREE.Vector3(side * (11 + r() * 13), 0, 5 - i * 3.8 - r() * 1.5),
        scale: 0.6 + r() * 0.32,
        texIdx: i % 3,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {trees.map((t, i) => {
        const tex = texs[t.texIdx];
        if (!tex) return null;
        const h = 9 * t.scale;
        return (
          <Billboard key={i} position={[t.pos.x, h * 0.5, t.pos.z]} lockX lockZ>
            <mesh>
              <planeGeometry args={[h * 0.9, h]} />
              <meshStandardMaterial
                map={tex}
                alphaTest={0.1}
                transparent={true}
                side={THREE.DoubleSide}
                roughness={0.95}
                depthWrite={true}
              />
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
}

/* ─── Ground (improved grass + road with edge lines) ── */
function Ground() {
  const [grass, road] = useTexture([groundImg, roadImg]);
  if (!grass || !road) return null;

  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(14, 28);          // fine-detail tiling
  grass.colorSpace = THREE.SRGBColorSpace;
  grass.anisotropy = 16;
  grass.minFilter = THREE.LinearMipmapLinearFilter;
  grass.magFilter = THREE.LinearFilter;
  grass.generateMipmaps = true;

  road.wrapS = road.wrapT = THREE.RepeatWrapping;
  road.repeat.set(1, 26);
  road.colorSpace = THREE.SRGBColorSpace;
  road.anisotropy = 8;

  return (
    <>
      {/* Wide grass plane */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -45]} receiveShadow>
        <planeGeometry args={[100, 160]} />
        <meshStandardMaterial map={grass} roughness={0.97} metalness={0} color="#cce8aa" />
      </mesh>
      {/* Road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -45]} receiveShadow>
        <planeGeometry args={[3.3, 160, 1, 80]} />
        <meshStandardMaterial map={road} roughness={0.9} />
      </mesh>
      {/* Road edge lines */}
      <mesh rotation-x={-Math.PI / 2} position={[-1.78, 0.04, -45]}>
        <planeGeometry args={[0.07, 160]} />
        <meshStandardMaterial color="#fffff0" roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.78, 0.04, -45]}>
        <planeGeometry args={[0.07, 160]} />
        <meshStandardMaterial color="#fffff0" roughness={0.8} />
      </mesh>
    </>
  );
}

/* ─── NIT Sikkim 3-D aerial campus at end of road ───── */
function NITCampus() {
  const campusTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext("2d")!;

    // Hillside backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#5a8f5a");
    bg.addColorStop(0.45, "#4a7a4a");
    bg.addColorStop(1, "#2d5c2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Misty mountain upper
    ctx.fillStyle = "rgba(200,220,200,0.35)";
    ctx.beginPath();
    ctx.ellipse(512, 60, 750, 180, 0, 0, Math.PI * 2);
    ctx.fill();

    // Terrace retaining walls
    ctx.strokeStyle = "#707060";
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(180 + i * 55, 520 - i * 28);
      ctx.bezierCurveTo(380 + i * 38, 508 - i * 26, 640 + i * 18, 496 - i * 24, 820 + i * 8, 484 - i * 22);
      ctx.stroke();
    }

    // Campus roads
    ctx.strokeStyle = "#9a9080";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(170, 760);
    ctx.bezierCurveTo(220, 590, 340, 510, 390, 410);
    ctx.bezierCurveTo(440, 320, 500, 275, 555, 215);
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(390, 410);
    ctx.bezierCurveTo(490, 395, 620, 375, 730, 355);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(555, 215);
    ctx.bezierCurveTo(660, 205, 760, 215, 830, 235);
    ctx.stroke();

    function shadeDown(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgb(${Math.max(0,r-32)},${Math.max(0,g-32)},${Math.max(0,b-32)})`;
    }

    function drawBuilding(x: number, y: number, w: number, h: number, rot: number, color: string) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const g = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
      g.addColorStop(0, color);
      g.addColorStop(1, shadeDown(color));
      ctx.fillStyle = g;
      ctx.fillRect(-w/2, -h/2, w, h);
      // Ridge line
      ctx.strokeStyle = shadeDown(color);
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-w/2+3, 0); ctx.lineTo(w/2-3, 0); ctx.stroke();
      // Shadow edge
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(-w/2, h/2-5, w, 7);
      ctx.fillRect(w/2-5, -h/2, 7, h);
      ctx.restore();
    }

    // Main academic block
    drawBuilding(418, 345, 155, 78, -0.15, "#4ecdc0");
    drawBuilding(488, 298, 88, 58, -0.15, "#4ecdc0");
    // Hostel row
    drawBuilding(598, 398, 68, 98, 0.10, "#45b7aa");
    drawBuilding(676, 388, 64, 88, 0.10, "#3da898");
    drawBuilding(318, 428, 78, 52, -0.20, "#52d1c4");
    drawBuilding(258, 476, 58, 44, -0.18, "#48c4b7");
    // Admin
    drawBuilding(548, 238, 108, 58, -0.05, "#5addd0");
    drawBuilding(678, 248, 72, 48, -0.05, "#4ecdc0");
    // Utilities
    drawBuilding(378, 508, 44, 34, -0.25, "#3d9e92");
    drawBuilding(748, 338, 48, 38, 0.12, "#45b7aa");
    drawBuilding(798, 278, 38, 28, 0.08, "#3da898");
    drawBuilding(228, 558, 26, 20, -0.30, "#357d74");

    // Water tank
    ctx.fillStyle = "#b8b8b8";
    ctx.beginPath(); ctx.arc(528, 178, 13, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#989898";
    ctx.beginPath(); ctx.arc(572, 168, 9, 0, Math.PI*2); ctx.fill();

    // Vegetation clusters
    for (let i = 0; i < 44; i++) {
      const vx = 200 + Math.sin(i * 137.5) * 300;
      const vy = 200 + Math.cos(i * 137.5) * 270;
      const vr = 7 + Math.sin(i * 73) * 5;
      const va = 0.38 + Math.sin(i * 53) * 0.18;
      ctx.fillStyle = `rgba(28,95,28,${va})`;
      ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI*2); ctx.fill();
    }

    // Label banner
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.roundRect(230, 685, 360, 58, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NIT SIKKIM", 410, 724);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <group position={[0, 0, -76]}>
      {/* Green hillside base */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <circleGeometry args={[24, 48]} />
        <meshStandardMaterial color="#3a6640" roughness={1} />
      </mesh>
      {/* Aerial campus panel angled for 3-D bird's-eye perspective */}
      <mesh position={[0, 14, -4]} rotation-x={-Math.PI / 2 + 0.18}>
        <planeGeometry args={[38, 28]} />
        <meshStandardMaterial map={campusTex} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── Petal particles ────────────────────────────────── */
const petalVert = /* glsl */ `
  uniform float uTime; uniform float uSpeed;
  attribute float aSeed;
  varying float vSeed;
  void main() {
    vec3 p = position;
    float t = uTime * uSpeed + aSeed * 40.0;
    p.y = mod(p.y - t * (0.7 + aSeed * 0.8), 14.0);
    p.x += sin(t * 0.9 + aSeed * 18.0) * (1.2 + aSeed * 1.6) + t * 0.15;
    p.x = mod(p.x + 22.0, 44.0) - 22.0;
    p.z += cos(t * 0.65 + aSeed * 11.0) * (0.8 + aSeed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((20.0 + aSeed * 22.0) * (10.0 / -mv.z), 2.0, 44.0);
    vSeed = aSeed;
  }`;
const petalFrag = /* glsl */ `
  varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float a = vSeed * 6.28;
    uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
    float d = length(vec2(uv.x * 1.8, uv.y + abs(uv.x) * 0.6));
    if (d > 0.42) discard;
    float vein = smoothstep(0.03, 0.0, abs(uv.x)) * 0.14;
    vec3 c = mix(vec3(0.96, 0.50, 0.68), vec3(1.0, 0.91, 0.94), vSeed) + vein;
    gl_FragColor = vec4(c, smoothstep(0.42, 0.18, d) * 0.90);
  }`;

function Petals({ count, progress }: { count: number; progress: React.MutableRefObject<number> }) {
  const geo = useMemo(() => {
    const r = rng(99);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 44;
      pos[i * 3 + 1] = r() * 14;
      pos[i * 3 + 2] = 12 - r() * 100;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSpeed: { value: 1 } }), []);
  useFrame((_, d) => {
    uniforms.uTime.value += Math.min(d, 0.05);
    uniforms.uSpeed.value = 1 + progress.current * 0.9;
  });
  return (
    <points geometry={geo}>
      <shaderMaterial vertexShader={petalVert} fragmentShader={petalFrag} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}

/* ─── Wooden sign ────────────────────────────────────── */
function makeSignTexture(label: string, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const grain = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grain.addColorStop(0, "#5d351f");
  grain.addColorStop(0.5, "#392014");
  grain.addColorStop(1, "#25140d");
  ctx.fillStyle = grain;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 24; y < canvas.height; y += 35) {
    ctx.strokeStyle = y % 70 === 0 ? "rgba(255,210,150,.11)" : "rgba(0,0,0,.13)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(220, y - 10, 720, y + 12, 1024, y - 3);
    ctx.stroke();
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
  ctx.fillStyle = "#fff8e8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 126px Georgia, serif";
  ctx.shadowColor = "rgba(0,0,0,.72)";
  ctx.shadowBlur = 14;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 7);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function ForestSign({ label, position, rotation = 0, accent }: { label: string; position: [number, number, number]; rotation?: number; accent: string }) {
  const texture = useMemo(() => makeSignTexture(label, accent), [label, accent]);
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[-1.55, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.15, 2.7, 12]} />
        <meshStandardMaterial color="#3d2418" roughness={0.95} />
      </mesh>
      <mesh position={[1.55, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.15, 2.7, 12]} />
        <meshStandardMaterial color="#3d2418" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[3.75, 1.5, 0.18]} />
        <meshStandardMaterial color="#3a2115" roughness={0.86} />
      </mesh>
      <mesh position={[0, 2.4, 0.101]}>
        <planeGeometry args={[3.55, 1.3]} />
        <meshStandardMaterial map={texture} roughness={0.78} />
      </mesh>
      <mesh position={[-1.55, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.34, 0.25, 12]} />
        <meshStandardMaterial color="#60594e" roughness={1} />
      </mesh>
      <mesh position={[1.55, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.34, 0.25, 12]} />
        <meshStandardMaterial color="#60594e" roughness={1} />
      </mesh>
    </group>
  );
}

/* ─── Camera: road travel + aerial lift at end ───────── */
function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera, scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const cur = useRef(0);
  const morning = useMemo(() => new THREE.Color("#fde4ec"), []);
  const golden = useMemo(() => new THREE.Color("#ffd9b8"), []);
  const aerialSky = useMemo(() => new THREE.Color("#c8e8d8"), []);

  useFrame((state, d) => {
    const dt = Math.min(d, 0.05);
    cur.current += (progress.current - cur.current) * (1 - Math.exp(-4 * dt));
    const p = cur.current;
    const t = state.clock.elapsedTime;

    // Aerial transition: starts at p=0.85
    const aerialT = Math.max(0, (p - 0.85) / 0.15);
    const roadZ = 10 - p * 82;
    const groundY = 1.7 + p * p * 4.5 + Math.sin(t * 0.6) * 0.05;

    camera.position.set(
      Math.sin(p * Math.PI * 2) * 1.2 * (1 - aerialT) + state.pointer.x * 0.4 * (1 - aerialT),
      groundY + aerialT * 32,
      roadZ + aerialT * 16,
    );
    camera.lookAt(
      Math.sin(p * Math.PI * 2 + 0.6) * 1.5 * (1 - aerialT),
      2.2 + p * 4 + state.pointer.y * 0.3 * (1 - aerialT),
      camera.position.z - 10 - aerialT * 20,
    );

    const midCol = morning.clone().lerp(golden, Math.min(p * 1.3, 1));
    const col = midCol.lerp(aerialSky, aerialT);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(col);
    (scene.background as THREE.Color)?.copy?.(col);

    if (sun.current) {
      sun.current.color.set("#fff4e6").lerp(new THREE.Color("#ffb37a"), Math.min(p, 1));
      sun.current.position.set(10, 18 - p * 8, camera.position.z + 6);
      sun.current.target.position.set(0, 0, camera.position.z - 10);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={sun}
      intensity={2.4}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
    />
  );
}

/* ─── Root ───────────────────────────────────────────── */
export function BlossomScene({ progress, low }: { progress: React.MutableRefObject<number>; low: boolean }) {
  return (
    <Canvas shadows={!low} dpr={low ? 1 : [1, 1.75]} camera={{ fov: 60, position: [0, 1.7, 10] }}>
      <color attach="background" args={["#fde4ec"]} />
      <fog attach="fog" args={["#fde4ec", 10, 62]} />
      <ambientLight intensity={0.65} color="#ffe8f0" />
      <hemisphereLight args={["#fff0f6", "#a8c898", 0.55]} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 6, 0]} scale={[10, 10, 1]} color="#fff" />
        <Lightformer intensity={1} color="#ffc0d6" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <CameraRig progress={progress} />
      <Suspense fallback={null}>
        <Ground />
        <Forest />
        <BackgroundTrees />
        <NITCampus />
        <ForestSign label="NIT SIKKIM" position={[3.4, 0, -12]} rotation={-0.12} accent="#d9b66f" />
        <ForestSign label="UDGAM 2K26" position={[-3.6, 0, -32]} rotation={0.14} accent="#e9a9bd" />
      </Suspense>
      <Petals count={low ? 2000 : 6500} progress={progress} />
    </Canvas>
  );
}
