import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   HexCluster3D — MSS UEMK
   Solid white hexagons pulsating Microsoft energy colours
   (blue · cyan · green · magenta · red · gold)
   across a thick horizontal 3D ribbon with real depth,
   parallax scroll fly-through, and mouse tilt.
═══════════════════════════════════════════════════════════ */

/* ── Helpers ────────────────────────────────────────────── */
function hexVerts(r: number): number[] {
  const v: number[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;  // pointy-top
    v.push(r * Math.cos(a), r * Math.sin(a));
  }
  return v;
}

function makeFaceGeo(r: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const verts = hexVerts(r);
  const pos: number[] = [];
  for (let i = 0; i < 6; i++) {
    const n = (i + 1) % 6;
    pos.push(
      0, 0, 0,
      verts[i * 2], verts[i * 2 + 1], 0,
      verts[n * 2], verts[n * 2 + 1], 0
    );
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return geo;
}

function makeEdgePositions(r: number): number[] {
  const verts = hexVerts(r);
  const pos: number[] = [];
  for (let i = 0; i < 6; i++) {
    const n = (i + 1) % 6;
    pos.push(verts[i*2], verts[i*2+1], 0, verts[n*2], verts[n*2+1], 0);
  }
  return pos;
}

function hexGrid(rings: number): { q: number; r: number }[] {
  const cells: { q: number; r: number }[] = [];
  for (let q = -rings; q <= rings; q++) {
    const r1 = Math.max(-rings, -q - rings);
    const r2 = Math.min(rings, -q + rings);
    for (let r = r1; r <= r2; r++) cells.push({ q, r });
  }
  return cells;
}

function axial2px(q: number, r: number, size: number) {
  return {
    x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: size * 1.5 * r,
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ── Microsoft Energy Palette ───────────────────────────── */
const PALETTE = [
  { h: 0.582, s: 1.0 },   // MS Blue
  { h: 0.46,  s: 1.0 },   // Cyan-Teal
  { h: 0.38,  s: 0.9 },   // Green
  { h: 0.85,  s: 1.0 },   // Purple
  { h: 0.57,  s: 1.0 },   // Electric Cyan
  { h: 0.95,  s: 1.0 },   // Hot Red/Magenta
  { h: 0.12,  s: 1.0 },   // Amber
];

/* ── Config ─────────────────────────────────────────────── */
const HEX_R        = 15;
const SPACING      = 1.02;
const RINGS        = 5;
const Y_SQUASH     = 0.32;
const DEPTH_LAYERS = 8;
const Z_STEP       = 28;
const BAND_W       = RINGS * HEX_R * 2.1;
const BAND_H       = RINGS * HEX_R * 0.42;
const PC           = 500;

interface HexObj {
  faceMesh: THREE.Mesh;
  edgeLine: THREE.LineSegments;
  faceMat:  THREE.MeshBasicMaterial;
  edgeMat:  THREE.LineBasicMaterial;
  pal: { h: number; s: number };
  norm: number;
  phase: number;
  pulseLag: number;
  pulseSpeed: number;
  baseZ: number;
}

/* ── Component ──────────────────────────────────────────── */
export default function HexCluster3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x04060f, 1);
    container.appendChild(renderer.domElement);

    /* Scene / Camera */
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x04060f, 0.0014);
    const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 3000);
    camera.position.z = 480;

    /* Pre-build layer geometries */
    const faceGeos: THREE.BufferGeometry[]  = [];
    const edgePosList: number[][]           = [];
    for (let li = 0; li < DEPTH_LAYERS; li++) {
      const norm = li / (DEPTH_LAYERS - 1);
      const r    = HEX_R * (0.55 + norm * 0.45);
      faceGeos.push(makeFaceGeo(r * 0.88));
      edgePosList.push(makeEdgePositions(r));
    }

    /* Build hex band */
    const base     = hexGrid(RINGS);
    const hexObjs: HexObj[] = [];

    for (let li = 0; li < DEPTH_LAYERS; li++) {
      const norm    = li / (DEPTH_LAYERS - 1);
      const zPos    = (li - DEPTH_LAYERS / 2) * Z_STEP;
      const hexR    = HEX_R * (0.55 + norm * 0.45);
      const spacing = hexR * 2 * SPACING;
      const jitX    = (Math.random() - 0.5) * hexR * 0.5;
      const jitY    = (Math.random() - 0.5) * hexR * 0.3;

      base.forEach(({ q, r }) => {
        const { x, y } = axial2px(q, r, spacing);
        const nx = x + jitX;
        const ny = y * Y_SQUASH + jitY;
        const ed = (nx * nx) / (BAND_W * BAND_W) + (ny * ny) / (BAND_H * BAND_H);
        if (ed > 1.0) return;

        const pal        = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const phase      = Math.random() * Math.PI * 2;
        const pulseLag   = Math.sqrt(nx * nx + ny * ny) * 0.005 + li * 0.15;
        const pulseSpeed = 1.2 + Math.random() * 1.0;

        /* Face */
        const faceMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(pal.h, 0.05, 0.96),
          side: THREE.DoubleSide,
        });
        const faceMesh = new THREE.Mesh(faceGeos[li], faceMat.clone());
        faceMesh.position.set(nx, ny, zPos);
        scene.add(faceMesh);

        /* Edge */
        const eGeo = new THREE.BufferGeometry();
        eGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePosList[li], 3));
        const edgeMat = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(pal.h, 1.0, 0.75),
          transparent: true,
          opacity: 0.5 + norm * 0.5,
          depthWrite: false,
        });
        const edgeLine = new THREE.LineSegments(eGeo, edgeMat.clone());
        edgeLine.position.set(nx, ny, zPos);
        scene.add(edgeLine);

        hexObjs.push({ faceMesh, edgeLine, faceMat: faceMesh.material as THREE.MeshBasicMaterial, edgeMat: edgeLine.material as THREE.LineBasicMaterial, pal, norm, phase, pulseLag, pulseSpeed, baseZ: zPos });
      });
    }

    /* Connector network (front layer) */
    const frontZ  = ((DEPTH_LAYERS - 1) - DEPTH_LAYERS / 2) * Z_STEP + 1;
    const frontR  = HEX_R;
    const frontSp = frontR * 2 * SPACING;
    const fMap: Record<string, { q: number; r: number; x: number; y: number }> = {};
    base.forEach(({ q, r }) => {
      const { x, y } = axial2px(q, r, frontSp);
      const ny = y * Y_SQUASH;
      const ed = (x * x) / (BAND_W * BAND_W) + (ny * ny) / (BAND_H * BAND_H);
      if (ed < 1.0) fMap[`${q},${r}`] = { q, r, x, y: ny };
    });

    const dirs: [number, number][] = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
    const connPts: number[] = [];
    Object.values(fMap).forEach((c) => {
      dirs.forEach(([dq, dr]) => {
        const nb = fMap[`${c.q + dq},${c.r + dr}`];
        if (nb && (c.q < nb.q || (c.q === nb.q && c.r < nb.r))) {
          connPts.push(c.x, c.y, frontZ + 2, nb.x, nb.y, frontZ + 2);
        }
      });
    });
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute("position", new THREE.Float32BufferAttribute(connPts, 3));
    const connMat = new THREE.LineBasicMaterial({ color: 0x50e6ff, transparent: true, opacity: 0.22, depthWrite: false });
    scene.add(new THREE.LineSegments(connGeo, connMat));

    /* Particles */
    const pGeo  = new THREE.BufferGeometry();
    const pPos  = new Float32Array(PC * 3);
    const pPhArr= new Float32Array(PC);
    for (let i = 0; i < PC; i++) {
      pPos[i*3]   = (Math.random() - 0.5) * 1600;
      pPos[i*3+1] = (Math.random() - 0.5) * 280;
      pPos[i*3+2] = (Math.random() - 0.5) * 800;
      pPhArr[i]   = Math.random() * Math.PI * 2;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x50e6ff, size: 1.4, transparent: true, opacity: 0.28, sizeAttenuation: true, depthWrite: false });
    scene.add(new THREE.Points(pGeo, pMat));

    /* State */
    let scrollTarget = 0, scrollY = 0;
    let mxT = 0, myT = 0, mxS = 0, myS = 0;
    let raf: number;
    const clock = new THREE.Clock();

    /* Events */
    const onWheel = (e: WheelEvent) => {
      scrollTarget = Math.max(-800, Math.min(800, scrollTarget + e.deltaY * 0.6));
    };
    let ty0 = 0;
    const onTS = (e: TouchEvent) => { ty0 = e.touches[0].clientY; };
    const onTM = (e: TouchEvent) => {
      const dy = ty0 - e.touches[0].clientY; ty0 = e.touches[0].clientY;
      scrollTarget = Math.max(-800, Math.min(800, scrollTarget + dy * 1.2));
    };
    const onMM = (e: MouseEvent) => {
      mxT = (e.clientX / window.innerWidth  - 0.5) * 2;
      myT = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("wheel",      onWheel, { passive: true });
    window.addEventListener("touchstart", onTS,    { passive: true });
    window.addEventListener("touchmove",  onTM,    { passive: true });
    window.addEventListener("mousemove",  onMM);
    window.addEventListener("resize",     onResize);

    /* Animate */
    function animate() {
      raf = requestAnimationFrame(animate);
      const T = clock.getElapsedTime();

      scrollY = lerp(scrollY, scrollTarget, 0.065);
      mxS     = lerp(mxS, mxT, 0.055);
      myS     = lerp(myS, myT, 0.055);

      const sn = scrollY / 800;
      camera.position.x = mxS * 45;
      camera.position.y = -myS * 25 + sn * -18;
      camera.position.z = 480 - sn * 200;
      camera.lookAt(mxS * 12, -myS * 8, 0);
      scene.rotation.y  = mxS * 0.10;
      scene.rotation.x  = myS * 0.05;

      hexObjs.forEach((h, i) => {
        const wave1 = Math.sin(T * h.pulseSpeed * 1.4 - h.pulseLag * 2.8 + h.phase * 0.4);
        const wave2 = Math.sin(T * h.pulseSpeed * 2.5 + h.phase);
        const pulse = (wave1 * 0.65 + wave2 * 0.35) * 0.5 + 0.5;  // 0..1

        const hue   = h.pal.h + Math.sin(T * 0.3 + h.phase) * 0.04;
        const satF  = lerp(0.05, 1.0,  pulse);
        const litF  = lerp(0.96, 0.60, pulse);
        h.faceMat.color.setHSL(hue, satF, litF);

        const depthScale = 0.55 + h.norm * 0.45;
        h.edgeMat.color.setHSL(hue, 1.0, lerp(0.50, 0.95, pulse));
        h.edgeMat.opacity = depthScale * (0.28 + pulse * 0.72);

        if (i % 3 === 0) {
          const zShift = Math.sin(T * 0.8 + h.phase) * 4.5;
          h.faceMesh.position.z = h.baseZ + zShift;
          h.edgeLine.position.z = h.baseZ + zShift;
        }

        const sc = 1.0 + pulse * 0.06;
        h.faceMesh.scale.setScalar(sc);
        h.edgeLine.scale.setScalar(sc);
      });

      connMat.opacity = 0.12 + Math.sin(T * 1.1) * 0.10;

      const pp = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PC; i++) {
        const pt = T * 0.2 + pPhArr[i];
        pp[i*3+1] += Math.sin(pt) * 0.016;
        pp[i*3]   += Math.cos(pt * 0.7) * 0.009;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove",  onTM);
      window.removeEventListener("mousemove",  onMM);
      window.removeEventListener("resize",     onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100vh", background: "#04060f", position: "relative", overflow: "hidden" }}
    />
  );
}
