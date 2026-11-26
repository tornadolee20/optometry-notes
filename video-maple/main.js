// 秋天許願楓樹林 — Three.js 場景（逐格可重現：所有動畫皆為時間 t 的純函數）
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 1080, H = 1920, DURATION = 15;

// ---------- 可重現亂數 ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(20261126);
const R = (a, b) => a + (b - a) * rand();
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = x => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x, 0, 1));

// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.NoToneMapping;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const FOG_COLOR = new THREE.Color('#c25a32');
scene.fog = new THREE.FogExp2(FOG_COLOR, 0.021);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 700);

const sunDir = new THREE.Vector3(0.05, 0.085, -1).normalize();

// ---------- 貼圖（程式繪製） ----------
function leafTexture() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.translate(s / 2, s * 0.54);
  const pts = [];
  for (let i = 0; i <= 500; i++) {
    const a = i / 500 * Math.PI * 2;
    let r = 0.5 + 0.5 * Math.pow(Math.abs(Math.cos(2.5 * a)), 1.5);
    const db = Math.abs(a - Math.PI);
    r *= 0.5 + 0.5 * Math.min(1, db / 1.25);
    r *= 1 + 0.055 * Math.sin(a * 44);
    r *= s * 0.43;
    pts.push([Math.sin(a) * r, -Math.cos(a) * r]);
  }
  const grad = g.createRadialGradient(0, 0, 4, 0, 0, s * 0.45);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.6, '#f4ece4'); grad.addColorStop(1, '#d8c4b4');
  g.fillStyle = grad; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,70,50,0.45)'; g.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    const a = k * Math.PI * 2 / 5; g.lineWidth = k === 0 ? 3.2 : 2.4;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * s * 0.4, -Math.cos(a) * s * 0.4); g.stroke();
  }
  g.lineWidth = 4; g.strokeStyle = 'rgba(150,90,60,1)';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, s * 0.42); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function haloTexture() {
  const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  gr.addColorStop(0.6, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}
const LEAF_TEX = leafTexture();
const HALO_TEX = haloTexture();

// ---------- 天空 ----------
const skyMat = new THREE.ShaderMaterial({
  uniforms: { sunDir: { value: sunDir }, occ: { value: 0 } },
  depthWrite: false, side: THREE.BackSide, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`,
  fragmentShader: `uniform vec3 sunDir; uniform float occ; varying vec3 vDir;
  void main(){
    vec3 d = normalize(vDir); float h = d.y;
    vec3 horizon = vec3(0.62,0.18,0.06), mid = vec3(0.50,0.12,0.05), top = vec3(0.10,0.035,0.08);
    vec3 col = mix(horizon, mid, smoothstep(0.0,0.16,h));
    col = mix(col, top, smoothstep(0.14,0.65,h));
    col = mix(col, vec3(0.53,0.11,0.035), smoothstep(0.02,-0.1,h));
    float s = max(dot(d,sunDir),0.0);
    vec3 sunCol = vec3(1.0,0.72,0.42);
    if(occ > 0.5){ gl_FragColor = vec4(sunCol*(pow(s,1800.)*40. + pow(s,140.)*2.2 + pow(s,14.)*0.35),1.); return; }
    col += sunCol*(pow(s,1800.)*40. + pow(s,180.)*2.2 + pow(s,20.)*0.55 + pow(s,4.)*0.25*vec3(1.0,0.6,0.35));
    gl_FragColor = vec4(col,1.);
  }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), skyMat);
sky.renderOrder = -10; sky.frustumCulled = false;
scene.add(sky);

// ---------- 池塘 / 地面 ----------
const POND = { a: 7.5, b: 28, cz: 26 };
const pondHalf = z => POND.a * Math.sqrt(Math.max(0, 1 - ((z - POND.cz) / POND.b) ** 2));
const inPond = (x, z, m = 0) => (x / (POND.a + m)) ** 2 + ((z - POND.cz) / (POND.b + m)) ** 2 < 1;

const groundMat = new THREE.ShaderMaterial({
  fog: true,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { occ: { value: 0 }, pond: { value: new THREE.Vector3(POND.a, POND.b, POND.cz) } }]),
  vertexShader: `#include <fog_pars_vertex>
  varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
  #include <fog_vertex>
  }`,
  fragmentShader: `#include <fog_pars_fragment>
  uniform float occ; uniform vec3 pond; varying vec3 vW;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  void main(){
    float d = pow(vW.x/pond.x,2.) + pow((vW.z-pond.z)/pond.y,2.);
    if(d < 1.0) discard;
    if(occ > 0.5){ gl_FragColor = vec4(0.,0.,0.,1.); return; }
    float n = noise(vW.xz*2.2)*0.6 + noise(vW.xz*7.0)*0.4;
    vec3 litter = mix(vec3(0.10,0.03,0.015), vec3(0.34,0.08,0.03), n);
    litter = mix(litter, vec3(0.42,0.18,0.04), smoothstep(0.75,0.95,noise(vW.xz*3.1+7.)));
    float bank = smoothstep(1.0, 1.25, d);
    vec3 col = mix(vec3(0.035,0.015,0.01), litter, bank);
    gl_FragColor = vec4(col,1.);
    #include <fog_fragment>
  }`
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), groundMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = 0.03;
scene.add(ground);

const waterShader = {
  uniforms: {
    color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
    time: { value: 0 }, fogColor: { value: FOG_COLOR }, fogDensity: { value: 0.021 }
  },
  vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
  void main(){ vUv = textureMatrix*vec4(position,1.); vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse; uniform float time; uniform vec3 fogColor; uniform float fogDensity;
  varying vec4 vUv; varying vec3 vW;
  void main(){
    vec2 p = vW.xz;
    vec2 n = vec2(sin(p.x*1.6+time*0.8) + 0.6*sin(p.y*2.4 - time*0.6 + p.x*0.5),
                  cos(p.y*1.8+time*0.7) + 0.5*cos(p.x*3.1 + p.y*0.7 - time*1.0));
    n += 0.35*vec2(sin(p.y*7.0+time*1.6), cos(p.x*6.0-time*1.3));
    vec4 uv = vUv; uv.xy += n*0.0045*uv.w;
    vec3 refl = texture2DProj(tDiffuse, uv).rgb;
    vec3 V = normalize(cameraPosition - vW);
    float fres = 0.3 + 0.7*pow(1.0 - max(V.y,0.0), 2.5);
    vec3 col = mix(vec3(0.03,0.012,0.008), refl*0.92, fres);
    float dist = length(cameraPosition - vW);
    float f = 1.0 - exp(-fogDensity*fogDensity*dist*dist);
    col = mix(col, fogColor, f);
    gl_FragColor = vec4(col,1.);
  }`
};
const water = new Reflector(new THREE.PlaneGeometry(260, 260), {
  shader: waterShader, textureWidth: 540, textureHeight: 960, clipBias: 0.003, color: 0xffffff, multisample: 4
});
water.rotation.x = -Math.PI / 2; water.position.y = 0;
scene.add(water);

// ---------- 程式生成楓樹 ----------
const trunkGeoms = [];
const leafPos = [], leafQuat = [], leafScale = [], leafCol = [];
const PALETTE = ['#b51d1d', '#c92a1c', '#d8401c', '#e2581d', '#ea7524', '#f09430', '#f4b03c', '#a81a2c'].map(h => new THREE.Color(h));
const UP = new THREE.Vector3(0, 1, 0);

function addBranch(start, dir, len, rad, depth, tips) {
  const end = start.clone().addScaledVector(dir, len);
  const g = new THREE.CylinderGeometry(rad * 0.66, rad, len, depth < 2 ? 7 : 5, 1, true);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir));
  g.translate(start.x, start.y, start.z);
  trunkGeoms.push(g);
  if (depth >= 3) { tips.push(end); return; }
  const n = depth === 0 ? 3 : (rand() < 0.5 ? 2 : 3);
  const perp = Math.abs(dir.x) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const p1 = new THREE.Vector3().crossVectors(dir, perp).normalize();
  const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
  const az0 = R(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    const ang = R(0.38, 0.8);
    const az = az0 + i / n * Math.PI * 2 + R(-0.4, 0.4);
    const off = p1.clone().multiplyScalar(Math.cos(az)).addScaledVector(p2, Math.sin(az));
    const nd = dir.clone().multiplyScalar(Math.cos(ang)).addScaledVector(off, Math.sin(ang));
    nd.y += 0.18; nd.normalize();
    const bs = start.clone().lerp(end, depth === 0 ? R(0.7, 0.95) : R(0.8, 1.0));
    addBranch(bs, nd, len * R(0.62, 0.8), rad * 0.6, depth + 1, tips);
  }
  if (depth >= 1) tips.push(end.clone().lerp(start, 0.25));
}

function makeTree(x, z, Ht, far = false) {
  const tips = [];
  const lean = new THREE.Vector3(R(-0.08, 0.08), 1, R(-0.08, 0.08)).normalize();
  addBranch(new THREE.Vector3(x, -0.3, z), lean, Ht * 0.48, Ht * R(0.026, 0.034), 0, tips);
  const base = Math.floor(R(0, 6.2));
  const cr = Ht * R(0.1, 0.13);
  let topY = 0; tips.forEach(t => topY = Math.max(topY, t.y));
  for (const tip of tips) {
    const cnt = far ? 10 : 30;
    for (let k = 0; k < cnt; k++) {
      const u = new THREE.Vector3(R(-1, 1), R(-0.6, 1), R(-1, 1));
      if (u.lengthSq() > 1) { k--; continue; }
      const p = tip.clone().addScaledVector(u, cr);
      leafPos.push(p);
      leafQuat.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(R(0, 6.28), R(0, 6.28), R(0, 6.28))));
      leafScale.push((far ? R(0.7, 1.0) : R(0.34, 0.55)) * Ht / 12);
      const ci = clamp(base + Math.round(R(-1.4, 1.4)), 0, PALETTE.length - 1);
      const hf = clamp(p.y / topY, 0, 1);
      const rim = Math.pow(clamp(Math.hypot(u.x, u.y), 0, 1), 3);
      const b = 0.26 + 0.5 * hf * hf + 0.42 * rim + R(-0.06, 0.12);
      leafCol.push(PALETTE[ci].clone().multiplyScalar(b));
    }
  }
}

// 遠岸樹林
for (let i = 0; i < 95; i++) {
  const x = R(-40, 40), z = R(-4, -85);
  if (Math.abs(x - sunDir.x / -sunDir.z * -z) < 1.6 && rand() < 0.6) continue; // 留出陽光縫隙
  makeTree(x, z, R(9, 16));
}
// 遠方林線（霧中剪影）
for (let i = 0; i < 70; i++) makeTree(R(-70, 70), R(-88, -150), R(13, 20), true);
// 兩側河岸
for (let i = 0; i < 80; i++) {
  const z = R(-4, 60), side = rand() < 0.5 ? -1 : 1;
  const x = side * R(pondHalf(z) + 1.6, 30);
  if (inPond(x, z, 1.2)) continue;
  makeTree(x, z, R(9, 15));
}

const trunkGeo = mergeGeometries(trunkGeoms); trunkGeoms.length = 0;
const trunkMat = new THREE.MeshBasicMaterial({ color: '#2a1510' });
const trunks = new THREE.Mesh(trunkGeo, trunkMat);
scene.add(trunks);

const leafGeo = new THREE.PlaneGeometry(1, 1);
const leafMat = new THREE.MeshBasicMaterial({ map: LEAF_TEX, alphaTest: 0.5, side: THREE.DoubleSide });
const foliage = new THREE.InstancedMesh(leafGeo, leafMat, leafPos.length);
{
  const m = new THREE.Matrix4(), s = new THREE.Vector3();
  for (let i = 0; i < leafPos.length; i++) {
    s.setScalar(leafScale[i]); m.compose(leafPos[i], leafQuat[i], s);
    foliage.setMatrixAt(i, m); foliage.setColorAt(i, leafCol[i]);
  }
  foliage.instanceMatrix.needsUpdate = true; foliage.instanceColor.needsUpdate = true;
}
scene.add(foliage);
console.log('foliage instances', leafPos.length);

// ---------- 飄落楓葉 ----------
const FALL_N = 950;
const fallMat = new THREE.MeshBasicMaterial({ map: LEAF_TEX, alphaTest: 0.5, side: THREE.DoubleSide });
const falling = new THREE.InstancedMesh(leafGeo, fallMat, FALL_N);
falling.frustumCulled = false;
const fallP = [];
for (let i = 0; i < FALL_N; i++) {
  let x = R(-14, 14), z = R(-22, 50);
  if (z > 1 && z < 12 && Math.abs(x) < 2.4) x += Math.sign(x || 1) * 2.6; // 讓結尾畫面中央保持乾淨
  const c = PALETTE[Math.floor(R(1, PALETTE.length))].clone().multiplyScalar(R(0.75, 1.25));
  falling.setColorAt(i, c);
  fallP.push({ x, z, top: R(11, 15), spd: R(0.42, 0.75), ph: rand(), sw: R(0.4, 1.1), sf: R(0.5, 1.1), sp: R(0, 6.28),
    r1: R(-1.2, 1.2), r2: R(-1.5, 1.5), r3: R(0, 6.28), sc: R(0.16, 0.26) });
}
falling.instanceColor.needsUpdate = true;
scene.add(falling);

// ---------- 心願葉（發光） ----------
const wishes = [];
function addWish(o) {
  const col = new THREE.Color(1.0, 0.38, 0.085).multiplyScalar(o.glow);
  const mat = new THREE.MeshBasicMaterial({ map: LEAF_TEX, alphaTest: 0.35, side: THREE.DoubleSide, color: col, fog: false });
  const mesh = new THREE.Mesh(leafGeo, mat);
  mesh.scale.setScalar(o.size);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO_TEX, color: new THREE.Color(1.0, 0.55, 0.22), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  halo.scale.setScalar(o.size * 4.2);
  scene.add(mesh); scene.add(halo);
  wishes.push({ ...o, mesh, halo, col });
}
[[-3.2, 1.6, 18, 0.11], [2.8, 2.4, 24, 0.09], [-1.8, 3.6, 30, 0.1], [4.2, 1.2, 12, 0.12], [-4.6, 2.2, 6, 0.1],
 [1.6, 0.9, 36, 0.08], [-2.4, 4.4, -1, 0.07], [3.4, 3.2, 2, 0.09], [-0.8, 2.0, 14, 0.1], [5.2, 4.8, 28, 0.08]]
  .forEach(([x, y, z, v]) => addWish({ x, y, z, v, size: R(0.32, 0.42), glow: R(1.6, 2.2), ph: R(0, 6.28), hero: false }));
addWish({ x: 0.08, y: 2.95, z: 5.0, v: 0.012, size: 0.5, glow: 1.55, ph: 0.6, hero: true });

// ---------- 光塵 ----------
const DUST_N = 700;
const dustGeo = new THREE.BufferGeometry();
const dustArr = new Float32Array(DUST_N * 3);
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
const dustP = [];
for (let i = 0; i < DUST_N; i++) dustP.push({ x: R(-10, 10), y: R(0.3, 9), z: R(-15, 48), a: R(0, 6.28), s: R(0.1, 0.3) });
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: HALO_TEX, size: 0.07, color: new THREE.Color(1.6, 1.0, 0.5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
dust.frustumCulled = false;
scene.add(dust);

// ---------- 霧層與空氣透視 ----------
const NOISE_GLSL = `float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }`;
const mists = [];
function mistPlane({ w, h, pos, rotX = 0, opacity, color, scale, speed, vertical }) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { time: { value: 0 }, opacity: { value: opacity }, color: { value: new THREE.Color(...color) }, scale: { value: scale }, speed: { value: new THREE.Vector2(...speed) }, vertical: { value: vertical ? 1 : 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform float time, opacity, scale, vertical; uniform vec3 color; uniform vec2 speed; varying vec2 vUv; varying vec3 vW;
    ${NOISE_GLSL}
    void main(){
      vec2 q = (vertical>0.5 ? vW.xy : vW.xz)*scale + speed*time;
      float n = fbm(q + fbm(q*0.7 + time*0.03)*1.5);
      float edge = smoothstep(0.0,0.18,vUv.x)*smoothstep(1.0,0.82,vUv.x)*smoothstep(0.0,0.15,vUv.y)*smoothstep(1.0,0.75,vUv.y);
      if(vertical>0.5) edge *= smoothstep(1.0,0.05,vUv.y);
      float dc = length(cameraPosition - vW);
      float a = smoothstep(0.35,0.85,n)*edge*opacity*smoothstep(1.5,7.0,dc);
      gl_FragColor = vec4(color*a,1.);
    }`
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(...pos); m.rotation.x = rotX; m.renderOrder = 5;
  scene.add(m); mists.push(m); return m;
}
mistPlane({ w: 30, h: 70, pos: [0, 0.35, 24], rotX: -Math.PI / 2, opacity: 0.26, color: [1.0, 0.5, 0.28], scale: 0.22, speed: [0.06, 0.02] });
mistPlane({ w: 34, h: 76, pos: [0, 1.1, 22], rotX: -Math.PI / 2, opacity: 0.16, color: [1.0, 0.45, 0.24], scale: 0.15, speed: [0.04, -0.015] });
[[-4, 0.05], [-14, 0.055], [-28, 0.065], [-46, 0.08]].forEach(([z, o]) =>
  mistPlane({ w: 140, h: 18, pos: [0, 7, z], opacity: o, color: [1.0, 0.4, 0.16], scale: 0.07, speed: [0.05, 0.01], vertical: true }));

// ---------- 遮擋（god rays 用）材質切換 ----------
const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
const blackLeafMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: LEAF_TEX, alphaTest: 0.5, side: THREE.DoubleSide, fog: false });
function setOcc(on) {
  skyMat.uniforms.occ.value = on ? 1 : 0;
  groundMat.uniforms.occ.value = on ? 1 : 0;
  trunks.material = on ? blackMat : trunkMat;
  foliage.material = on ? blackLeafMat : leafMat;
  falling.material = on ? blackLeafMat : fallMat;
  water.visible = !on; dust.visible = !on;
  mists.forEach(m => m.visible = !on);
  wishes.forEach(w => { w.mesh.visible = !on; w.halo.visible = !on; });
  scene.fog = on ? null : fogObj;
}
const fogObj = scene.fog;

// ---------- 後製管線 ----------
const rtMain = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
rtMain.depthTexture = new THREE.DepthTexture(W, H); rtMain.depthTexture.type = THREE.UnsignedIntType;
const rtOcc = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
const rtDof = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });

const dofMat = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: rtMain.texture }, tDepth: { value: rtMain.depthTexture }, near: { value: camera.near }, far: { value: camera.far },
    focus: { value: 20 }, aperture: { value: 6 }, maxBlur: { value: 12 }, texel: { value: new THREE.Vector2(1 / W, 1 / H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D tColor, tDepth; uniform float near, far, focus, aperture, maxBlur; uniform vec2 texel; varying vec2 vUv;
  float lin(float d){ return near*far/(far - d*(far-near)); }
  float coc(float z){ return clamp(aperture*abs(1.0 - focus/z), 0.0, maxBlur); }
  void main(){
    float cz = lin(texture2D(tDepth,vUv).x); float cs = coc(cz);
    vec3 col = texture2D(tColor,vUv).rgb; float tot = 1.0;
    float radius = 1.0; float ang = 0.0;
    for(int i=0;i<110;i++){
      if(radius >= maxBlur) break;
      vec2 tc = vUv + vec2(cos(ang),sin(ang))*texel*radius;
      vec3 sc = texture2D(tColor,tc).rgb;
      float sz = lin(texture2D(tDepth,tc).x);
      float ss = coc(sz);
      if(sz > cz) ss = clamp(ss, 0.0, cs*2.0);
      float m = smoothstep(radius-0.5, radius+0.5, ss);
      col += mix(col/tot, sc, m); tot += 1.0;
      radius += 1.0/radius; ang += 2.39996323;
    }
    gl_FragColor = vec4(col/tot,1.);
  }`
});
const dofQuad = new FullScreenQuad(dofMat);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.6, 1.0);

const finalMat = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: rtDof.texture }, tOcc: { value: rtOcc.texture }, sunUv: { value: new THREE.Vector2(0.5, 0.5) },
    rayStrength: { value: 0.42 }, exposure: { value: 1.0 }, frame: { value: 0 }, fade: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D tColor, tOcc; uniform vec2 sunUv; uniform float rayStrength, exposure, frame, fade; varying vec2 vUv;
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.); }
  float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  void main(){
    vec3 col = texture2D(tColor,vUv).rgb;
    // 體積光：遮擋緩衝的徑向模糊
    vec2 d = (vUv - sunUv) * (0.92/72.0);
    vec2 c = vUv; float il = 1.0; vec3 rays = vec3(0.);
    for(int i=0;i<72;i++){ c -= d; rays += texture2D(tOcc, clamp(c,0.,1.)).rgb*il; il *= 0.972; }
    rays *= 1.0/72.0;
    col += rays*vec3(1.0,0.55,0.25)*rayStrength*3.0;
    col *= exposure;
    vec2 sd = (vUv - sunUv)*vec2(1.0,1.7778);
    col += vec3(1.0,0.5,0.2)*(exp(-dot(sd,sd)*9.0)*0.22 + exp(-dot(sd,sd)*40.0)*0.25);
    vec3 m = aces(col);
    // 調色：暗部偏暖紫、整體暖橘
    m = pow(m, vec3(0.97,1.0,1.04));
    m = m + vec3(0.018,0.006,0.012)*(1.0-m);
    float lum = dot(m, vec3(0.2126,0.7152,0.0722));
    m = mix(vec3(lum), m, 1.12);
    vec2 v = vUv - 0.5; v.y *= 1.25;
    m *= mix(1.0, smoothstep(0.85, 0.25, length(v)), 0.55);
    m = pow(max(m,0.), vec3(1.0/2.2));
    m += (hash(vUv*vec2(1080.,1920.) + frame*7.13) - 0.5)*0.022;
    gl_FragColor = vec4(m*fade,1.);
  }`
});
const finalQuad = new FullScreenQuad(finalMat);

// ---------- 鏡頭 ----------
const CAM_A = new THREE.Vector3(0.9, 4.8, 47), CAM_B = new THREE.Vector3(0.0, 3.32, 7.6);
const TGT_A = new THREE.Vector3(0.0, 5.6, -20), TGT_B = new THREE.Vector3(0.04, 3.32, 0.0);
function cameraAt(t) {
  const k = easeInOut(t / 12.3);
  const k2 = 1 - Math.pow(1 - clamp(t / 12.3, 0, 1), 2.2); // 前段略快、後段緩停
  const kk = 0.55 * k + 0.45 * k2;
  camera.position.lerpVectors(CAM_A, CAM_B, kk);
  camera.position.x += Math.sin(t * 0.35) * 0.12 * (1 - kk);
  camera.position.y += Math.sin(t * 0.5 + 1.0) * 0.03;
  const tg = new THREE.Vector3().lerpVectors(TGT_A, TGT_B, kk);
  camera.lookAt(tg);
}

// ---------- 每格更新 ----------
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3();
function update(t) {
  cameraAt(t);
  camera.updateMatrixWorld();
  sky.position.copy(camera.position);
  water.material.uniforms.time.value = t;
  mists.forEach(m => m.material.uniforms.time.value = t);

  // 飄落楓葉：位置為 t 的函數
  for (let i = 0; i < FALL_N; i++) {
    const p = fallP[i];
    const span = p.top;
    const fallen = ((t * p.spd + p.ph * span) % span);
    const y = p.top - fallen;
    const x = p.x + Math.sin(t * p.sf + p.sp) * p.sw + t * 0.18;
    const z = p.z + Math.cos(t * p.sf * 0.7 + p.sp) * p.sw * 0.5;
    const grow = smooth(0, 0.8, fallen) * smooth(0.0, 0.5, y);
    tmpE.set(p.r3 + t * p.r1, t * p.r2, Math.sin(t * 0.9 + p.sp) * 0.9);
    tmpQ.setFromEuler(tmpE);
    tmpS.setScalar(p.sc * Math.max(grow, 0.0001));
    tmpM.compose(tmpV.set(x, y, z), tmpQ, tmpS);
    falling.setMatrixAt(i, tmpM);
  }
  falling.instanceMatrix.needsUpdate = true;

  // 心願葉
  const arrive = smooth(9.0, 12.5, t);
  for (const w of wishes) {
    let y = w.y + t * w.v + Math.sin(t * 0.6 + w.ph) * 0.12;
    let x = w.x + Math.sin(t * 0.4 + w.ph) * 0.18;
    const z = w.z + Math.cos(t * 0.3 + w.ph) * 0.12;
    const flick = 0.78 + 0.16 * Math.sin(t * 1.7 + w.ph) + 0.06 * Math.sin(t * 4.3 + w.ph * 2);
    let g = flick;
    if (w.hero) {
      y = w.y + Math.sin(t * 0.7) * 0.05 + (1 - arrive) * -0.15;
      x = w.x + Math.sin(t * 0.45) * 0.04;
      g = (0.75 + 0.45 * arrive) * (0.9 + 0.1 * Math.sin(t * 1.5));
      w.mesh.quaternion.setFromEuler(new THREE.Euler(-0.25 + Math.sin(t * 0.5) * 0.08, Math.sin(t * 0.4) * 0.35, 0.18 + Math.sin(t * 0.6) * 0.06));
    } else {
      w.mesh.quaternion.setFromEuler(new THREE.Euler(Math.sin(t * 0.5 + w.ph) * 0.5, t * 0.35 + w.ph, Math.sin(t * 0.7 + w.ph) * 0.4));
    }
    w.mesh.position.set(x, y, z);
    w.halo.position.set(x, y, z);
    w.mesh.material.color.copy(w.col).multiplyScalar(g);
    w.halo.material.color.setRGB(1.0, 0.42, 0.12).multiplyScalar(0.55 * g * (w.hero ? 0.8 : 1));
  }

  // 光塵
  for (let i = 0; i < DUST_N; i++) {
    const p = dustP[i];
    dustArr[i * 3] = p.x + Math.sin(t * 0.3 + p.a) * 0.4;
    dustArr[i * 3 + 1] = p.y + ((t * p.s) % 3) * 0.3 + Math.sin(t * 0.5 + p.a * 2) * 0.2;
    dustArr[i * 3 + 2] = p.z + Math.cos(t * 0.25 + p.a) * 0.4;
  }
  dustGeo.attributes.position.needsUpdate = true;

  // 景深：前段聚焦林間，後段轉到心願葉
  const hero = wishes[wishes.length - 1].mesh.position;
  const heroDist = camera.position.distanceTo(hero);
  const fk = smooth(8.0, 12.0, t);
  dofMat.uniforms.focus.value = THREE.MathUtils.lerp(26, heroDist, fk);
  dofMat.uniforms.aperture.value = THREE.MathUtils.lerp(5, 15, fk);

  // 太陽螢幕位置
  tmpV.copy(sunDir).multiplyScalar(400).add(camera.position).project(camera);
  finalMat.uniforms.sunUv.value.set(tmpV.x * 0.5 + 0.5, tmpV.y * 0.5 + 0.5);
  finalMat.uniforms.frame.value = Math.round(t * 30);
  finalMat.uniforms.fade.value = smooth(0, 0.6, t) * (1 - smooth(14.4, 15.0, t) * 0.0);
  finalMat.uniforms.exposure.value = 0.92 - 0.07 * smooth(12, 14, t);

  // 文字：最後 3 秒淡入
  const title = document.getElementById('title');
  const a = smooth(12.0, 13.4, t);
  title.style.opacity = a.toFixed(4);
  title.firstElementChild.style.transform = `translateY(${-60 + (1 - a) * 18}px)`;
  title.style.filter = `blur(${((1 - a) * 6).toFixed(2)}px)`;
}

function renderAt(t) {
  update(t);
  setOcc(true);
  renderer.setRenderTarget(rtOcc); renderer.clear(); renderer.render(scene, camera);
  setOcc(false);
  renderer.setRenderTarget(rtMain); renderer.clear(); renderer.render(scene, camera);
  renderer.setRenderTarget(rtDof); dofQuad.render(renderer);
  bloom.render(renderer, null, rtDof, 0, false);
  renderer.setRenderTarget(null); finalQuad.render(renderer);
  renderer.getContext().finish();
}

window.renderAt = renderAt;
window.DURATION = DURATION;
window.sceneReady = (async () => {
  await document.fonts.load('700 108px "Noto Sans TC"', '今年辛苦了。');
  await document.fonts.ready;
  renderAt(0);
  return true;
})();
const qs = new URLSearchParams(location.search);
if (qs.has('t')) window.sceneReady.then(() => renderAt(parseFloat(qs.get('t'))));
