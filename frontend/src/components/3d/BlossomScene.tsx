import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, useTexture, Html } from "@react-three/drei";
import tree1 from "@/assets/tree1.png";
import tree2 from "@/assets/tree2.png";
import tree3 from "@/assets/tree3.png";
import groundImg from "@/assets/grass_real.jpg";
import roadImg from "@/assets/road_real.jpg";
import floatingCampusImg from "@/assets/floating_campus.png";
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
        pos: new THREE.Vector3(-(6.5 + r() * 3.5), 0, z),
        scale: 0.9 + r() * 0.5,
        texIdx,
      });
      // Right side (different variety)
      list.push({
        pos: new THREE.Vector3(6.5 + r() * 3.5, 0, z + (r() - 0.5) * 1.5),
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
          <Billboard key={i} position={[t.pos.x, h * 0.5 - 1.5, t.pos.z]} lockX lockZ>
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
          <Billboard key={i} position={[t.pos.x, h * 0.5 - 1.2, t.pos.z]} lockX lockZ>
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
  grass.repeat.set(60, 97);          // fine-detail tiling
  grass.colorSpace = THREE.SRGBColorSpace;
  grass.anisotropy = 16;
  grass.minFilter = THREE.LinearMipmapLinearFilter;
  grass.magFilter = THREE.LinearFilter;
  grass.generateMipmaps = true;

  road.wrapS = road.wrapT = THREE.RepeatWrapping;
  road.repeat.set(1, 21);
  road.colorSpace = THREE.SRGBColorSpace;
  road.anisotropy = 8;

  return (
    <>
      {/* Wide grass plane (the wedge) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -30]} receiveShadow>
        <planeGeometry args={[100, 130]} />
        <meshStandardMaterial map={grass} roughness={0.97} metalness={0} color="#cce8aa" />
      </mesh>
      {/* Road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -30]} receiveShadow>
        <planeGeometry args={[3.3, 130, 1, 80]} />
        <meshStandardMaterial map={road} roughness={0.9} />
      </mesh>
      {/* Road edge lines */}
      <mesh rotation-x={-Math.PI / 2} position={[-1.78, 0.04, -30]}>
        <planeGeometry args={[0.07, 130]} />
        <meshStandardMaterial color="#fffff0" roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.78, 0.04, -30]}>
        <planeGeometry args={[0.07, 130]} />
        <meshStandardMaterial color="#fffff0" roughness={0.8} />
      </mesh>
    </>
  );
}

/* ─── NIT Sikkim Campus Modal ───── */
function NITCampus({ progress }: { progress: React.MutableRefObject<number> }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useFrame(() => {
    if (modalRef.current) {
      const p = progress.current;
      if (p > 0.75) {
         const t = Math.min((p - 0.75) / 0.25, 1);
         // Easing function for smooth pop-up
         const easeOutBack = (x: number): number => {
           const c1 = 1.70158;
           const c3 = c1 + 1;
           return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
         };
         const scale = 0.5 + 0.5 * easeOutBack(t);
         
         modalRef.current.style.opacity = t.toString();
         modalRef.current.style.transform = `scale(${scale})`;
         modalRef.current.style.pointerEvents = t > 0.9 ? 'auto' : 'none';
      } else {
         modalRef.current.style.opacity = '0';
         modalRef.current.style.transform = `scale(0.5)`;
         modalRef.current.style.pointerEvents = 'none';
      }
    }
  });

  return (
    <group position={[0, 24.2, -96]}>
      <Html transform center scale={0.3} zIndexRange={[100, 0]}>
        <div ref={modalRef} style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '40px',
          padding: '50px',
          width: '900px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 32px 128px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.2)',
          opacity: 0,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}>
           <h2 style={{
             color: 'white',
             fontSize: '56px',
             fontFamily: '"Inter", sans-serif',
             fontWeight: '800',
             margin: '0 0 10px 0',
             textShadow: '0 4px 16px rgba(0,0,0,0.4)',
             letterSpacing: '-0.02em'
           }}>
             Explore NIT Sikkim
           </h2>
           <p style={{
             color: 'rgba(255,255,255,0.9)',
             fontSize: '24px',
             fontFamily: '"Inter", sans-serif',
             margin: '0 0 40px 0',
             textShadow: '0 2px 8px rgba(0,0,0,0.3)'
           }}>
             The official venue for UDGAM 2K26
           </p>
           
           <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
             {/* Glow effect behind image */}
             <div style={{
               position: 'absolute',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: '80%',
               height: '80%',
               background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
               filter: 'blur(40px)',
               zIndex: -1
             }} />
             {/* Use floating_campus.png because nitsikkim_3d_img.png is not in src/assets */}
             <img src={floatingCampusImg} alt="NIT Sikkim Campus" style={{
               width: '110%',
               maxWidth: '1000px',
               height: 'auto',
               filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
               transform: 'translateY(-20px)'
             }} />
           </div>

           <button 
             style={{
               marginTop: '20px',
               padding: '20px 50px',
               fontSize: '28px',
               background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
               color: '#e9a9bd',
               border: 'none',
               borderRadius: '60px',
               fontWeight: '900',
               cursor: 'pointer',
               boxShadow: '0 12px 24px rgba(0,0,0,0.2), 0 0 0 4px rgba(255,255,255,0.3)',
               transition: 'all 0.2s ease',
               textTransform: 'uppercase',
               letterSpacing: '1px'
             }} 
             onPointerOver={(e) => {
               e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
               e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.5)';
             }}
             onPointerOut={(e) => {
               e.currentTarget.style.transform = 'translateY(0) scale(1)';
               e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2), 0 0 0 4px rgba(255,255,255,0.3)';
             }}
             onClick={() => alert('Entering Campus Tour...')}
           >
             Enter Campus
           </button>
        </div>
      </Html>
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
  uniform float uAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float a = vSeed * 6.28;
    uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
    float d = length(vec2(uv.x * 1.8, uv.y + abs(uv.x) * 0.6));
    if (d > 0.42) discard;
    float vein = smoothstep(0.03, 0.0, abs(uv.x)) * 0.14;
    vec3 c = mix(vec3(0.96, 0.50, 0.68), vec3(1.0, 0.91, 0.94), vSeed) + vein;
    gl_FragColor = vec4(c, smoothstep(0.42, 0.18, d) * 0.90 * uAlpha);
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
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSpeed: { value: 1 }, uAlpha: { value: 1 } }), []);
  useFrame((_, d) => {
    uniforms.uTime.value += Math.min(d, 0.05);
    uniforms.uSpeed.value = 1 + progress.current * 0.9;
    const aerialT = Math.max(0, (progress.current - 0.85) / 0.15);
    uniforms.uAlpha.value = 1.0 - aerialT;
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
      2.2 + p * 4 + state.pointer.y * 0.3 * (1 - aerialT) + aerialT * 18,
      camera.position.z - 10 - aerialT * 30,
    );

    const midCol = morning.clone().lerp(golden, Math.min(p * 1.3, 1));
    const col = midCol.lerp(aerialSky, aerialT);
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      fog.color.copy(col);
      fog.near = 10 + p * 120;
      fog.far = 62 + p * 220;
    }
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

/* ─── Merch Stall ────────────────────────────────────── */
function MerchStall({ position }: { position: [number, number, number] }) {
  const stallRef = useRef<THREE.Group>(null);
  const btnWrapRef = useRef<HTMLDivElement>(null);

  useFrame(({ camera }) => {
    if (stallRef.current && btnWrapRef.current) {
      const dist = camera.position.distanceTo(stallRef.current.position);
      if (dist < 22 && dist > 3) {
        btnWrapRef.current.style.opacity = '1';
        btnWrapRef.current.style.pointerEvents = 'auto';
      } else {
        btnWrapRef.current.style.opacity = '0';
        btnWrapRef.current.style.pointerEvents = 'none';
      }
    }
  });

  return (
    <group position={position} ref={stallRef} rotation-y={-0.2}>
      {/* Table */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Table Front Banner */}
      <Html position={[0, 0.5, 0.76]} transform center scale={0.008}>
        <div style={{
          background: '#111',
          color: 'white',
          padding: '20px 40px',
          border: '4px solid #e9a9bd',
          borderRadius: '16px',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          fontSize: '48px',
          width: '320px',
          textAlign: 'center',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.5)',
        }}>
          UDGAM MERCH
          <div style={{ fontSize: '22px', color: '#e9a9bd', marginTop: '12px' }}>
            👕 T-Shirts &nbsp;|&nbsp; 🧥 Hoodies
          </div>
        </div>
      </Html>
      {/* Canopy Poles */}
      <mesh position={[-1.4, 1.5, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[1.4, 1.5, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[-1.4, 1.5, 0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[1.4, 1.5, 0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      {/* Canopy Roof */}
      <mesh position={[0, 3.1, 0]} castShadow rotation-x={-0.1}>
        <boxGeometry args={[3.4, 0.1, 2]} />
        <meshStandardMaterial color="#e9a9bd" roughness={1} />
      </mesh>
      {/* Folded hoodies/t-shirts */}
      <mesh position={[-0.8, 1.1, 0]} castShadow>
         <boxGeometry args={[0.6, 0.2, 0.6]} />
         <meshStandardMaterial color="#222" roughness={1} />
      </mesh>
      <mesh position={[-0.8, 1.25, 0]} castShadow>
         <boxGeometry args={[0.55, 0.1, 0.55]} />
         <meshStandardMaterial color="#d9b66f" roughness={1} />
      </mesh>
      <Html position={[-0.8, 1.6, 0]} center transform scale={0.012}>
        <div style={{ fontSize: '48px', filter: 'drop-shadow(0px 8px 8px rgba(0,0,0,0.5))' }}>🧥</div>
      </Html>

      <mesh position={[0, 1.15, 0]} castShadow>
         <boxGeometry args={[0.6, 0.3, 0.6]} />
         <meshStandardMaterial color="#fff" roughness={1} />
      </mesh>
      <Html position={[0, 1.5, 0]} center transform scale={0.012}>
        <div style={{ fontSize: '48px', filter: 'drop-shadow(0px 8px 8px rgba(0,0,0,0.5))' }}>👕</div>
      </Html>

      <mesh position={[0.8, 1.1, 0.2]} castShadow>
         <boxGeometry args={[0.6, 0.2, 0.6]} />
         <meshStandardMaterial color="#4ecdc0" roughness={1} />
      </mesh>
      <Html position={[0.8, 1.45, 0.2]} center transform scale={0.012}>
        <div style={{ fontSize: '48px', filter: 'drop-shadow(0px 8px 8px rgba(0,0,0,0.5))' }}>🧢</div>
      </Html>

      <Html position={[0, 4.5, 0]} center>
        <div ref={btnWrapRef} style={{ transition: 'opacity 0.4s ease', opacity: 0, pointerEvents: 'none' }}>
          <div 
            style={{
              background: 'white',
              padding: '12px 24px',
              borderRadius: '30px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#e9a9bd',
              fontFamily: 'sans-serif',
              border: '3px solid #e9a9bd',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
            }}
            onPointerOver={(e) => {
              e.currentTarget.style.background = '#e9a9bd';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onPointerOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#e9a9bd';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={() => {
              alert('Opening Merch Page!');
            }}
          >
            🛍️ Shop Merch
          </div>
        </div>
      </Html>
    </group>
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
        <NITCampus progress={progress} />
        <ForestSign label="NIT SIKKIM" position={[2.4, 0, -12]} rotation={-0.12} accent="#d9b66f" />
        <ForestSign label="UDGAM 2K26" position={[-2.6, 0, -32]} rotation={0.14} accent="#e9a9bd" />
        <MerchStall position={[3.8, 0, -50]} />
      </Suspense>
      <Petals count={low ? 2000 : 6500} progress={progress} />
    </Canvas>
  );
}
