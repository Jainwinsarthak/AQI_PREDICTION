import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function detectSoftwareWebGL() {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return { supported: false, isSoftwareGl: true };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

// Procedurally paint a soft multi-lobe volumetric cloud puff (zero external 404 assets)
function createCloudPuffTexture(maxAnisotropy) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const puffs = [
    { x: 128, y: 132, r: 92, a: 0.34 },
    { x: 88,  y: 138, r: 66, a: 0.30 },
    { x: 168, y: 140, r: 64, a: 0.28 },
    { x: 112, y: 102, r: 60, a: 0.28 },
    { x: 148, y: 108, r: 54, a: 0.24 },
    { x: 128, y: 128, r: 44, a: 0.22 },
  ];

  for (const p of puffs) {
    const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.08, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(255, 255, 255, ${p.a})`);
    grad.addColorStop(0.45, `rgba(255, 255, 255, ${p.a * 0.52})`);
    grad.addColorStop(0.78, `rgba(255, 255, 255, ${p.a * 0.14})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAnisotropy || 1);
  tex.needsUpdate = true;
  return tex;
}

// Procedurally paint a wispy drifting atmospheric smoke plume
function createSmokeWispTexture(maxAnisotropy) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const wisps = [
    { x: 118, y: 126, rx: 106, ry: 54, rot: -0.25, a: 0.26 },
    { x: 146, y: 118, rx: 86,  ry: 46, rot: 0.35,  a: 0.22 },
    { x: 96,  y: 142, rx: 78,  ry: 40, rot: 0.18,  a: 0.20 },
    { x: 132, y: 130, rx: 60,  ry: 58, rot: -0.1,  a: 0.18 },
  ];

  for (const w of wisps) {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(w.rot);
    ctx.scale(1, w.ry / w.rx);
    const grad = ctx.createRadialGradient(0, 0, w.rx * 0.05, 0, 0, w.rx);
    grad.addColorStop(0, `rgba(255, 255, 255, ${w.a})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${w.a * 0.42})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, w.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAnisotropy || 1);
  tex.needsUpdate = true;
  return tex;
}

// Soft circular particulate dot texture for suspended airborne dust/aerosols
function createParticulateTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Pre-allocated scratch colors to guarantee zero GC allocations inside the render loop
const _targetCloudColor = new THREE.Color();
const _targetSmokeColor = new THREE.Color();
const _targetDustColor = new THREE.Color();
const _targetFogColor = new THREE.Color();
const _cleanDayCloud = new THREE.Color('#d2e2e0');
const _hazeDayCloud = new THREE.Color('#cfc4b4');
const _cleanDaySmoke = new THREE.Color('#8db5b2');
const _hazeDaySmoke = new THREE.Color('#b6977d');
const _cleanNightCloud = new THREE.Color('#27474b');
const _hazeNightCloud = new THREE.Color('#473b36');
const _cleanNightSmoke = new THREE.Color('#2dd4bf');
const _hazeNightSmoke = new THREE.Color('#d97757');

export default function AtmosphericBackdrop({ isDark, aqi = 150, motionEnabled = true }) {
  const mountRef = useRef(null);
  const [webglReady, setWebglReady] = useState(true);

  // Stable reactive state refs so theme/AQI/motion updates never rebuild the WebGL context
  const stateRef = useRef({
    isDark,
    aqi,
    motionEnabled,
    pointerX: 0,
    pointerY: 0,
    smoothPointerX: 0,
    smoothPointerY: 0,
  });

  useEffect(() => {
    stateRef.current.isDark = isDark;
    stateRef.current.aqi = Number(aqi) || 120;
    stateRef.current.motionEnabled = motionEnabled;
  }, [isDark, aqi, motionEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { supported, isSoftwareGl } = detectSoftwareWebGL();
    if (!supported) {
      setWebglReady(false);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(stateRef.current.isDark ? 0x0b1112 : 0xf7f8f7, 0.028);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 0.4, 14);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const cloudTex = createCloudPuffTexture(maxAniso);
    const smokeTex = createSmokeWispTexture(maxAniso);
    const dustTex = createParticulateTexture();

    const planeGeo = new THREE.PlaneGeometry(1, 1);

    // Layer 1: High floating atmospheric cloud banks
    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      color: new THREE.Color('#d2e2e0'),
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    const clouds = [];
    const cloudCount = 16;
    for (let i = 0; i < cloudCount; i++) {
      const mesh = new THREE.Mesh(planeGeo, cloudMat);
      const baseX = ((i / cloudCount) - 0.5) * 34 + (Math.sin(i * 4.3) * 2.2);
      const baseY = 1.2 + Math.cos(i * 2.7) * 5.2;
      const baseZ = -12 - (i % 5) * 2.4;
      const scaleX = 9.5 + (i % 4) * 3.1;
      const scaleY = scaleX * (0.58 + (i % 3) * 0.08);

      mesh.position.set(baseX, baseY, baseZ);
      mesh.scale.set(scaleX, scaleY, 1);
      mesh.rotation.z = (Math.sin(i * 1.9) * 0.22);
      scene.add(mesh);

      clouds.push({
        mesh,
        baseX,
        baseY,
        baseZ,
        speed: 0.18 + (i % 5) * 0.055,
        bobAmp: 0.25 + (i % 3) * 0.12,
        bobFreq: 0.22 + (i % 4) * 0.06,
        phase: i * 1.37,
        rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.012 + (i % 3) * 0.004),
      });
    }

    // Layer 2: Drifting volumetric smoke & haze plumes responding to cursor wind
    const smokeMat = new THREE.MeshBasicMaterial({
      map: smokeTex,
      color: new THREE.Color('#8db5b2'),
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    });

    const smokes = [];
    const smokeCount = 20;
    for (let i = 0; i < smokeCount; i++) {
      const mesh = new THREE.Mesh(planeGeo, smokeMat);
      const baseX = ((i / smokeCount) - 0.5) * 30 + Math.cos(i * 3.1) * 2.4;
      const baseY = -1.5 + Math.sin(i * 2.1) * 5.6;
      const baseZ = -5.5 - (i % 6) * 1.35;
      const scaleX = 6.8 + (i % 5) * 2.1;
      const scaleY = scaleX * 0.66;

      mesh.position.set(baseX, baseY, baseZ);
      mesh.scale.set(scaleX, scaleY, 1);
      mesh.rotation.z = Math.cos(i * 2.5) * 0.6;
      scene.add(mesh);

      smokes.push({
        mesh,
        x: baseX,
        y: baseY,
        baseY,
        baseZ,
        offsetX: 0,
        offsetY: 0,
        speed: 0.34 + (i % 5) * 0.09,
        phase: i * 0.91,
        rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.045 + (i % 4) * 0.012),
      });
    }

    // Layer 3: Fine suspended airborne particulate motes (PM2.5 / aerosols)
    const particleCount = 130;
    const positions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 28;
      const py = (Math.random() - 0.5) * 15;
      const pz = -10 + Math.random() * 14;
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      particleSeeds[i * 3] = 0.25 + Math.random() * 0.55; // horizontal drift
      particleSeeds[i * 3 + 1] = Math.random() * Math.PI * 2; // wave phase
      particleSeeds[i * 3 + 2] = 0.08 + Math.random() * 0.14; // upward buoyancy
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({
      map: dustTex,
      color: new THREE.Color('#0d6e6e'),
      size: 0.26,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustPoints.frustumCulled = false;
    scene.add(dustPoints);

    // Pointer listeners for smooth interactive cursor parallax & wind parting
    const onPointerMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      stateRef.current.pointerX = (e.clientX / w) * 2 - 1;
      stateRef.current.pointerY = -((e.clientY / h) * 2 - 1);
    };

    const onPointerLeave = () => {
      stateRef.current.pointerX = 0;
      stateRef.current.pointerY = 0;
    };

    const onResize = () => {
      if (!container) return;
      const nextW = container.clientWidth || window.innerWidth;
      const nextH = container.clientHeight || window.innerHeight;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    let contextLost = false;
    const onContextLost = (e) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
      tick();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb) {
      const gl = renderer.getContext();
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 8);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 8);
      } else {
        frameId = window.setTimeout(cb, 90);
      }
    }

    function updateScene(delta) {
      const st = stateRef.current;
      const activeMotion = st.motionEnabled && !prefersReduced;
      const dt = Math.min(delta, 0.08);
      if (activeMotion) {
        elapsed += dt;
      }

      // Smooth damped pointer interpolation
      st.smoothPointerX = THREE.MathUtils.damp(st.smoothPointerX, st.pointerX, 3.2, dt);
      st.smoothPointerY = THREE.MathUtils.damp(st.smoothPointerY, st.pointerY, 3.2, dt);

      // Camera parallax sway driven by cursor
      camera.position.x = THREE.MathUtils.damp(camera.position.x, st.smoothPointerX * 1.45, 3.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.4 + st.smoothPointerY * 0.85, 3.5, dt);
      camera.lookAt(st.smoothPointerX * 0.4, st.smoothPointerY * 0.25, -6);

      // Compute AQI severity factor (0 = pristine, 1 = heavy haze/smoke)
      const hazeFactor = THREE.MathUtils.clamp((st.aqi - 50) / 260, 0, 1);

      if (st.isDark) {
        _targetCloudColor.copy(_cleanNightCloud).lerp(_hazeNightCloud, hazeFactor * 0.7);
        _targetSmokeColor.copy(_cleanNightSmoke).lerp(_hazeNightSmoke, hazeFactor * 0.85);
        _targetDustColor.set(hazeFactor > 0.55 ? '#f59e0b' : '#2dd4bf');
        _targetFogColor.set('#0b1112');
      } else {
        _targetCloudColor.copy(_cleanDayCloud).lerp(_hazeDayCloud, hazeFactor * 0.72);
        _targetSmokeColor.copy(_cleanDaySmoke).lerp(_hazeDaySmoke, hazeFactor * 0.82);
        _targetDustColor.set(hazeFactor > 0.55 ? '#b45309' : '#0d6e6e');
        _targetFogColor.set('#f7f8f7');
      }

      cloudMat.color.lerp(_targetCloudColor, Math.min(1, dt * 3));
      smokeMat.color.lerp(_targetSmokeColor, Math.min(1, dt * 3));
      dustMat.color.lerp(_targetDustColor, Math.min(1, dt * 3));
      scene.fog.color.lerp(_targetFogColor, Math.min(1, dt * 3));

      const targetCloudOpacity = st.isDark ? 0.34 + hazeFactor * 0.1 : 0.46 + hazeFactor * 0.08;
      const targetSmokeOpacity = st.isDark ? 0.20 + hazeFactor * 0.16 : 0.18 + hazeFactor * 0.16;
      const targetDustOpacity = st.isDark ? 0.28 + hazeFactor * 0.22 : 0.22 + hazeFactor * 0.2;

      cloudMat.opacity = THREE.MathUtils.damp(cloudMat.opacity, targetCloudOpacity, 3, dt);
      smokeMat.opacity = THREE.MathUtils.damp(smokeMat.opacity, targetSmokeOpacity, 3, dt);
      dustMat.opacity = THREE.MathUtils.damp(dustMat.opacity, targetDustOpacity, 3, dt);

      // Drift cloud banks gently across the sky
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        if (activeMotion) {
          c.baseX += c.speed * dt;
          if (c.baseX > 20) c.baseX = -20;
          c.mesh.rotation.z += c.rotSpeed * dt;
        }
        c.mesh.position.x = c.baseX + st.smoothPointerX * 0.65;
        c.mesh.position.y =
          c.baseY + Math.sin(elapsed * c.bobFreq + c.phase) * c.bobAmp + st.smoothPointerY * 0.35;
      }

      // Cursor world proxy for interactive wind parting on smoke plumes
      const cursorWorldX = st.smoothPointerX * 11.5;
      const cursorWorldY = st.smoothPointerY * 6.0;

      for (let i = 0; i < smokes.length; i++) {
        const s = smokes[i];
        if (activeMotion) {
          s.x += (s.speed * (1 + hazeFactor * 0.35)) * dt;
          if (s.x > 18) s.x = -18;
          s.mesh.rotation.z += s.rotSpeed * dt;
        }

        const dx = s.x - cursorWorldX;
        const dy = s.baseY - cursorWorldY;
        const distSq = dx * dx + dy * dy;
        let repelX = 0;
        let repelY = 0;
        if (distSq < 42 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 6.48) * 1.9;
          repelX = (dx / dist) * force;
          repelY = (dy / dist) * force;
        }

        s.offsetX = THREE.MathUtils.damp(s.offsetX, repelX, 3.0, dt);
        s.offsetY = THREE.MathUtils.damp(s.offsetY, repelY, 3.0, dt);

        s.mesh.position.x = s.x + s.offsetX;
        s.mesh.position.y =
          s.baseY + Math.sin(elapsed * 0.45 + s.phase) * 0.45 + s.offsetY;
      }

      // Update suspended airborne particulates
      if (activeMotion) {
        const posAttr = dustGeo.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          arr[i3] += (particleSeeds[i3] + st.smoothPointerX * 0.5) * dt;
          arr[i3 + 1] +=
            (particleSeeds[i3 + 2] + Math.sin(elapsed * 0.7 + particleSeeds[i3 + 1]) * 0.14) * dt;

          if (arr[i3] > 15) arr[i3] = -15;
          if (arr[i3] < -15) arr[i3] = 15;
          if (arr[i3 + 1] > 8) arr[i3 + 1] = -8;
        }
        posAttr.needsUpdate = true;
      }
    }

    function tick() {
      if (disposed || contextLost) return;
      const delta = clock.getDelta();
      updateScene(delta);
      renderer.render(scene, camera);

      if (prefersReduced) return; // Render one serene frame for reduced-motion users

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    // Warm one initial frame immediately
    updateScene(0.016);
    renderer.render(scene, camera);
    if (!prefersReduced) {
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      planeGeo.dispose();
      cloudMat.dispose();
      smokeMat.dispose();
      cloudTex.dispose();
      smokeTex.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      dustTex.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {webglReady ? (
        <div ref={mountRef} className="h-full w-full" />
      ) : (
        <div
          className="h-full w-full opacity-50"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 80% 50% at 75% 15%, rgba(45, 212, 191, 0.12), transparent 70%)'
              : 'radial-gradient(ellipse 80% 50% at 75% 15%, rgba(13, 110, 110, 0.08), transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
